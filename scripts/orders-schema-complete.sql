-- ============================================================================
-- Complete orders table schema fix for Paystack integration
-- ============================================================================

-- Step 1: Ensure all required columns exist
DO $$
BEGIN
  -- Add order_number if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;

  -- Add shipping_cost if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
    ALTER TABLE orders ADD COLUMN shipping_cost INTEGER DEFAULT 0;
  END IF;

  -- Add vat_amount if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'vat_amount') THEN
    ALTER TABLE orders ADD COLUMN vat_amount INTEGER DEFAULT 0;
  END IF;

  -- Add currency if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'currency') THEN
    ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'GHS';
  END IF;

  -- Add shipping_address if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
    ALTER TABLE orders ADD COLUMN shipping_address JSONB;
  END IF;

  -- Add payment_method if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT;
  END IF;

  -- Add momo_provider if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'momo_provider') THEN
    ALTER TABLE orders ADD COLUMN momo_provider TEXT;
  END IF;

  -- Add customer_email if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;

  -- Add payment_status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Step 2: Fix the status constraint to include all valid statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled', 'payment_failed'));

-- Step 3: Fix payment_status constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Step 4: Enable RLS but add policy for service role
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow service role all access" ON orders;
DROP POLICY IF EXISTS "Allow users to view own orders" ON orders;

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role all access" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to view their own orders
CREATE POLICY "Allow users to view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Step 5: Also fix order_items table - add missing columns
DO $$
BEGIN
  -- Add product_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'product_name') THEN
    ALTER TABLE order_items ADD COLUMN product_name TEXT;
  END IF;

  -- Add size if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'size') THEN
    ALTER TABLE order_items ADD COLUMN size TEXT;
  END IF;

  -- Add color if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'color') THEN
    ALTER TABLE order_items ADD COLUMN color TEXT;
  END IF;

  -- Add total_price if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'total_price') THEN
    ALTER TABLE order_items ADD COLUMN total_price INTEGER;
  END IF;

  -- Add unit_price if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'unit_price') THEN
    ALTER TABLE order_items ADD COLUMN unit_price INTEGER;
  END IF;
END $$;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role all access" ON order_items;
DROP POLICY IF EXISTS "Allow users to view own order items" ON order_items;

CREATE POLICY "Allow service role all access" ON order_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to view own order items" ON order_items
  FOR SELECT
  TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Step 6: Create function to generate order numbers if it doesn't exist
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();
