# TASK-175 — «Добавить цвет» не должен менять данные существующей модели

Статус: COMPLETED

Приоритет: P1 — риск изменить product identity при создании цветового варианта.

Источник: Owner physical walkthrough feedback, 2026-08-21.

## Наблюдение

В Receive Flow после выбора action «Добавить цвет» для уже созданного товара UI
всё ещё позволяет менять `gender`: например, исходная модель `men` может быть
изменена на `women` или `unisex`. В том же режиме остаются изменяемыми общие детали
модели, включая как минимум Product code, название товара и производителя.

Это противоречит смыслу режима: Owner добавляет цвет к существующей модели, а не
создаёт другую модель и не редактирует её identity.

## Ожидаемый результат

В режиме «Добавить цвет» model-level данные уже выбранного товара показываются как
зафиксированный контекст и не редактируются. Минимально должны быть locked:

- Product code;
- название товара;
- производитель/brand;
- gender (`men` / `women` / `unisex`).

Перед реализацией нужно явно проверить остальные model-level поля (например,
category/shared barcode) и отделить их от variant/receipt полей. В этом режиме можно
изменять только данные, действительно относящиеся к добавляемому цветовому варианту
и его приёмке; нельзя молча перезаписать существующую модель.

## Влияние

- Товар мужской категории может стать женским/unisex при простой добавке цвета.
- Код, название или производитель могут перестать соответствовать историческим
  приёмкам, продажам и поиску.
- TASK-165 physical acceptance остаётся blocked до исправления и повторного Receive
  Flow check.

## Диагностика

- Проследить state и live/demo payload «Добавить цвет»; убедиться, что UI lock не
  является единственной защитой и существующая model identity не перезаписывается.
- Составить явную матрицу model-level versus colour/variant/receipt fields с учётом
  уже существующих Product code edit permissions TASK-162.
- Проверить существующую модель с несколькими цветами, Seller boundary, back/cancel,
  refresh и сохранение новой colour/size/quantity fixture.

## Результат

- После распознавания существующей модели Receive Flow явно показывает locked
  context. Product code, name, brand, category, supplier, shared barcode и gender
  становятся read-only; Owner может явно выбрать другой товар, чтобы начать новый
  lookup.
- Для добавляемого цвета доступны только variant/receipt fields: colour, sizes,
  quantities, variant barcode, purchase cost и currency. EN/TR copy объясняет
  это разделение.
- Новая server migration делает boundary независимым от UI: existing model берёт
  identity и supplier только из базы. Подменённые name/brand/category/gender/barcode/
  supplier payload values не переписывают модель, не меняют supplier receipt и не
  создают лишнего supplier; сохраняется лишь новый variant/receipt.
- Physical Redmi Receive Flow check остаётся в consolidated TASK-165 Preview.

## Проверки

- `npm test -- --run features/receipts/ui/receive-flow.test.tsx features/receipts/model/product-code-input.test.ts` — 16/16 passed.
- Clean local reset + `supabase test db --local supabase/tests/database/033_existing_receipt_model_lock_test.sql` — 5/5 passed.
- `npm run build` и `npm run build:live` — passed (only existing unrelated lint warnings).
- `git diff --check` — passed.

## Критерии готовности

- После «Добавить цвет» Owner не может изменить code, name, brand или gender
  существующей модели через этот flow.
- Сохраняется только новый допустимый цветовой вариант/приёмка; исходная model
  identity и её прошлые receipt/sale/history records остаются неизменными.
- Любая попытка подменить model-level values в live request надёжно отвергается либо
  игнорируется server-side с явным безопасным результатом.
- EN/TR copy ясно говорит, что это добавление цвета к существующему товару.
- Targeted UI/data tests и demo/live builds проходят; physical Android recheck
  входит в consolidated staging walkthrough TASK-165.

## Remaining staging evidence

No further code work is required. TASK-165 must confirm that locked model inputs
cannot change on Redmi 14, a new color receipt persists, and a cancel/back leaves
the existing model untouched.
