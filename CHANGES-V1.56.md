# ToolCart V1.56 — Manual-Scroll Category Navigation

## Customer experience
- Clicking Everything, Formats, Web Tools, Premium Tools, or Free Tools filters the product grid **in place** without automatically moving the viewport to the lineup.
- Clicking the Free Goods shortcut also changes the filter without forcing a scroll.
- Customers retain full manual scrolling; selecting a category doesn't hide the homepage hero or switch views.
- Public category buttons were already non-scrolling and are unchanged.

## Scope / compatibility
- Only the homepage category click handler was updated in `app.js`.
- `index.html` and `sw.js` were cache-versioned so iPhone Safari receives the new JavaScript.
- No changes to the hero image, CSS, product data, admin, Paystack, wallet, checkout, entitlement checks, SQL, or R2.

## Files changed
- `app.js`
- `index.html` (JS cache query only)
- `sw.js` (shell cache version only)
- `VERSION`
- `CHANGES-V1.56.md` (new)

## SQL
None.

## Deployment
Not deployed. Deploy changes via the user's GitHub and Cloudflare workflow.
