# TASK-090 — Выбрать OCR/AI provider и privacy policy

Статус: pending

## Цель

Принять документированное решение по provider, data residency, retention, cost и acceptable document content.

## Предполагаемые файлы

- `docs/DECISIONS.md`
- `docs/AI_PRIVACY.md`
- `docs/PROJECT_STATUS.md`

## Зависимости

TASK-089.

## Критерии готовности

- Provider и fallback approved владельцем.
- Определены retention/redaction/consent rules.
- Проверена поддержка Turkish invoice tables, rotated/mobile photos, decimal comma и многостраничных документов.
- Решение не обещает автоматическое проведение stock.

## Тесты

- Privacy/security review checklist.
- Sample sanitized invoice feasibility test: header, `Ürün Kodu`, description, quantity, unit price and total.
