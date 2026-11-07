# ToolCart V1.57 — Premium Services Foundation

Development base: V1.56 Complete.

- Added an **owner-only Premium Services admin dashboard** next to existing Premium Tools digital products.
- Service definitions store name, short/full descriptions, optional R2 cover, customer price, provider agreed amount, display order, optional unverified provider code, preparation status, and custom requirement form schema.
- Requirements support text, paragraph, phone, email, number, dropdown, date, image, and PDF/image upload with required flag, labels and helper text. Admin can add/remove/reorder and preview.
- Uses new `0010_premium_services_foundation.sql` table; **not** the existing `products` table.
- Customers cannot purchase or submit personal information for these service definitions yet. No provider messages, payouts, or customer data are processed. The 'configured' status never enables checkout.
- Server-side owner authorization, CSRF, strict price/form validation, and admin audit logs.
- Existing product checkout, wallet balances, Paystack, R2 purchases, customer authentication, and website design untouched.

## Updated files
`_worker.js`, `admin.js`, `admin.html`, `admin-storefront.css`, `sw.js`, `VERSION`; new `0010_premium_services_foundation.sql` and `CHANGES-V1.57.md`.

## Deployment
Backup production D1 first. Run the existing configured automatic Wrangler D1 migration at deployment; do **not** manually apply this SQL first. No new Cloudflare secrets needed. Not deployed by this package.

## Next planned release
V1.58 adds provider accounts, unique IDs, approval, and permissioned provider dashboard. No automatic dispatch until verified.
