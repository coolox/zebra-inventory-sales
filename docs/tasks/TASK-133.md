# TASK-133 — Закрыть оставшиеся Turkish UI gaps

Статус: pending

## Цель

Завершить фактический Turkish pass перед внешней mobile‑проверкой preview.

## Предполагаемые файлы

- `lib/i18n.ts`
- `features/audit/ui/audit-log.tsx`
- `features/seller-goals/ui/seller-goal-card.tsx`
- `components/modal.tsx`
- точечные `features/**/ui/*.tsx`

## Зависимости

TASK-058, TASK-132.

## Критерии готовности

- Audit log, Seller Goal, dialogs, loading/empty/error states и aria labels не показывают hardcoded English при Turkish locale.
- Domain/API keys остаются неизменными и переводятся только при отображении.
- Date, number и currency formatting используют выбранную locale.

## Тесты

- Targeted source scan visible UI literals.
- Turkish component smoke tests.
- Desktop/mobile Turkish browser smoke.

