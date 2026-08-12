# TASK-126 — Сопоставлять этикетку с in-stock catalog variant

Статус: pending

## Цель

По extracted label найти ровно одну существующую модель/variant текущего магазина, не создавая товары и не допуская автоматического fuzzy merge.

## Предполагаемые файлы

- `features/sale-labels/model/match-label-to-catalog.ts`
- `features/catalog/data/**`
- `features/sales/model/**`

## Зависимости

TASK-117, TASK-118, TASK-125.

## Критерии готовности

- Matching priority: exact validated variant barcode → exact Product code/model article → normalized brand + code → manual review.
- После model match color/size должны точно определить один variant; barcode не обязателен.
- Matching ограничен active catalog текущего store и положительным доступным stock.
- Unknown, ambiguous, low-confidence и out-of-stock label не добавляется в cart автоматически.
- Fuzzy name/brand similarity используется только как ranked suggestion для человека.
- Результат содержит reason/confidence и source fields для проверки.

## Тесты

- Exact code, optional barcode, no-barcode, ambiguous and unknown cases.
- Wrong store, archived model and zero-stock denial.
- Color synonym/size normalization и no-fuzzy-auto-match.

