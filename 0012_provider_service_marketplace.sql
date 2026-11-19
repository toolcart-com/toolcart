-- ToolCart V1.60: approved provider self-publishing and first-use guides.
-- Neither a provider listing nor an admin-defined service is purchasable in this release.
-- No money moves, no customer requirements are submitted, no payout ledger is created.
CREATE TABLE IF NOT EXISTS provider_service_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_key TEXT,
  quote_minor INTEGER NOT NULL CHECK(quote_minor BETWEEN 100 AND 1000000000),
  customer_price_minor INTEGER NOT NULL CHECK(customer_price_minor >= quote_minor),
  provider_earnings_minor INTEGER NOT NULL CHECK(provider_earnings_minor >= 0),
  platform_margin_minor INTEGER NOT NULL CHECK(platform_margin_minor >= 0),
  requirements_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(requirements_json)),
  status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published','paused','restricted','removed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provider_service_listings_provider ON provider_service_listings(provider_id,status,id DESC);
CREATE INDEX IF NOT EXISTS idx_provider_service_listings_public ON provider_service_listings(status,id DESC);
CREATE TABLE IF NOT EXISTS user_onboarding_tours (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context TEXT NOT NULL CHECK(context IN ('customer','provider')),
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id,context)
);
