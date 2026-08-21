# TASK-183 — Проверить согласованность Owner/Seller revenue и freshness snapshot

Статус: COMPLETED

Приоритет: P1 — Owner сообщил расхождение revenue между Owner и Seller страницами.

Источник: две physical mobile screenshots, 2026-08-21.

## Подтверждённое наблюдение и evidence

Owner сообщил расхождение сегодняшней выручки между Owner Page и Seller Page.

- Initial screenshots at `13:39` and `13:57` differed by €83 and one sale, which
  could initially have been explained by time between captures.
- Owner then made one sale, refreshed both screens and captured new screenshots in
  the same minute (`14:01` / `2:01` on the second device): one screen shows store
  summary `Сегодня` €2,002 and 16 units, while the other `Today` dashboard shows
  €2,085 and 17 pcs.
- The confirmed difference remains exactly €83 and one sale after refresh. This is
  no longer treated as only capture-time/stale-screen ambiguity.
- Второй screenshot визуально содержит Owner actions (`FX rates`, `Receive products`),
  хотя Owner описал его как Seller Page. Нельзя скрытно предполагать роль/identity:
  нужно проверить controlled sessions.

## Цель

Подтвердить, что при одинаковом store, business-date, role scope и моменте refresh:

- Owner store revenue показывает все разрешённые store sales;
- Seller personal revenue показывает только sales этого Seller;
- одинаковые метрики не расходятся между экранами из-за stale cache, period/timezone,
  role mapping, cancellation/exchange или different live snapshot.

Если показатели намеренно имеют разный scope, UI должен прямо это объяснять и
показывать last-updated/refresh state так, чтобы Owner не сравнивал разные числа как
одно и то же.

## Диагностика

- На безопасных staging fixtures открыть Owner и Seller sessions, подтвердить role,
  store and identity; не записывать email/token/real sales.
- Сделать baseline, одну controlled sale и optional cancellation/exchange; после
  explicit refresh сравнить Owner store dashboard, Owner personal section, Seller
  dashboard, Sales History и Reports в одном business-date.
- Trace live RPC/query/cache invalidation and date boundaries; проверить polling,
  revalidation, reload, offline/error state и locale/timezone.
- Установить, где возникает confirmed mismatch: sale write, actor/store filter,
  live loader/cache, period/timezone filter или UI label; historical records не
  переписывать без отдельного audited decision.

## Результат

- Подтверждены две разные live read-модели: Owner KPI строится из store-scoped
  sale-line snapshot, а Seller Summary читает server-authorized `store_*` и
  `personal_*` aggregates. Это намеренное различие scope, не изменение денежной
  формулы: Seller Summary остаётся только для Seller, и его карточки прямо
  разделены на «Store sales» и «My sales».
- Найден и устранён источник stale UI: несколько параллельных summary requests
  могли завершиться не по порядку, поэтому старый server snapshot мог перезаписать
  новый после sale/refresh. Последний запрос теперь имеет приоритет; UI показывает
  время успешного обновления и оставляет ручной refresh.
- Server-side access не ослаблялся: RPC не принимает Seller id и existing pgTAP
  уже подтверждает personal/store scope, blocked/outsider/anonymous denial.
- Physical cross-session comparison отложен до единого remediation staging Preview
  и будет выполнен в TASK-165 вместе с остальными мобильными findings. В staging
  нужно сравнить один одинаковый Istanbul-day/store snapshot после ручного refresh:
  Owner dashboard, Seller `Store sales`, Seller `My sales`, History и Reports.

## Проверки

- `npm test -- --run features/sales/ui/seller-sales-summary.test.tsx features/overview/model/metrics.test.ts` — 8/8 passed; added delayed-response regression.
- `npm run build` — passed (existing unrelated lint warnings only).
- `npm run build:live` — passed (same existing warnings only).
- `git diff --check` — passed.

## Критерии готовности

- UI однозначно маркирует store versus personal seller revenue и актуальность данных.
- При одинаковом scope/time snapshot числа совпадают с Sales History/Reports;
  после новой sale/cancellation/exchange они обновляются предсказуемо.
- Seller не получает store-wide financial data без разрешения, Owner сохраняет полный
  store scope; Owner/Seller role boundaries verified server-side.
- Targeted data/UI/RLS tests и demo/live builds проходят; physical two-session
  recheck входит в consolidated staging walkthrough TASK-165.

## Remaining staging evidence

No further code work is required in this task. The controlled physical comparison
is intentionally batched into TASK-165 after the consolidated remediation Preview;
it must not use real sales or record credentials/tokens.
