# ToolCart V1.54 — Homepage Hero Shopping Cart

## Scope
Replace the woman/laptop hero photograph with the exact original customer-supplied shopping cart loaded from `toolcart-v154-original-cart.jpeg`, following the reference mockup. Do not redesign surrounding elements.

## Changed
- Replaced only the **two embedded hero background images** in `index.html` (mobile 1200×625, desktop 1800×680). Both use the uploaded original photo of the black cart carrying ribboned gold gift boxes.
- Left the live `Scroll. Spot. Shop.` headline, eyebrow, arrow button, gold artwork caption, hero dimensions, rounded clipping, gold border, shadow, and responsive layout untouched.
- Maintained inline critical CSS backgrounds, requiring no extra image request on homepage load.
- Bumped Service Worker shell version for updated HTML visibility on Safari.

## Changed files
- `index.html`
- `sw.js`
- `VERSION`
- `CHANGES-V1.54.md`
- `toolcart-v154-original-cart.jpeg` — source photo (new)
- `toolcart-v154-hero-mobile.webp` — editable prepared hero background (new)
- `toolcart-v154-hero-desktop.webp` — editable prepared hero background (new)

## Database/Payments
No SQL, database changes, payment, wallet, authentication, admin, or Worker code changes.

## Deployment
Not deployed. Upload Changes-Only ZIP contents to existing GitHub repository. Use Complete ZIP as backup and future authoritative base.
