-- ToolCart V1.61: wallet-funded managed-service orders.
-- Independent of product orders/payments. Never releases provider earnings.
CREATE TABLE IF NOT EXISTS service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  listing_source TEXT NOT NULL CHECK(listing_source IN ('provider','admin')),
  listing_id INTEGER NOT NULL,
  idempotency_key TEXT NOT NULL,
  service_name TEXT NOT NULL,
  customer_price_minor INTEGER NOT NULL CHECK(customer_price_minor BETWEEN 100 AND 1000000000),
  provider_earnings_minor INTEGER NOT NULL CHECK(provider_earnings_minor BETWEEN 0 AND 1000000000),
  platform_margin_minor INTEGER NOT NULL CHECK(platform_margin_minor >= 0),
  currency TEXT NOT NULL DEFAULT 'NGN' CHECK(currency='NGN'),
  requirements_json TEXT NOT NULL CHECK(json_valid(requirements_json)),
  answers_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(answers_json)),
  status TEXT NOT NULL DEFAULT 'awaiting_requirements' CHECK(status IN ('awaiting_requirements','submitted','in_progress')),
  paid_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TEXT,
  started_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_service_orders_customer ON service_orders(user_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_service_orders_provider ON service_orders(provider_id,status,submitted_at DESC);
CREATE TABLE IF NOT EXISTS service_wallet_debits (
  order_id INTEGER PRIMARY KEY REFERENCES service_orders(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount_minor INTEGER NOT NULL CHECK(amount_minor > 0),
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- A single INSERT performs a conditional debit and writes the ledger, or aborts in full.
-- This is atomic in SQLite even with concurrent checkout attempts.
CREATE TRIGGER IF NOT EXISTS tc_service_order_debit AFTER INSERT ON service_orders BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM provider_profiles p JOIN users u ON u.id=p.user_id
    WHERE p.id=NEW.provider_id AND p.status='approved' AND u.status='active'
  ) THEN RAISE(ABORT,'service_provider_unavailable') END;
  SELECT CASE WHEN NOT (
    (NEW.listing_source='provider' AND EXISTS(
      SELECT 1 FROM provider_service_listings s WHERE s.id=NEW.listing_id AND s.provider_id=NEW.provider_id AND s.status='published'
      AND s.customer_price_minor=NEW.customer_price_minor AND s.provider_earnings_minor=NEW.provider_earnings_minor))
    OR (NEW.listing_source='admin' AND EXISTS(
      SELECT 1 FROM premium_service_definitions d JOIN provider_profiles p ON p.provider_code=d.provider_code
      WHERE d.id=NEW.listing_id AND p.id=NEW.provider_id AND d.status='configured' AND d.archived_at IS NULL
      AND d.customer_price_minor=NEW.customer_price_minor AND d.provider_price_minor=NEW.provider_earnings_minor))
  ) THEN RAISE(ABORT,'service_listing_unavailable') END;
  UPDATE wallet_accounts SET balance_minor=balance_minor-NEW.customer_price_minor,updated_at=CURRENT_TIMESTAMP
    WHERE user_id=NEW.user_id AND currency=NEW.currency AND balance_minor>=NEW.customer_price_minor;
  SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'insufficient_service_wallet') END;
  INSERT INTO service_wallet_debits(order_id,user_id,amount_minor,reference)
    VALUES(NEW.id,NEW.user_id,NEW.customer_price_minor,NEW.order_number);
END;
CREATE TABLE IF NOT EXISTS service_requirement_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
  field_key TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK(mime_type IN ('image/jpeg','image/png','image/webp','application/pdf')),
  file_size INTEGER NOT NULL CHECK(file_size BETWEEN 1 AND 8388608),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_requirement_uploads_order ON service_requirement_uploads(order_id,field_key);
