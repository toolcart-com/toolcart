# ToolCart V1.58 — Service Provider Registration and Approval

**Base:** ToolCart V1.57 Complete ZIP (source unchanged outside the scoped files below).

## What was added
- New customer-facing `/provider` page using existing ToolCart customer sign-in and registration, with a separate service provider application form.
- Provider profile collects full name, WhatsApp number (including country code), and optional services description; personal contact information is visible only to the owner and its own provider.
- A cryptographically generated, unique `TC-SP-...` provider ID is created upon application. The ID is an identifier, never an authentication credential.
- Provider application statuses: pending, approved, rejected, restricted, permanently banned. Pending applicants may edit their application; approved users see an approved but read-only workspace.
- Provider dashboard shows assigned requests and earnings as unavailable placeholders. Customer order data, upload delivery, withdrawals, and provider payouts are **not enabled**.
- Owner-only Service Providers tab lists applications, statuses and applicant contact details. The owner can approve, reject, restrict, restore a restricted provider, and permanently ban. Decisions and messages are recorded in D1, with audit events.
- Existing Premium Services editor continues to accept manually supplied provider codes and now indicates verification only when the code belongs to an approved provider whose ToolCart account is active. No assignment routes orders yet.
- A small “Become a service provider” entry was added to the existing ToolCart navigation menu. No other storefront or payment experience was redesigned.
- Provider API responses are private/no-store; CSRF, logged-in user scopes, owner permissions and login sessions are reused from the existing Worker.

## Updated/new files
- `_worker.js`
- `admin.js`
- `admin.html`
- `admin-storefront.css`
- `provider.html` (new)
- `provider.js` (new)
- `provider.css` (new)
- `index.html`
- `tempo06.css`
- `sw.js`
- `VERSION`
- `0011_provider_accounts.sql` (new D1 migration)
- `CHANGES-V1.58.md` (this file)

## Tests
- Parsed all 11 migrations in an isolated SQLite database. Verified provider-code uniqueness, one provider profile per user, valid status constraints, and review event history.
- Actual Worker API handlers tested against isolated SQLite: application, duplicate rejection, pending edits, signed-in identity, owner-only access, approval, restriction, ban, audit, and permissions.
- Browser interaction tests with mocked auth and API responses: provider sign-up → application → pending → approved, admin review actions, and responsive layouts at 320/375/390/430/768 pixels. No horizontal overflow in tested environments.
- JavaScript syntax, CSS parsing, HTML IDs, service-worker bypass of provider pages, and both ZIP integrity checks passed.
- Live iPhone Safari, Cloudflare D1, account email delivery and real provider registrations have NOT been tested. No deployment was performed.

## Deployment
Back up your Cloudflare D1 first. Deploy through the existing command (`npm run db:migrate:remote && npx wrangler deploy`). Migration `0011_provider_accounts.sql` is included. **Do not manually run this SQL before the automated Wrangler migration**. No new secret is needed.

## Next phase
V1.59 — verified service-order payments, customer requirement forms, protected customer submissions and assignment to approved providers. This remains unimplemented in V1.58.
