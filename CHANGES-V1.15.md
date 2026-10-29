# ToolCart V1.15 — Branding & Consistent Storefront

Based on the exact ToolCart V1.14 complete ZIP supplied by the owner.

- Uses the two newly supplied black-background gold/silver symbol and white/gold ToolCart wordmark in both public and logged-in header. The originals are preserved byte-for-byte. Header matches the black artwork background.
- Updates customer/admin sign-in logos and PWA home-screen icon using a crop/resize of the new symbol (not a redraw).
- Removes the 2.8-second post-login/refresh intro welcome screen. Successful login, signup, and session restoration display the homepage immediately after bootstrap completes.
- Signed-in featured lineup now contains actual products followed by actual working tools in the same two-column style as the logged-out homepage. Authenticated product purchases/cart/wishlist and tool launch remain active.
- Slightly compacts the separate Working Tools cards below the free-goods banner; does not shrink the main product listing.
- Bumps service worker cache to v1.15 to refresh changed assets.

No D1 SQL migration, environment/binding change or payment/wallet/download change required.

Validation: JavaScript syntax, static assets, and mocked desktop/mobile browser rendering checks. These tests do NOT prove a real Cloudflare production deployment or authenticated live-payment flow.
