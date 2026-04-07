-- Add SevisID to vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS sevis_id TEXT;

-- Add transaction type and digital flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='type') THEN
        ALTER TABLE transactions ADD COLUMN type TEXT DEFAULT 'IN' CHECK (type IN ('IN', 'OUT'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='is_digital') THEN
        ALTER TABLE transactions ADD COLUMN is_digital BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- View for Reliability Score calculation
CREATE OR REPLACE VIEW vendor_reliability_stats AS
SELECT
  vendor_id,
  COUNT(*) FILTER (WHERE is_digital = TRUE AND created_at >= NOW() - INTERVAL '30 days') AS digital_txn_count,
  SUM(total_kina) FILTER (WHERE is_digital = TRUE AND created_at >= NOW() - INTERVAL '30 days') AS digital_txn_volume,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS total_txn_count_30d
FROM transactions
GROUP BY vendor_id;
