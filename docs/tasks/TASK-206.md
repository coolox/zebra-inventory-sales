# TASK-206 — Автоматически загружать дневные FX-курсы

Статус: PAUSED

2026-08-31: Owner утвердил TCMB, `Döviz Satış`, EUR/USD/TRY и carry-forward
не старше трёх Istanbul business days. Задача разделена: TASK-209 реализует
строгий parser и нормализацию provider payload; следующие isolated tasks добавят
metadata/storage, server sync и Owner observability. Этот parent не выполняется
целиком за одну сессию.

## Цель

После Clothing Pilot автоматически заполнять дневные курсы для существующих
sale/receipt/exchange flows из утверждённого официального источника, сохраняя
происхождение, дату публикации, ручной fallback и неизменяемые historical FX
snapshots.

## Рекомендуемое направление

- Основной кандидат — официальный дневной XML TCMB
  `https://www.tcmb.gov.tr/kurlar/today.xml`: он публикует USD и EUR относительно
  TRY и соответствует турецкому контексту магазина.
- До реализации Owner утверждает точную rate basis: рекомендуется один стабильно
  используемый показатель TCMB (`Döviz Satış`), а не незаметное смешивание buying,
  selling и midpoint.
- ECB EUR reference rates можно использовать для monitoring/feasibility и
  контролируемого fallback только после отдельного решения; автоматическое
  переключение provider без видимого source запрещено.

## Предполагаемые файлы

- `supabase/migrations/<new>_automatic_exchange_rates.sql`
- `supabase/functions/sync-exchange-rates/**`
- `features/exchange-rates/data/**`
- `features/exchange-rates/ui/fx-rate-manager.tsx`
- `docs/operations/FX_RATES.md`
- `.github/workflows/**` или Supabase scheduled job configuration

## Зависимости

TASK-088, TASK-116.

## Предлагаемый поток данных

1. Server-side scheduled job запускается после ожидаемой дневной публикации TCMB
   и повторяется ограниченное число раз при временной ошибке.
2. Job загружает и строго валидирует source date, currency codes и положительные
   decimal values. Клиентский браузер не обращается к provider напрямую.
3. TCMB TRY-per-currency values приводятся к текущему storage contract
   `eur_rate = EUR per one currency unit`. Если `T_EUR` — TRY за 1 EUR, а
   `T_USD` — TRY за 1 USD, то в базе сохраняются `EUR = 1`,
   `TRY = 1 / T_EUR`, `USD = T_USD / T_EUR`. UI при необходимости показывает
   обратную quote «сколько единиц валюты за 1 EUR». Остальные поддерживаемые
   валюты преобразуются по той же проверяемой cross-rate формуле, только если
   source публикует обе стороны.
4. В `exchange_rates` сохраняются business date, normalized `eur_rate`, provider,
   source rate date, fetched/published time, raw value basis и статус
   `automatic`, `carried_forward` или `manual_override`.
5. В выходной/праздник последняя опубликованная ставка может быть скопирована на
   новую Istanbul business date только с видимой отметкой `carried_forward` и
   исходной source date.
6. Owner видит время обновления, источник и stale status, может запустить retry и
   выполнить audited manual override. Seller только читает утверждённый курс.
7. Sale/receipt/exchange сохраняют прежний immutable FX snapshot; новый sync
   никогда не пересчитывает завершённые операции.

## Критерии готовности

- USD/EUR/TRY daily rates автоматически доступны для текущей Istanbul business
  date без действий Seller; EUR всегда равен `1`.
- Provider и выбранная buying/selling basis утверждены Owner и документированы.
- Weekend/holiday carry-forward сохраняет фактическую source date и явно виден в
  Owner UI.
- Missing, malformed, future-dated или implausible provider response не
  перезаписывает действующий курс и создаёт observable failure.
- Нет скрытого provider fallback: источник каждой строки известен и audited.
- Owner manual entry остаётся доступным fallback/override и не выдаётся за
  автоматически полученный курс.
- Job идемпотентен; retry/concurrent runs не создают conflicting rows или audit
  noise.
- Provider credentials, если понадобятся, находятся только в secret store.
- Historical sale/receipt/exchange FX snapshots не меняются.

## Тесты

- Parser fixtures для valid/malformed/missing-currency/date XML.
- Cross-rate precision, inversion and rounding tests.
- Istanbul business date, weekend, holiday, stale and future-date tests.
- Scheduled retry/idempotency/concurrency tests.
- RLS: Seller read, Seller write denial, Owner audited override, cross-role tests.
- Provider failure → existing approved rate/manual fallback without historical
  mutation.
- Demo/live builds и Owner/Seller browser smoke.

## Открытые решения

- Утвердить TCMB как provider и `Döviz Satış` как единый rate basis либо выбрать
  другой официальный показатель.
- Утвердить максимальный допустимый возраст carried-forward курса и канал alert.
- Решить, нужны ли GBP/RUB auto-rates в первой итерации или сначала только
  EUR/USD/TRY. Для отсутствующей у provider валюты запрещён выдуманный cross-rate.
