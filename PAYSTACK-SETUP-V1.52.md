# Paystack Setup — ToolCart V1.52

1. In Cloudflare Workers > ToolCart > Settings > Variables and Secrets add `PAYSTACK_SECRET_KEY` as a **Secret**. Use your Paystack **live** secret (`sk_live_...`) only for real payments; never put it in code, GitHub, or chat. Use a separate test secret (`sk_test_...`) when testing without real charges.
2. On Paystack Dashboard (Live mode) configure Webhook URL: `https://toolcart.mgt-toolcart.workers.dev/api/payments/paystack/webhook`.
3. Optional callback URL: `https://toolcart.mgt-toolcart.workers.dev/?payment=complete`. The Worker supplies this per transaction.
4. Deploy the entire V1.52 project (or Changes Only over your exact V1.51 repository). Your existing `npm run db:migrate:remote && npx wrangler deploy` applies `0008_paystack_wallet_funding.sql`. **Do not manually apply that SQL first.**
5. Sign into your own ToolCart customer account, go to Wallet & payments, fund ₦100 using Paystack. Check Paystack transaction success and ToolCart wallet increase by exactly ₦100. Reload and verify the balance is unchanged. Repeat verify and webhook delivery safely; should never double-credit.
6. If funds leave your bank but wallet does not increase, do NOT pay again. Keep the reference, check Paystack dashboard status and Worker logs, and use Check payment status. Do not credit wallets manually until status is independently verified.

Paystack API: https://paystack.com/docs/api/transaction/ ; verification: https://paystack.com/docs/payments/verify-payments/ ; webhooks: https://paystack.com/docs/payments/webhooks/ .
