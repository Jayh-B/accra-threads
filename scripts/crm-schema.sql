-- ============================================
-- CRM Module Schema - Phase 5
-- Customer Communication & Feedback Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Customer Communications Table
-- Tracks all customer interactions (email, SMS, notes, calls)
-- ============================================
CREATE TABLE IF NOT EXISTS customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'note', 'call')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(255),
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for customer_communications
CREATE INDEX IF NOT EXISTS idx_communications_customer ON customer_communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_order ON customer_communications(order_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON customer_communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON customer_communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_direction ON customer_communications(direction);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_communications_updated_at ON customer_communications;
CREATE TRIGGER update_customer_communications_updated_at
  BEFORE UPDATE ON customer_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. Customer Notes Table
-- Internal admin notes about customers
-- ============================================
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('general', 'complaint', 'vip', 'follow-up', 'support', 'sales')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for customer_notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_category ON customer_notes(category);
CREATE INDEX IF NOT EXISTS idx_customer_notes_priority ON customer_notes(priority);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at DESC);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_customer_notes_updated_at ON customer_notes;
CREATE TRIGGER update_customer_notes_updated_at
  BEFORE UPDATE ON customer_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Customer Feedback Table
-- Ratings and reviews from customers
-- ============================================
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  category VARCHAR(50) CHECK (category IN ('product', 'service', 'delivery', 'general')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT TRUE,
  helpful_count INTEGER DEFAULT 0
);

-- Indexes for customer_feedback
CREATE INDEX IF NOT EXISTS idx_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_product ON customer_feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_feedback_order ON customer_feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON customer_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON customer_feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON customer_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_published ON customer_feedback(is_published);

-- ============================================
-- 4. Email Templates Table
-- Store reusable email templates
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of variable names like ["customer_name", "order_id"]
  category VARCHAR(50) CHECK (category IN ('order', 'shipping', 'marketing', 'support', 'feedback')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, body, variables, category) VALUES
('order_confirmation', 'Your Accra Threads Order is Confirmed! - {{order_id}}', 
'<h2>Thank you for your order!</h2>
<p>Hi {{customer_name}},</p>
<p>Your order <strong>{{order_id}}</strong> has been confirmed and is being processed.</p>
<p><strong>Order Summary:</strong></p>
<p>Total: GHS {{total}}</p>
<p>We will notify you when your order ships.</p>
<p>Thanks for shopping with Accra Threads!</p>', 
'["customer_name", "order_id", "total"]', 'order'),

('shipping_update', 'Your Order is On Its Way! - {{order_id}}',
'<h2>Your order is shipping!</h2>
<p>Hi {{customer_name}},</p>
<p>Great news! Your order <strong>{{order_id}}</strong> has been shipped.</p>
<p><strong>Tracking:</strong> {{tracking_number}}</p>
<p><strong>Carrier:</strong> {{carrier}}</p>
<p>You can track your order at: {{tracking_url}}</p>',
'["customer_name", "order_id", "tracking_number", "carrier", "tracking_url"]', 'shipping'),

('delivery_confirmation', 'Your Accra Threads Order Has Been Delivered!',
'<h2>Order Delivered!</h2>
<p>Hi {{customer_name}},</p>
<p>Your order <strong>{{order_id}}</strong> has been delivered.</p>
<p>We hope you love your new items! Please leave us a review and let us know about your experience.</p>
<p><a href="{{feedback_url}}">Leave Feedback</a></p>',
'["customer_name", "order_id", "feedback_url"]', 'feedback'),

('feedback_request', 'How was your Accra Threads experience?',
'<h2>We value your feedback!</h2>
<p>Hi {{customer_name}},</p>
<p>It has been a few days since you received your order <strong>{{order_id}}</strong>.</p>
<p>We would love to hear about your experience! Your feedback helps us improve and helps other customers make informed decisions.</p>
<p><a href="{{feedback_url}}">Share Your Feedback</a></p>
<p>As a thank you, you will receive a 10% discount code for your next purchase after submitting your review!</p>',
'["customer_name", "order_id", "feedback_url"]', 'feedback')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. RLS Policies for CRM Tables
-- ============================================

