'use server';

import { getAdminClient } from './admin-data';
import { revalidatePath } from 'next/cache';

console.log('📦 tracking-actions.ts module loaded');

export type TrackingEvent = {
  id: string;
  order_id: string;
  status: string;
  description: string;
  location: string | null;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  created_at: string;
};

const VALID_STATUSES = [
  'pending_payment',
  'paid',
  'confirmed',
  'processing',
  'ready_for_pickup',
  'picked',
  'packed',
  'handed_to_courier',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
];

/**
 * Add tracking event to an order
 */
export async function addTrackingEvent(
  orderId: string,
  data: {
    status: string;
    description: string;
    location?: string;
    estimatedDeliveryDate?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log(`[TRACKING] Adding event for order ${orderId}: ${data.status}`);
  const db = getAdminClient();

  try {
    // Validate status
    if (!VALID_STATUSES.includes(data.status)) {
      return { success: false, error: `Invalid status: ${data.status}` };
    }

    // Insert tracking event
    const { error: eventError } = await db.from('order_tracking_events').insert({
      order_id: orderId,
      status: data.status,
      description: data.description,
      location: data.location || null,
      estimated_delivery_date: data.estimatedDeliveryDate || null,
    });

    if (eventError) {
      console.error('[TRACKING] Failed to add event:', eventError);
      return { success: false, error: eventError.message };
    }

    // Update order status
    const { error: updateError } = await db
      .from('orders')
      .update({ status: data.status })
      .eq('id', orderId);

    if (updateError) {
      console.error('[TRACKING] Failed to update order status:', updateError);
    }

    console.log(`[TRACKING] ✅ Event added: ${data.status}`);
    revalidatePath(`/admin/orders/${orderId}/delivery`);
    revalidatePath(`/orders/${orderId}/track`);
    revalidatePath('/admin/orders');

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[TRACKING] ❌ Error:', message);
    return { success: false, error: message };
  }
}

/**
 * Get tracking events for an order
 */
export async function getTrackingEvents(orderId: string): Promise<{
  success: boolean;
  events?: TrackingEvent[];
  error?: string;
}> {
  console.log(`[TRACKING] Fetching events for order: ${orderId}`);
  const db = getAdminClient();

  try {
    const { data: events, error } = await db
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[TRACKING] Error fetching events:', error);
      return { success: false, error: error.message };
    }

    console.log(`[TRACKING] ✅ Found ${events?.length || 0} events`);
    return { success: true, events: events || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get order delivery details
 */
export async function getDeliveryDetails(orderId: string): Promise<{
  success: boolean;
  delivery?: {
    id: string;
    delivery_number: string;
    status: string;
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    estimated_delivery: string | null;
    actual_delivery: string | null;
  } | null;
  error?: string;
}> {
  const db = getAdminClient();

  try {
    const { data: delivery, error } = await db
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      return { success: false, error: error.message };
    }

    return { success: true, delivery: delivery || null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Create or update delivery record
 */
export async function upsertDelivery(
  orderId: string,
  data: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log(`[DELIVERY] Updating delivery for order: ${orderId}`);
  const db = getAdminClient();

  try {
    // Check if delivery exists
    const { data: existing } = await db
      .from('deliveries')
      .select('id')
      .eq('order_id', orderId)
      .single();

    const deliveryData = {
      order_id: orderId,
      carrier: data.carrier || null,
      tracking_number: data.trackingNumber || null,
      tracking_url: data.trackingUrl || null,
      estimated_delivery: data.estimatedDelivery || null,
      status: 'pending',
    };

    if (existing) {
      // Update
      const { error } = await db
        .from('deliveries')
        .update(deliveryData)
        .eq('id', existing.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Create new
      const { error } = await db.from('deliveries').insert({
        ...deliveryData,
        delivery_number: `DEL-${Date.now().toString(36).toUpperCase()}`,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath(`/admin/orders/${orderId}/delivery`);
    revalidatePath(`/orders/${orderId}/track`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
  orderId: string,
  status: string,
  actualDelivery?: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();

  try {
    const updateData: Record<string, string> = { status };
    if (actualDelivery) {
      updateData.actual_delivery = actualDelivery;
    }

    const { error } = await db
      .from('deliveries')
      .update(updateData)
      .eq('order_id', orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/orders/${orderId}/delivery`);
    revalidatePath(`/orders/${orderId}/track`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get order with full tracking timeline
 */
export async function getOrderWithTimeline(orderId: string): Promise<{
  success: boolean;
  order?: any;
  timeline?: TrackingEvent[];
  delivery?: any;
  error?: string;
}> {
  console.log(`[TRACKING] Getting full timeline for order: ${orderId}`);
  const db = getAdminClient();

  try {
    // Get order
    const { data: order, error: orderError } = await db
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { success: false, error: 'Order not found' };
    }

    // Get tracking events
    const { data: events } = await db
      .from('order_tracking_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    // Get delivery info
    const { data: delivery } = await db
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    return {
      success: true,
      order,
      timeline: events || [],
      delivery: delivery || null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
