# ToolCart V1.13 — Tempo 06 Mobile Proportion & Cover Fix

- Makes the white `Scroll. Spot. Shop.` hero compact on phones; removes excess whitespace above and below its content.
- Keeps gold bag, black header, five-tab bottom navigation and original Tempo 06 presentation.
- Reduces the visual height of two-column product/tool cards: shorter media, tighter labels, price, action button and card spacing.
- Displays an administrator-uploaded tool image as full-bleed artwork using `object-fit: cover` instead of a centered small icon.
- Keeps the Admin-configured tool accent color as a full-card fallback when no uploaded image exists.
- Prevents a missing old notification-dot element from interrupting storefront rendering.
- Updates the service worker cache name to V1.13.

No schema migrations or backend, authentication, payment, R2 or Admin updates.
