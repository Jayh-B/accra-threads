-- ============================================================================
-- INVENTORY MANAGEMENT RPC FUNCTIONS
-- Server-side functions for stock control
-- ============================================================================

-- Function to receive inventory from purchase orders
CREATE OR REPLACE FUNCTION receive_inventory(
  p_product_id UUID,
  p_quantity INTEGER,
  p_reference_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_inventory_id UUID;
BEGIN
  -- Check if inventory record exists at warehouse
  SELECT id INTO v_inventory_id
  FROM inventory
  WHERE product_id = p_product_id 
    AND location_type = 'warehouse'
    AND location_id IS NULL;
  
  IF v_inventory_id IS NULL THEN
    -- Create new inventory record
    INSERT INTO inventory (product_id, location_type, quantity, reserved_quantity)
    VALUES (p_product_id, 'warehouse', p_quantity, 0);
    
    v_inventory_id := (SELECT id FROM inventory WHERE product_id = p_product_id AND location_type = 'warehouse' AND location_id IS NULL);
  ELSE
    -- Update existing
    UPDATE inventory 
    SET quantity = quantity + p_quantity,
        updated_at = now()
    WHERE id = v_inventory_id;
  END IF;
  
  -- Log the movement
  INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, to_location, notes)
  VALUES (p_product_id, 'purchase', p_quantity, 'purchase_order', p_reference_id, 'warehouse', 'Received from purchase order');
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reserve inventory for an order
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_inventory_id UUID;
  v_available INTEGER;
BEGIN
  -- Get warehouse inventory
  SELECT id, (quantity - reserved_quantity) INTO v_inventory_id, v_available
  FROM inventory
  WHERE product_id = p_product_id 
    AND location_type = 'warehouse'
    AND location_id IS NULL;
  
  IF v_inventory_id IS NULL OR v_available < p_quantity THEN
    RETURN false;
  END IF;
  
  -- Reserve the inventory
  UPDATE inventory 
  SET reserved_quantity = reserved_quantity + p_quantity,
      updated_at = now()
  WHERE id = v_inventory_id;
  
  -- Log the movement
  INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, to_location, notes)
  VALUES (p_product_id, 'sale', -p_quantity, 'order', 'reserved', 'Reserved for customer order');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release reserved inventory (when order cancelled)
CREATE OR REPLACE FUNCTION release_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_inventory_id UUID;
BEGIN
  SELECT id INTO v_inventory_id
  FROM inventory
  WHERE product_id = p_product_id 
    AND location_type = 'warehouse'
    AND location_id IS NULL;
  
  IF v_inventory_id IS NOT NULL THEN
    UPDATE inventory 
    SET reserved_quantity = GREATEST(0, reserved_quantity - p_quantity),
        updated_at = now()
    WHERE id = v_inventory_id;
    
    -- Log the movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, to_location, notes)
    VALUES (p_product_id, 'adjustment', p_quantity, 'order', 'warehouse', 'Released from cancelled order');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fulfill an order (convert reserved to actual sale)
CREATE OR REPLACE FUNCTION fulfill_order(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_inventory_id UUID;
BEGIN
  SELECT id INTO v_inventory_id
  FROM inventory
  WHERE product_id = p_product_id 
    AND location_type = 'warehouse'
    AND location_id IS NULL;
  
  IF v_inventory_id IS NOT NULL THEN
    -- Deduct from both quantity and reserved
    UPDATE inventory 
    SET quantity = quantity - p_quantity,
        reserved_quantity = reserved_quantity - p_quantity,
        updated_at = now()
    WHERE id = v_inventory_id;
    
    -- Log the movement
    INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, from_location, notes)
    VALUES (p_product_id, 'sale', -p_quantity, 'order', 'warehouse', 'Order fulfilled and shipped');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and alert low stock
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  available INTEGER,
  reorder_point INTEGER,
  supplier_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.product_id,
    p.name as product_name,
    i.available_quantity as available,
    i.reorder_point,
    s.name as supplier_name
  FROM inventory i
  JOIN products p ON i.product_id = p.id
  LEFT JOIN supplier_products sp ON p.id = sp.product_id AND sp.is_primary_supplier = true
  LEFT JOIN suppliers s ON sp.supplier_id = s.id
  WHERE i.location_type = 'warehouse'
    AND i.available_quantity <= i.reorder_point;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get reorder point helper
CREATE OR REPLACE FUNCTION get_reorder_point(inventory_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_reorder_point INTEGER;
BEGIN
  SELECT reorder_point INTO v_reorder_point
  FROM inventory
  WHERE id = inventory_id;
  RETURN v_reorder_point;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
