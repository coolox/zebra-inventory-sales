# TASK-009 — Добавить unit/component test runner

Статус: COMPLETED

## Цель

Подключить минимальную среду Vitest + React Testing Library для feature-модулей.

## Предполагаемые файлы

- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `test/setup.ts`

## Зависимости

Нет.

## Критерии готовности

- Есть отдельные scripts для unit/component tests.
- jsdom и path aliases работают с Next.js/TypeScript.
- Пустой baseline suite запускается локально.

## Тесты

- `npm run test` или утверждённый эквивалент.
- `npx tsc --noEmit`.
- `npm run build`.

## Результат

- Добавлены Vitest, React Testing Library, jsdom, общая test setup и scripts `test`/`test:watch`.
- Suite работает с TypeScript path aliases и Next.js проектом.
