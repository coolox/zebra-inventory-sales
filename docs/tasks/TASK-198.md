# TASK-198 — Сохранить доступное Owner удаление фотографии после сохранения товара

Статус: pending

Приоритет: P1 — ошибочно загруженная фотография не должна оставаться в товаре
без понятного способа её удалить.

Источник: повторное уточнение Owner во время local visual intake, 2026-08-22.

## Запрос Owner

После сохранения товара Owner должен видеть понятный путь к управлению его
фотографиями и иметь право удалить каждую ошибочно добавленную фотографию. Это
нужно, например, когда при создании товара была выбрана неверная фотография.

TASK-178 уже реализовала live server-side deletion/private Storage safety. Эта
задача не отменяет её evidence: она закрывает acceptance gap текущего локального
demo и будущего unified Product Edit (TASK-197), где Owner должен суметь увидеть и
проверить этот сценарий, а не только полагаться на скрытую техническую реализацию.

## Цель

Сделать photo-management entry point доступным после сохранения товара: Owner
может выбрать конкретную фотографию, подтвердить её удаление и сразу увидеть
корректное состояние карточки. В demo действие должно быть функционально
проверяемым на локальных данных; в live оно использует уже защищённую TASK-178
операцию без ослабления Storage/RLS boundary.

## Границы

- Только Owner и только фотографии разрешённого товара/store; Seller не получает
  delete control и server-side остаётся denied.
- Entry point может быть частью unified `Edit product` из TASK-197 либо ясным
  соседним Owner control, но не должен теряться после перестановки Product Details
  actions.
- Сохраняются confirm/cancel/loading/error/retry, empty-photo state, swipe/
  fullscreen viewing и historical sale/receipt image snapshots из TASK-178/TASK-196.
- Demo изменяет только persisted local workspace; live не получает mock fallback и
  использует private Storage/DB cleanup, audit и recovery semantics TASK-178.
- Не менять sale, stock, product code/model RPC, роль Seller или historical data.

## Критерии готовности

- После reload сохранённого товара Owner находит photo-management control без
  поиска по коду или скрытым жестам.
- Owner удаляет выбранную ошибочную фотографию с явным подтверждением; carousel и
  Product Details обновляются после reload, а удаление последней оставляет понятный
  empty state.
- В local demo сценарий реально работает на fixture/persisted данных; в live
  сохраняются TASK-178 RLS/Storage/audit/retry guarantees и нет false success.
- Seller/cross-store attempt не получает control и server-side denied; другие
  фотографии, товары и historical snapshots нетронуты.
- Targeted UI/data tests, build и Owner mobile visual recheck проходят.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.
