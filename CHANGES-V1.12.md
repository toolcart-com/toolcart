# ToolCart V1.12 — Tempo 06 Reference-Faithful Rebuild

This corrects V1.11 to follow the exact *structure and visual direction* of the user-provided Design 06 screenshots, rather than the earlier dark, rounded concept.

## Customer storefront

- Signature black header with original Tempo-style gold T+ mark and TOOLCART wordmark.
- White, full-width search bar and filter button.
- White editorial hero: **Scroll. Spot. Shop.**, gold illustrated shopping bag and browse arrow.
- Underlined categories row: Everything, Design, Business, AI goods and Guides.
- Real database-driven product cards, with admin-uploaded display images, name, price, a wishlist heart, and a functioning Add to cart action.
- Product sorting by featured, newest, price ascending and price descending.
- Gold promotional panel for free digital products.
- Persistent white bottom navigation: Shop, Categories, Wishlist, Cart and Profile.
- Existing CallFocus, ChatFocus, LodgeFinder and future Admin-managed tools appear in a separate working-tools shelf.
- Signed-out customers can see public listings; private downloads still require verified server-side entitlements.

## Features retained

Preserves V1.11's D1 schema, Worker API, Paystack server verification, R2 file protection, Resend integration points, Admin, authentication, user profile, payment and wallet flows, subscriptions, updates and requests. No server/Worker logic changed in this version.

## Notes

- Product category tabs currently search product names/descriptions because the current product schema does not contain a dedicated category field. They do not falsely claim a stored category.
- Wishlist saves are **local to the current browser/device**, not ecosystem-wide synced favorites. They do not unlock protected files.
- The screenshot illustrations are design references. Live product cards display **your own uploaded cover images**, never the preview's fictional sample products.
- Appearance is intentionally locked to the selected Tempo 06 storefront palette for the customer UI; Admin styling remains separate.
- No new D1 migration required.
- Existing bindings and origin are preserved: D1 ef8f71eb-dd5a-41dd-b049-bfe85066aa98; https://toolcart.mgt-toolcart.workers.dev.

## Deployment

Upload all files from the Changes Only folder directly to your existing GitHub repo root; no subdirectory prefix is needed. Keep the existing Cloudflare deploy command. After Ready, reopen Safari to pick up the new service worker cache.
