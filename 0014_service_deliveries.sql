-- ToolCart V1.62: private completed-work deliveries. No provider payouts or refunds.
-- Separate from service_orders to preserve the existing order status CHECK and wallet ledger.
CREATE TABLE IF NOT EXISTS service_deliveries (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
 revision INTEGER NOT NULL CHECK(revision BETWEEN 1 AND 100),
 provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
 original_r2_key TEXT NOT NULL UNIQUE,
 preview_r2_key TEXT NOT NULL UNIQUE,
 original_name TEXT NOT NULL,
 original_mime TEXT NOT NULL CHECK(original_mime IN ('image/jpeg','image/png','image/webp','application/pdf')),
 original_size INTEGER NOT NULL CHECK(original_size BETWEEN 1 AND 16777216),
 preview_size INTEGER NOT NULL CHECK(preview_size BETWEEN 1 AND 4194304),
 provider_note TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'delivered' CHECK(status IN ('delivered','accepted','revision_requested')),
 customer_feedback TEXT,
 delivered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 decided_at TEXT,
 UNIQUE(order_id,revision)
);
CREATE INDEX IF NOT EXISTS idx_service_deliveries_order ON service_deliveries(order_id,revision DESC);
CREATE TRIGGER IF NOT EXISTS tc_delivery_guard BEFORE INSERT ON service_deliveries BEGIN
 SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM service_orders o JOIN provider_profiles p ON p.id=o.provider_id
  JOIN users u ON u.id=p.user_id WHERE o.id=NEW.order_id AND o.provider_id=NEW.provider_id
  AND o.status='in_progress' AND p.status='approved' AND u.status='active'
 ) THEN RAISE(ABORT,'delivery_provider_unavailable') END;
 SELECT CASE WHEN NEW.revision!=COALESCE((SELECT MAX(revision) FROM service_deliveries WHERE order_id=NEW.order_id),0)+1
  THEN RAISE(ABORT,'delivery_revision_conflict') END;
 SELECT CASE WHEN EXISTS(SELECT 1 FROM service_deliveries WHERE order_id=NEW.order_id)
 AND COALESCE((SELECT status FROM service_deliveries WHERE order_id=NEW.order_id ORDER BY revision DESC LIMIT 1),'')!='revision_requested'
 THEN RAISE(ABORT,'delivery_pending_customer') END;
END;
CREATE TABLE IF NOT EXISTS service_delivery_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE RESTRICT,
 delivery_id INTEGER NOT NULL REFERENCES service_deliveries(id) ON DELETE RESTRICT,
 actor_role TEXT NOT NULL CHECK(actor_role IN ('provider','customer')),
 actor_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 event_type TEXT NOT NULL CHECK(event_type IN ('delivered','accepted','revision_requested')),
 note TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_service_delivery_events_order ON service_delivery_events(order_id,created_at);
