# TASK-180 — Проверить штатную iPhone PWA-установку и Magic Link install boundary

Статус: COMPLETED

Приоритет: P1 — Owner не смог установить staging app на iPhone после login.

Источник: Owner iPhone screenshot, 2026-08-21.

## Наблюдение

Owner открыл staging site на iPhone, прошёл Magic Link и затем попытался сохранить
приложение на Home Screen. В итоге показано сообщение стороннего Shortcut/tool:
«downloading from this site or application is not supported yet». На screenshot также
виден безопасный Auth error summary `access_denied` / `otp_expired` / invalid or
expired email link; token, email и полный Magic Link не записываются.

Screenshot не подтверждает ошибку Safari PWA manifest/install: экран принадлежит
стороннему tool, а не стандартному iOS `Share` sheet. Но он подтверждает, что Owner
не достиг понятного рабочего install path, а expired Magic Link мог прервать flow.

## Цель

Подтвердить и, если необходимо, исправить штатный iPhone сценарий:

1. Открыть Ready staging Preview в Safari.
2. Завершить fresh controlled Magic Link в том же Safari browser.
3. Использовать только Safari `Поделиться` → `На экран «Домой»`.
4. Открыть установленную PWA, подтвердить session/login boundary и понятное
   recovery поведение для expired link.

Сторонние shortcuts/downloaders не являются поддерживаемым способом установки и не
должны требоваться пользователю.

## Границы

- iPhone Safari/PWA manifest, icons, display/start URL, standalone session and clear
  user guidance/recovery states.
- Связать expired Magic Link observation с controlled acceptance TASK-169, не
  логировать email, token или full link.
- Не менять production Auth, production PWA project, secrets, SMTP template или
  использовать сторонний Shortcut как часть продукта.

## Критерии готовности

- Owner на physical iPhone устанавливает staging PWA штатно через Safari Home Screen
  и запускает её без стороннего приложения.
- Установленная PWA показывает correct Zebra Boutique name/icon и работает в
  standalone mode; login/session guard не создаёт loop.
- Fresh same-browser Magic Link succeeds; expired/reused link показывает понятный
  EN/TR recovery action, а не оставляет Owner в неясном состоянии.
- Manifest/icon/install checks и targeted Auth callback/PWA tests проходят; iPhone
  physical evidence записано без личных данных.
- TASK-169/TASK-165 acceptance отражает фактический результат; no Production change.

## Ограничение текущего этапа

Finding только зафиксирован. Диагностику, настройки или код не менять, пока Owner
не скажет, что закончил передавать найденные баги.

## Выполнено в коде

- PWA manifest и экран входа используют имя `Zebra Boutique`; manifest сохраняет
  standalone mode, `/` start URL, scope и утверждённые Zebra icons.
- Auth callback безопасно возвращает отсутствующий, просроченный или повторно
  использованный Magic Link на `/login` с локализованным EN/TR recovery message.
- Добавлено targeted coverage для брендинга manifest/login и Turkish recovery state.

## Evidence

- `npx vitest run app/manifest.test.ts app/login/page.test.tsx` — 4/4 passed.
- `npm run build` — passed (only pre-existing lint warnings in `app/page.tsx`).
- Live staging Preview `https://zebra-inventory-sales-kb56dzquv-cooloxs-projects.vercel.app`
  deployed Ready (`dpl_BfjvLh5cbvjgLj4RyZQJ6c2rLMAJ`). Staging Auth Site URL and one
  exact callback now point to it; redirect allow-list remains eight exact URLs.
- Production, SMTP templates, database and secrets were not changed.

## Physical acceptance — 2026-08-21

- Owner подтвердил на iPhone штатную установку через Safari Home Screen: приложение
  скачивается, открывается из установленной PWA и работает корректно.
- Fresh Owner/Seller Magic Link acceptance уже подтверждён в TASK-169; sensitive
  identities, email addresses, tokens и ссылки не записывались.
- TASK-165 продолжает общий Owner/Seller mobile walkthrough для remaining device
  evidence. Production не изменялся.
