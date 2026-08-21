# TASK-177 — Расширить Edit Product и убрать Low-stock threshold из обычной карточки

Статус: COMPLETED

Приоритет: P1 — Owner должен исправлять model data в одном явном audited flow, без
смешения с ежедневной карточкой товара.

Источник: Owner physical Android walkthrough, 2026-08-21.

## Запрос Owner

В `Edit Product` Owner хочет изменять:

- Low-stock threshold;
- gender;
- название товара;
- входную цену производителя / purchase cost.

Low-stock threshold больше не должен быть виден или редактируем непосредственно в
обычной Product Details карточке; его нужно перенести в `Edit Product`.

## Важная граница данных

Название, gender и threshold являются model-level fields. Purchase cost требует
явной безопасной семантики: изменение текущей/default стоимости не может переписать
historical receipt, sale, FX или ledger evidence. Перед реализацией нужно определить
и показать Owner, относится ли edit к future receipt default, конкретному variant
или новой отдельной receipt correction, и audited old/new values.

### Принятое решение Owner — 2026-08-21

Purchase cost редактируется на уровне модели/Product code: новое значение
синхронно применяется ко всем текущим цветам и размерам этого кода как их
текущая стоимость для будущих операций. Исторические receipt, sale, FX и ledger
records не переписываются; audit фиксирует old/new model cost и actor.

## Границы

- Owner-only Edit Product UI, server-side authorization, validation, audit и
  соответствующие read models.
- Убрать inline Low-stock threshold control из обычной Product Details карточки.
- Не менять Seller permissions, historical receipts/sales, stock balances, FX,
  barcode/QR identity или автоматические inventory corrections.

## Критерии готовности

- Owner видит все разрешённые поля в одном понятном Edit Product flow с loading,
  validation, success/error и EN/TR states.
- Seller не может видеть или вызвать edit API; cross-store requests запрещены
  server-side.
- Low-stock threshold отсутствует из обычной карточки и сохраняется только через
  Edit Product с audit.
- Name/gender changes не ломают existing variants/history; purchase-cost edit имеет
  явный scope и не переписывает historical financial/receipt data.
- Cancel/reload и concurrent update не создают false success или silent overwrite.
- Targeted tests, `npm run build` и Owner mobile recheck проходят.

## Ограничение текущего этапа

Finding только зафиксирован. Product/data design и код не менять, пока Owner не
скажет, что закончил передавать найденные баги.

## Реализация и evidence

- Owner Edit Product теперь содержит name, gender, low-stock threshold и current
  purchase cost/currency в одном flow; threshold удалён из обычной Product Details
  карточки. Product-code correction остаётся отдельным ясно названным flow.
- Migration `20260821150000_model_current_purchase_cost.sql` добавляет Owner-only
  `update_product_model_details` RPC. Она блокирует Seller/cross-store update,
  сохраняет audit old/new values и меняет только current model cost for future
  operations; historical receipt/sale/FX/ledger rows не переписываются.
- `npx vitest run features/catalog/ui/product-card.test.tsx features/catalog/data/update-product-model-details.test.ts` — 15/15 passed.
- `supabase/tests/database/036_product_model_details_test.sql` — pgTAP 8/8 passed.
- `npm run build` — passed (only pre-existing lint warnings).
- Physical Owner mobile recheck входит в consolidated TASK-165 согласно TASK-190.
