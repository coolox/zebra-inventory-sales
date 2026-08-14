# TASK-139 — Показать мини-фото в строках Inventory

Статус: pending

## Цель

Сделать фотографию основным визуальным ориентиром в Inventory: каждая строка товара показывает компактный thumbnail первой фотографии модели.

## Границы

- Использовать уже загружаемые private product-image signed URLs из live catalog; не менять Storage/RLS и не публиковать bucket.
- На desktop и mobile показывать `object-cover` thumbnail рядом с названием, брендом, code, size и color.
- В каждой строке Inventory показывать purchase cost в исходной валюте (`cost` + `currency`) для Seller и Owner.
- В открытой Product Card не показывать purchase cost: там остаётся только sell price.
- Для товара без фотографии показывать нейтральный placeholder, не создавая ложного изображения.
- Клик по строке сохраняет открытие существующей Product Card; thumbnail не создаёт отдельного сценария.

## Зависимости

TASK-025.

## Критерии готовности

- Загруженная фотография видна как маленькое изображение в Inventory Seller и Owner.
- Seller и Owner видят purchase cost в каждой строке Inventory; в Product Card purchase cost отсутствует.
- Товар без фото имеет аккуратный placeholder.
- Поиск, пагинация, остаток, desktop/mobile layout и доступное имя строки не деградируют.

## Тесты

- Component tests: фото, placeholder, selection/search.
- Browser smoke: desktop и mobile Inventory с изображением.
- `npm test` и `npm run build`.

## Открытое pricing-уточнение

Текущая карточка показывает `Sell price` как UI-расчёт `purchase cost × 3`. Фиксированная или рекомендуемая selling price в модели товара не хранится: фактическая цена по принятому правилу вводится при подтверждении Sale. Менять источник sell price можно только после отдельного решения владельца.
