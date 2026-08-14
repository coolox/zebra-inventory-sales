# TASK-079 — Развернуть отдельный staging frontend

Статус: COMPLETED

## Цель

Опубликовать Next.js staging на Vercel с привязкой только к staging Supabase.

## Предполагаемые файлы

- `vercel.json` при необходимости
- `.env.example`
- `docs/PROJECT_STATUS.md`
- `docs/tasks/TASK-079.md`

## Зависимости

TASK-040, TASK-061, TASK-078.

## Критерии готовности

- Staging URL доступен и не использует production resources.
- Environment variables настроены вне git.
- Auth callbacks и protected routes работают.

## Тесты

- Staging health/auth smoke.
- Live workspace no-mock check.
- Desktop/mobile Playwright smoke against staging.

## Evidence выполнения

- Отдельный Preview staging deployment опубликован из чистого архива `main`
  (`81701be40f378369caf44cb45277d786bde81e27`):
  `https://zebra-inventory-sales-51z34xyje-cooloxs-projects.vercel.app`.
  Vercel подтвердил `target: preview`, `Ready`; production deployment этой командой
  не выполнялся.
- В Vercel Preview настроены вне git только `NEXT_PUBLIC_APP_MODE`,
  `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; build command
  — `npm run build:live`. Значения переменных не читались и не записывались в repo.
- В проекте `zebra-retail-staging` Site URL и redirect allow-list обновлены для
  текущего Preview URL; локальный callback сохранён. Новый
  `/auth/callback` разрешён в Supabase.
- Health/auth smoke: `/` перенаправляет на `/login`, live Magic Link login доступен
  без demo/mock workspace и без console errors; неаутентифицированный `/api/session`
  остаётся защищён middleware. На ширине `390×844` login не имеет horizontal overflow.
- Реальная отправка Magic Link не выполнялась: это отправило бы письмо внешнему
  пользователю. Полная Owner/Seller/used-link/logout matrix уже имеет staging
  evidence в TASK-040; новая callback-конфигурация подтверждена для того же flow.
