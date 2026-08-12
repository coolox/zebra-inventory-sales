# TASK-089 — Добавить upload фото/PDF накладной

Статус: pending

## Цель

Принимать фото или PDF накладной, создавать store-scoped receipt draft и сохранять исходный документ в private Storage без автоматического изменения stock.

## Предполагаемые файлы

- `supabase/migrations/<new>_receipt_documents.sql`
- `features/receipt-documents/**`

## Зависимости

TASK-082, TASK-088, TASK-119.

## Критерии готовности

- Поддержаны approved image/PDF limits.
- Файл store-scoped и связан с draft receipt.
- Draft получает статус `uploaded` и ссылку на source document; повторная загрузка того же файла определяется по fingerprint.
- Upload поддерживает mobile camera/photo picker и обычный PDF/image file picker.
- Upload не подтверждает receipt автоматически.

## Тесты

- File type/size/RLS tests.
- Upload/reload/delete draft attachment.
- Malicious filename/path test.
