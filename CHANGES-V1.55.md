# ToolCart V1.55 — Free Tools and flexible protected content

- Rebrand the storefront and admin *Announcements* section as **Free Tools**. The underlying `announcements` value is intentionally unchanged to respect existing D1 CHECK constraints and prevent losing prior listings.
- Free Tools listings default to Free pricing when newly created; existing listings keep their configured prices.
- Add protected **links** and **text** to product content alongside optional PDF/image files, with multiple entries supported and independent labels. At least one item of any kind is required.
- Protect the new link/text content: public listing and unowned product detail endpoints do not return it; customers only receive content after a confirmed entitlement from purchased items/product detail.
- Existing PDF/image R2 files retain entitlement-checked download links and their existing table. No R2 public exposure or wallet behavior changes.
- New D1 migration `0009_product_content_items.sql` creates a separate typed-content table. Deploy through `npm run db:migrate:remote` as configured; **do not execute it manually first**.

Files changed: `_worker.js`, `app.js`, `admin.js`, `admin.html`, `index.html`, `tempo06.css`, `admin-storefront.css`, `sw.js`, `VERSION`.
New files: `0009_product_content_items.sql`, `CHANGES-V1.55.md`.
