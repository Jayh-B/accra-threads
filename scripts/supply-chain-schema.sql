-- ============================================================================
-- SUPPLY CHAIN MANAGEMENT SCHEMA
-- For Accra Threads - E-marketplace, Suppliers, Partners, Distribution
-- ============================================================================

-- ───────────────────────────────────────────────────────────────────────────
-- SUPPLIERS TABLE
-- Manufacturers, fabric suppliers, artisans who provide products/materials
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., "KENT-001" for Kente Weaver A
  type TEXT NOT NULL CHECK (type IN ('manufacturer', 'fabric_supplier', 'artisan', 'logistics', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Ghana',
  payment_terms TEXT DEFAULT 'NET_30', -- NET_30, NET_60, COD, etc.
  currency TEXT DEFAULT 'GHS',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Policies: Admin full access, suppliers read own (if they have login)
CREATE POLICY "Admin full access on suppliers" ON suppliers
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Public read active suppliers" ON suppliers
  FOR SELECT USING (status = 'active');

-- ───────────────────────────────────────────────────────────────────────────
-- PARTNERS TABLE
-- Retail partners, boutiques, international distributors
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., "BOUT-LA-001"
  type TEXT NOT NULL CHECK (type IN ('retail_boutique', 'online_marketplace', 'international_distributor', 'department_store', 'popup_store')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  commission_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage commission
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  region_served TEXT[], -- e.g., ['Greater Accra', 'Ashanti']
  contract_start DATE,
  contract_end DATE,
  sales_target DECIMAL(12,2),
  current_sales DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on partners" ON partners
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Public read active partners" ON partners
  FOR SELECT USING (status = 'active');

-- ───────────────────────────────────────────────────────────────────────────
-- INVENTORY / STOCK MANAGEMENT
-- Track stock levels at warehouse and partner locations
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_type TEXT NOT NULL CHECK (location_type IN ('warehouse', 'partner_store', 'supplier', 'in_transit')),
  location_id UUID, -- References suppliers.id or partners.id when applicable
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0, -- Reserved for orders
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  reorder_point INTEGER DEFAULT 10, -- When to reorder
  reorder_quantity INTEGER DEFAULT 50, -- How much to reorder
  last_counted_at TIMESTAMPTZ,
  bin_location TEXT, -- Warehouse bin/shelf location
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, location_type, location_id)
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on inventory" ON inventory
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Public read inventory" ON inventory
  FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- PURCHASE ORDERS (Procurement)
-- Orders placed TO suppliers for inventory
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL, -- e.g., "PO-2025-001"
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled', 'returned')),
  order_date TIMESTAMPTZ DEFAULT now(),
  expected_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GHS',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on purchase_orders" ON purchase_orders
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- PURCHASE ORDER ITEMS
-- Individual line items in a purchase order
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id), -- Can be null for raw materials
  description TEXT NOT NULL, -- "Kente fabric - blue/gold pattern"
  quantity INTEGER NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on purchase_order_items" ON purchase_order_items
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- DELIVERY / DISTRIBUTION
-- Shipments from warehouse to customers or partners
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number TEXT UNIQUE NOT NULL, -- e.g., "DEL-2025-001"
  type TEXT NOT NULL CHECK (type IN ('customer_order', 'partner_transfer', 'supplier_return', 'inter_warehouse')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned')),
  order_id UUID REFERENCES orders(id), -- Link to customer order if applicable
  partner_id UUID REFERENCES partners(id), -- Link to partner if partner transfer
  carrier TEXT, -- "FedEx", "DHL", "Local Courier"
  tracking_number TEXT,
  tracking_url TEXT,
  origin_address TEXT,
  destination_address TEXT NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  shipping_cost DECIMAL(10,2),
  weight_kg DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add partner_id column if deliveries table exists from previous run
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deliveries' AND column_name = 'partner_id') THEN
    ALTER TABLE deliveries ADD COLUMN partner_id UUID REFERENCES partners(id);
  END IF;
END $$;

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on deliveries" ON deliveries
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Note: Users view policy is created after partner_users table is defined below

-- ───────────────────────────────────────────────────────────────────────────
-- DELIVERY ITEMS
-- Items in each delivery
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id), -- Link to original order item
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  condition_received TEXT CHECK (condition_received IN ('perfect', 'damaged', 'missing')),
  notes TEXT
);

ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on delivery_items" ON delivery_items
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- E-MARKETPLACE LISTINGS
-- Products listed on external marketplaces (Jumia, Amazon, etc.)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id), -- Which marketplace partner
  platform TEXT NOT NULL CHECK (platform IN ('jumia', 'amazon', 'etsy', 'shopify', 'instagram', 'facebook', 'tiktok', 'website')),
  external_id TEXT, -- The ID on the external platform
  external_url TEXT,
  listing_status TEXT DEFAULT 'active' CHECK (listing_status IN ('active', 'paused', 'ended', 'sold_out')),
  price_override DECIMAL(10,2), -- Different price on different platforms
  commission_fee DECIMAL(5,2) DEFAULT 0, -- Platform commission %
  listing_fee DECIMAL(10,2) DEFAULT 0,
  monthly_sales INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, platform, partner_id)
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on marketplace_listings" ON marketplace_listings
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- SUPPLIER PRODUCTS (Link table - which products come from which suppliers)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  raw_material_name TEXT, -- For raw materials not yet products
  sku_at_supplier TEXT, -- How the supplier identifies this item
  cost_price DECIMAL(10,2) NOT NULL, -- What we pay the supplier
  minimum_order_qty INTEGER DEFAULT 1,
  lead_time_days INTEGER DEFAULT 7, -- How long to receive
  is_primary_supplier BOOLEAN DEFAULT false,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(supplier_id, product_id)
);

ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on supplier_products" ON supplier_products
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- STOCK MOVEMENTS (Audit trail)
-- Track all inventory changes
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'damage')),
  quantity INTEGER NOT NULL, -- Positive for in, negative for out
  reference_type TEXT, -- 'purchase_order', 'order', 'adjustment'
  reference_id UUID, -- ID of the related record
  from_location TEXT,
  to_location TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on stock_movements" ON stock_movements
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ───────────────────────────────────────────────────────────────────────────
-- PARTNER USERS (For partners who need dashboard access)
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'manager', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(partner_id, user_id)
);

ALTER TABLE partner_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on partner_users" ON partner_users
  FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Create the deliveries user view policy now that partner_users exists
CREATE POLICY "Users view own deliveries" ON deliveries
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR partner_id IN (SELECT id FROM partners WHERE id IN (
      SELECT partner_id FROM partner_users WHERE user_id = auth.uid()
    ))
  );

-- ============================================================================
-- INDICES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_type, location_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_product ON marketplace_listings(product_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);

-- ============================================================================
-- FUNCTIONS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON deliveries;
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplier_products_updated_at ON supplier_products;
CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON supplier_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - add via Supabase UI or separate INSERTs)
-- ============================================================================
-- Note: Sample data removed to avoid column mismatch errors.
-- Add test data manually via Supabase Table Editor or custom INSERTs.
