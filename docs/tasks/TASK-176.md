# TASK-176 — Исправить неработающее сохранение Product code из Edit Product

Статус: COMPLETED

Приоритет: P1 — Owner видит успешную edit action, но изменение Product code не
сохраняется.

Источник: Owner physical Android walkthrough, 2026-08-21.

## Наблюдение

В Product Details Owner открывает `Edit Product`, меняет Product code и нажимает
`Save` / `Kodu kaydet`. Ничего не происходит: значение не меняется и UI остаётся в
том же состоянии без результата либо понятной ошибки.

Это регрессия/неполная physical acceptance TASK-162: локальные tests подтверждали
code-only edit boundary, но реальная mobile action не выполняет обещанный сценарий.

## Цель

Сделать сохранение Product code надёжным и объяснимым: при success новый code виден
после reload, при validation/network/authorization failure Owner видит явную ошибку
и прежнее значение не выдаётся за сохранённое.

## Диагностика

- Воспроизвести с safe staging fixture и проследить tap, form submit, client request,
  route/RPC response, RLS/authorization и reload state без записи secret data.
- Сравнить Android touch/keyboard boundary с desktop test path; проверить disabled,
  pending, error и stale state.
- Проверить blank, duplicate, same-value, cross-store и Seller cases; code edit
  остаётся отдельной audited model-level operation.

## Результат

- Live code edit теперь считает сохранение успешным только если audited
  `update_product_model_code` RPC вернул ровно запрошенный Product code. Empty,
  missing или mismatched RPC response остаётся явной ошибкой в Edit Product, а не
  silent no-op или ложным success.
- После server confirmation все варианты этой же model обновляются одним
  confirmed code; Product model UUID, barcode, photos, inventory ledger и history
  не изменяются. Demo по-прежнему обновляет только свой локальный workspace.
- Existing server-side Owner/store authorization, duplicate lock и audit old/new
  code сохранены. Physical Android recheck будет выполнен на consolidated staging
  Preview в TASK-165, без записи реальных продаж или credentials.

## Проверки

- `npm test -- --run features/catalog/data/update-product-code.test.ts features/catalog/ui/product-card.test.tsx` — 15/15 passed.
- `supabase test db --local supabase/tests/database/032_product_code_edit_test.sql` — 11/11 passed.
- `npm run build` и `npm run build:live` — passed (only existing unrelated lint warnings).
- `git diff --check` — passed.

## Критерии готовности

- Owner меняет допустимый Product code через Edit Product и видит confirmed result
  после reload без создания новой модели/варианта.
- Failure не выглядит как silent no-op: доступен EN/TR error/retry state, а
  сохранённое значение честно отражает серверный результат.
- UUID, barcode, photos, ledger/history и model/variant boundaries остаются
  неизменными; audit содержит old/new code.
- Targeted UI/data regression и demo/live builds проходят; physical Android
  recheck входит в consolidated staging walkthrough TASK-165.

## Remaining staging evidence

No further code work is required in this task. Confirm the success/error/retry
states and persistence after reload on the Redmi 14 during TASK-165.

## Follow-up interaction hierarchy — 2026-08-22

- Owner requested one unified `Edit product` entry point instead of separate
  Product code and model-detail buttons, with the primary Sell action first.
- TASK-176 server exact-code confirmation/audit boundary remains required inside
  that unified UI; action ordering and dialog composition are isolated in
  [TASK-197](TASK-197.md). Do not change implementation during visual intake.
