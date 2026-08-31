# TASK-208 — Не блокировать live workspace ошибкой фотографии товара

Статус: COMPLETED

Создано: 2026-08-31 из недельного pilot intake после наблюдения Owner: после
входа workspace мог не показать данные. Реальные account identifiers и данные
магазина в task evidence не записываются.

## Причина

`loadLiveCatalog` считал ошибку создания одной private signed URL фотографии
фатальной. Из-за этого один недоступный/устаревший image object прерывал весь
`loadLiveWorkspace`, хотя каталог, stock и продажи оставались доступными через
database/RLS.

## Цель

Сделать product photo optional enhancement: отсутствие или ошибка одной signed
URL не скрывает inventory и Owner/Seller workspace. Core database/RLS ошибки не
маскировать и не заменять demo-данными.

## Критерии готовности

- Успешные signed URLs продолжают показывать фотографии.
- Ошибка/отсутствие одной URL пропускает только эту фотографию.
- Ошибки core catalog queries остаются fatal и видны через существующий live
  workspace error/retry state.
- Targeted test, demo/live builds и `git diff --check` проходят.
- После consolidated remediation publication Owner проверяет fresh login и
  catalog loading на живом account без раскрытия identity.

## Возврат

TASK-088 остаётся pilot/remediation parent и продолжится после TASK-208.

## Реализация и evidence — 2026-08-31

- Signed URLs для product photos теперь собираются best-effort: success остаётся
  в catalog, а error, отсутствие объекта или rejected storage request исключает
  только конкретную фотографию.
- Product models, variants, movements, receipts и другие core database/RLS
  queries не менялись и продолжают fail-fast через существующий live error/retry
  state; demo данные при ошибке не подставляются.
- Targeted Vitest: `features/catalog/data/load-live-catalog.test.ts` проверяет
  partial/no signed URLs; вместе с TASK-207 auth coverage — 3 files / 7 tests
  passed.
- `npm run build:demo` — passed.
- `npm run build:live` — passed.
- `git diff --check` — passed.
- Production data, Storage objects, Auth, RLS, migrations и secrets не менялись.
  Fresh live login/catalog recheck выполняется после consolidated publication в
  TASK-088.
