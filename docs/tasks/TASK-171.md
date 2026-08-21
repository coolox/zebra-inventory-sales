# TASK-171 — Exchange доплата должна быть видна в Sales History и финансовых итогах

Статус: COMPLETED

Приоритет: P1 — риск потерять €70 фактически полученной доплаты при обмене.

Источник: physical walkthrough Owner, 2026-08-21.

## Наблюдаемый сценарий

1. В Sales History открыть существующую продажу на безопасный тестовый товар за
   €100.
2. Запустить обмен на другой товар.
3. Указать новую цену €170 и сохранить обмен.
4. Выйти из flow и проверить Sales History.

Фактический результат: итоговая продажа отображается как €170, но отдельная доплата
€70 нигде явно не указывается.

Ожидаемый результат: история и финансовые представления ясно показывают исходную
продажу €100, новый товар €170 и полученную при обмене доплату €70. Суммы должны
быть согласованы с immutable ledger, payment records, audit и Owner reports; нельзя
молчаливо трактовать €170 как отдельную новую продажу или терять €70.

## Влияние

- Owner и Seller не могут подтвердить, была ли доплата действительно получена.
- В Sales History и отчётах возникает риск расхождения между товарной ценой и
  деньгами, принятыми при exchange.
- TASK-165 physical staging acceptance остаётся заблокирована до исправления и
  повторной проверки этого сценария.

## Диагностика

- Воспроизвести сценарий на безопасной staging fixture без customer data.
- Сравнить exchange draft, RPC request/response, `sale_payments`, ledger/movements,
  audit и отображение в Sales History/Reports; зафиксировать только тестовые суммы.
- Установить, потеряна ли доплата при сохранении, в query/model или только в UI.
- Проверить равный обмен, доплату и возврат разницы, включая mixed payment и валюту,
  если это поддерживает текущий flow.

## Результат

- Причина найдена в live read path, не в financial write: `exchange_sale_line`
  атомарно создаёт `sale_exchanges`, exchange payment, movements и audit, а
  reporting RPC уже учитывает top-up. Но после reload `loadLiveWorkspace` всегда
  передавал `exchanges: []`, поэтому Sales History не могла связать исходную line
  с новой товарной позицией и €70 доплатой.
- Новый store-scoped `loadLiveExchanges` загружает exchange, source/replacement
  variants, payment snapshot и actor после RLS. Он возвращает top-up в History,
  overview/demo calculations и refresh keys; existing History UI уже явно
  показывает `Exchange top-up` и final ticket total (€100 + €70 = €170).
- Server write, immutable sale/payment records, exchange audit и Owner reports не
  изменялись; no double counting introduced.

## Проверки

- `npm test -- --run features/sales/model/sale-history.test.ts features/sales/ui/sale-history.test.tsx features/exchanges/ui/exchange-flow.test.tsx` — 16/16 passed.
- `supabase test db --local 027_sales_exchange_test.sql 028_reporting_metrics_test.sql` — 37/37 passed.
- `npm run build` and `npm run build:live` — passed (only existing unrelated lint warnings).
- `git diff --check` — passed.

## Критерии готовности

- Для €100 → €170 история обмена явно показывает €70 доплаты и связанные исходную
  и новую товарные позиции.
- Доплата сохраняется атомарно, аудируется и корректно входит в Owner financial
  reports/reconciliation без двойного учёта.
- UI не скрывает разницу после reload и доступен Owner/Seller только в пределах
  их разрешённого магазина.
- Targeted regression/tests и live build проходят; Owner повторно подтверждает
  staging fixture на physical device в consolidated TASK-165.

## Remaining staging evidence

No further code work is required. TASK-165 must confirm on a safe fixture that a
€100 → €170 exchange shows the source item, replacement item, €70 top-up and
payment method after reload; no real customer data or payments are used.
