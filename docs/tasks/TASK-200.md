# TASK-200 — Диагностировать staging live workspace load failure

Статус: pending

Приоритет: P1 — authenticated staging workspace не загружает store data.

Источник: Owner staging Redmi walkthrough screenshot, 2026-08-22.

## Наблюдение

После authenticated staging entry app показывает `Store data could not be loaded.
No demo values were substituted.` Это честный no-mock boundary, но блокирует
Owner/Seller walkthrough и Cash report data.

## Границы

- Диагностировать live adapter/session/store membership/RPC/runtime boundary без
  чтения или записи secret values в repository/evidence.
- Не подставлять demo values, не менять production, реальные customer data или
  staging configuration без отдельного Owner решения.
- Safe evidence: route/operation/error class and redacted runtime observation only.

## Критерии готовности

- Причина и minimal authorised fix определены; live workspace загружается для
  authorised Owner/Seller или блокер документирован с безопасным next action.
- No-mock behaviour сохраняется при genuine failure.
- Targeted runtime/data tests and staging safe smoke pass; any required external
  config change is explicitly authorized and recorded.

