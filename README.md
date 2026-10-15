# ToolCart V1.4 — Dashboard Visual Rebuild

ToolCart is a mobile-first Cloudflare Workers application for launching and managing a growing family of independently hosted digital products. Apps are stored in D1 and can be added, edited, put into maintenance, hidden, reordered, or removed from `/admin` without changing source code.

## Easiest GitHub upload

This package is arranged in a CallFocus-style project folder. After extracting the ZIP, open the the extracted ToolCart folder folder, select **everything inside it**, and upload those items directly to the root of your GitHub `ToolCart` repository. There are no nested `public` or `migrations` folders in this flat upload build. The Worker entry file is `_worker.js` at the project root.


## What the current build includes

- Customer email/password authentication with server-authoritative HttpOnly sessions
- Email verification and password reset through Resend
- Premium signed-out experience and a rebuilt launcher-first signed-in dashboard
- Database-driven compact app launcher, recent app activity, categories and search
- Maintenance, coming-soon and subscription-gated app states
- Updates center with unread tracking
- Customer requests and staff responses
- Notification inbox with unread counts, read/unread controls and swipe dismissal
- User profile, password changes and device-session visibility/revocation
- Database-driven subscription plans and customer payment history
- Paystack checkout initialization, transaction verification and signed webhook handling
- Separate `/admin` portal with dashboard, customers, apps, subscriptions, payments, updates, requests, notifications, analytics, appearance, settings/promotions and diagnostics
- R2 media upload structure for app icons and profile photos, with browser-side WebP resizing before upload plus server MIME/size validation
- Admin audit log backend
- Brighter Pearl-first visual system plus a refreshed navy Midnight theme
- PWA manifest, service worker and standalone-ready shell
- D1 migrations and optional starter seed


## V1.4 visual direction

V1.4 rebuilds the customer-facing dashboard around compact launcher tiles. App tiles show only the app icon, app name and ONLINE/OFFLINE state. The oversized V1.3 hero and app panels are removed. The bottom dock has also been rebuilt for iPhone Safari stability, including BFCache/page-return recovery after users open an external product and come back to ToolCart.

## Architecture

- **Cloudflare Workers**: API, authentication, payment verification, media delivery and static routing
- **Cloudflare D1**: users, sessions, apps, subscriptions, payments, updates, requests, notifications, admin data and audit logs
- **Cloudflare R2**: uploaded media
- **Resend**: transactional email
- **Paystack**: initial payment provider
- **Workers KV**: not required by this build and is not used as the customer/account database

## 1. Create the Cloudflare resources

From the project folder after installing dependencies:

```bash
npm install
npx wrangler d1 create toolcart
npx wrangler r2 bucket create toolcart-media
```

The current Complete build is already synced to the live ToolCart D1 database ID and the current workers.dev origin. If this project is moved to a different Cloudflare account or domain later, update those values in `wrangler.jsonc`.

## 2. Apply the database migrations

```bash
npm run db:migrate:remote
```

This applies `0001_initial.sql` from the project root.

`0002_seed_optional.sql` contains optional starter rows for CallFocus, ChatFocus and LodgeFinder. It is intentionally **not** required by the application. Edit any URLs first, then apply it only if you want those starter records. The ecosystem itself does not hard-code these apps.

To apply the optional seed manually:

```bash
npx wrangler d1 execute toolcart --remote --file=./0002_seed_optional.sql
```

## 3. Configure production secrets

Set each secret from the project directory:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM
npx wrangler secret put PAYSTACK_SECRET_KEY
npx wrangler secret put ADMIN_BOOTSTRAP_TOKEN
```

### Required meanings

- `RESEND_API_KEY`: Resend production API key.
- `RESEND_FROM`: verified sender such as `ToolCart <no-reply@yourdomain.com>`.
- `PAYSTACK_SECRET_KEY`: use the Paystack test secret while testing, then replace with the live secret before taking real payments.
- `ADMIN_BOOTSTRAP_TOKEN`: a long random one-time token used only to create the first ToolCart owner account.

No credential is included in the ZIP and no fake successful integration is shown when a provider is not configured. Diagnostics reports whether the required binding/secret is present.

## 4. Create the first administrator

After deployment, create the first owner exactly once. Replace the URL, token, email, name and password below:

```bash
curl -X POST "https://YOUR-TOOLCART-DOMAIN/api/admin/bootstrap" \
  -H "content-type: application/json" \
  -H "x-toolcart-bootstrap-token: YOUR_ADMIN_BOOTSTRAP_TOKEN" \
  --data '{"email":"owner@example.com","fullName":"ToolCart Owner","password":"USE-A-LONG-UNIQUE-PASSWORD"}'
