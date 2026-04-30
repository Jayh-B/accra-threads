-- ============================================================================
-- COMPREHENSIVE DATABASE FIX FOR E-BUSINESS SYSTEM
-- Run this in Supabase SQL Editor to fix all schema issues
-- ============================================================================

-- ============================================================================
-- PART 1: ORDERS TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vat_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'GHS',
ADD COLUMN IF NOT EXISTS shipping_address JSONB,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS momo_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(100);

-- Update status constraint to include pending_payment
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled', 'payment_failed'));

-- ============================================================================
-- PART 2: ORDER_ITEMS TABLE - Add Missing Columns
-- ============================================================================

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS total_price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit_price INTEGER DEFAULT 0;

-- ============================================================================
-- PART 3: RLS POLICIES - Enable Full Admin Access
-- ============================================================================

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role full access" ON orders;
DROP POLICY IF EXISTS "Users view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users view own orders" ON orders;

-- Create service role policy (full access)
CREATE POLICY "Service role full access" ON orders
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Create policy for authenticated users to view their own orders
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON order_items;
DROP POLICY IF EXISTS "Users view own order items" ON order_items;

CREATE POLICY "Service role full access" ON order_items
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT 
  TO authenticated 
  USING (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- PART 4: ORDER NUMBER GENERATION TRIGGER
-- ============================================================================

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

-- ============================================================================
-- PART 5: INVOICES TABLE (For Finance Module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  billing_address JSONB,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  vat_amount INTEGER NOT NULL,
  shipping_cost INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  generated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  pdf_url TEXT
);

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON invoices;
DROP POLICY IF EXISTS "Users view own invoices" ON invoices;

CREATE POLICY "Service role full access" ON invoices
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Users view own invoices" ON invoices
  FOR SELECT 
  TO authenticated 
  USING (customer_email = auth.email());

-- ============================================================================
-- PART 6: ORDER TRACKING EVENTS TABLE (For Order Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS order_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on tracking events
ALTER TABLE order_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON order_tracking_events;
DROP POLICY IF EXISTS "Users view own tracking" ON order_tracking_events;

CREATE POLICY "Service role full access" ON order_tracking_events
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Users view own tracking" ON order_tracking_events
  FOR SELECT 
  TO authenticated 
  USING (order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  ));

-- ============================================================================
-- PART 7: CUSTOMER COMMUNICATIONS TABLE (For CRM Module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'note', 'call')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON customer_communications;
CREATE POLICY "Service role full access" ON customer_communications
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- PART 8: CUSTOMER NOTES TABLE (For CRM Module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON customer_notes;
CREATE POLICY "Service role full access" ON customer_notes
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- PART 9: CUSTOMER FEEDBACK TABLE (For CRM Module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW(),
  admin_response TEXT,
  responded_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON customer_feedback;
DROP POLICY IF EXISTS "Users view all feedback" ON customer_feedback;
DROP POLICY IF EXISTS "Users create feedback" ON customer_feedback;

CREATE POLICY "Service role full access" ON customer_feedback
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Users view all feedback" ON customer_feedback
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users create feedback" ON customer_feedback
  FOR INSERT 
  TO authenticated 
  WITH CHECK (customer_id = auth.uid());

-- ============================================================================
-- PART 10: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON orders(invoice_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON order_tracking_events(order_id);

CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_order_id ON customer_communications(order_id);

CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_product_id ON customer_feedback(product_id);

-- ============================================================================
-- PART 11: VERIFY SETUP
-- ============================================================================

-- Check orders table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('orders', 'order_items', 'invoices', 'order_tracking_events', 'customer_communications', 'customer_notes', 'customer_feedback');
