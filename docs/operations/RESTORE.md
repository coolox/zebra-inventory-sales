# Restore procedure — Clothing Pilot

Статус: **проверено rehearsal на артефакте `staging-2026-08-15.tar.gz.age`** (TASK-082).

Порядок восстановления обязателен и закреплён в D-061: **сначала цепочка миграций,
затем данные**. Архив не самодостаточен — он не содержит `on_auth_user_created` на
`auth.users`, потому что `supabase db dump` не выгружает DDL управляемой схемы
`auth`. Restore только из архива молча потеряет автосоздание профилей.

Endpoint VPS, ключи и пароли в этом файле отсутствуют осознанно (D-060). Они
берутся из GitHub Secrets `BACKUP_VPS_*` и из личного хранилища Owner.

## Что нужно заранее

- Encrypted artifact `staging-YYYY-MM-DD.tar.gz.age` и `SHA256SUMS` из
  `daily/<date>/` на VPS.
- Private `age` identity. Без него архив нечитаем — Owner хранит вторую копию вне
  рабочей станции.
- Целевое окружение: локальный стек (`supabase start`) либо отдельный Supabase
  project. Production восстанавливать в тот же project **нельзя** без отдельного
  Go/No-Go решения.

## Шаг 1 — забрать и проверить артефакт

```bash
scp -i <backup-key> "$BACKUP_VPS_USER@$BACKUP_VPS_HOST:$BACKUP_VPS_PATH/zebra-retail/staging/daily/<date>/staging-<date>.tar.gz.age" .
scp -i <backup-key> "$BACKUP_VPS_USER@$BACKUP_VPS_HOST:$BACKUP_VPS_PATH/zebra-retail/staging/daily/<date>/SHA256SUMS" .
shasum -a 256 -c SHA256SUMS
age -d -i <age-identity> -o staging.tar.gz staging-<date>.tar.gz.age
mkdir payload && tar -xzf staging.tar.gz -C payload
```

Checksum обязателен до расшифровки. Дальше не идти, если он не сошёлся.

## Шаг 2 — применить миграции в чистое окружение

```bash
npm run supabase:reset          # локально: пересоздаёт БД и применяет 29 миграций
# или для отдельного project: supabase db push --db-url <target>
```

После этого целевая база уже содержит: 21 таблицу, 21 RLS policy, 3 public-триггера,
триггер `on_auth_user_created` и bucket `product-images` с `public=false`, лимитом
`8388608` и MIME `image/jpeg,image/png,image/webp`.

## Шаг 3 — применить roles.sql

```bash
psql -f payload/database/roles.sql
```

**Ожидаемая ошибка, которую нужно игнорировать:** последняя строка
`GRANT SET ON PARAMETER "log_min_messages" TO "supabase_realtime_admin"` падает с
`permission denied for parameter log_min_messages` даже под `postgres`.

Остальное содержимое `roles.sql` — `statement_timeout` `3s` для `anon` и `8s` для
`authenticated` — это платформенные значения Supabase, которые уже присутствуют на
любом чистом проекте. Проверено на чистой локальной базе после миграций. Шаг можно
выполнять для полноты, но он ничего не добавляет, и его провал не блокирует restore.

## Шаг 4 — загрузить данные без схемы storage

Схему `storage` из SQL нужно исключить целиком:

```bash
awk '/^COPY "storage"\./{skip=1; next} skip && /^\\\.$/{skip=0; next} skip{next} {print}' \
  payload/database/data.sql > payload/database/data-restore.sql
psql --single-transaction -v ON_ERROR_STOP=1 -f payload/database/data-restore.sql
```

Почему нельзя загружать `storage` как есть — обе причины найдены на rehearsal:

- `storage.buckets` конфликтует по primary key с бакетом, который уже создала
  миграция. Атрибуты при этом совпадают полностью, поэтому строка из дампа не
  нужна. `DELETE FROM storage.buckets` не помогает: его блокирует защитный триггер
  `storage.protect_delete()`.
- `storage.buckets_vectors` и другие внутренние таблицы дают
  `permission denied` даже под `postgres`, хотя все они пусты.

`--single-transaction` вместе с `ON_ERROR_STOP=1` обязательны: при ошибке база
остаётся чистой, а не частично заполненной. Первый прогон rehearsal без них залил
43 блока и оборвался на `storage`, оставив несогласованное состояние.

