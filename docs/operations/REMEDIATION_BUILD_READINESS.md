# Readiness audit — consolidated remediation build

Обновлено: 2026-09-01. Это доказательная граница перед публикацией: документ не
авторизует deploy и не меняет production.

## Решение

**Нельзя утверждать, что в следующей версии уже есть все запрошенные новые
возможности.** Четыре pilot fixes готовы в коде, автоматические FX технически
работают в staging, но AI-приёмка накладных и sale flow по серии фото этикеток
ещё являются не начатым backlog.

Рекомендуемый следующий релиз — узкий **remediation build**: published fixes
TASK-203/205/207/208 и уже подготовленный FX UI. Он не должен рекламироваться
как release с invoice AI или label-assisted sale.

| Область | Статус | Evidence / оставшаяся граница |
| --- | --- | --- |
| Android PWA install (TASK-203) | Готово в коде, не опубликовано | Network-only worker, 3 automated PWA checks, `build:live`; нужен Android Chrome Home Screen → Magic Link → inventory smoke. |
| Снять фото товара (TASK-205) | Готово в коде, не опубликовано | Separate rear-camera и gallery controls, 19 component/data checks, builds; нужен mobile photo → save → reopen proof. |
| Logout / смена account (TASK-207) | Готово в коде, не опубликовано | Same-origin server logout, browser fallback и pending state; текущий preview не содержит этот uncommitted fix и не имеет browser Supabase env, поэтому не является его acceptance evidence. |
| Одна битая product photo (TASK-208) | Готово в коде, не опубликовано | Signed URL теперь best-effort; core DB/RLS остаются fail-fast. Нужен fresh live login/catalog check на опубликованном build. |
| Авто-курсы EUR/USD/TRY (TASK-209—212) | Backend готов в staging; UI ждёт frontend build/UAT | TCMB `ForexSelling`, provenance, safe carry и protected schedule активированы только на staging. Manual invocation и scheduled run green; Owner должен увидеть source/carry warning и Seller no-write boundary. |
| Приёмка по турецкой накладной + Owner archive | Не реализовано | TASK-089—093, TASK-119—122 pending: private document storage, OCR provider/privacy, editable review и atomic receipt ещё не сделаны. |
| Продажа по серии фото этикеток | Не реализовано | TASK-124—130 pending: private drafts, capture session, extraction/review и atomic sale UI ещё не сделаны. |

## Проверка этого аудита

2026-09-01: targeted Vitest passed — 8 files / 36 tests:

- logout and Access Denied;
- best-effort product signed URLs;
- product camera/gallery controls;
- service-worker registration;
- TCMB parser, sync policy и FX manager localization.

Проверка подтверждает regression coverage кода, но не заменяет publication и
physical-device/live-account acceptance.

## Обязательные условия перед build

1. Собрать reviewed commit только из scope TASK-203/205/207/208 и FX UI; не
   захватывать посторонние dirty changes.
2. Сохранить исправления Logout, PWA, camera и signed URL в version-controlled
   commit; текущий публичный preview им не соответствует.
3. Опубликовать **staging**, а не production, с корректными browser Supabase
   environment variables. Preview без них не пригоден для Auth/logout UAT.
4. После deploy пройти Owner/Seller матрицу: Logout → fresh Magic Link, live
   catalog с отсутствующей photo, Android PWA launch, camera save/reopen, Owner
   FX provenance/carry и Seller no-write.
5. Лишь после этой матрицы решить, закрывать ли TASK-203/205/212 и выпускать ли
   отдельный production remediation release.

## Вне remediation build

Invoice AI и label-assisted sales не добавляются скрытно или частично. Их
реализация начинается только отдельной командой Owner с соответствующей task
цепочкой и решениями об OCR provider, privacy/retention и mobile capture UX.
