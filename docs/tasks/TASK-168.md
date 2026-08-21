# TASK-168 — Единый Zebra Boutique знак в login shell

Статус: COMPLETED

Источник: staging safe smoke TASK-167, 2026-08-20.

## Цель

Заменить оставшийся прежний `ZB` знак на unauthenticated Magic Link login page
на принятый фирменный знак Zebra Boutique, уже используемый в PWA assets и
navigation.

## Evidence finding

- Ready live Preview `zebra-inventory-sales-8725em7sd-cooloxs-projects.vercel.app`
  показывает `Zebra — Inventory & Sales` login, но в visual shell остаётся `ZB`.
- Это несогласованность brand asset после TASK-166, не auth/runtime failure.

## Границы

- Менять только unauthenticated visual brand mark и его tests, если нужны.
- Не менять Magic Link logic, auth callback, Supabase, Vercel configuration,
  production или PWA manifest assets.
- После local verification опубликовать только новый staging Preview по отдельному
  Owner approval, затем повторить affected login safe smoke.

## Критерии готовности

- Login показывает Zebra Boutique mark вместо `ZB` на desktop и mobile.
- Login component test и production builds проходят.
- Новое staging Preview подтверждает affected safe route; TASK-165 может
  возобновить device walkthrough.

## Локальный результат

- `app/login/page.tsx` использует существующий `/icons/zebra-192.png` с
  accessible alt `Zebra Boutique` вместо violet `ZB` tile. Magic Link logic,
  Auth callback, Supabase и PWA manifest не менялись.
- `app/login/page.test.tsx` теперь подтверждает фирменный asset, а не только
  языковое поведение.
- Passed: targeted login Vitest (1/1), demo production build, live production
  build и `git diff --check`. В `app/page.tsx` остаются только прежние lint
  warnings; новых warning от login brand asset нет.

## Staging evidence

- Owner approved a clean non-secret staging source upload. New Preview
  `https://zebra-inventory-sales-bokm6pf92-cooloxs-projects.vercel.app`
  completed Vercel `npm run build:live` and became Ready.
- Public `/` safe smoke shows `Zebra — Inventory & Sales` login with image alt
  `Zebra Boutique`; the previous visible `ZB` tile is absent. No Magic Link was
  sent, so no identity, email or authentication side effect was created.
- Production, Supabase, Auth URLs, Vercel configuration and secret values were
  not changed.
