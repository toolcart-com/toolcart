-- ToolCart V1.57: managed Premium Services configuration only.
-- This does not alter existing products, wallets, orders, or provider payouts.
-- Service purchases and customer requirement submission deliberately remain disabled.
CREATE TABLE IF NOT EXISTS premium_service_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_key TEXT,
  customer_price_minor INTEGER NOT NULL CHECK (customer_price_minor >= 100),
  provider_price_minor INTEGER NOT NULL CHECK (provider_price_minor >= 0 AND provider_price_minor <= customer_price_minor),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK(currency = 'NGN'),
  provider_code TEXT,
  requirements_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(requirements_json)),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','configured')),
  display_order INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_premium_service_definitions_status
  ON premium_service_definitions(archived_at,status,display_order,id);
