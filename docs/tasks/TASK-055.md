# TASK-055 — Описать auth/workspace API contracts

Статус: completed

## Цель

Зафиксировать transport-independent session, membership, profile и workspace snapshot contracts.

## Предполагаемые файлы

- `lib/contracts/auth.ts`
- `lib/contracts/workspace.ts`
- `docs/ARCHITECTURE.md`

## Зависимости

TASK-052.

## Критерии готовности

- Contracts не импортируют Supabase types.
- Server/client boundaries используют одни DTO.
- Role/store/locale fields определены явно.

## Тесты

- Type-level fixtures.
- Mapper unit tests.
- Typecheck.

## Результат

- `SessionDto` фиксирует user, locale/theme, membership role/status и store metadata без Supabase types или snake_case в client contract.
- `/api/session` нормализует join response до DTO до пересечения server/client boundary.
- `WorkspaceSnapshotDto` стал общим контрактом для demo и live adapters; mapper выдаёт detached snapshot.
- Проверены TypeScript, mapper fixtures и production build.
