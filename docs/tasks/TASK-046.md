# TASK-046 — Зафиксировать design tokens и adaptive rules

Статус: COMPLETED

## Цель

Собрать цвета, spacing, typography, focus и breakpoints в компактный поддерживаемый слой.

## Предполагаемые файлы

- `app/globals.css`
- `docs/ARCHITECTURE.md`

## Зависимости

TASK-045.

## Критерии готовности

- Нет дублирующих критичных theme values.
- Light/Dark selected/focus/error states документированы.
- Mobile/tablet/desktop rules перечислены компактно.

## Тесты

- Source scan duplicate legacy tokens.
- Build.
- Browser smoke in both themes and three viewport groups.

## Результат

- Theme, spacing, radius and focus tokens consolidated in `app/globals.css`; Light/Dark selected, focus and error semantics are documented in architecture.
- Playwright now tests production-like output, the Light toggle, and desktop/tablet/mobile projects. Full suite has no failure artifacts after the final run; production build passes.
