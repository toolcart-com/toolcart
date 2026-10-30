# ToolCart V1.35 — Owner Wallet Funding

- Added a dedicated **Wallet Funding** admin page (sidebar + mobile More menu).
- Search for a customer, verify their identity and NGN wallet balance, and add spendable balance for testing a real checkout.
- Owner-only API with verified user status, CSRF/session authorization, input limits, a confirmation step, an audit trail and recent credit history.
- Prevents duplicate funding on repeated requests with a unique admin credit reference.
- Existing checkout, payment providers, wallet purchase debit, protected downloads, and storefront are unchanged.
- **Migration required:** Run `0005_admin_wallet_credit_idempotency.sql` on the production D1 database before deploying/using Wallet Funding.
- Admin credit is real wallet money, not a fake preview. A successful checkout may consume stock and creates real entitlements.