-- Enable RLS on all CRM tables
ALTER TABLE customer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Customer Communications Policies
DROP POLICY IF EXISTS "Customers can view their own communications" ON customer_communications;
CREATE POLICY "Customers can view their own communications"
  ON customer_communications FOR SELECT
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can manage all communications" ON customer_communications;
CREATE POLICY "Admins can manage all communications"
  ON customer_communications FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Customer Notes Policies (admin only)
DROP POLICY IF EXISTS "Admins can manage customer notes" ON customer_notes;
CREATE POLICY "Admins can manage customer notes"
  ON customer_notes FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Customers cannot view notes" ON customer_notes;
CREATE POLICY "Customers cannot view notes"
  ON customer_notes FOR SELECT
  USING (FALSE);

-- Customer Feedback Policies
DROP POLICY IF EXISTS "Customers can view published feedback" ON customer_feedback;
CREATE POLICY "Customers can view published feedback"
  ON customer_feedback FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Customers can create their own feedback" ON customer_feedback;
CREATE POLICY "Customers can create their own feedback"
  ON customer_feedback FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update their own feedback" ON customer_feedback;
CREATE POLICY "Customers can update their own feedback"
  ON customer_feedback FOR UPDATE
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can manage all feedback" ON customer_feedback;
CREATE POLICY "Admins can manage all feedback"
  ON customer_feedback FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Email Templates Policies (admin only)
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can view active templates" ON email_templates;
CREATE POLICY "Anyone can view active templates"
  ON email_templates FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- 6. Helper Functions for CRM
-- ============================================

-- Function to get customer timeline (orders + communications + notes)
CREATE OR REPLACE FUNCTION get_customer_timeline(p_customer_id UUID)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  title TEXT,
  description TEXT,
  metadata JSONB
) AS $$
BEGIN
  -- Orders
  RETURN QUERY
  SELECT 
    o.id,
    'order'::TEXT as event_type,
    o.created_at as event_date,
    'Order ' || o.order_number as title,
    'Status: ' || o.status as description,
    jsonb_build_object('order_id', o.id, 'total', o.total, 'status', o.status) as metadata
  FROM orders o
  WHERE o.customer_id = p_customer_id;
  
  -- Communications
  RETURN QUERY
  SELECT 
    cc.id,
    ('communication_' || cc.type)::TEXT as event_type,
    cc.created_at as event_date,
    COALESCE(cc.subject, cc.type) as title,
    LEFT(cc.content, 200) as description,
    jsonb_build_object('type', cc.type, 'direction', cc.direction, 'sent_at', cc.sent_at) as metadata
  FROM customer_communications cc
  WHERE cc.customer_id = p_customer_id;
  
  -- Notes
  RETURN QUERY
  SELECT 
    cn.id,
    'admin_note'::TEXT as event_type,
    cn.created_at as event_date,
    COALESCE(cn.category, 'Note') as title,
    LEFT(cn.note, 200) as description,
    jsonb_build_object('category', cn.category, 'priority', cn.priority) as metadata
  FROM customer_notes cn
  WHERE cn.customer_id = p_customer_id;
  
  -- Feedback
  RETURN QUERY
  SELECT 
    cf.id,
    'feedback'::TEXT as event_type,
    cf.created_at as event_date,
    'Rating: ' || cf.rating || '/5' as title,
    LEFT(cf.feedback, 200) as description,
    jsonb_build_object('rating', cf.rating, 'category', cf.category, 'product_id', cf.product_id) as metadata
  FROM customer_feedback cf
  WHERE cf.customer_id = p_customer_id;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customer summary stats
