/**
 * supply-chain-data.ts - Supply Chain Management Data Layer
 * E-marketplace, Distribution, Suppliers, Partners, Purchasing
 */

import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type Supplier = {
  id: string;
  name: string;
  code: string;
  type: 'manufacturer' | 'fabric_supplier' | 'artisan' | 'logistics' | 'other';
  status: 'active' | 'inactive' | 'suspended';
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string;
  payment_terms: string;
  currency: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
};

export type Partner = {
  id: string;
  name: string;
  code: string;
  type: 'retail_boutique' | 'online_marketplace' | 'international_distributor' | 'department_store' | 'popup_store';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  commission_rate: number;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  region_served: string[] | null;
  contract_start: string | null;
  contract_end: string | null;
  sales_target: number;
  current_sales: number;
  notes: string | null;
  created_at: string;
};

export type PurchaseOrder = {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled' | 'returned';
  order_date: string;
  expected_delivery: string | null;
  actual_delivery: string | null;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  currency: string;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  notes: string | null;
  item_count?: number;
  created_at: string;
};

export type PurchaseOrderItem = {
  id: string;
  purchase_order_id: string;
  product_id: string | null;
  product_name?: string;
  description: string;
  quantity: number;
  received_quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
};

export type Delivery = {
  id: string;
  delivery_number: string;
  type: 'customer_order' | 'partner_transfer' | 'supplier_return' | 'inter_warehouse';
  status: 'pending' | 'picked' | 'packed' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  order_id: string | null;
  order_number?: string;
  partner_id: string | null;
  partner_name?: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  origin_address: string | null;
  destination_address: string;
  recipient_name: string | null;
  recipient_phone: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  shipping_cost: number | null;
  weight_kg: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  product_id: string;
  product_name?: string;
  product_sku?: string;
  location_type: 'warehouse' | 'partner_store' | 'supplier' | 'in_transit';
  location_id: string | null;
  location_name?: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  last_counted_at: string | null;
  bin_location: string | null;
  needs_reorder?: boolean;
};

export type MarketplaceListing = {
  id: string;
  product_id: string;
  product_name?: string;
  partner_id: string | null;
  partner_name?: string;
  platform: 'jumia' | 'amazon' | 'etsy' | 'shopify' | 'instagram' | 'facebook' | 'tiktok' | 'website';
  external_id: string | null;
  external_url: string | null;
  listing_status: 'active' | 'paused' | 'ended' | 'sold_out';
  price_override: number | null;
  commission_fee: number;
  listing_fee: number;
  monthly_sales: number;
  total_sales: number;
  last_synced_at: string | null;
  created_at: string;
};

export type SupplierProduct = {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  product_id: string | null;
  product_name?: string;
  raw_material_name: string | null;
  sku_at_supplier: string | null;
  cost_price: number;
  minimum_order_qty: number;
  lead_time_days: number;
  is_primary_supplier: boolean;
  quality_rating: number | null;
};

export type StockMovement = {
  id: string;
  product_id: string;
  product_name?: string;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'return' | 'damage';
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  from_location: string | null;
  to_location: string | null;
  notes: string | null;
  created_at: string;
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchSuppliers(status?: string, type?: string): Promise<Supplier[]> {
  const db = getAdminClient();
  try {
    let query = db.from('suppliers').select('*').order('name');
    
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('fetchSuppliers error:', error);
    return [];
  }
}

export async function fetchSupplierById(id: string): Promise<Supplier | null> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.from('suppliers').select('*').eq('id', id).single();
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('fetchSupplierById error:', error);
    return null;
  }
}

export async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.from('suppliers').insert(supplier).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('createSupplier error:', error);
    throw error;
  }
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db.from('suppliers').update(updates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('updateSupplier error:', error);
    throw error;
  }
}

export async function deleteSupplier(id: string): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db.from('suppliers').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('deleteSupplier error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTNERS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchPartners(status?: string, type?: string): Promise<Partner[]> {
  const db = getAdminClient();
  try {
    let query = db.from('partners').select('*').order('name');
    
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('fetchPartners error:', error);
    return [];
  }
}

export async function fetchPartnerById(id: string): Promise<Partner | null> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.from('partners').select('*').eq('id', id).single();
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('fetchPartnerById error:', error);
    return null;
  }
}

export async function createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'current_sales'>): Promise<Partner> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.from('partners').insert({ ...partner, current_sales: 0 }).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('createPartner error:', error);
    throw error;
  }
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db.from('partners').update(updates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('updatePartner error:', error);
    throw error;
  }
}

