# Автоматические курсы TCMB

## Что запускается

`sync-exchange-rates` — server-only Supabase Edge Function. Она читает только
официальный `https://www.tcmb.gov.tr/kurlar/today.xml`, берёт `ForexSelling`
(`Döviz Satış`) для EUR/USD и записывает EUR/USD/TRY в EUR-base contract.
Browser и Seller никогда не обращаются к TCMB.

GitHub Actions запускает endpoint в 16:40 Istanbul по рабочим дням и повторяет
только временную ошибку до трёх раз. Автоматическая публикация workflow/function
не является разрешением менять production: перед включением Owner подтверждает
staging evidence и отдельно публикует Edge Function.

## Secret setup до включения schedule

В Supabase Edge Function secrets создать случайный `FX_SYNC_SECRET`; такой же
`FX_SYNC_SECRET` и точный deployed endpoint `FX_SYNC_URL` создать только в GitHub
Actions secrets. Значения не записываются в repository, issue, workflow output или
chat. Function требует этот secret в header `x-fx-sync-secret`.

После deploy вызвать endpoint один раз только с разрешённым secret и проверить:

- `exchange_rate_sync_runs` создаёт `success`, `carried_forward` или `failed`;
- Owner видит source date/status в Daily exchange rates;
- Seller не может вызвать write RPC и не видит sync health rows;
- manual Owner override не заменяется sync-ом.

## Безопасные правила

- TCMB malformed, future-dated или неполный XML не записывает ставок.
- При source date раньше текущей Istanbul date ставка помечается
  `carried_forward`; предел — три business days (Mon–Fri).
- При fetch failure используется только последний complete TCMB EUR/USD/TRY set
  внутри того же предела. Нет ECB или другого скрытого provider fallback.
- После трёх business days создаётся `failed` run; Owner видит stale/review state
  и использует audited manual override до восстановления источника.
- Existing sale/receipt/exchange FX snapshots никогда не обновляются.
