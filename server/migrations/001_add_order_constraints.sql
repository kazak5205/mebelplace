-- ============================================
-- Migration: Add constraints for order system
-- Created: 2025-10-28
-- Purpose: Ensure data integrity for orders and responses
-- ============================================

-- ✅ UNIQUE constraint: Only ONE accepted response per order
-- This prevents data corruption where multiple responses are accepted
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_responses_accepted_unique 
ON order_responses(order_id) 
WHERE status = 'accepted';

-- ✅ Performance index: Fast lookup of responses by order
CREATE INDEX IF NOT EXISTS idx_order_responses_order_status 
ON order_responses(order_id, status);

-- ✅ Performance index: Fast lookup of orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status_active 
ON orders(status, is_active) 
WHERE is_active = true;

-- ✅ Comment for documentation
COMMENT ON INDEX idx_order_responses_accepted_unique IS 
'Ensures only one response can be accepted per order';

