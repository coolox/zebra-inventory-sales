# TASK-192 — Исправить Turkish greeting: пожелание только в supporting line

Статус: pending

Приоритет: P2 — visual/copy regression перед consolidated staging acceptance.

Источник: Owner screenshot from local demo, 2026-08-22.

## Наблюдение

Текущий Turkish dashboard header показывает:

```text
Merhaba Elif, bol satışlar!
Zebra Boutique · bol satışlar!
```

Это повторяет одно и то же пожелание в двух строках. Owner уточнил, что после
имени в заголовке пожелания быть не должно.

## Ожидаемый результат

```text
Merhaba Elif,
Zebra Boutique · bol satışlar!
```

English boundary остаётся уже принятым: `Hello {name},` и supporting line
`Zebra Boutique · good sales!`.

## Границы

- Только Turkish/English presentation copy dashboard greeting.
- Не менять user/session/role logic, greeting placement, i18n persistence,
  notifications, sale/receipt flows или data.
- Проверить demo и live rendering, accessible heading and responsive layout.

## Критерии готовности

- TR heading заканчивается после имени и запятой; `bol satışlar!` есть только в
  Zebra Boutique supporting line.
- EN copy сохраняет утверждённый вариант без повторения пожелания в heading.
- Targeted copy/UI tests и production build проходят.
- Owner visual confirmation записано без staging/production mutation.

## Ограничение Owner

Owner продолжает собирать visual feedback. Не начинать реализацию до прямой команды
после завершения intake.

