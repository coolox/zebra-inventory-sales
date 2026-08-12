# TASK-095 — Адаптировать Telegram bot к общему API

Статус: pending

## Цель

Перевести утверждённые bot flows на production application services без независимого источника stock.

## Предполагаемые файлы

- Отдельный bot repository или `integrations/telegram/**` после подтверждения
- `docs/operations/TELEGRAM.md`

## Зависимости

TASK-094.

## Критерии готовности

- Bot не пишет legacy SQLite как master.
- Каждая operation имеет authenticated actor/store mapping.
- Unsupported flows дают безопасный handoff в web.

## Тесты

- Staging bot receipt/sale/query smoke.
- Permission mapping tests.
- Legacy write-disabled verification.

