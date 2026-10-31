-- V1.55: Product text/URL items live separately from protected PDF/image R2 assets.
-- No existing products or purchased media records are changed.
CREATE TABLE IF NOT EXISTS product_content_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('link','text')),
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_content_items_product
ON product_content_items(product_id, display_order, id);
