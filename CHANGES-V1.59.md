# ToolCart V1.59 — Admin Control Center Redesign

## Base
ToolCart V1.58 Complete ZIP. Visual and admin-only navigation update. No migrations or changes to production data.

## Changes
- Replaced the legacy icon glyphs in the administrator sidebar and mobile dock with consistent, inline monochrome SVG line icons (no extra network requests).
- Added a visible mobile drawer close (X) button, dismissible backdrop, Escape-key closing, menu `aria-expanded` state, and scroll locking of the background while leaving the drawer navigation scrollable.
- Replaced bulky gold-highlighted navigation rows with restrained charcoal selection and a thin muted-gold accent.
- Simplified the administrator top bar and mobile dock into a clean white/neutral control-center design.
- Reorganized the existing Dashboard response into prominent Monthly Revenue, Total Customers and Open Requests metrics, then seven secondary operational figures. All ten underlying metrics are still shown from the same API response; none are invented or recalculated.
- Updated empty-state, panel, card, typography and layout treatments to use thin neutral borders and minimal shadows instead of repetitive gold strips.
- Added working quick-navigation controls for Premium Services and Service Providers.
- Added equivalent Midnight appearance styles. No account preferences were changed.
- Updated CSS/JS version URLs in admin.html and shell cache revision for stale-asset avoidance.

## Files changed
- `admin.html` (menu structure, buttons, icons, asset versions)
- `admin.js` (menu-state handling and dashboard rendering only)
- `admin-storefront.css` (presentation changes)
- `sw.js` (cache version)
- `VERSION`
- `CHANGES-V1.59.md` (new)

## QA
- JavaScript syntax: `node --check` passed.
- CSS syntax parsed without errors.
- Simulated authenticated admin dashboard rendered in headless Chromium at 320, 375, 390, 430, 768, and 1280px in Pearl and Midnight; no horizontal overflow.
- Mobile drawer open / close button / click-outside backdrop / Escape key and `aria-expanded` state passed in both themes.
- Confirmed all ten original dashboard metric keys are still included, and no API endpoints or payment logic changed.
- These are isolated mock-data browser tests, not a live Cloudflare or iPhone Safari verification.

## SQL and deployment
No SQL required. This package has not been deployed.

## Next
1. Upload Changes-Only file contents to the same GitHub repository paths, commit, and verify Cloudflare's deploy succeeds. Do not change database migration settings.
2. Open `/admin` on iPhone, test menu X, backdrop, navigation and Pearl/Midnight. Check service provider admin review remains available.
3. Continue ToolCart V1.60 with the planned paid service order, configurable requirement intake, and secure provider assignment after verification of V1.58 accounts.
