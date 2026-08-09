# Roadmap Zebra Retail

Обновлено: 2026-08-08  
Текущий этап: Этап 2  
Правило: следующий этап начинается только после выполнения exit criteria текущего

## Этап 0 — Исследование и demo

Статус: завершён

- [x] Провести read-only аудит существующего Telegram-бота.
- [x] Зафиксировать текущие поля товара и продажи.
- [x] Создать Next.js + Tailwind demo.
- [x] Реализовать preview двух ролей и трёх магазинов.
- [x] Реализовать клиентские mock-продажу, приёмку и управление продавцами.
- [x] Проверить production build.
- [x] Создать постоянную документацию проекта.

Exit criteria: demo собирается, текущее состояние и ограничения зафиксированы.

## Этап 1 — Product discovery и решения

Статус: завершён

- [x] Получить ответы на обязательные вопросы из `QUESTIONS.md`.
- [x] Утвердить базовую матрицу прав владельца и продавца.
- [x] Утвердить состав Clothing MVP и список отложенных функций.
- [x] Утвердить основной канал: web/PWA.
- [x] Утвердить English/Turkish и business week Wednesday–Tuesday с будущей настройкой.
- [x] Утвердить EUR основной валютой; определить дополнительные валюты и FX provider позже.
- [x] Определить судьбу Telegram-бота: приложение сначала, постепенная адаптация бота позже.
- [x] Выбрать Supabase Auth + Magic Link.
- [x] Подтвердить Vercel для frontend и managed Supabase для Postgres/Auth/Storage.
- [x] Утвердить чистый старт без миграции текущих товаров и продаж.
- [x] Утвердить clothing-only первый пилот; shoes и bags добавить позже.
- [x] Утвердить currencies EUR/USD/TRY/RUB/GBP и Cash/Card/Bank transfer.
- [x] Зафиксировать ответы первого раунда в `DECISIONS.md`.

Exit criteria: нет открытых вопросов, блокирующих архитектуру и MVP.

## Этап 2 — Frontend foundation

Статус: в работе

- [ ] Разделить `app/page.tsx` на feature-модули и переиспользуемые компоненты. Начато: вынесены Sale Flow, Receive Flow и low-stock carousel.
- [ ] Зафиксировать design tokens, состояния компонентов и адаптивные правила. Начато: добавлены Light/Dark theme tokens и responsive Product/Receive flows.
- [ ] Реализовать i18n для English и Turkish. Начато: добавлены en/tr dictionary, persistent language switcher и локализация основных dashboard/nav/stock labels; modal flows/login ещё требуют полного покрытия.
- [ ] Ввести routing будущих разделов без потери цельности продукта.
- [ ] Добавить form validation и единый слой доменных ошибок.
- [ ] Добавить test runner, component tests и e2e smoke tests.
- [ ] Добавить локальный persistence adapter для development/demo.
- [ ] Описать API contracts независимо от выбранного transport.
- [ ] Проверить desktop, tablet и mobile в браузере.

Exit criteria: frontend модульный, тестируемый и готов заменить mocks реальным API.

## Этап 3 — Backend и безопасность

Статус: в работе — staging foundation применён, Magic Link flow готов к настройке и проверке

- [ ] Создать backend-проект и конфигурацию окружений. Начато: staging project создан, добавлены Supabase browser/server clients, `.env.example` и SDK; локальный `.env.local` ещё не заполнен.
- [ ] Настроить staging/production database и миграции. Начато: первая RLS migration применена к чистому staging; production не создан.
- [ ] Реализовать пользователей, сессии и восстановление доступа. Начато: первичный Owner создан, добавлены login/callback/session middleware и active-membership guard; требуется ручная проверка обновлённого Magic Link flow.
- [ ] Настроить Magic Link callback URLs, email templates и production SMTP. Начато: callback route есть; требуется добавить staging redirect URL. SMTP относится к production.
- [ ] Реализовать server-side RBAC и доступ к магазинам. Начато: middleware требует активный `store_memberships`; следующий шаг — Owner invite и write policies/RPC.
- [ ] Реализовать audit log. Начато: audit log table и Owner-only read RLS применены в staging для receipt/FX operations; UI owner audit view ещё впереди.
- [ ] Настроить валидацию, rate limiting и безопасное хранение секретов. Начато: authenticated RPC validates receipt input and Owner-only FX mutation; UI/server validation и production secrets ещё впереди.
- [ ] Добавить backup/restore и проверку восстановления.
- [ ] Добавить CI для типов, тестов, миграций и сборки.

