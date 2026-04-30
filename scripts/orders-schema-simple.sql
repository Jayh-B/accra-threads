-- ============================================================================
-- Simple orders schema fix (without DO blocks)
-- Run each section separately if needed
-- ============================================================================

-- Add columns to orders table (will error if already exist, that's OK)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GHS';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS momo_provider TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Fix constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled', 'payment_failed'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role all access" ON orders;
DROP POLICY IF EXISTS "Allow users to view own orders" ON orders;

CREATE POLICY "Allow service role all access" ON orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to view own orders" ON orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Add columns to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_price INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price INTEGER;

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role all access" ON order_items;
DROP POLICY IF EXISTS "Allow users to view own order items" ON order_items;

CREATE POLICY "Allow service role all access" ON order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to view own order items" ON order_items
  FOR SELECT TO authenticated USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Order number trigger
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();
