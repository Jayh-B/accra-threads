-- ============================================================================
-- Update orders status constraint to include 'pending_payment'
-- ============================================================================

-- First, update any existing orders with 'pending_payment' to 'pending' temporarily
UPDATE orders SET status = 'pending' WHERE status = 'pending_payment';

-- Drop the existing constraint and recreate with 'pending_payment' included
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled', 'payment_failed'));
