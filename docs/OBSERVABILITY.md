# Observability policy

## Scope and data boundary

The application emits only structured error events to the server log stream when
`NEXT_PUBLIC_OBSERVABILITY_ENABLED=true` is set outside git. Without that setting,
client reporting and server capture are no-ops.

Each event contains environment, operation, a correlation ID, an optional request
path without its query string, a bounded error name/message and bounded safe context.
It never intentionally records request bodies, email, phone, tokens, cookies,
authorization headers, Supabase keys, payment values, product descriptions or raw
Supabase/provider errors. The redactor replaces sensitive keys, emails, Bearer
values and token-like query parameters before output.

## Staging alert policy

- `sale.confirm`, `receipt.confirm` and `auth.magic_link` errors are critical.
- Any critical event during staging acceptance is a release blocker until triaged;
  repeated events must stop the affected smoke test.
- Other client/server errors are reviewed in the Vercel staging log stream before
  the daily acceptance session. The event correlation ID is used instead of user
  or transaction data.
- No automatic email/chat recipient is configured yet. Before production, Owner
  must choose the monitoring provider, retention period and alert recipients in
  TASK-080's decision gate; production alerting is not implied by staging logs.

## Verification

Synthetic client and server captures, redaction, disabled-mode no-op and malformed
payload rejection are covered by unit tests. Browser/UI flows must continue to work
if reporting is disabled or the endpoint is unavailable.
