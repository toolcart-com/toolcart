# ToolCart V1.8

ToolCart V1.8 adds the Digital Products Marketplace.

## Updating an existing ToolCart project

Upload all files from `ToolCart-V1.8-Changes-Only` to the root of the existing GitHub repository and replace matching files.

Keep the Cloudflare deploy command exactly as:

`npm run db:migrate:remote && npx wrangler deploy`

Unlike the recent visual-only versions, **V1.8 includes a required D1 migration**: `0003_products_marketplace.sql`.

## No new Cloudflare binding

V1.8 uses the D1 and R2 bindings already configured for ToolCart. Paystack remains optional until paid checkout is needed. If Paystack is not configured, paid products can still be purchased using sufficient ToolCart wallet balance.

## Product file security

The protected product PDF/image is not exposed through the normal `/media/` route. Product access is checked server-side against the authenticated customer's entitlement before the file is streamed.
