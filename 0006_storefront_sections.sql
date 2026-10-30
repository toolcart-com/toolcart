-- V1.47: the existing product catalog remains in Formats by default.
-- Apply once to the CURRENT ToolCart D1 database before deploying the V1.47 Worker.
ALTER TABLE products ADD COLUMN store_section TEXT NOT NULL DEFAULT 'formats'
  CHECK (store_section IN ('formats', 'premium_tools', 'announcements'));
CREATE INDEX IF NOT EXISTS idx_products_store_section ON products(store_section,active,display_order);
