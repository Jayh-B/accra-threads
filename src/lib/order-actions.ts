/**
 * order-actions.ts - Server Actions for Order Processing
 * Handles order creation, inventory management, and fulfillment
 */

'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { Product } from './data';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  qty: number;
  size: string;
  color: string;
};

export type OrderInput = {
  userId: string | null;
  email: string;
  items: CartItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    region: string;
    phone: string;
  };
  paymentMethod: 'card' | 'momo';
  momoProvider?: 'mtn' | 'voda' | 'airtel';
};

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AT-${year}-${random}`;
}

/**
 * Create a new order with inventory reservation
 */
export async function createOrder(input: OrderInput): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const vatRate = 0.15; // 15% VAT for Ghana
    const vatAmount = subtotal * vatRate;
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping over GHS 500
    const total = subtotal + vatAmount + shippingCost;
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Check inventory availability for all items
    for (const item of input.items) {
      const { data: inventory, error: invError } = await db
        .from('inventory')
        .select('available_quantity')
        .eq('product_id', item.id)
        .eq('location_type', 'warehouse')
        .single();
      
      if (invError || !inventory || inventory.available_quantity < item.qty) {
        return { 
          success: false, 
          error: `Insufficient stock for ${item.name}. Available: ${inventory?.available_quantity || 0}` 
        };
      }
    }
    
    // Create the order
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        id: crypto.randomUUID(),
        order_number: orderNumber,
        user_id: input.userId,
        status: 'confirmed',
        payment_status: 'pending',
        subtotal,
        vat_amount: vatAmount,
        shipping_cost: shippingCost,
        total,
        currency: 'GHS',
        shipping_address: {
          first_name: input.shippingAddress.firstName,
          last_name: input.shippingAddress.lastName,
          address: input.shippingAddress.address,
          city: input.shippingAddress.city,
          region: input.shippingAddress.region,
          phone: input.shippingAddress.phone,
        },
        payment_method: input.paymentMethod,
        momo_provider: input.momoProvider,
        customer_email: input.email,
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Create order items and reserve inventory
    for (const item of input.items) {
      // Insert order item
      const { error: itemError } = await db
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price * 100, // Store in pesewas
          total_price: item.price * item.qty * 100,
          size: item.size,
          color: item.color,
        });
      
      if (itemError) throw itemError;
      
      // Reserve inventory using RPC function
      const { error: reserveError } = await db.rpc('reserve_inventory', {
        p_product_id: item.id,
        p_quantity: item.qty,
      });
      
      if (reserveError) {
        console.error('Failed to reserve inventory:', reserveError);
        // Continue anyway - we'll handle this in fulfillment
      }
    }
    
    // Create initial delivery record
    const { error: deliveryError } = await db
      .from('deliveries')
      .insert({
        delivery_number: `DEL-${orderNumber}`,
        type: 'customer_order',
        status: 'pending',
        order_id: order.id,
        destination_address: `${input.shippingAddress.address}, ${input.shippingAddress.city}, ${input.shippingAddress.region}`,
        recipient_name: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`,
        recipient_phone: input.shippingAddress.phone,
        estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      });
    
    if (deliveryError) {
      console.error('Failed to create delivery:', deliveryError);
      // Don't fail the order for this
    }
    
    // Revalidate relevant paths
    revalidatePath('/admin/orders');
    revalidatePath('/admin/supply-chain/inventory');
    revalidatePath('/admin/supply-chain/deliveries');
    
    return { 
      success: true, 
      orderId: order.id,
      orderNumber: orderNumber,
    };
    
  } catch (error) {
    console.error('Order creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order' 
    };
  }
}

/**
 * Update order status and handle inventory accordingly
 */
export async function updateOrderStatus(
  orderId: string, 
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    const { data: order, error: fetchError } = await db
      .from('orders')
      .select('status, order_number')
      .eq('id', orderId)
      .single();
    
    if (fetchError || !order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Update order status
    const { error: updateError } = await db
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    if (updateError) throw updateError;
    
    // Handle inventory based on status change
    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      // Release reserved inventory
      const { data: items } = await db
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);
      
      for (const item of items || []) {
        await db.rpc('release_inventory', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }
    
    if (newStatus === 'shipped') {
      // Convert reserved to fulfilled (deduct from actual stock)
      const { data: items } = await db
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);
      
      for (const item of items || []) {
        await db.rpc('fulfill_order', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
      
      // Update delivery status
      await db
        .from('deliveries')
        .update({ status: 'shipped' })
        .eq('order_id', orderId);
    }
    
    if (newStatus === 'delivered') {
      // Update delivery status
      await db
        .from('deliveries')
        .update({ 
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
        })
        .eq('order_id', orderId);
    }
    
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/admin/supply-chain/inventory');
    revalidatePath('/admin/supply-chain/deliveries');
    
    return { success: true };
    
  } catch (error) {
    console.error('Status update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update status' 
    };
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    const { error } = await db
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    if (error) throw error;
    
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Payment update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update payment' 
    };
  }
}

/**
 * Add tracking information to an order
 */
export async function addTrackingInfo(
  orderId: string,
  carrier: string,
  trackingNumber: string,
  trackingUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    const { error } = await db
      .from('deliveries')
      .update({
        carrier,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        status: 'shipped',
      })
      .eq('order_id', orderId);
    
    if (error) throw error;
    
    // Also update order status
    await db
      .from('orders')
      .update({ 
        status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    revalidatePath('/admin/orders');
    revalidatePath(`/orders/${orderId}/track`);
    revalidatePath('/admin/supply-chain/deliveries');
    
    return { success: true };
  } catch (error) {
    console.error('Tracking update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add tracking' 
    };
  }
}
