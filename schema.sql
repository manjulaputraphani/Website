-- Chamundi / Sri Durga HariHara Enterprises
-- Cloudflare D1 schema. Apply once per database:
--   npx wrangler d1 execute sdhhe-leads --remote --file=./schema.sql
--   npx wrangler d1 execute sdhhe-leads --local  --file=./schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL,
  name          TEXT NOT NULL,
  company       TEXT NOT NULL,
  country       TEXT NOT NULL,
  buyer_type    TEXT NOT NULL,
  product_form  TEXT NOT NULL,
  origin_grade  TEXT NOT NULL,
  volume        TEXT NOT NULL,
  incoterm_port TEXT NOT NULL,
  timeline      TEXT NOT NULL,
  email         TEXT NOT NULL,
  whatsapp      TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  consent       INTEGER NOT NULL DEFAULT 0 CHECK (consent IN (0, 1)),
  source        TEXT NOT NULL DEFAULT 'chamundi',
  session_id    TEXT NOT NULL DEFAULT '',
  ip_hash       TEXT NOT NULL DEFAULT '',
  user_agent    TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- Draft state keeps lead capture reliable even when only the last 12
-- chat messages are sent to the model.
CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id  TEXT PRIMARY KEY,
  lead_json   TEXT NOT NULL DEFAULT '{}',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions (updated_at);

-- One row per rate-limit bucket. Buckets:
--   session:<session id>       20 messages / 7 days
--   ip:<sha256>:<utc day>     100 messages / day
--   lead:<sha256>:<utc hour>   12 lead posts / hour
CREATE TABLE IF NOT EXISTS chat_rate_limits (
  bucket      TEXT PRIMARY KEY,
  count       INTEGER NOT NULL DEFAULT 0,
  expires_at  INTEGER NOT NULL
);

-- Optional housekeeping, run occasionally:
-- DELETE FROM chat_rate_limits WHERE expires_at < (strftime('%s','now') * 1000);
-- DELETE FROM chat_sessions WHERE julianday(updated_at) < julianday('now', '-30 days');
