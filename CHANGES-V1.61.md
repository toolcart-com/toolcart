# ToolCart V1.61 — Secure Service Orders and Provider Routing

Built from V1.60 Complete ZIP. This is a functional release of wallet-funded managed service orders, not a complete service-fulfillment platform.

## New workflow
- Customers can initiate wallet-funded Premium Service purchases and confirm the charge before it occurs.
- Service price, provider assignment and the required field definitions are validated server-side and snapshotted into the order.
- Each purchase inserts the order and debits the wallet atomically in D1, with a unique idempotency key and private service-wallet debit ledger. Insufficient balances, altered prices, inactive providers and paused listings are rejected.
- After purchase, customers receive the configured form (text/number/email/phone/select/date and optional JPEG/PNG/WebP/PDF uploads) and can return via **My service requests**.
- Requirement submissions are private, stored separately from public storefront content, and routed only to the assigned approved provider after submission.
- Approved providers see an assigned request inbox, review submitted details/files, and mark a request **In progress**. Other providers cannot access orders they do not own.
- Owner admin **Service Orders** panel shows orders, status, customer email, provider assignment, pricing and requirement details. No withdrawal or fulfillment button is enabled yet.
- Both customer and provider interfaces use the existing ToolCart authentication. Existing Paystack wallet top-ups and ordinary digital-product checkout remain unchanged.

## Security / known scope limitations
- No provider earnings are released or made withdrawable in this version. Provider earnings amounts shown are pending estimates, not available balance.
- **No completed-work delivery, watermarked preview, acceptance/rejection, dispute handling, refunds or provider payouts exist in V1.61.** Do not market paid services as end-to-end deliverable until those steps are completed and tested; a charged customer cannot yet receive a final file through this workflow.
- Purchases currently use the customer's existing NGN wallet; this is **not** a new direct Paystack service-payment flow.
- Customer requirements are visible only to the customer, approved assigned provider (after submission) and authorized owner admin. Private R2 uploads cannot be downloaded without these checks.
- No encryption-at-rest customization or automatic retention/deletion policy introduced in this version; evaluate privacy and retention requirements before collecting sensitive documents.

## Database and deployment
- New migration `0013_service_orders.sql` creates `service_orders`, `service_wallet_debits`, `service_requirement_uploads`, and an atomic wallet-debit trigger. Existing tables and transaction definitions are preserved.
- Apply through existing `npm run db:migrate:remote && npx wrangler deploy` workflow; back up production D1 first; do not manually apply the same migration in advance.
- No new Cloudflare environment secrets required. R2 binding `MEDIA` is reused.

## Files
`_worker.js`, `app.js`, `index.html`, `tempo06.css`, `provider.js`, `provider.html`, `provider.css`, `admin.js`, `admin.html`, `admin-storefront.css`, `sw.js`, `VERSION`, new `0013_service_orders.sql` and this changelog.

## Local checks
- SQLite migrations 0001–0013 apply successfully; simulated D1 wallet/order trigger tests verified single debit, same-reference idempotency, insufficient balance rollback, provider restrictions and price tampering checks.
- JS syntax and CSS parsing completed; simulated Chromium customer form, provider inbox and admin orders flows passed at 320/375/390/430/768px with no horizontal overflow.
- Zip integrity and source-preservation checks pass.
- Not deployed. Real Cloudflare/D1, iPhone Safari, payment events and live permission behavior still require verification.
