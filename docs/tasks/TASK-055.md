# TASK-055 — Описать auth/workspace API contracts

Статус: pending

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