Exit criteria: безопасный пользователь может войти и получить только разрешённые данные.

## Этап 4 — Складское ядро

Статус: ожидает

- [ ] Магазины и доступы пользователей.
- [ ] Фабрики/поставщики.
- [ ] Модели товара и варианты размер/цвет.
- [ ] Фотографии, внутренние коды и штрихкоды. Начато: private Storage bucket, store-scoped RLS policies, image metadata RPC and product-card upload flow подготовлены; требуется применить staging migration и проверить реальную загрузку.
- [ ] Документы приёмки и строки приёмки. Начато: idempotent RPC applied to staging, live Receive Flow invokes it, and live catalog refreshes after a receipt; follow-up migration исправляет business-date FX lookup, затем остаётся manual integration test.
- [ ] Журнал складских движений. Начато: receipt RPC атомарно создаёт приходные movements, а live catalog суммирует их для остатка; sale/exchange/cancellation ещё не реализованы.
- [ ] Дневные курсы валют. Начато: Owner-only upsert RPC applied to staging and Owner FX settings UI invokes it; manual integration test remains.
- [ ] Перемещения между магазинами.
- [ ] Инвентаризация и корректировки.
- [ ] Низкий остаток и история изменения товара.

Exit criteria: остаток каждого варианта воспроизводится из движений и сходится после конкурентных операций.

## Этап 5 — Продажи

Статус: ожидает

- [ ] Корзина и продажа нескольких позиций.
- [ ] Свободная фактическая цена без discount entity; mixed payment lines.
- [ ] Атомарное списание остатков.
- [ ] Снимок себестоимости и валютного курса.
- [ ] Обмен товара согласно утверждённой политике; денежные возвраты не входят в Clothing MVP.
- [ ] Резервы, если входят в MVP.
- [ ] Внутренняя запись sale; customer receipt не требуется.
- [ ] История смены продавца.

Exit criteria: продажи и обмены не создают отрицательный или несогласованный остаток.

## Этап 6 — Отчёты владельца

Статус: ожидает

- [ ] Оборот, себестоимость, маржа, количество и средний чек.
- [ ] Сеть / магазин / продавец / товар / фабрика.
- [ ] День / неделя / месяц / год / произвольный период.
- [ ] Валютные снимки и единая базовая валюта.
- [ ] Остатки, оборачиваемость и низкий остаток.
- [ ] Экспорт CSV/XLSX/PDF согласно потребности.
- [ ] Контроль расхождений и корректировок.

Exit criteria: отчёты согласованы с журналом продаж и складских движений.

## Этап 7 — AI-приёмка и Telegram

Статус: ожидает

- [ ] Загрузка фото и PDF накладных.
- [ ] OCR/AI extraction в черновик, но не автоматическая запись.
- [ ] Проверка и подтверждение пользователем.
- [ ] Общий backend для web и Telegram-бота либо утверждённая замена бота.
- [ ] Идемпотентность повторной обработки сообщений и документов.
- [ ] Миграция существующих фото и SQLite-данных.

Exit criteria: web и Telegram не расходятся по остаткам и продажам.

## Этап 8 — Production launch

Статус: ожидает

- [ ] Staging с обезличенными данными.
- [ ] Миграционная репетиция и rollback plan.
- [ ] Обучение владельца и продавцов.
- [ ] Мониторинг, журнал ошибок и алерты.
- [ ] Нагрузочные и security smoke tests.
- [ ] Запуск одного пилотного магазина.
- [ ] Сверка остатков и продаж.
- [ ] Подключение остальных магазинов.
- [ ] Post-launch support и список улучшений.

Exit criteria: система ежедневно используется, резервные копии восстанавливаются, критических расхождений нет.

## После MVP

Предварительный backlog, не обещание:

- мобильное приложение;
- программа лояльности и клиенты;
- интеграция с кассой и бухгалтерией;
- закупочные заказы и прогнозирование;
- мультикомпания и франшиза;
- advanced analytics и рекомендации.
