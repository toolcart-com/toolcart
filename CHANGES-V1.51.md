# ToolCart V1.51 — Safe Product Removal and Admin Appearance Repair

- Admin Delete removes any product from both owner catalog and storefront, even with purchase history. Uses `archived_at` and hides listings instead of physically deleting product/asset records, so receipts, order references, purchase entitlements and protected R2 files remain available to prior buyers. Removes abandoned cart rows for that product, not orders or wallets. Reuses product names after archive.
- Settings PATCH writes only stable `settings(key,value_json)` columns with validation and a specific error message rather than a generic unavailable response.
- Admin Appearance now applies the saved Pearl/Midnight theme to the admin preview only after a successful save; displays a saving/confirmation state and disables duplicate submits. It does not change customer preferences.
- Cache revision and static asset version changed to make Safari fetch updated code.

## Migration
- Required: `0007_product_archive.sql` adds `products.archived_at` and a small index. Run once **through the configured automatic Wrangler migration command** before deploy; do not paste manually if your deploy runs the migrations.

## Updated files
- `_worker.js`, `admin.js`, `admin-storefront.css`, `admin.html`, `sw.js`, `VERSION` and new `0007_product_archive.sql`, `CHANGES-V1.51.md`.
