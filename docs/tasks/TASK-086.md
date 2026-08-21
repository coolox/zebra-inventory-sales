# TASK-086 — Подготовить pilot runbook и обучение

Статус: COMPLETED

## Цель

Создать короткие инструкции Owner/Seller и checklist запуска на пяти pilot devices.

## Предполагаемые файлы

- `docs/operations/PILOT_RUNBOOK.md`
- `docs/operations/OWNER_GUIDE.md`
- `docs/operations/SELLER_GUIDE.md`

## Зависимости

TASK-061, TASK-064, TASK-066, TASK-072, TASK-085.

## Критерии готовности

- Описаны login, receipt, sale, exchange, cancellation и incident escalation.
- Есть checklist 1 Owner + 4 Sellers.
- Инструкции доступны на English/Turkish или имеют утверждённый language plan.

## Тесты

- Dry-run обучения с test accounts.
- Checklist walkthrough on iPhone/Android.
- Feedback оформлен отдельными tasks.

## Текущее состояние — 2026-08-16

Prepared bilingual Owner/Seller guides and the five-device operational runbook. The
guides cover Magic Link login, receipt, sale, exchange, cancellation, closing and
incident escalation; no credentials, URLs, accounts or real data are recorded.

TASK-086 remains IN PROGRESS until Owner completes the documented walkthrough on
three iPhones and two Android devices with controlled accounts, records pass/fail
evidence and creates separate follow-up task IDs for any feedback. The agent cannot
substitute physical-device or human-role acceptance.

## Собранный feedback

- [TASK-152](TASK-152.md) — после архивации товара Owner не смог очевидно найти
  архивный список и действие восстановления. Исправление отложено до сообщения
  Owner о завершении сбора проблем.
- [TASK-153](TASK-153.md) — развёрнутый Reconciliation не нужен на основной Owner
  page, должен открываться только по запросу и полностью переводиться на Turkish;
  iPhone screenshot сохранён как manual walkthrough evidence без копирования
  персональных данных в репозиторий.
- [TASK-154](TASK-154.md) — длинный Low stock список на основной Owner page должен
  быть компактным по умолчанию и полностью открываться только по явному нажатию;
  iPhone screenshot отмечен как mobile walkthrough evidence.
- [TASK-155](TASK-155.md) — Seller invitation на текущем staging Preview возвращает
  generic unavailable не из-за Turkish имени, а из-за отсутствующей server-only
  Admin configuration; screenshot содержит contact data и не хранится в репозитории.
- [TASK-156](TASK-156.md) — одна multi-item sale (€50 + €100) отображается в Sales
  History двумя карточками по €150; до исправления нужно исключить duplicate
  sale/payment/movement, затем исправить grouping и line/total presentation.
- [TASK-157](TASK-157.md) — tap по Sales Trend bar на телефоне не показывает точную
  EUR сумму; существующий tooltip должен поддерживать touch наряду с hover/focus.
- [TASK-158](TASK-158.md) — короткий Movement History на телефоне выглядит как
  низкая bottom sheet у края экрана; нужен adaptive-height layout выше в viewport и
  более ясная визуальная иерархия.
- [TASK-159](TASK-159.md) — Audit Log позволяет нажимать Next и увеличивать page при
  пустом filtered result; filters должны reset page, а controls учитывать реальные
  границы результата.
- [TASK-160](TASK-160.md) — Adjust Stock должен требовать явный выбор размера внутри
  формы до ввода delta, показывать balance выбранного variant и не переносить delta
  при смене size.
- [TASK-161](TASK-161.md) — Reports при Turkish locale остаётся смешанным с English
  title, description, exports, KPI/dimension/table labels и fallback copy; нужен
  полный targeted translation pass.
- [TASK-162](TASK-162.md) — Owner запросил Edit товара, прежде всего исправление
  Product code, без пересоздания модели; UUID/history/stock должны сохраниться, а
  old/new values — попасть в audit.
- [TASK-163](TASK-163.md) — в Receive Flow после закрытия mobile keyboard к Product
  code добавляется неизвестный character; нужно воспроизвести точный input event и
  исключить любое изменение значения на blur/composition completion.

## Завершение — 2026-08-17

Owner сообщил, что walkthrough и сбор feedback завершены. Runbook и bilingual role
guides подготовлены; найденные проблемы сохранены отдельными TASK-152—TASK-163 без
секретов и персональных данных. Повторный device acceptance выполняется после
последовательного исправления и обновления staging.
