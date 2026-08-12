# TASK-026 — Добавить barcode в catalog schema

Статус: COMPLETED

## Цель

Хранить barcode модели/варианта с контролируемой уникальностью и индексом поиска.

## Предполагаемые файлы

- `supabase/migrations/<new>_product_barcodes.sql`
- `docs/DATA_MODEL.md`
- `supabase/README.md`

## Зависимости

TASK-012.

## Критерии готовности

- Schema различает model code и barcode.
- Определена store-scoped uniqueness policy.
- Existing rows мигрируют без потери данных.

## Тесты

- Fresh migration run.
- Duplicate/cross-store barcode SQL cases.
- RLS read test.

## Результат

- В `product_models` и `product_variants` barcode остаётся отдельным от `model_code`; пустые и внешние пробелы нормализуются безопасно.
- Введена store-scoped, case-insensitive policy: barcode принадлежит только одной модели или варианту в пределах магазина; в другом магазине такой же barcode допустим.
- Миграция не удаляет существующие barcode. Если старые данные уже содержат конфликт в одном магазине, migration останавливается до включения enforcement и сообщает store/barcode для ручного разрешения.
- Добавлены lookup indexes, concurrency-safe trigger enforcement и pgTAP suite: same-store rejection, cross-store allowance и RLS read scope.
- `npm run supabase:verify` прошёл с чистой базы: 3 SQL files, 32 checks. `npm test` 51/51, TypeScript и production build проходят.
- Migration протестирована только локально; staging/production не изменялись.
- После решения D-051 migration нельзя применять на staging до TASK-117: barcode остаётся nullable и не должен становиться основой product identity или обязательным полем operational flow.
