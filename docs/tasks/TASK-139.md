# TASK-139 — Показать мини-фото в строках Inventory

Статус: COMPLETED

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

## Pricing rule

`Sell price` на Product Card остаётся только отображаемым ориентиром, вычисляемым существующим UI как `purchase cost × 3`. Эта цена не сохраняется в товаре, не становится обязательной для Seller и не меняет фактическую цену: её Seller по-прежнему вводит при подтверждении Sale.

## Выполнено

- Каждая строка Inventory показывает первую product photo как компактный thumbnail; для товара без фото добавлен локализованный доступный placeholder.
- В строках Seller и Owner показана purchase cost в исходной валюте.
- Existing Product Card не менялась: purchase cost там не появляется, а `Sell price` остаётся только ориентиром.
- Search, pagination и открытие Product Card по клику на строку сохранены.

## Проверка

- `npm test` — 71 files / 166 tests passed.
- `npm run build` — успешно.
- `npm run test:e2e` — 54/54 desktop/tablet/mobile smoke checks passed, включая thumbnail и purchase cost в Inventory.
