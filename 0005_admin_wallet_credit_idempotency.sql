-- ToolCart V1.35: prevent a duplicate admin credit after retries or double submissions.
-- No wallet amounts or existing transactions are modified.
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_admin_credit_reference
ON wallet_transactions(reference)
WHERE transaction_type='admin_adjustment' AND reference LIKE 'ADMIN-CREDIT-%';
