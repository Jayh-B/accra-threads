/**
 * order-data.ts - Order data fetching for customers
 */

import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export type OrderWithItems = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  vat_amount: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    region: string;
    phone: string;
  };
  payment_method: string;
  created_at: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    size: string | null;
    color: string | null;
    product_id: string | null;
    image?: string;
  }[];
  delivery?: {
    delivery_number: string;
    status: string;
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    estimated_delivery: string | null;
    actual_delivery: string | null;
  } | null;
};

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const db = getClient();
  
  const { data: order, error: orderError } = await db
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single();
  
  if (orderError || !order) return null;
  
  // Get delivery info
  const { data: delivery } = await db
    .from('deliveries')
    .select('*')
    .eq('order_id', order.id)
    .single();
  
  // Get product images for items
  const productIds = order.items?.map((i: any) => i.product_id).filter(Boolean) || [];
  
  let productImages: Record<string, string> = {};
  if (productIds.length > 0) {
    const { data: products } = await db
      .from('products')
      .select('id, images')
      .in('id', productIds);
    
    productImages = Object.fromEntries(
      (products || []).map((p: any) => [p.id, p.images?.[0] || '/products/placeholder.jpg'])
    );
  }
  
  return {
    ...order,
    items: (order.items || []).map((item: any) => ({
      ...item,
      unit_price: item.unit_price / 100,
      total_price: item.total_price / 100,
      image: productImages[item.product_id] || '/products/placeholder.jpg',
    })),
    subtotal: order.subtotal / 100,
    vat_amount: order.vat_amount / 100,
    shipping_cost: order.shipping_cost / 100,
    total: order.total / 100,
    delivery: delivery || null,
  };
}

export async function fetchOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const db = getClient();
  
  const { data: order, error: orderError } = await db
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('order_number', orderNumber)
    .single();
  
  if (orderError || !order) return null;
  
  // Get delivery info
  const { data: delivery } = await db
    .from('deliveries')
    .select('*')
    .eq('order_id', order.id)
    .single();
  
  // Get product images for items
  const productIds = order.items?.map((i: any) => i.product_id).filter(Boolean) || [];
  
  let productImages: Record<string, string> = {};
  if (productIds.length > 0) {
    const { data: products } = await db
      .from('products')
      .select('id, images')
      .in('id', productIds);
    
    productImages = Object.fromEntries(
      (products || []).map((p: any) => [p.id, p.images?.[0] || '/products/placeholder.jpg'])
    );
  }
  
  return {
    ...order,
    items: (order.items || []).map((item: any) => ({
      ...item,
      unit_price: item.unit_price / 100,
      total_price: item.total_price / 100,
      image: productImages[item.product_id] || '/products/placeholder.jpg',
    })),
    subtotal: order.subtotal / 100,
    vat_amount: order.vat_amount / 100,
    shipping_cost: order.shipping_cost / 100,
    total: order.total / 100,
    delivery: delivery || null,
  };
}

export async function fetchUserOrders(userId: string): Promise<OrderWithItems[]> {
  const db = getClient();
  
  const { data: orders, error } = await db
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !orders) return [];
  
  // Get product images
  const allProductIds = orders.flatMap((o: any) => 
    (o.items || []).map((i: any) => i.product_id).filter(Boolean)
  );
  
  let productImages: Record<string, string> = {};
  if (allProductIds.length > 0) {
    const { data: products } = await db
      .from('products')
      .select('id, images')
      .in('id', [...new Set(allProductIds)]);
    
    productImages = Object.fromEntries(
      (products || []).map((p: any) => [p.id, p.images?.[0] || '/products/placeholder.jpg'])
    );
  }

  return orders.map((order: any) => ({
    ...order,
    items: (order.items || []).map((item: any) => ({
      ...item,
      unit_price: item.unit_price / 100,
      total_price: item.total_price / 100,
      image: productImages[item.product_id] || '/products/placeholder.jpg',
    })),
    subtotal: order.subtotal / 100,
    vat_amount: order.vat_amount / 100,
    shipping_cost: order.shipping_cost / 100,
    total: order.total / 100,
  }));
}
