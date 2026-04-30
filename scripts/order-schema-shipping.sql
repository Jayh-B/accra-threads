-- ============================================================================
-- Add shipping_cost column to orders table
-- ============================================================================

-- Add shipping_cost column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
    ALTER TABLE orders ADD COLUMN shipping_cost INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update any existing orders with default shipping cost
UPDATE orders SET shipping_cost = 0 WHERE shipping_cost IS NULL;