Первая строка `data.sql` содержит `SET session_replication_role = replica`, поэтому
триггеры при загрузке не срабатывают. Это нужно и правильно: иначе
`inventory_movements_reject_archived_model_sale` отверг бы движения архивированной
модели. Роль, выполняющая restore, должна иметь право менять этот параметр.

## Шаг 5 — восстановить Storage перезаливкой файлов

`public.product_images.storage_path` — это **text-путь**, а не ссылка на
`storage.objects.id`. Поэтому файлы можно залить заново: новые UUID объектов ничего
не ломают, пути сохраняются, а строки `storage.objects` создаст сам Storage API.

```bash
# для каждого файла payload/product-images/<store>/<model>/<image>.<ext>
curl -X POST "$SUPABASE_URL/storage/v1/object/product-images/<path>" \
  -H "Authorization: Bearer <service-role-key>" \
  -H "Content-Type: image/jpeg|image/png|image/webp" \
  --data-binary "@payload/product-images/<path>"
```

## Шаг 6 — обязательная сверка

```sql
-- 1. Пооблачно сверить количество строк с COPY-блоками архива: должно быть 43 из 43.
-- 2. Связность изображений:
select (select count(*) from public.product_images)                                    as images,
       (select count(*) from public.product_images pi
          join storage.objects o on o.name = pi.storage_path
         where o.bucket_id = 'product-images')                                         as resolved,
       (select count(*) from public.product_images pi
         where not exists (select 1 from storage.objects o
                            where o.name = pi.storage_path and o.bucket_id='product-images')) as orphan_rows;
```

Дополнительно: сравнить `metadata->>'size'` каждого объекта с размером исходного
файла и сверить `sha256` при скачивании обратно через API.

Прикладной smoke под RLS выполняется без браузера — как в pgTAP-тестах:

```sql
begin;
select set_config('request.jwt.claim.sub', '<owner-user-id>', true);
set local role authenticated;
select count(*) from get_reporting_metrics('<store>', '2026-01-01', '2026-12-31');
select count(*) from get_reconciliation_discrepancies('<store>');
rollback;
```

Seller обязан получать `Owner access is required for reconciliation`.

## Результат rehearsal — артефакт 2026-08-15

Эти числа служат эталоном при следующих проверках.

| Проверка | Результат |
|---|---|
| Checksum | сошёлся на VPS и локально |
| Расшифровка и `gzip -t` | OK |
| Таблицы `auth` + `public` | **43 из 43 совпали, 0 расхождений** |
| Ключевые объёмы | 49 sales, 80 sale lines, 57 payments, 180 movements, 166 audit, 77 variants, 13 models, 2 users |
| Изображения | 16 залито, 16 связано, 0 сирот с обеих сторон |
| Байты изображений | 16 из 16 совпали по размеру и `sha256` при round-trip |
| Owner RPC | metrics 1, reconciliation 11, inventory 77, low stock 72 |
| Seller RPC | summary 7, sales 49, reconciliation отклонён |
| Схема vs миграции | 21 таблица идентична по именам, 21 policy, 21 RLS-таблица |

Одиннадцать строк reconciliation совпадают с 11 историческими
`manual_correction`, принятыми Owner в D-058. Это подтверждает восстановление
бизнес-состояния, а не только количества строк.

## Известное расхождение staging и миграций

Расхождение ровно одно: функция `rls_auto_enable`. Она есть в дампе staging,
отсутствует во всём репозитории, и event trigger для неё не зарегистрирован ни на
staging, ни локально. Это event-trigger функция (`SECURITY DEFINER`,
`search_path=pg_catalog`), включающая RLS на любой новой таблице `public` — то есть
незавершённая страховка, а не мусор.

Её отсутствие в новом production project ничего не ослабляет: все 21 таблица
получают RLS явно из миграций, что проверяется в CI. Вызвать функцию напрямую
нельзя. Решение о снятии со staging либо о полноценной регистрации event trigger
принимается отдельно от RC пилота (D-062).

Все прочие функции, «отсутствующие» на staging, — внутренние объекты расширения
`citext`, которые `pg_dump` штатно не выгружает. Дрейфом они не являются.

## Чего rehearsal не доказал

- Restore в отдельный **hosted** Supabase project: не проверялись создание
  проекта, реальный Auth/SMTP и загрузка Storage через hosted S3. Это покрывает
  TASK-085.
- RTO на hosted. Локально все шаги вместе занимают минуты, из которых основное
  время — применение миграций.
- Retention: восстановление проверялось на единственном доступном артефакте.
