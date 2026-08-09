# Clothing MVP Scope

Обновлено: 2026-08-08  
Статус: утверждён владельцем

## 1. Цель релиза

Дать магазину одежды первую надёжную web/PWA-систему для ежедневного заведения товара, приёмки, поиска, продаж и контроля результатов. Обувь и сумки в первый запуск не входят, но core-модель не должна мешать добавить их позже.

## 2. Пользователи

### Owner

- видит весь clothing store;
- управляет продавцами;
- приглашает Seller по email, указывает его phone и отправляет Supabase Magic Link;
- видит закупочную цену, фактическую цену, маржу и все продажи;
- видит поставщиков, остатки и отчёты;
- управляет настройкой business week на более позднем этапе.

### Seller

- работает только в назначенном clothing store;
- видит каталог, остатки, закупочную цену и маржу;
- видит продажи всех продавцов этого магазина;
- принимает товар и оформляет продажу;
- не видит будущие магазины обуви и сумок.

## 3. Каталог одежды

### Product model

- model/name;
- brand;
- supplier;
- category;
- gender: Men / Women / Unisex;
- model code;
- photographs;
- active/archive status.

### Product variant

- product model;
- size;
- color;
- отдельный system variant ID;
- существующий barcode, если он есть;
- текущий остаток как результат inventory movements.

Один model code повторяется у всех size/color-вариантов модели. Он не является уникальным ключом варианта.

## 4. Приёмка и остатки

- создание supplier;
- ручная приёмка товара;
- несколько size/color lines в одной поставке;
- закупочная цена и currency;
- подтверждение документа перед изменением остатка;
- inventory movement на каждую строку;
- начальная инвентаризация чистого каталога;
- ручной поиск по model code/barcode;
- история движений и защита от отрицательного остатка.

AI photo/PDF extraction не входит в первый MVP.

## 5. Продажа

- один или несколько товаров в одной sale;
- продавец и clothing store фиксируются автоматически;
- фактическая цена каждой строки, которую seller свободно определяет на основе видимой закупочной цены;
- currency: EUR, USD, TRY, RUB или GBP;
- отдельного поля или правила discount нет;
- один или несколько payment lines: Cash, Card и/или Bank transfer;
- cost и exchange-rate snapshot;
- revenue/margin snapshots в EUR;
- атомарное списание остатков;
- история продажи и audit trail.

Возврата денег в первом MVP нет. Seller может самостоятельно оформить обмен: при более дорогом новом товаре покупатель доплачивает, при более дешёвом разница не возвращается. Операция и причина видны Owner.

Seller также может отменить ошибочно оформленную sale. Отмена создаёт reversal movements, требует reason и отображается Owner; исходная запись не удаляется.

Клиентский чек не печатается и не отправляется — достаточно внутренней записи sale.

## 6. Отчёты

- Today / business week / month / year / custom range;
- business week по умолчанию Wednesday–Tuesday;
- оборот, себестоимость, маржа, количество продаж и единиц;
- все продавцы clothing store;
- supplier, brand, model, category;
- low stock;
- display totals в EUR с сохранением original transaction currency.

## 7. Язык и интерфейс

- English;
- Turkish;
- responsive web/PWA;
- installable manifest и mobile-friendly flows;
- тёмный графитовый визуальный язык с фиолетовым accent;
- language switcher без дублирования бизнес-логики.

## 8. Технический baseline

- Next.js PWA;
- Supabase Auth Magic Link;
- server-side роли и store access;
- Postgres data model;
- Row Level Security;
- object storage для фотографий;
- audit log;
- staging и production изолированы;
- automatic backup/restore до пилота.

Hosting подтверждён: Vercel + managed Supabase. Owner вручную задаёт дневные курсы валют, seller только использует их.

Purchase cost, как и sale price, поддерживает EUR/USD/TRY/RUB/GBP и сохраняет original currency + EUR snapshot.

## 9. Не входит в Clothing MVP

- магазины обуви и сумок;
- миграция старых товаров/продаж Telegram-бота;
- AI/OCR накладных;
- Telegram integration;
- автоматический FX provider;
- AI-распознавание code/size/color по фотографии этикетки;
- собственная печать barcode/price labels;
- резервы;
- loyalty/CRM;
- advanced forecasting.

## 10. Exit criteria

Clothing MVP готов к пилоту, когда:

1. Owner приглашает seller по Magic Link.
2. Seller видит только clothing store.
3. Можно создать каталог с variants и принять начальный stock.
4. Ручной barcode/code и filters находят модель, затем seller выбирает size/color variant.
5. Sale надёжно уменьшает остаток и фиксирует EUR margin snapshot.
6. Конкурентная продажа не создаёт отрицательный stock.
7. Owner и seller получают разрешённые отчёты.
8. Все финансовые и складские изменения имеют audit trail.
9. English/Turkish интерфейсы проверены на desktop и mobile.
10. Backup восстановлен на staging в рамках rehearsal.

## 11. Pilot users and devices

- 1 Owner — iPhone;
- 2 Sellers — iPhone;
- 2 Sellers — Android;
- всего 5 индивидуальных учётных записей;
- mobile portrait flows являются основным сценарием проверки PWA.
