# Предметная модель Zebra Retail

Обновлено: 2026-08-08  
Статус: предлагаемый production baseline, требует утверждения MVP

## 1. Основные сущности

### User

- `id`
- имя, отдельные email и phone;
- статус: invited / active / blocked;
- дата создания и последнего входа.

Owner создаёт invitation для Seller. Supabase Auth отправляет Magic Link на email; phone является данными профиля, но не способом входа в Clothing MVP.

### StoreMembership

Связывает пользователя с магазином и правами.

- `user_id`
- `store_id`
- роль: owner / manager / seller — необходимость manager ожидает решения;
- granular permissions при необходимости.

Владелец может иметь доступ ко всем магазинам. Продавец потенциально может быть назначен в один или несколько.

### Store

- `id`, name, category;
- адрес и timezone;
- статус.

### Supplier

- `id`, name;
- контакты и заметки;
- базовая валюта при необходимости.

### Product

Модель товара, общая для вариантов.

- внутренний код модели; в clothing этот code общий для всех вариантов size/color;
- name, brand, category, gender, description;
- supplier или связь с несколькими supplier;
- фотографии и штрихкод модели, если используется.

### ProductVariant

Конкретный продаваемый вариант.

- `product_id`
- размер;
- цвет;
- SKU/internal code;
- barcode;
- active status.

Один вариант не должен объединять разные размеры в строке `"S,M,L"`.
Так как clothing model code повторяется, database identity варианта строится на отдельном `id`, а не на уникальности model code. Barcode может быть сохранён отдельно от model code.

### PurchaseReceipt

Документ приёмки.

- store, supplier;
- номер и дата документа;
- draft / confirmed / cancelled;
- created_by, confirmed_by;
- source: manual / text / photo / PDF / import;
- ссылка на исходный файл.

### PurchaseReceiptLine

- receipt;
- variant;
- quantity;
- unit cost и currency;
- exchange-rate snapshot при необходимости.

Разрешённые purchase currencies: EUR, USD, TRY, RUB, GBP. Каждая строка сохраняет original cost и EUR cost snapshot.

### InventoryMovement

- variant и store;
- тип: receipt / sale / exchange_in / exchange_out / transfer_in / transfer_out / adjustment / write_off;
- signed quantity;
- ссылка на исходный документ;
- actor, timestamp, reason;
- idempotency key.

### Sale

- store, seller;
- timestamp и business date;
- status;
- totals by original currencies and EUR;
- idempotency key.

### SaleLine

- sale, variant;
- quantity;
- actual unit price и currency;
- cost snapshot;
- exchange-rate snapshot;
- margin snapshot;
- фактическая цена вводится seller; отдельного discount field нет.

Разрешённые currency фактической продажи: EUR, USD, TRY, RUB, GBP. Base reporting currency: EUR.

### SalePayment

Одна sale имеет одну или несколько payment lines:

- sale;
- method: Cash / Card / Bank transfer;
- amount;
- currency;
- EUR snapshot.

Сумма payment lines должна совпадать с итогом sale в согласованной валютной модели.

### Exchange

Обмен ссылается на исходную sale и line:

- возвращаемый variant и quantity создают положительное inventory movement;
- новый variant создаёт отрицательное inventory movement;
- actor и reason обязательны;
- если новый товар дороже, создаются payment lines на доплату;
- если новый товар дешевле, разница не возвращается и не создаёт customer credit;
- Seller может оформить exchange самостоятельно;
- reason, actor и timestamps обязательны и видны Owner.

### SaleCancellation

Seller может отменить ошибочную sale:

- исходная sale получает cancelled status, но не удаляется;
- stock восстанавливается reversal movements;
- payment records получают reversal/cancel status;
- обязательны actor, reason и timestamp;
- Owner видит отмену и исходную операцию в reports/audit log.

### Return

Денежный возврат не входит в Clothing MVP. Если он появится позже, должен ссылаться на исходную продажу и строки.

### ExchangeRate

- business date;
- currency pair;
- rate;
- source и автор ручной корректировки.

### AuditLog

- actor;
- action;
- entity type/id;
- before/after или structured details;
- timestamp, IP/device metadata в допустимом объёме.

## 2. Ключевые инварианты

1. Подтверждённая продажа и расходное движение создаются в одной database transaction.
2. Подтверждённая приёмка и приходные движения создаются в одной transaction.
3. Нельзя продать больше доступного остатка без отдельного разрешённого режима.
4. Историческая цена и маржа не зависят от текущей карточки товара.
5. Продажа всегда имеет seller и store.
6. Движение всегда имеет source и actor либо явный system actor.
7. Отмена документа создаёт обратные движения или контролируемую reversal-операцию.
8. Валютный курс фиксируется на business date и сохраняется в финансовой операции.
9. Доступ пользователя к store проверяется сервером.
10. Внешний повторный запрос не создаёт дубликат благодаря idempotency key.
11. Cancellation и Exchange не удаляют исходную Sale и всегда создают reversal/exchange movements.
12. Любая самостоятельная Cancellation/Exchange Seller видна Owner вместе с actor, reason и timestamp.

## 3. Соответствие текущему боту

| Telegram bot | Production model |
|---|---|
| `items` | `Product` + `ProductVariant` + receipt movements |
| `items.quantity` | balance derived from `InventoryMovement` |
| `items.shop` | `Store` |
| `items.supplier` | `Supplier` relation |
| `sales` | `Sale` + `SaleLine` + sale movements |
| `rates` | `ExchangeRate` |
| `logs` | `AuditLog` |
| Telegram username owner | `User` + memberships/role |

## 4. Стратегия старта

Владелец решил начать реальный учёт с чистых данных. Текущие 209 товарных строк, 16 продаж и фотографии Telegram-бота не импортируются в первую production-версию. Начальный остаток будет сформирован новой инвентаризацией или первичной приёмкой.

## 5. Риски исторических данных

- часть `name`, `brand` и `category` в текущей базе пустая;
- категории и значения имеют разные языки и написания;
- один код представлен несколькими строками размеров/цветов;
- текущая база фактически содержит только `clothing`;
- исторические строки продажи содержат snapshots, но часть native margin равна нулю при разных валютах;
- фотографии лежат на filesystem и связаны строковым путём;
- продавцы определяются Telegram id/name, отдельного справочника нет.

Эти риски актуальны только если позднее будет принято отдельное решение импортировать историю. Тогда нужны dry-run, отчёт расхождений и ручное подтверждение спорных соответствий.
