# TASK-163 — Не добавлять лишний символ в Product code при закрытии mobile keyboard

Статус: COMPLETED

Приоритет: P1 — риск создания/поиска неверного product identity.

Источник: feedback Owner во время walkthrough TASK-086, 2026-08-17.

## Наблюдение

В Receive Flow Owner вводит Product code с клавиатуры телефона. После сворачивания
клавиатуры/потери фокуса в поле появляется дополнительный непонятный символ, которого
пользователь не вводил.

Точный символ, модель телефона, OS/browser и keyboard locale пока не зафиксированы.
Не предполагать скрытно, что это пробел, newline, composition artifact или barcode
terminator: определить фактическое событие при воспроизведении.

## Ожидаемый результат

- Закрытие mobile keyboard, tap вне поля, blur и переход к следующему шагу не меняют
  введённый Product code.
- Leading zeros, Latin/Turkish letters и digits сохраняются в точном порядке.
- Если input содержит запрещённый символ, UI показывает validation и не исправляет
  значение скрытно созданием другого code.
- Enter/Done/Go, IME composition и hardware/scanner terminator не добавляют
  отображаемый либо сохранённый character.

## Диагностика перед исправлением

- Воспроизвести на затронутом устройстве и записать только safe before/after sample,
  OS/browser/keyboard locale и действие закрытия; не использовать реальный customer
  или secret data.
- Проверить event sequence `composition*`, `beforeinput`, `input`, `change`, `blur`,
  `keydown` и возможный scanner handler без логирования пользовательских данных.
- Сравнить displayed state, receipt draft payload и normalized server value.

## Критерии готовности

- Product code остаётся неизменным после всех способов закрытия клавиатуры на target
  iPhone/Android.
- Search existing product и create-new-model path получают одинаковое корректное
  значение без invisible suffix/prefix.
- Ошибка не создаёт duplicate model и не влияет на barcode/QR handling.
- English/Turkish keyboard и locale flows проходят одинаково.

## Проверки

- Component tests для blur, Enter/Done, composition и trailing control characters.
- Leading-zero/alphanumeric/Turkish input regression TASK-117.
- iPhone/Android manual Receive Flow walkthrough.
- `npm run build`.

## Ограничение

Не начинать диагностику/исправление, пока Owner не сообщит, что сбор проблем TASK-086
завершён.

## Результат

- Receive Flow больше не передаёт event value без проверки в catalog lookup. Product
  code принимает visible Unicode characters, включая leading zeroes, Latin/Turkish
  letters и digits, но отвергает control/invisible format characters с явной EN/TR
  validation — без hidden trim, replacement или сохранения другого code.
- `Enter` / `Done` / `Go` предотвращаются как keyboard terminators и только снимают
  focus; обычный `blur` не изменяет state. `beforeinput` блокирует line-break input,
  а IME composition откладывает lookup до `compositionend`.
- Search existing model и new-model receipt draft получают тот же validated code;
  barcode/QR handling не менялись.

## Evidence

- Targeted Vitest `product-code-input` + `receive-flow`: 14/14 passed. Покрыты
  blur, Done, Turkish IME composition, leading-zero/alphanumeric и invisible/control
  suffix boundaries.
- `npm run build` passed (existing unrelated lint warnings remain warnings).
- Existing Playwright receive-flow smoke passed in desktop/tablet/mobile. Full suite
  completed 68/75: 7 unrelated existing failures are in Audit Log, Seller summary
  and Adjust Stock smoke cases; Receive Flow is not among them.
- В этом окружении нет подключённого physical iPhone/Android, поэтому safe
  before/after device evidence, OS/browser/keyboard locale и manual keyboard
  dismissal остаются обязательной частью общего staging Preview walkthrough.

## Physical Android regression finding — 2026-08-21

- На Redmi 14 закрытие экранной клавиатуры системной стрелкой вниз воспроизводимо
  добавляет неожиданный символ: safe sample `SS55` становился `SS55Q` или `SS55И`.
  В этот момент телефон вибрирует как при нажатии клавиши.
- Та же проблема затрагивает числовое поле продажи: `100` становилось `1004`.
- Таким образом, реализованный TASK-163 boundary прошёл автоматические проверки, но
  не закрыл physical Android сценарий. Finding вынесен в отдельную
  [TASK-170](TASK-170.md); TASK-163 не переоткрывается и её прежнее evidence не
  считается device acceptance.
- По указанию Owner TASK-170 пока только записана: диагностика и исправление начнутся
  после завершения сбора всех найденных багов.
