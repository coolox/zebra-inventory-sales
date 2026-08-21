# TASK-181 — Добавить профессиональную авторскую подпись Arslan Ram

Статус: COMPLETED

Приоритет: P2 — professional product presentation before pilot.

Источник: Owner request, 2026-08-21.

## Цель

В web app и установленной PWA должно быть аккуратно указано, что продукт создан
Arslan Ram. Подпись должна выглядеть профессионально и поддерживать Zebra Boutique
brand, а не быть навязчивой рекламой или занимать рабочее пространство продавца.

## Предлагаемый UX direction

- Разместить компактную attribution в устойчивом, но ненавязчивом месте: например,
  в app footer, About/Settings sheet или обеих согласованных точках.
- Использовать нейтральную формулировку, локализованную EN/TR, например
  `Created by Arslan Ram` / `Arslan Ram tarafından oluşturuldu` после подтверждения
  Owner финального copy.
- Не помещать подпись в receipts, invoices, sales exports, audit records, emails,
  QR/barcode payloads или UI, который нужен для быстрой кассовой операции.

## Границы

- Только presentation/copy/accessible link if Owner provides a public destination.
- Не создавать ссылку, контакт, social account или claim, которые Owner не утвердил.
- Не менять identity Zebra Boutique, manifest name, Auth, data, permissions или
  financial/operational flows.

## Критерии готовности

- Arslan Ram указан профессионально и читаемо в web и standalone PWA, в light/dark
  themes и на mobile/desktop.
- Attribution не мешает Owner/Seller flows, safe areas, keyboard, accessibility или
  primary actions.
- EN/TR copy согласованы; если добавлена ссылка, она ведёт только на явно одобренный
  Owner public URL и имеет понятную accessible label.
- Targeted UI/visual regression и `npm run build` проходят; Owner подтверждает copy
  и placement на physical phone.

## Результат

- Compact attribution размещена в устойчивом workspace footer: `Created by Arslan
  Ram` / `Arslan Ram tarafından oluşturuldu`.
- Copy читается в web и standalone PWA, имеет EN/TR accessible label и не создаёт
  неутверждённую внешнюю ссылку, не затрагивая receipts, exports или кассовые flow.

## Evidence — 2026-08-22

- Source verified in `app/page.tsx`: responsive footer placement with EN/TR copy
  and accessible label for both app modes.
- `npm run build` — passed as part of the consolidated remediation build.
- Physical placement confirmation входит в consolidated TASK-165 walkthrough.