export async function deletePartner(id: string): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db.from('partners').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('deletePartner error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchPurchaseOrders(status?: string): Promise<PurchaseOrder[]> {
  const db = getAdminClient();
  try {
    let query = db
      .from('purchase_orders')
      .select(`
        *,
        supplier:supplier_id(name),
        items:purchase_order_items(count)
      `)
      .order('order_date', { ascending: false });
    
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((po: any) => ({
      ...po,
      supplier_name: po.supplier?.name,
      item_count: po.items?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error('fetchPurchaseOrders error:', error);
    return [];
  }
}

export async function fetchPurchaseOrderById(id: string): Promise<{ order: PurchaseOrder; items: PurchaseOrderItem[] } | null> {
  const db = getAdminClient();
  try {
    const { data: order, error: orderError } = await db
      .from('purchase_orders')
      .select('*, supplier:supplier_id(name)')
      .eq('id', id)
      .single();
    
    if (orderError || !order) return null;
    
    const { data: items, error: itemsError } = await db
      .from('purchase_order_items')
      .select(`
        *,
        product:product_id(name)
      `)
      .eq('purchase_order_id', id);
    
    if (itemsError) throw itemsError;
    
    return {
      order: {
        ...order,
        supplier_name: order.supplier?.name,
      },
      items: (items || []).map((item: any) => ({
        ...item,
        product_name: item.product?.name,
      })),
    };
  } catch (error) {
    console.error('fetchPurchaseOrderById error:', error);
    return null;
  }
}

export async function createPurchaseOrder(
  order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'item_count' | 'supplier_name'>,
  items: Omit<PurchaseOrderItem, 'id' | 'purchase_order_id' | 'total_price' | 'received_quantity'>[]
): Promise<PurchaseOrder> {
  const db = getAdminClient();
  try {
    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const total = subtotal + (order.tax_amount || 0) + (order.shipping_cost || 0);
    
    // Create order
    const { data: newOrder, error: orderError } = await db
      .from('purchase_orders')
      .insert({
        ...order,
        subtotal,
        total,
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create items
    if (items.length > 0) {
      const { error: itemsError } = await db
        .from('purchase_order_items')
        .insert(
          items.map(item => ({
            ...item,
            purchase_order_id: newOrder.id,
            received_quantity: 0,
          }))
        );
      
      if (itemsError) throw itemsError;
    }
    
    return newOrder;
  } catch (error) {
    console.error('createPurchaseOrder error:', error);
    throw error;
  }
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrder['status'],
  actualDelivery?: string
): Promise<void> {
  const db = getAdminClient();
  try {
    const updates: any = { status };
    if (actualDelivery) updates.actual_delivery = actualDelivery;
    
    const { error } = await db.from('purchase_orders').update(updates).eq('id', id);
    if (error) throw error;
    
    // If received, update inventory
    if (status === 'received') {
      const { data: items } = await db
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', id);
      
      for (const item of items || []) {
        if (item.product_id) {
          // Update inventory
          await db.rpc('receive_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_reference_id: id,
          });
        }
      }
    }
  } catch (error) {
    console.error('updatePurchaseOrderStatus error:', error);
    throw error;
  }
}

export async function receivePurchaseOrderItem(
  itemId: string,
  quantity: number
): Promise<void> {
  const db = getAdminClient();
  try {
    // Get item details
    const { data: item, error } = await db
      .from('purchase_order_items')
      .select('*, purchase_order:purchase_order_id(supplier_id)')
      .eq('id', itemId)
      .single();
    
    if (error || !item) throw error || new Error('Item not found');
    
    // Update received quantity
    const { error: updateError } = await db
      .from('purchase_order_items')
      .update({ received_quantity: item.received_quantity + quantity })
      .eq('id', itemId);
    
    if (updateError) throw updateError;
    
    // Add stock if product exists
    if (item.product_id) {
      await db.rpc('receive_inventory', {
        p_product_id: item.product_id,
        p_quantity: quantity,
        p_reference_id: item.purchase_order_id,
      });
    }
  } catch (error) {
    console.error('receivePurchaseOrderItem error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchInventory(locationType?: string): Promise<InventoryItem[]> {
  const db = getAdminClient();
  try {
    let query = db
      .from('inventory')
      .select(`
        *,
        product:product_id(name, sku),
        supplier:location_id(name),
        partner:location_id(name)
      `)
      .order('product_id');
    
    if (locationType) query = query.eq('location_type', locationType);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((inv: any) => ({
      ...inv,
      product_name: inv.product?.name,
      product_sku: inv.product?.sku,
      location_name: inv.location_type === 'supplier' 
        ? inv.supplier?.name 
        : inv.location_type === 'partner_store'
          ? inv.partner?.name 
          : 'Main Warehouse',
      needs_reorder: inv.available_quantity <= inv.reorder_point,
    }));
  } catch (error) {
    console.error('fetchInventory error:', error);
    return [];
  }
}

export async function fetchInventoryByProduct(productId: string): Promise<InventoryItem[]> {
  const db = getAdminClient();
  try {
    const { data, error } = await db
      .from('inventory')
      .select(`
        *,
        supplier:location_id(name),
        partner:location_id(name)
      `)
      .eq('product_id', productId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('fetchInventoryByProduct error:', error);
    return [];
  }
}

export async function updateInventoryQuantity(
  inventoryId: string,
  newQuantity: number,
  reason: string
): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db
      .from('inventory')
      .update({ 
        quantity: newQuantity, 
        last_counted_at: new Date().toISOString() 
      })
      .eq('id', inventoryId);
    
    if (error) throw error;
  } catch (error) {
    console.error('updateInventoryQuantity error:', error);
    throw error;
  }
}

export async function reserveInventory(
  productId: string,
  quantity: number
): Promise<boolean> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.rpc('reserve_inventory', {
      p_product_id: productId,
      p_quantity: quantity,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('reserveInventory error:', error);
    throw error;
  }
}

export async function releaseInventory(
  productId: string,
  quantity: number
): Promise<void> {
  const db = getAdminClient();
  try {
    const { error } = await db.rpc('release_inventory', {
      p_product_id: productId,
      p_quantity: quantity,
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('releaseInventory error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELIVERIES
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchDeliveries(status?: string, type?: string): Promise<Delivery[]> {
  const db = getAdminClient();
  try {
    let query = db
      .from('deliveries')
      .select(`
        *,
        partner:partner_id(name),
        order:order_id(id)
      `)
      .order('created_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((d: any) => ({
      ...d,
      partner_name: d.partner?.name,
      order_number: d.order?.id?.slice(0, 8).toUpperCase(),
    }));
  } catch (error) {
    console.error('fetchDeliveries error:', error);
    return [];
  }
}

export async function fetchDeliveryById(id: string): Promise<Delivery | null> {
  const db = getAdminClient();
  try {
    const { data, error } = await db
      .from('deliveries')
      .select(`
        *,
        partner:partner_id(name),
        items:delivery_items(
          *,
          product:product_id(name, images)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      ...data,
      partner_name: data.partner?.name,
    };
  } catch (error) {
    console.error('fetchDeliveryById error:', error);
    return null;
  }
}

export async function createDelivery(delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>): Promise<Delivery> {
  const db = getAdminClient();
  try {
    const { data, error } = await db.from('deliveries').insert(delivery).select().single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('createDelivery error:', error);
    throw error;
  }
}

export async function updateDeliveryStatus(
  id: string,
  status: Delivery['status'],
  trackingInfo?: { tracking_number?: string; tracking_url?: string; carrier?: string }
): Promise<void> {
  const db = getAdminClient();
  try {
    const updates: any = { status };
    if (status === 'delivered') updates.actual_delivery = new Date().toISOString();
    if (trackingInfo) {
      updates.tracking_number = trackingInfo.tracking_number;
      updates.tracking_url = trackingInfo.tracking_url;
      updates.carrier = trackingInfo.carrier;
    }
    
    const { error } = await db.from('deliveries').update(updates).eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('updateDeliveryStatus error:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MARKETPLACE LISTINGS (E-Marketplace)
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchMarketplaceListings(platform?: string): Promise<MarketplaceListing[]> {
  const db = getAdminClient();
  try {
    let query = db
      .from('marketplace_listings')
      .select(`
        *,
        product:product_id(name),
        partner:partner_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (platform) query = query.eq('platform', platform);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((l: any) => ({
      ...l,
      product_name: l.product?.name,
      partner_name: l.partner?.name,
    }));
  } catch (error) {
    console.error('fetchMarketplaceListings error:', error);
    return [];
  }
}

export async function createMarketplaceListing(
  listing: Omit<MarketplaceListing, 'id' | 'created_at' | 'updated_at' | 'monthly_sales' | 'total_sales' | 'product_name' | 'partner_name'>
): Promise<MarketplaceListing> {
  const db = getAdminClient();
  try {
    const { data, error } = await db
      .from('marketplace_listings')
      .insert({ ...listing, monthly_sales: 0, total_sales: 0 })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('createMarketplaceListing error:', error);
    throw error;
  }
  const { data, error } = await db
    .from('marketplace_listings')
    .insert({ ...listing, monthly_sales: 0, total_sales: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMarketplaceListing(id: string, updates: Partial<MarketplaceListing>): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from('marketplace_listings').update(updates).eq('id', id);
  if (error) throw error;
}

export async function syncMarketplaceListing(id: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db
    .from('marketplace_listings')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPPLIER PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchSupplierProducts(supplierId?: string): Promise<SupplierProduct[]> {
  const db = getAdminClient();
  let query = db
    .from('supplier_products')
    .select(`
      *,
      supplier:supplier_id(name),
      product:product_id(name)
    `)
    .order('created_at', { ascending: false });
  
  if (supplierId) query = query.eq('supplier_id', supplierId);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map((sp: any) => ({
    ...sp,
    supplier_name: sp.supplier?.name,
    product_name: sp.product?.name,
  }));
}

export async function createSupplierProduct(
  supplierProduct: Omit<SupplierProduct, 'id' | 'supplier_name' | 'product_name'>
): Promise<SupplierProduct> {
  const db = getAdminClient();
  const { data, error } = await db.from('supplier_products').insert(supplierProduct).select().single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// STOCK MOVEMENTS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchStockMovements(productId?: string, limit = 50): Promise<StockMovement[]> {
  const db = getAdminClient();
  let query = db
    .from('stock_movements')
    .select(`
      *,
      product:product_id(name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (productId) query = query.eq('product_id', productId);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map((m: any) => ({
    ...m,
    product_name: m.product?.name,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchSupplyChainStats(): Promise<{
  totalSuppliers: number;
  activeSuppliers: number;
  totalPartners: number;
  activePartners: number;
  pendingPurchaseOrders: number;
  totalPurchaseOrderValue: number;
  lowStockItems: number;
  activeDeliveries: number;
  activeListings: number;
  error?: string;
}> {
  const db = getAdminClient();
  
  try {
    const [
      { count: totalSuppliers },
      { count: activeSuppliers },
      { count: totalPartners },
      { count: activePartners },
      { count: pendingPOs, data: poData },
      { count: lowStock },
      { count: activeDeliveries },
      { count: activeListings },
    ] = await Promise.all([
      db.from('suppliers').select('*', { count: 'exact', head: true }),
      db.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      db.from('partners').select('*', { count: 'exact', head: true }),
      db.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      db.from('purchase_orders').select('total', { count: 'exact' }).in('status', ['draft', 'sent', 'confirmed', 'partial']),
      db.from('inventory').select('*', { count: 'exact', head: true }),
      db.from('deliveries').select('*', { count: 'exact', head: true }).in('status', ['pending', 'picked', 'packed', 'shipped', 'in_transit', 'out_for_delivery']),
      db.from('marketplace_listings').select('*', { count: 'exact', head: true }).eq('listing_status', 'active'),
    ]);
    
    const totalPOValue = (poData || []).reduce((sum: number, po: { total: number }) => sum + (po.total || 0), 0);
    
    return {
      totalSuppliers: totalSuppliers || 0,
      activeSuppliers: activeSuppliers || 0,
      totalPartners: totalPartners || 0,
      activePartners: activePartners || 0,
      pendingPurchaseOrders: pendingPOs || 0,
      totalPurchaseOrderValue: totalPOValue,
      lowStockItems: lowStock || 0,
      activeDeliveries: activeDeliveries || 0,
      activeListings: activeListings || 0,
    };
  } catch (error) {
    console.error('Supply chain stats error:', error);
    // Return zeros if tables don't exist yet
    return {
      totalSuppliers: 0,
      activeSuppliers: 0,
      totalPartners: 0,
      activePartners: 0,
      pendingPurchaseOrders: 0,
      totalPurchaseOrderValue: 0,
      lowStockItems: 0,
      activeDeliveries: 0,
      activeListings: 0,
      error: 'Database tables not set up. Run the SQL schema in Supabase.',
    };
  }
}
