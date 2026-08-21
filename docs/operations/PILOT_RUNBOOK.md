# Zebra Boutique Clothing Pilot — Runbook

Status: **prepared in TASK-086; device walkthrough pending Owner**.

This is the operational checklist for one Owner and four Sellers. It does not
contain accounts, emails, URLs, passwords, project identifiers or real inventory.

## Language plan

The application and the two role guides are English-first with Turkish support
(D-014/D-045). During training, each person chooses their interface language and
uses the matching labels in their guide. Russian is for internal coordination only,
not a production UI option.

## Before the pilot

Owner completes these checks in order:

1. Confirm the approved production deployment and callback exist; do not use a
   staging or local address.
2. Complete TASK-084 Magic Link acceptance for Owner, active Seller, unknown email,
   expired/reused link and allowed redirect.
3. Create the initial Owner and Zebra Boutique membership through the documented
   bootstrap; then invite exactly four Sellers through the audited Owner flow.
4. Confirm each membership is `active` and Zebra Boutique is the only pilot store.
5. Load and physically reconcile initial clothing inventory only in TASK-087.
6. Confirm that encrypted backup has a current successful run and the Owner knows
   the recovery owner/escalation path.

Never reuse a staging test account in production, share a Magic Link or write a
password into a chat, screenshot or paper checklist.

## Five-device walkthrough

Use one test session per person; do not share sessions.

| Participant | Device | Walkthrough | Pass condition |
|---|---|---|---|
| Owner | iPhone | Magic Link, Owner workspace, invite/status review, Reports/Reconciliation read-only check | Correct role and no error/overflow at mobile width |
| Seller 1 | iPhone | Magic Link, product search, one controlled receipt draft and one controlled sale draft | Sees only Zebra Boutique and own permitted actions |
| Seller 2 | iPhone | Magic Link, normal sale payment flow, logout/login | Session and store boundary survive reload without cross-user data |
| Seller 3 | Android | Magic Link, exchange draft and cancel-sale information screen | All controls fit; no horizontal scroll; confirmation is explicit |
| Seller 4 | Android | Magic Link, receipt color/size/quantity matrix and sale draft | Quantity and payment validation errors are understandable |

For production pre-launch, use only controlled test records approved by Owner and
remove/compensate them through audited flows. Do not test a sale, cancellation or
exchange against real customer stock before TASK-087/088.

## Day-one operating rhythm

1. Owner checks login, Seller membership status and backup health before opening.
2. Sellers record receipts only after physical count; Seller checks model code,
   colour, sizes, quantities, supplier and original currency before confirmation.
3. Sellers confirm a sale only after payment amount/method and selected variants are
   reviewed with the customer.
4. At closing, Owner reviews sales, cancelled/exchanged operations, stock anomalies
   and reconciliation. A discrepancy is investigated through audit history, never by
   editing ledger rows.

## Incident escalation

| Severity | Examples | Immediate action | Escalation |
|---|---|---|---|
| P0 | Cannot sell/receive, suspected wrong-store access, duplicate money/stock movement | Stop the affected operation; take no retry that changes stock or money | Owner immediately; preserve timestamp, screen and operation ID; use recovery/rollback plan only with Owner approval |
| P1 | Magic Link not received, Seller blocked unexpectedly, one device UI cannot complete flow | Do not share another person's session; retry only the safe login flow | Owner checks membership/status and records device/browser/time |
| P2 | Copy/visual issue with a safe workaround | Use the documented workaround; do not change production settings during sales | Owner creates a separate follow-up task with reproduction steps |

Never delete a sale, movement or audit row to resolve an incident. Cancellation,
exchange, audited adjustment and compensating migration are the only valid paths.

## Evidence to collect

Owner records only pass/fail and non-sensitive observations for each device: role,
language, flow, date/time, result and issue reference. Do not attach Magic Links,
emails, tokens, customer data, database IDs or screenshots containing them.
