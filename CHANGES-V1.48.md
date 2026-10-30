# ToolCart V1.48 — Category Bar Mobile Edge and Spacing Fix

- Fixed the homepage category bar on narrow iPhones so the full **Everything** label and its underline sit comfortably within the left edge.
- Kept **all five** categories visible in one row: Everything, Formats, Web Tools, Premium Tools, Announcements.
- Used responsive five-column spacing and slightly tighter type on narrow screens so the longer names do not run off the right side.
- Preserved the category-filtering behavior, content, product cards, admin management, image-loading improvements, checkout, and wallet.
- Updated the critical storefront stylesheet URL and service-worker shell revision for Safari cache refresh.

## Modified files
`tempo06.css`, `index.html`, `sw.js`, `VERSION`.
New file: `CHANGES-V1.48.md`.

## SQL
No new SQL is required; the V1.47 database migration remains unchanged.

## Deployment
Not deployed.
