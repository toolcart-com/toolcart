# ToolCart V1.9 — Unified Tool / Product Uploads + Multi-File Products

## New
- Tools and Products now share one Admin management page with a two-way switch.
- The Add button opens a combined **Add tool / Add product** flow so the administrator can switch immediately between the two content types.
- Product uploads now support selecting any number of protected PDF/image files in one selection.
- Additional protected files can be added later while editing a product.
- Individual protected files can be removed before saving.
- Purchased customers see a secure list of every file belonging to the product.
- Each protected asset remains private in R2 and is served only after entitlement checks.

## Database
- Adds `0004_product_assets.sql`.
- Existing single-file products are migrated automatically into the new product-assets table.
- Legacy product file columns remain for backward compatibility.

## Unchanged
- Display image remains a separate single cover image.
- Pricing, free/paid status, premium status, stock controls, cart, ToolCart balance and Paystack logic remain intact.
