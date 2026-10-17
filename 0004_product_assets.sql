PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS product_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK(file_type IN ('pdf','image')),
  mime_type TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, r2_key)
);

INSERT OR IGNORE INTO product_assets(product_id,r2_key,file_name,file_type,mime_type,display_order)
SELECT id,file_key,file_name,file_type,mime_type,0
FROM products
WHERE file_key IS NOT NULL AND file_key <> '';

CREATE INDEX IF NOT EXISTS idx_product_assets_product_order ON product_assets(product_id,display_order,id);
