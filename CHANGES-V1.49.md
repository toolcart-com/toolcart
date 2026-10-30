# ToolCart V1.49 — Appearance Theme Repair

- Fixed the Appearance control: Midnight now applies a dark charcoal, black and gold appearance; Pearl retains the original white design.
- Corrected the application logic that previously forced Pearl regardless of the selected button.
- Added customer-scoped dark surface colors for storefront, product cards, category bar, navigation, account pages, cart, purchased items, and appearance popup.
- Preserved the original homepage hero image, header branding, layout, checkout, downloads and administrator appearance.
- Selected appearance is applied immediately, saved via the existing /api/profile endpoint, restored on return, and rolled back with a visible error if account saving fails.
- Respects the existing admin Allow User Theme setting; no Worker or database changes.
- Updated cache and asset versions so Safari refreshes the corrected CSS and JS.

Modified: `app.js`, `tempo06.css`, `index.html`, `sw.js`, `VERSION`.
New: `CHANGES-V1.49.md`.
No SQL required. Not deployed.
