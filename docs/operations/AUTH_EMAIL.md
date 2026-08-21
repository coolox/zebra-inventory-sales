# Production Auth email — Clothing Pilot

Status: **configured, delivery acceptance pending bootstrap (TASK-084)**.

This document deliberately omits all email addresses, SMTP credentials and hosted
endpoints. They are secret or personal configuration values, not repository data
(D-060).

## Configured boundary

- Supabase custom SMTP is enabled. The sender uses the Owner-controlled temporary
  Gmail SMTP account with a Google App Password entered only in the hosted
  dashboard; the account password is never used or recorded.
- Sender display name is `Zebra Retail`. The provider warning about personal rather
  than transactional mail is accepted only for the small Clothing Pilot; it must be
  replaced with a verified transactional sender before broader rollout.
- The temporary managed Vercel HTTPS origin is the exact Supabase Site URL and the
  only allowed redirect URL (D-065). There are no wildcards and no staging or
  localhost production redirects.
- Magic Link has one branded bilingual template: English first, then Turkish. Both
  links use `{{ .ConfirmationURL }}`; the copy explicitly says that the link is
  short-lived and single-use. This follows D-010 and D-045 without attempting
  unsupported per-email locale detection in Supabase Auth.

## Delivery acceptance matrix

Do not run these tests until TASK-085 has applied migrations and created the
controlled Owner/Seller test identities, and TASK-150 has deployed the production
application callback. No real pilot data is introduced by this document.

| Check | Expected evidence |
|---|---|
| Owner Magic Link delivery | Branded EN/TR email arrives, callback resolves to the allowed temporary origin and Owner workspace only after active membership verification. |
| Seller Magic Link delivery | Branded EN/TR email arrives and opens only assigned store workspace after active membership verification. |
| Unknown email / non-member | Auth flow does not create a usable workspace session; D-044 server-side membership guard denies access. |
| Expired or reused link | Supabase rejects the link and the application shows its safe sign-in failure state without creating a session. |
| Redirect boundary | Only the single exact production origin succeeds; staging, localhost and arbitrary origins are rejected. |

## Domain and sender change

When Owner later adopts a custom domain or transactional sender:

1. Add and verify the new sender/domain in its provider.
2. Add the new exact HTTPS origin in Supabase and deploy the matching callback.
3. Run the full matrix above.
4. Remove the temporary Vercel origin only after successful evidence.
