# TASK-139 — Показать мини-фото в строках Inventory

Статус: pending

## Цель

Сделать фотографию основным визуальным ориентиром в Inventory: каждая строка товара показывает компактный thumbnail первой фотографии модели.

## Границы

- Использовать уже загружаемые private product-image signed URLs из live catalog; не менять Storage/RLS и не публиковать bucket.
- На desktop и mobile показывать `object-cover` thumbnail рядом с названием, брендом, code, size и color.
- Для товара без фотографии показывать нейтральный placeholder, не создавая ложного изображения.
- Клик по строке сохраняет открытие существующей Product Card; thumbnail не создаёт отдельного сценария.

## Зависимости

TASK-025.

## Критерии готовности

- Загруженная фотография видна как маленькое изображение в Inventory Seller и Owner.
- Товар без фото имеет аккуратный placeholder.
- Поиск, пагинация, остаток, desktop/mobile layout и доступное имя строки не деградируют.

## Тесты

- Component tests: фото, placeholder, selection/search.
- Browser smoke: desktop и mobile Inventory с изображением.
- `npm test` и `npm run build`.
