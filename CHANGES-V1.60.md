# ToolCart V1.60 — Provider Self-Publishing & Guided Onboarding

Built from V1.59 Complete. No previous files discarded.

- Existing sign-up popup now offers **Shopping / buying** and **Offer services** (opens `/provider?register=1`). The provider portal still uses the original ToolCart authentication and owner-approval flow.
- Approved providers can publish, edit, hide, and remove service listings. Each listing has name, short/full descriptions, optional R2 cover, and configurable customer information fields.
- Server-computed pricing: provider quote P; fee = round(0.15P) in kobo; customer price P+fee; provider net P-fee; ToolCart gross margin 2*fee. Example P=₦10,000 -> customer ₦11,500; provider ₦8,500; platform gross ₦3,000. Never use client prices to move money.
- Listings are displayed under Premium Tools and Everything, both before and after sign-in. Listings are **preview-only** until the secure payment/order provider routing workflow exists. No fake purchase buttons or debits.
- Owner admin keeps the existing manual service builder and gains provider listing moderation (restrict/release/remove). Banned/restricted providers disappear from the public catalog.
- First-use guided tours for shoppers and providers have Next/Skip controls; completion is saved per account in D1. Guide advances intentionally scroll to the highlighted area; normal browsing never auto-jumps.
- New migration: `0012_provider_service_marketplace.sql` (provider_service_listings and user_onboarding_tours tables). Apply through existing Wrangler automatic migration, not manually before deploying. Back up D1 first.
- Existing product, Paystack, wallets, orders, protected R2 files, and admin credentials untouched.
- Checkout for managed services, customer form submission, provider earnings, payouts, and disputes remain **disabled** pending the next stages.
- Not deployed. Live iPhone Safari and production payment flows require verification after deployment.
