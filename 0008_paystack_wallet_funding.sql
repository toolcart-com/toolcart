-- V1.52: defense against duplicate Paystack wallet-funding credits.
-- No existing wallet balances, purchases, or products are modified.
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_funding_reference
  ON wallet_transactions(reference)
  WHERE transaction_type='funding' AND reference IS NOT NULL;
