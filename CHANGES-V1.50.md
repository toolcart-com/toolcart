# ToolCart V1.50 — Premium Shopping Experience

Development base: V1.49 Complete ZIP. Scoped storefront improvements only.

## Premium product details
- Larger contained cover with a clean framed presentation, readable title/price/stock, product description, existing wallet balance, compact quantity controls, and an add-to-wishlist control.
- Purchase actions appear only once the authenticated product detail endpoint has checked availability and ownership; no purchase is treated as complete before server confirmation.
- Keep the existing loaded photo in place when the verification response updates pricing or file access; verified owned users retain private file links.
- Mobile purchase controls stay reachable while scrolling. Pearl and Midnight both have explicit styles.

## Shopping responsiveness and reliability
- Remove unnecessary smooth scroll from category selection.
- Return the complete, server-authoritative cart snapshot from existing add/remove handlers, avoiding a second GET to reconcile quantities/prices and preventing locally guessed cart state.
- Reconcile successful quantity PATCH replies directly if still current; preserve out-of-order/stale-response guards.
- Suppress duplicate add-to-cart/buy actions while prior requests are pending, and keep the existing checkout double-tap guard.
- Safeguard direct Buy now: no purchased-files view until checkout returns verified entitlements; uncertain/network errors instruct customers to check Purchased Items.
- Wishlist remains responsive even if Safari blocks storage, with an in-memory fallback for that session.

## Scope
Modified: `app.js`, `_worker.js`, `tempo06.css`, `index.html`, `sw.js`, `VERSION`.
Added: `CHANGES-V1.50.md`.
No D1 migration, no secrets or Worker binding changes. Existing authentication, money debits, order/payment authorization, entitlements, product data, and R2 privacy unchanged.
Not deployed. Live payment and iPhone Safari validation still required after deployment.
