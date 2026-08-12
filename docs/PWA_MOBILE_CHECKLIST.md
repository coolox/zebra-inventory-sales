# PWA physical-device checklist

## TASK-135 — первоначальная проверка

Владелец подтвердил на Android Chrome и iPhone Safari:

- demo PWA устанавливается;
- приложение запускается standalone, без browser address bar;
- в браузере и установленном приложении не обнаружено функциональных ошибок.

Найденный non-functional defect: исходные Android/iOS icons не соответствуют visual direction. Исправление перенесено в TASK-136.

## TASK-136 — повторная проверка после icon update

После обновления deployment на телефоне удалить старую установку Zebra, установить приложение заново с `https://zebra-inventory-sales.vercel.app` и подтвердить:

- новая чёрно-белая zebra `Z` отображается на home screen;
- новая иконка видна при standalone launch;
- Overview, Workspace, New sale, Receive products и EN/TR работают как до обновления;
- старая demo data не считается production data; при необходимости использовать Reset demo data.

Если старый icon остаётся в launcher, сначала закрыть браузер/app, удалить старую установку и повторить Add to Home Screen / Install app: OS может держать PWA icon cache.
