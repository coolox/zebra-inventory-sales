# Zebra Retail

Zebra Retail — будущая система учёта товаров и продаж для магазинов одежды, обуви и сумок. Сейчас в репозитории находится clothing-only интерактивное demo без backend: роли владельца и продавца, склад, пошаговая multi-item продажа, ручная приёмка с подсказками и управление продавцами.

## Быстрый запуск

Требуется Node.js 18.18+.

```bash
npm install
npm run dev
```

Открыть `http://localhost:3000`.

Проверка production-сборки:

```bash
npm run build
```

## Статус

Проект находится на этапе Frontend Foundation. Целевая инфраструктура Vercel + managed Supabase утверждена, но backend, база данных, API и настоящая авторизация ещё не реализованы.

Актуальная точка продолжения: [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md).

## Документация

- [`AGENTS.md`](AGENTS.md) — обязательные правила для новых агентов.
- [`docs/README.md`](docs/README.md) — карта документации.
- [`docs/PRODUCT.md`](docs/PRODUCT.md) — продукт, пользователи и сценарии.
- [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) — состав первого реального релиза для магазина одежды.
- [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) — текущее состояние и следующий шаг.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — этапы реализации.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — границы и целевая архитектура.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — предметная модель.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — журнал решений.
- [`docs/QUESTIONS.md`](docs/QUESTIONS.md) — вопросы владельцу продукта.
- [`docs/WORKFLOW.md`](docs/WORKFLOW.md) — порядок ведения проекта и handoff.
- [`docs/UI_REVIEW.md`](docs/UI_REVIEW.md) — следующий visual review и UI-решения.

## Структура кода

```text
app/
  layout.tsx       метаданные и корневой layout
  page.tsx         текущее одностраничное demo
  globals.css      тема и общие стили
components/
  sale-flow.tsx            пошаговая продажа и корзина
  receive-flow.tsx         приёмка color → sizes → quantity
  low-stock-carousel.tsx   Owner carousel товаров внимания
  product-card.tsx         карточка модели и фотокарусель
  seller-goal-card.tsx     личные цели Seller
public/products/           mock-фотографии clothing-моделей
lib/
  mock-data.ts     демонстрационные товары, продажи и продавцы
  types.ts         текущие клиентские типы
docs/              постоянная память и проектная документация
```

## Безопасность

Demo не подключено к VPS и не использует реальные данные. Не добавляйте в репозиторий `.env`, Telegram-токены, SSH-ключи или service-account JSON.
