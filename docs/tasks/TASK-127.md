# TASK-127 — Добавить Camera / Upload labels в New Sale

Статус: pending

## Цель

Дать продавцу в New Sale понятную кнопку для съёмки этикетки камерой телефона или загрузки уже сделанных фотографий.

## Предполагаемые файлы

- `features/sales/ui/sale-flow.tsx`
- `features/sale-labels/ui/label-capture.tsx`
- `features/sale-labels/ui/label-processing-state.tsx`

## Зависимости

TASK-060, TASK-124, TASK-125, TASK-126.

## Критерии готовности

- После выбора Price Type доступны `Scan label` и `Upload label photos`, при этом обычный ручной code → color → size flow остаётся.
- Mobile input предлагает rear camera только после явного действия пользователя; отказ в camera permission не блокирует file upload/manual flow.
- Можно последовательно сфотографировать несколько этикеток или выбрать несколько готовых файлов.
- UI показывает upload/extract/match progress для каждого изображения и позволяет retry/remove.
- EN/TR copy объясняет, что фото только заполняет черновик и ничего не продаёт автоматически.

## Тесты

- Camera permission denied/fallback tests.
- Single/multi-file component tests.
- Mobile Safari/Chrome and Android Chrome smoke.