```

The endpoint refuses to create another owner after the first admin exists. After successful bootstrap, rotate or remove `ADMIN_BOOTSTRAP_TOKEN`.

Admin sign-in is at:

```text
/admin
```

## 5. Configure support details

The base migration uses `support@example.com` as a deliberate placeholder. Sign in to `/admin`, open **Settings**, and replace it with your real support address before launch.

## 6. Configure Paystack

In the Paystack dashboard, point the webhook to:

```text
https://YOUR-TOOLCART-DOMAIN/api/payments/paystack/webhook
```

ToolCart does not activate a subscription from a browser success screen. It verifies transactions server-side and accepts the signed Paystack webhook as the authoritative payment event.

The plan price is stored in **minor currency units**. For NGN, `500000` represents ₦5,000.00.

## 7. Configure Resend

Verify the sender/domain in Resend and set `RESEND_FROM` to that verified identity. Registration is intentionally blocked with a clear configuration error when Resend is missing, rather than pretending email verification worked.

## 8. Deploy

Run the syntax checks, then deploy:

```bash
npm run check
npm run deploy
```

Add the final custom domain or route in Cloudflare after the Worker is deployed.

## Local testing versus production testing

### Local / mock-environment testing

`wrangler dev` can test UI rendering, D1 migration behavior, API routing, authentication flow and R2 calls with local resources. Provider calls still need valid test credentials. A local success is not proof that production DNS, Resend domain verification, Paystack live mode, webhook delivery or custom-domain cookies are working.

### Production verification

Before accepting customers or money, verify on the deployed HTTPS domain:

1. Registration sends a real verification email.
2. Verification link activates the account.
3. Login persists after closing/reopening the browser.
4. Password reset email works.
5. Admin can create an app and it appears for customers without redeployment.
6. Maintenance mode blocks launching and shows the configured message.
7. App icon upload is visible through the Worker media route.
8. A Paystack **test** payment is verified server-side and creates the subscription.
9. Paystack webhook delivery is successful.
10. Notifications and request replies appear on the customer account.
11. Mobile Safari layout, safe areas, keyboard behavior and PWA launch are checked on a real iPhone.
12. Only after test-mode validation, switch `PAYSTACK_SECRET_KEY` to the live key and run a controlled live transaction.

## Security notes

- Passwords use PBKDF2-SHA256 with random salts and 310,000 iterations through Web Crypto.
- Session tokens are random opaque values; only token hashes are stored in D1.
- Customer and admin sessions use `HttpOnly; Secure; SameSite=Lax` cookies.
- Mutating authenticated APIs require a per-session CSRF token and same-origin check.
- Authentication endpoints are rate-limited in D1.
- Subscription state is read from the server; app access is never trusted from localStorage.
- Paystack webhooks require the provider HMAC signature and amount/currency consistency.
- Uploaded image types and sizes are validated server-side.
- Admin actions are enforced by the server and important actions are recorded in `audit_logs`.
- Raw SQL errors, Worker stack traces and provider payloads are not shown to customers.

## V1.0 boundaries

ToolCart V1.0 implements the requested Foundation architecture. Phase 2 cross-product single sign-on is intentionally **not** implemented. Apps continue to open their independently hosted URLs. Advanced scheduled notifications, refunds, deeper role-based admin permissions, automatic server-side image transcoding and external push notifications can be layered onto this schema without changing the core architecture.

## Flat GitHub upload edition

This package is the simplified flat-layout edition prepared for phone/GitHub uploading. Static frontend files and D1 migration SQL files live at the repository root. `wrangler.jsonc` points Workers Static Assets to the root, while `.assetsignore` excludes backend/config/database/documentation files from public asset upload. D1 `migrations_dir` is also set to the repository root.


## V1.2 temporary signup mode
This build contains `ALLOW_UNVERIFIED_SIGNUP=true` so accounts can be created without Resend during development. Registration is still server-authoritative and passwords are still securely hashed. When Resend is configured, change this variable to `false` in `wrangler.jsonc` and redeploy. Forgot-password email remains unavailable until Resend is connected.
