# TASK-164 — Разобрать и закрыть текущие browser-regression failures

Статус: COMPLETED

Источник: явная команда Owner после TASK-149 review, 2026-08-20.

## Цель

Перед единым staging Preview воспроизвести и классифицировать семь текущих
Playwright failures из полного локального suite; исправить только подтверждённые
регрессии, вызванные текущим remediation set.

## Границы

- Scope: Audit Log, Seller sales summary и Adjust Stock scenarios, которые упали в
  локальном `npm run test:e2e` после TASK-163.
- Сначала воспроизведение с точным assertion/error context. Не считать failure
  «несвязанным» без evidence.
- Исправлять только реальный product/test regression. Если expectation устарел,
  обновить test вместе с объяснением фактического согласованного поведения.
- Не менять staging/production, credentials, Auth setup или Go/No-Go decision.

## Критерии готовности

- Все семь failures имеют подтверждённую причину и outcome: исправлены либо
  документированно признаны не дефектом с обновлённым test evidence.
- Полный Playwright suite зелёный, либо оставшийся blocker изолирован в отдельной
  TASK с воспроизведением и не скрыт.
- Targeted Vitest и `npm run build` проходят.
- Обновлены `PROJECT_STATUS.md`, `ROADMAP.md`, `CHANGELOG.md` и task evidence.

## Следующий шаг после completion

Создать единый staging Preview и выполнить Owner/Seller mobile walkthrough в
TASK-165; найденные на телефонах дефекты фиксировать отдельными небольшими TASK.

## Результат

- Подтверждённый product defect: Adjust Stock открывался поверх Product Details,
  поэтому нижний dialog перехватывал pointer events и Owner не мог выбрать size.
  Теперь карточка продукта закрывается до открытия adjustment dialog, а список
  variants для выбранных model/color берётся из workspace, поэтому выбор size,
  before/delta/after preview и submit снова доступны.
- Четыре desktop/tablet Audit Log/Seller summary failures были stale test selectors:
  глобальный `Seller` стал неоднозначным после добавления Seller dimension в Reports.
  Smoke теперь выбирает role control внутри header `banner`; product behaviour не
  изменялся.
- Все семь исходных failures воспроизведены: 3 Adjust Stock fixed, 2 Audit Log and
  2 Seller summary selector expectations made deterministic. Один последующий
  isolated Low Stock timing failure не воспроизвёлся standalone; повторный full run
  подтвердил его как transient, а не скрытый blocker.

## Evidence

- Targeted Playwright for all seven scenarios: 9/9 passed.
- Targeted Vitest (AdjustmentForm, AuditLog, SellerSalesSummary): 13/13 passed.
- Full `npm run test:e2e`: 75/75 passed on repeat.
- `npm run build`: passed; existing unrelated lint warnings remain warnings.
