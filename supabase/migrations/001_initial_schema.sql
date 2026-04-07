-- DSP PNG Vendor Platform — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query
-- pe.dspng.tech

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Vendors ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  business_name TEXT,
  phone         TEXT,
  province      TEXT,
  market_name   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Transactions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id            UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  receipt_date         DATE,
  vendor_name          TEXT,
  total_kina           NUMERIC(10,2) NOT NULL,
  currency             CHAR(3) DEFAULT 'PGK',
  items                JSONB DEFAULT '[]',
  ocr_confidence       TEXT CHECK (ocr_confidence IN ('high','medium','low')),
  ocr_notes            TEXT,
  raw_gemini_response  TEXT,
  source               TEXT DEFAULT 'receipt_scan',
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Coach interactions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_interactions (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id                 UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  user_message              TEXT NOT NULL,
  ai_reply                  TEXT NOT NULL,
  transaction_count_at_time INT  DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_transactions_vendor    ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date      ON transactions(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created   ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_vendor           ON coach_interactions(vendor_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE vendors            ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_self" ON vendors
  FOR ALL USING (auth.uid() = auth_user_id);

CREATE POLICY "vendor_own_transactions" ON transactions
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "vendor_own_coaching" ON coach_interactions
  FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE auth_user_id = auth.uid())
  );

-- ── Analytics views ───────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW monthly_vendor_summary AS
SELECT
  vendor_id,
  DATE_TRUNC('month', receipt_date) AS month,
  COUNT(*)                           AS transaction_count,
  SUM(total_kina)                    AS total_kina,
  AVG(total_kina)                    AS avg_kina,
  MAX(total_kina)                    AS max_kina,
  MIN(total_kina)                    AS min_kina
FROM transactions
GROUP BY vendor_id, DATE_TRUNC('month', receipt_date);

CREATE OR REPLACE VIEW vendor_top_items AS
SELECT
  vendor_id,
  item->>'name'                        AS item_name,
  COUNT(*)                             AS appearance_count,
  SUM((item->>'price')::NUMERIC)       AS total_spent_kina
FROM transactions,
     LATERAL jsonb_array_elements(items) AS item
WHERE item->>'name' IS NOT NULL
GROUP BY vendor_id, item->>'name'
ORDER BY vendor_id, appearance_count DESC;