CREATE OR REPLACE FUNCTION get_customer_stats(p_customer_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  total_spent NUMERIC,
  total_feedback BIGINT,
  avg_rating NUMERIC,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  communication_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT o.id), 0) as total_orders,
    COALESCE(SUM(o.total), 0) as total_spent,
    COALESCE(COUNT(DISTINCT cf.id), 0) as total_feedback,
    COALESCE(AVG(cf.rating), 0) as avg_rating,
    MAX(cc.created_at) as last_contact_date,
    COALESCE(COUNT(DISTINCT cc.id), 0) as communication_count
  FROM auth.users u
  LEFT JOIN orders o ON o.customer_id = u.id
  LEFT JOIN customer_feedback cf ON cf.customer_id = u.id
  LEFT JOIN customer_communications cc ON cc.customer_id = u.id
  WHERE u.id = p_customer_id
  GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product rating summary
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS TABLE (
  avg_rating NUMERIC,
  total_reviews BIGINT,
  rating_5 BIGINT,
  rating_4 BIGINT,
  rating_3 BIGINT,
  rating_2 BIGINT,
  rating_1 BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating), 0)::NUMERIC(3,2) as avg_rating,
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE rating = 5) as rating_5,
    COUNT(*) FILTER (WHERE rating = 4) as rating_4,
    COUNT(*) FILTER (WHERE rating = 3) as rating_3,
    COUNT(*) FILTER (WHERE rating = 2) as rating_2,
    COUNT(*) FILTER (WHERE rating = 1) as rating_1
  FROM customer_feedback
  WHERE product_id = p_product_id AND is_published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Triggers for Automated Communications
-- ============================================

-- Trigger to log order status changes as communications
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO customer_communications (
      customer_id,
      order_id,
      type,
      direction,
      subject,
      content,
      created_at
    ) VALUES (
      NEW.customer_id,
      NEW.id,
      'note',
      'outbound',
      'Order Status Update',
      'Order status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- 8. View for Customer 360
-- ============================================

CREATE OR REPLACE VIEW customer_360 AS
SELECT 
  u.id as customer_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.created_at as joined_at,
  u.last_sign_in_at,
  COALESCE(o.total_orders, 0) as total_orders,
  COALESCE(o.total_spent, 0) as total_spent,
  COALESCE(f.total_feedback, 0) as total_feedback,
  COALESCE(f.avg_rating, 0) as avg_rating_given,
  COALESCE(c.communication_count, 0) as total_communications,
  c.last_contact_date,
  n.note_count,
  n.latest_note,
  n.latest_note_category
FROM auth.users u
LEFT JOIN (
  SELECT customer_id, COUNT(*) as total_orders, SUM(total) as total_spent
  FROM orders
  GROUP BY customer_id
) o ON o.customer_id = u.id
LEFT JOIN (
  SELECT customer_id, COUNT(*) as total_feedback, AVG(rating) as avg_rating
  FROM customer_feedback
  GROUP BY customer_id
) f ON f.customer_id = u.id
LEFT JOIN (
  SELECT customer_id, COUNT(*) as communication_count, MAX(created_at) as last_contact_date
  FROM customer_communications
  GROUP BY customer_id
) c ON c.customer_id = u.id
LEFT JOIN (
  SELECT 
    customer_id, 
    COUNT(*) as note_count,
    MAX(note) as latest_note,
    MAX(category) as latest_note_category
  FROM customer_notes
  GROUP BY customer_id
) n ON n.customer_id = u.id;

COMMENT ON TABLE customer_communications IS 'Stores all customer interactions including emails, SMS, calls, and notes';
COMMENT ON TABLE customer_notes IS 'Internal admin notes about customers, not visible to customers';
COMMENT ON TABLE customer_feedback IS 'Customer ratings and reviews for products and service';
COMMENT ON TABLE email_templates IS 'Reusable email templates for automated and manual communications';
