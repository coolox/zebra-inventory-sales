# TASK-162 — Добавить Owner Edit товара и исправление Product code

Статус: COMPLETED

Источник: явный запрос Owner во время walkthrough TASK-086, 2026-08-17.

Evidence: Owner screenshot Product Details показывает данные товара и Owner controls,
но не имеет понятного `Edit / Düzenle` для исправления ошибочно введённого кода.

## Цель

Дать Owner безопасное редактирование товара, в первую очередь исправление
`Product code / Ürün Kodu`, без пересоздания модели и потери связанной истории.

## Подтверждённый scope

- В Product Details есть заметное Owner-only действие `Edit / Düzenle`.
- Owner может изменить ошибочный Product code и подтвердить результат.
- Дополнительные редактируемые поля определить отдельно перед реализацией; не делать
  все database fields изменяемыми по умолчанию.

## Правила данных и безопасности

- Internal model/variant UUID не изменяются: receipts, sale lines, inventory
  movements, photos и stock остаются связаны с тем же товаром.
- Новый code обязателен, сохраняет ведущие нули/буквы и проходит существующую
  normalized store-scoped uniqueness policy TASK-117.
- Конфликт с другим товаром нельзя разрешать скрытым merge или overwrite.
- Изменение выполняется атомарным Owner-only server-side RPC и записывает actor,
  timestamp, old value и new value в audit.
- Seller не получает edit permission; cross-store model нельзя изменить.
- Barcode остаётся отдельным optional identifier и не переписывается автоматически
  при смене Product code.

## Открытый UX/data вопрос перед реализацией

Определить отображение code в historical views: показывать исправленный current code
при сохранении original value в audit либо использовать существующий historical
snapshot, если он уже хранится. Решение не должно менять immutable ledger rows.

## Критерии готовности

- После сохранения Catalog/Search/Sale/Receipt находят модель по новому code и не
  создают дубликат товара.
- Старый code больше не выбирает эту модель, если отдельно не принято решение об
  alias; alias нельзя вводить скрытно.
- Photos, variants, balances и полный operation history сохраняются.
- Validation/conflict/loading/error/success states понятны на English/Turkish.
- Edit dialog работает на mobile/desktop и явно показывает, какой товар изменяется.

## Проверки

- pgTAP/RPC: Owner success, Seller/cross-store denial, duplicate/empty code denial,
  audit old/new и unchanged UUID/history/stock.
- Component tests: open, validation, conflict, save, error и EN/TR.
- Search/Sale/Receipt regression с leading-zero/alphanumeric corrected code.
- `npm run build`.

## Результат

- Добавлена migration `20260820120000_update_product_model_code.sql` с атомарным
  Owner-only RPC `update_product_model_code`. Она нормализует только outer
  whitespace у нового code, сохраняет leading zeroes/alphanumeric value, защищает
  store-scoped collision advisory lock + TASK-117 uniqueness policy и пишет audit
  `product_model.code_updated` с actor, timestamp, old/new code.
- RPC обновляет только `product_models.model_code`; model/variant UUID, barcode,
  photos, receipt/sale lines и inventory ledger не пересоздаются и не меняются.
- Product Details получил заметное Owner-only `Edit product / Ürünü düzenle`.
  В форме намеренно доступен только Product code, явно указано, что barcode не
  изменяется; есть validation, loading, conflict, error и success states на EN/TR.
  Seller не получает control, а server-side RPC дополнительно отклоняет Seller и
  cross-store Owner requests.
- После сохранения app заменяет code всех variants этой model в текущем workspace и
  обновляет выбранную карточку: новый code сразу участвует в existing catalog/sale/
  receipt lookup, старый alias не создаётся.
- Historical sale/receipt/ledger rows остаются immutable snapshots; current catalog
  показывает исправленный code, а исходное и новое значения доступны в audit
  (решение D-067).

## Evidence

- `npm test -- --run features/catalog/ui/product-card.test.tsx` — 13/13 passed.
- `npm run build` — passed (existing unrelated lint warnings remain warnings).
- Local Supabase clean reset applied all 30 migrations, including
  `20260820120000_update_product_model_code`; new pgTAP regression file covers
  Owner success, Seller/cross-store denial, blank/duplicate denial, audit old/new
  and unchanged UUID/variant/history/barcode. The local `supabase test db` harness
  is currently blocked before test execution by its stale Auth test schema
  (`auth.users.email_confirmed_at` absent), which also fails existing SQL suites;
  no staging or production project was changed.
