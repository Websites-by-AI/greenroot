# GreenRoot opt-in follow-up reminders

Deployed endpoint: https://greenroot-followups.elasa2next.workers.dev

## Current activation state

Provider and sender are NOT configured. No real email delivery has been tested or claimed. UI timestamps and local tasks are not a mail queue. The Worker returns a deliberate 503 for email activation when sender settings are missing; it does not store that request’s recipient.

## Storage and scheduling

Dedicated SQLite-backed Durable Object (`ReminderStore`), isolated from other projects. Account D1 and cron quotas were full, so no other database/trigger was deleted and no plan upgrade was performed. Persistent Durable Object alarms tick every 30 minutes while subscriber records exist; no browser or Arena session needs to remain open. There is deliberately no account-level cron trigger in wrangler.toml.

`schema.sql` is embedded into worker.mjs. If schema changes, update the embedded SCHEMA and apply a safe, non-destructive migration; do not drop private records.

## Secret configuration

Never commit values. Use Cloudflare Worker Settings → Secrets or `wrangler secret put`.

- `RATE_SALT`: generated on first deployment. Auth-key hashing, rate privacy and AES-GCM unsubscribe-token encryption depend on it. Preserve on redeploy.
- `RESEND_API_KEY`: real sender API credential, supplied by the owner.
- `EMAIL_FROM`: owner testing can use onboarding@resend.dev; public use requires a verified sender domain.
- `TEST_RECIPIENT`: owner’s actual Resend-account email. While present, other addresses are refused.
- For public mode also require `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, a real `PRIVACY_CONTACT` and HTTPS `PRIVACY_NOTICE_URL`. Review real privacy/legal obligations, costs and provider terms first.

Frontend public site key is returned only when configured. There is no secret in the website.

## Security / autonomy boundaries

- High-entropy bearer workspace key; salted hash in private storage, never exported in private JSON backups.
- CORS restricted to current Cloudflare/Hugging Face website origins.
- Explicit consent; email verification requires a user POST, not merely a scanner opening a link.
- Owner-only test mode or Turnstile + rate limits + public privacy configuration.
- Stable one-purpose unsubscribe tokens, encrypted at rest; old email links remain valid.
- One active verified workspace per address; new-device verification replaces the previous server workspace.
- Retry limit, idempotency key, atomic claims and opt-out checks. Provider acceptance is NOT delivery/read confirmation.
- Only institution name, task type, lead ID and due timestamp sync. No notes, drafts, health records, CVs or documents.
- DELETE endpoint / unsubscribe removes app records; retention cleanup independent of sender activation. Provider/backup retention follows the vendor’s policy.
- NO recipient-institution outreach, inbox reading, technopark application, company incorporation, signature, payment or equity transfer.

## API

- `GET /api/status`: non-secret setup capability.
- `POST /api/email/connect`: owner address, consent, locale, Turnstile token if public.
- `GET /verify` → explicit `POST /verify`: confirm owner address.
- `GET /api/workspace`: authenticated own workspace status only.
- `POST /api/tasks`: authenticated, verified pending task list, max 60.
- `DELETE /api/workspace`: stop/delete.
- `GET /unsubscribe` → explicit POST; mail one-click POST supported.

All internal endpoints are blocked by the public Worker router. There is no public route to invoke reminder sending or list other users.

## Deployment

`deploy.py` requires existing authorized CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID in the process environment. It retains existing secret bindings, never fabricates a sender and does not collect an email address. Use wrangler.toml for ordinary future deployment; preserve secrets. No database or scheduler of another project is reused.

Manual real-delivery test is required AFTER owner setup and verification. Current QA uses local mocks plus negative production API checks; no actual emails were sent.
