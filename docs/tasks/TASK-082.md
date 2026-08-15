# TASK-082 — Провести restore rehearsal и rollback plan

Статус: IN PROGRESS

## Цель

Восстановить staging из backup и доказать работоспособность данных/Storage после восстановления.

## Предполагаемые файлы

- `docs/operations/RESTORE.md`
- `docs/operations/ROLLBACK.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-081.

## Критерии готовности

- Restore выполнен в изолированное окружение.
- Catalog, stock, sales, payments, audit и images сверены.
- Для migrations и deploy описан проверенный rollback.

## Тесты

- Documented restore drill.
- Row/count/hash reconciliation.
- Application smoke against restored environment.

## Restore rehearsal — 2026-08-16

Target: local Supabase stack, the only fully isolated environment that needs no new
cloud resources. Source: the TASK-081 verified artifact `staging-2026-08-15.tar.gz.age`,
re-fetched from the VPS and re-verified by checksum before decryption. The local dev
database was safety-dumped first, so the reset destroyed nothing.

The rehearsal proved the procedure and, more usefully, found four ways the naive
procedure fails. All are now documented in [RESTORE.md](../operations/RESTORE.md).

### Defects found in the restore path

1. `roles.sql` cannot be applied cleanly. Its final
   `GRANT SET ON PARAMETER "log_min_messages"` fails with `permission denied` even as
   `postgres`. Everything material applies before it, so the error is expected and
   ignorable — but only once documented.
2. `data.sql` aborts on `storage.buckets`: the bucket already exists from migrations
   and collides on primary key. Attributes are identical
   (`public=false`, `8388608`, jpeg/png/webp), so the dumped row is unnecessary.
   `DELETE FROM storage.buckets` is not a workaround — the `storage.protect_delete()`
   trigger blocks it.
3. Even with buckets excluded, `storage.buckets_vectors` fails with `permission denied`
   as `postgres`. Of seven dumped `storage` blocks only two hold rows (1 bucket,
   16 objects), yet the empty internal tables still break the load. The whole `storage`
   schema must be filtered out of the SQL.
4. Without `--single-transaction`, the first failed attempt left the database
   partially loaded: 43 blocks committed, `storage` aborted. `--single-transaction`
   with `ON_ERROR_STOP=1` is mandatory, not stylistic.

Storage is instead restored by re-uploading the mirrored files. This is safe because
`public.product_images.storage_path` is a text path, not a foreign key to
`storage.objects.id`, so new object UUIDs break nothing.

### Reconciliation result

| Проверка | Результат |
|---|---|
| `auth` + `public` tables | **43 / 43 matched, 0 mismatches** |
| Volumes | 49 sales, 80 sale lines, 57 payments, 180 movements, 166 audit, 77 variants, 13 models, 2 users |
| Images | 16 uploaded, 16 resolved, 0 orphan rows, 0 orphan objects |
| Image bytes | 16 / 16 identical by size and by `sha256` round-trip through the API |
| Owner RPC | metrics 1, reconciliation 11, inventory 77, low stock 72, sales 49, images 16 |
| Seller RPC | summary 7, sales 49, reconciliation denied `Owner access is required` |
| Schema vs migrations | 21 tables identical by name, 21 policies, 21 RLS-enabled |

The 11 reconciliation rows match the 11 historical `manual_correction` rows accepted
by Owner in D-058, so business state was reproduced rather than just row counts.

### Schema drift found on staging

Comparing the dumped staging schema against a freshly migrated database showed the
migration chain reproduces staging exactly, with one exception: function
`rls_auto_enable`. It exists in the staging dump but nowhere in the repository, and
no event trigger references it on staging or locally.

Inspecting its body showed it is not junk: it is an event-trigger function
(`SECURITY DEFINER`, `search_path=pg_catalog`) that enables RLS on any newly created
`public` table. So it is an unfinished safety net whose registration was never
created. It cannot be invoked directly, because event-trigger functions may only run
as triggers, and its absence weakens nothing — all 21 tables get RLS explicitly from
migrations, which CI verifies.

An earlier version of this section and of D-062 also claimed `statement_timeout`
`3s`/`8s` was staging-only drift that production would miss. That was wrong.
Checking a clean database straight after migrations showed `anon` already at `3s` and
`authenticated` at `8s`: these are Supabase platform defaults and `roles.sql` merely
restates them. No migration was needed, and none was added — verifying first avoided
putting a pointless change into a frozen RC.

All other functions "missing" from staging were `citext` extension internals, which
`pg_dump` correctly omits.

### Correction to D-061

D-061 originally claimed the `rls_auto_enable` event trigger was omitted from the
dump because event triggers are cluster-global. That was wrong. The registration is
absent from staging itself, and the repository never creates it. D-061 now rests only
on `on_auth_user_created`, which was verified directly: absent from the dump, created
by migrations.

### Rollback plan

[ROLLBACK.md](../operations/ROLLBACK.md) documents deploy rollback via Vercel promote,
compensating forward migrations for the forward-only chain, and Storage-only recovery.
It records **RPO up to 24 hours** from the `20 1 * * *` UTC schedule, which Owner has
not yet accepted.

### Not proven

- Restore into a separate **hosted** project: project creation, real Auth/SMTP and
  hosted Storage upload are untested. Covered by TASK-085.
- Vercel promote of a previous deployment: production does not exist yet.
- A compensating migration has not been rehearsed against a real defect.

