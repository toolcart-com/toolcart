# ToolCart V1.52 — Paystack Wallet Funding and Live Payment Readiness

## Changes
- New authenticated NGN wallet funding form (₦100 to ₦1,000,000).
- Paystack transaction initialization performed only by the Worker using `PAYSTACK_SECRET_KEY` (Cloudflare Secret).
- ToolCart returns users to the existing payment-verification endpoint; verified payments update the displayed wallet immediately.
- Atomic D1 wallet credit, funding ledger insertion, and payment status transition; repeated webhooks and verify requests cannot double credit.
- Validate Paystack successful status, reference, amount, currency and environment (test/live) before settlement.
- One migration adds a unique funding reference index, without changing balances or products.
- Dashboard configuration instructions in PAYSTACK-SETUP-V1.52.md.

## Files
`_worker.js`, `app.js`, `index.html`, `tempo06.css`, `sw.js`, `VERSION`, `0008_paystack_wallet_funding.sql`, `CHANGES-V1.52.md`, `PAYSTACK-SETUP-V1.52.md`.

## Production
Do not run `0008` manually when the existing deploy command runs `npm run db:migrate:remote`.
No keys are included. No live payment has been processed during preparation.
