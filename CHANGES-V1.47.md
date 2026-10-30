# ToolCart V1.47 — Storefront Sections

## Storefront
- Renamed Design → Formats; Business → Web Tools; AI goods → Premium Tools; Guides → Announcements.
- Replaced old keyword-guessing filters with actual store section fields, including logged-out public catalog.
- Web Tools displays linked web services; Formats displays existing digital products; Premium Tools and Announcements display products assigned to those sections.
- Everything includes all sections. Existing products remain in Formats, including any marked as premium; move them explicitly in admin if desired.

## Administrator
- Four management sections: Web Tools, Formats, Premium Tools, Announcements.
- Web Tools uses the existing linked-tool editor. The other three use the existing secure product editor, including covers, protected multi-file uploads, prices, stock and free/paid settings.
- Admin can change a product's section when editing; listings are not duplicated.

## Database deployment (required)
1. Back up the live D1 database.
2. Apply `0006_storefront_sections.sql` ONCE to the existing production D1 database BEFORE deploying V1.47.
3. Deploy V1.47 (the Worker references products.store_section).
Do not rerun the ALTER TABLE statement once applied.

## Security
No changes to wallet, checkout, payment, entitlement verification or private R2 file access.
