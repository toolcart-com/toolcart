-- ToolCart V1.58: service provider enrollment and owner review only.
-- Uses existing customer authentication; creates no wallet ledger or payouts.
CREATE TABLE IF NOT EXISTS provider_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  provider_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  service_summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','restricted','banned')),
  review_message TEXT NOT NULL DEFAULT '',
  reviewed_by INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_status_created
  ON provider_profiles(status,created_at DESC,id DESC);
CREATE TABLE IF NOT EXISTS provider_review_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_provider_review_events_provider
  ON provider_review_events(provider_id,created_at DESC,id DESC);
