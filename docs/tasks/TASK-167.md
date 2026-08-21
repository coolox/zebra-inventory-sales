# TASK-167 — Разблокировать staging Preview deployment для TASK-165

Статус: COMPLETED

Источник: finding TASK-165, 2026-08-20.

## Цель

Определить и устранить external Vercel blocker, из-за которого approved staging
Preview не дошёл до build/runtime, не затрагивая Production или Supabase.

## Evidence finding

- Isolated non-secret snapshot `c2f9aaa0adb2cf570460f15601978ef145883e2d`
  был принят существующим staging Vercel project как Preview deployment
  `zebra-inventory-sales-frqey2j2l-cooloxs-projects.vercel.app`.
- Vercel dashboard показывает `Deployment Blocked`, `Environment: Preview`,
  `Duration: —`; public page показывает `Deployment is blocked`. Runtime/build
  request logs отсутствуют, то есть приложение не запускалось.
- Production deployment, Supabase, Auth URLs и repository secrets не менялись.

## Границы

- Только диагностировать и исправить blocking condition Preview environment.
- Не менять Production deployment, Supabase, Auth Site URL/redirect или secret
  values. Любое изменение Vercel deployment policy/settings требует отдельного
  Owner confirmation с точным действием.
- Не повторять deploy, пока cause и безопасный remediation не зафиксированы.

## Критерии готовности

- Причина block подтверждена безопасным Vercel evidence.
- Если требуется configuration mutation, есть явное Owner approval именно на неё.
- Новый Preview из exact snapshot становится `Ready`, public safe-route smoke
  проходит и TASK-165 можно возобновить.

## Результат

- Причина Vercel block подтверждена в deployment dashboard: temporary snapshot
  содержал локальный Git commit с artificial author email `preview@zebra.local`,
  который не является valid Vercel/Git collaborator email. Build кода при этом
  не запускался.
- Тот же reviewed snapshot был повторно опубликован без `.git` metadata; это не
  требует изменения Vercel deployment policy/settings, Production, Supabase,
  Auth URLs или secret values.
- Новый Preview `https://zebra-inventory-sales-8725em7sd-cooloxs-projects.vercel.app`
  успешно выполнил `npm run build:live` на Vercel и стал Ready. Public safe route
  открывает `Zebra — Inventory & Sales` Magic Link login; demo/mock UI не показан.
- Safe smoke обнаружил отдельный visual finding: login shell всё ещё отображает
  старый `ZB` mark. Он вынесен в TASK-168 и не исправлялся здесь.

## Evidence

- Vercel Dashboard: first Preview `2NKQpVQHtEy9udRaPzw2CTE5VbN3` — `Blocked`,
  `Environment: Preview`, duration `—`, explicit invalid commit-author reason.
- Replacement deploy `5oxmbdPQRLgCyqfvASaxVhLiMXFz` — Vercel build log
  `Running "npm run build:live"`; public Preview loaded the live login route.
- No Vercel configuration mutation was needed or performed.
