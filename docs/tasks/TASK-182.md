# TASK-182 — Reports Seller dimension: заменить `Unknown seller` на имя или email

Статус: COMPLETED

Приоритет: P1 — Owner не может корректно атрибутировать собственные продажи в
Seller reports.

Источник: Owner physical walkthrough feedback, 2026-08-21.

## Наблюдение

В Reports при выборе Seller dimension одна из строк отображается как `Unknown seller`.
Owner сообщил, что это его собственные продажи. Такая подпись не позволяет понять,
кто оформил продажу, и делает Seller report непригодным для проверки.

## Ожидаемый результат

Для каждой разрешённой строки Seller report использовать понятный стабильный label:

1. display name продавца, если он есть;
2. иначе approved account email;
3. `Unknown seller` только как последний безопасный fallback для действительно
   отсутствующей/удалённой historical identity, с понятным explanatory context.

Owner identity должна отображаться по тем же правилам. Email не должен появляться в
Seller-facing screens или там, где current authorization не разрешает раскрытие
персональных данных.

## Диагностика

- Проследить safe staging sale actor через report query/RPC, membership/profile
  mapping и rendering fallback; определить, почему Owner actor становится unknown.
- Проверить Owner, active Seller, blocked historical Seller, invited/no-name user,
  missing/deleted identity и cross-store boundaries.
- Убедиться, что display name/email не подменяются и не создают лишнее PII exposure
  в CSV/XLSX/PDF exports, audit или Seller view.

## Критерии готовности

- Owner sales больше не отображаются `Unknown seller`, если доступно имя или email.
- Reports показывают display name, иначе email, в корректном store/role boundary.
- Genuine unknown historical actor остаётся distinguishable и объяснён, не
  маскируется чужим email/name.
- EN/TR labels, loading/empty/error/export states и Seller privacy boundaries
  остаются корректными.
- Targeted report/data authorization tests, `npm run build` и Owner mobile recheck
  проходят.

## Результат

- Причина: `get_reporting_breakdown` использовал только `profiles.full_name`, хотя
  у Owner мог быть пустой display name при существующем approved Auth email.
- Новая migration `20260821140000_reporting_seller_email_fallback.sql` возвращает
  для Owner: display name → approved account email → `Unknown seller`. Для
  не-Owner caller email не раскрывается: при пустом имени сохраняется безопасный
  `Unknown seller`.
- EN/TR Reports объясняют genuine historical unknown без подмены чужой identity.
- Evidence: targeted Vitest 5/5, clean local pgTAP 3/3, demo и live production
  builds green. Physical Owner mobile recheck входит в consolidated TASK-165.
