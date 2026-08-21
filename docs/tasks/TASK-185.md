# TASK-185 — Заменить greeting «vardiya 09:00 açıldı» на «Bol satışlar»

Статус: COMPLETED

Приоритет: P2 — dashboard copy должна быть уместной и профессиональной.

Источник: Owner request, 2026-08-21.

## Запрос Owner

В верхнем greeting dashboard вместо Turkish текста о начале смены
`vardiya 09:00 açıldı` показать пожелание продаж:

`Merhaba Taylan, bol satışlar!`

Это убирает неактуальную фиксированную смену `09:00` и делает приветствие дружелюбным
для ежедневной работы.

## Границы

- Только presentation copy greeting для текущего authenticated user.
- Сохранить локализацию: Turkish exact copy выше; English equivalent должен передавать
  тот же профессиональный смысл, а не содержать hard-coded shift time.
- Не менять user name/profile, session, role, schedule, sales data или notification
  logic.

## Критерии готовности

- Turkish greeting имеет точный согласованный текст `Merhaba {name}, bol satışlar!`.
- English greeting локализован и не содержит Turkish/fixed-shift leakage.
- Empty/missing name имеет корректный fallback; desktop/mobile, light/dark и safe
  layout не получают overflow.
- Targeted localization/UI test и `npm run build` проходят; Owner подтверждает copy.

## Ограничение текущего этапа

Request только зафиксирован. Copy и код не менять, пока Owner не скажет, что
закончил передавать найденные баги.

## Результат

- Turkish Seller greeting uses `Merhaba {name}, bol satışlar!`.
- По уточнению Owner English heading uses only `Hello {name},`; persistent
  supporting line remains `Zebra Boutique · good sales!`, so greeting copy no
  longer repeats the sales wish.
- User/session, role, schedule, sales and notification logic were unchanged.

## Follow-up visual regression — 2026-08-22

- Owner local-demo screenshot confirms the current Turkish heading still renders
  `Merhaba Elif, bol satışlar!`, while the supporting line already correctly uses
  `Zebra Boutique · bol satışlar!`.
- Owner clarified that the heading must be only `Merhaba Elif,`; the sales wish
  belongs exclusively to the supporting line. The correction is isolated in
  [TASK-192](TASK-192.md).
- TASK-185 remains historical completion evidence for the original copy change;
  TASK-192 is a new regression and must not be implemented until Owner closes the
  current visual intake.
