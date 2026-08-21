# TASK-196 — Сделать Sale Details photo-first для продавца и Owner

Статус: IN PROGRESS

Приоритет: P1 — продавец не может надёжно идентифицировать проданный товар только
по Product code/name/size.

Источник: Owner local-demo Sale Details screenshot, 2026-08-22.

## Наблюдение

TASK-186 подготовила historical private image snapshot, thumbnail, fallback и
fullscreen viewer для sale line с доступным photo snapshot. Но в текущем local-demo
Sale Details line показывает нейтральный placeholder `—` рядом с `Structured Jacket`.
Для продавца это не решает основной сценарий: товар должен распознаваться по фото,
а не по code.

## Цель

Сделать visual acceptance photo-first:

1. sale line с фотографией показывает компактный, отчётливо видимый thumbnail;
2. tap/click thumbnail открывает fullscreen viewer с close и safe mobile layout;
3. demo fixture позволяет Owner увидеть этот сценарий локально;
4. live sale продолжает использовать только authorized historical sale-time private
   image snapshot, а не случайную текущую gallery image.

## Важная граница

Если sale line действительно не имеет historical photo, честный fallback остаётся
нужен. Но он не должен скрывать факт отсутствия фото как успешный photo-first
сценарий. Existing product photo strategy, store/RLS authorization и TASK-178 safe
deletion boundary сохраняются.

## Границы

- Только Sale Details line photo presentation, demo fixture/preview coverage и
  fullscreen interaction.
- Не менять sales, prices, payments, cancellation/exchange, audit, image Storage
  policies или cross-store authorization.
- Проверить multiple lines, missing snapshot fallback, light/dark, EN/TR,
  desktop/mobile and keyboard focus restoration.

## Критерии готовности

- Owner/Seller могут сразу визуально распознать photographed sale line в demo и
  authorized live Sale Details.
- Fullscreen preview работает по явному tap/click, закрывается безопасно и не
  допускает background scroll/focus leak.
- Missing legacy/no-photo line имеет понятный neutral fallback, а не misleading
  broken image.
- Historical sale image не меняется вслед за current gallery edit/deletion.
- Targeted UI/data/RLS tests, production build и Owner visual acceptance проходят.

## Ограничение Owner

Не начинать implementation до прямой команды Owner после закрытия renewed visual
intake.
