-- ============================================================================
-- ORDER SYSTEM SCHEMA UPDATE
-- Enhance orders table for complete order processing
-- ============================================================================

-- Add new columns to orders table if they don't exist
DO $$
BEGIN
  -- Add order_number column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number') THEN
    ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
  END IF;
  
  -- Add payment_method column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT CHECK (payment_method IN ('card', 'momo'));
  END IF;
  
  -- Add momo_provider column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'momo_provider') THEN
    ALTER TABLE orders ADD COLUMN momo_provider TEXT CHECK (momo_provider IN ('mtn', 'voda', 'airtel'));
  END IF;
  
  -- Add shipping_address JSONB column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipping_address') THEN
    ALTER TABLE orders ADD COLUMN shipping_address JSONB;
  END IF;
  
  -- Add customer_email column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_email') THEN
    ALTER TABLE orders ADD COLUMN customer_email TEXT;
  END IF;
  
  -- Add payment_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending' 
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));
  END IF;
  
  -- Add currency column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'currency') THEN
    ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'GHS';
  END IF;
END $$;

-- Update order_items table to add size and color
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'size') THEN
    ALTER TABLE order_items ADD COLUMN size TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'color') THEN
    ALTER TABLE order_items ADD COLUMN color TEXT;
  END IF;
END $$;

-- Create index on order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create index on payment_status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update existing orders with order numbers if missing
UPDATE orders 
SET order_number = 'AT-' || EXTRACT(YEAR FROM created_at) || '-' || LPAD(RIGHT(id::text, 4), 4, '0')
WHERE order_number IS NULL;

-- Function to automatically generate order number on insert
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'AT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
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
