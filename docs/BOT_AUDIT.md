# Аудит существующего Zebra Telegram Bot

Дата аудита: 2026-08-08  
Метод: SSH, только чтение  
Production VPS не изменялся

## 1. Размещение и запуск

- каталог: `/root/zebra`;
- systemd service: `zebra-bot.service`;
- процесс: `/root/zebra/venv/bin/python /root/zebra/bot.py`;
- дополнительный просмотрщик базы: `zebra-dbweb.service` / `/root/zebra/db_web.py`;
- база: `/root/zebra/zebra.db`;
- storage: SQLite;
- есть legacy/миграционный код Google Sheets.

Токены, `.env`, service-account и секреты не копировались в проект.

## 2. Файлы логики

- `bot.py` — Telegram handlers и FSM;
- `models.py` — `Item` и `Sale`;
- `repository.py` — repository interface;
- `sqlite_repo.py` — SQLite implementation и migration from Sheets;
- `reporting.py` — агрегация продаж;
- `ai.py` — extraction позиций из invoice photo/PDF;
- `zebra.db` — фактические товары, продажи, курсы и логи.

## 3. Фактическая схема

### `items`

`id`, `code`, `name`, `brand`, `category`, `gender`, `size`, `color`, `price`, `currency`, `quantity`, `supplier`, `photo_path`, `created_at`, `shop`.

### `sales`

`seller_id`, `seller_name`, `shop`, `item_id`, `code`, `name`, `size`, `quantity`, `cost_price`, `sell_price`, `currency`, native margin fields, EUR snapshot fields, rates, `timestamp`.

### `rates`

Курс по дате и валютной паре.

### `logs`

Время, Telegram user id/username, action и details.

Отдельных таблиц пользователей, ролей, магазинов, фабрик, документов приёмки и складских движений нет.

## 4. Данные на момент аудита

- `items`: 209 строк;
- общий остаток: 260 единиц;
- все строки относятся к `clothing`;
- валюты товара: EUR и USD;
- `sales`: 16 операций;
- период продаж: 2026-07-05 — 2026-07-19;
- основные suppliers включали PINO, SALAŞ, DUPA, BY KONCA TEKSTİL, SUSI и другие;
- часть карточек имеет пустые `name`, `brand` или `category`.

Это снимок на дату аудита, не текущая online-статистика.

## 5. Рабочие команды бота

- `/add` — ручное добавление товара и фотографий;
- `/invoice` — фото/PDF накладной, AI extraction, исправление, подтверждение;
- `/find CODE` — поиск по коду;
- `/search key=value` — фильтры;
- `/list` — список товара;
- `/edit` — редактирование варианта/модели;
- `/sell` — продажа;
- `/report` — отчёт по периоду;
- `/shop` — EUR-отчёт год → месяц → бизнес-неделя.

## 6. Логика продажи

1. Поиск товара по code.
2. Выбор color и size среди положительного остатка.
3. Ввод фактической цены и валюты.
4. При необходимости ввод дневного курса к EUR.
5. Расчёт EUR revenue/cost/margin snapshots.
6. Запись `sales`.
7. Уменьшение `items.quantity` на одну единицу.
8. Запись действия в `logs`.

Текущие запись продажи и списание остатка выполняются отдельными repository calls, а не одной явной transaction. В production это нужно исправить.

## 7. Роли и отчёты

- владелец задан константой Telegram username;
- отдельного RBAC нет;
- продавец определяется по отправителю Telegram message;
- только владелец видит breakdown по продавцам в отчёте;
- Turkey timezone реализована как UTC+3;
- бизнес-неделя начинается в среду и заканчивается во вторник;
- `/report` агрегирует native currency;
- `/shop` использует EUR snapshots.

## 8. Ограничения и риски

- фактически работает только clothing;
- нет нормализованной модели store/user/supplier;
- количество хранится редактируемым полем, нет ledger;
- роль владельца зависит от username;
- нет server-side API для web;
- in-memory FSM теряется после restart;
- в logs аудита наблюдались периодические Telegram network timeout, bot автоматически повторял polling;
- текущая база и filesystem photos требуют аккуратной миграции;
- нельзя подключать новый frontend прямым доступом к SQLite.

## 9. Как использовать аудит

Этот документ — reference для бизнес-логики и миграции, но не требование повторить технические ограничения бота. Production-модель описана в `DATA_MODEL.md`.

Для повторного подключения к VPS требуется отдельное разрешение владельца и новый безопасный способ доступа. Временный локальный ключ аудита был удалён.
