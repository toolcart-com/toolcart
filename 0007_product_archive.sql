-- ToolCart V1.51: archive deleted listings without breaking order records or customer downloads.
-- Applied automatically by `npm run db:migrate:remote` in Cloudflare deployments.
ALTER TABLE products ADD COLUMN archived_at TEXT;
CREATE INDEX IF NOT EXISTS idx_products_archived_active ON products(archived_at,active,display_order);
