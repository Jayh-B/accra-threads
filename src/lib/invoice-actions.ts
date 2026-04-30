'use server';

import { getAdminClient } from './admin-data';
import { revalidatePath } from 'next/cache';

console.log('🧾 invoice-actions.ts module loaded');

/**
 * Generate invoice number format: INV-YYYYMMDD-XXXX
 */
function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${random}`;
}

/**
 * Create invoice for an order
 */
export async function createInvoice(orderId: string): Promise<{
  success: boolean;
  invoiceNumber?: string;
  error?: string;
}> {
  console.log(`[INVOICE] Creating invoice for order: ${orderId}`);
  const db = getAdminClient();

  try {
    // Fetch order details with items
    const { data: order, error: orderError } = await db
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[INVOICE] Order not found:', orderError);
      return { success: false, error: 'Order not found' };
    }

    // Check if invoice already exists
    if (order.invoice_number) {
      console.log(`[INVOICE] Invoice already exists: ${order.invoice_number}`);
      return { success: true, invoiceNumber: order.invoice_number };
    }

    const invoiceNumber = generateInvoiceNumber();
    console.log(`[INVOICE] Generated invoice number: ${invoiceNumber}`);

    // Prepare invoice items
    const invoiceItems = (order.items || []).map((item: any) => ({
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      size: item.size,
      color: item.color,
    }));

    const billingAddress = order.shipping_address || {};

    // Create invoice record
    const { data: invoice, error: invoiceError } = await db
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        customer_name: billingAddress.first_name && billingAddress.last_name 
          ? `${billingAddress.first_name} ${billingAddress.last_name}`
          : order.customer_email?.split('@')[0] || 'Guest',
        customer_email: order.customer_email,
        customer_phone: billingAddress.phone,
        billing_address: billingAddress,
        items: invoiceItems,
        subtotal: order.subtotal,
        vat_amount: order.vat_amount,
        shipping_cost: order.shipping_cost,
        total: order.total,
        payment_method: order.payment_method,
        payment_status: order.payment_status || 'pending',
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('[INVOICE] Failed to create invoice:', invoiceError);
      return { success: false, error: `Invoice creation failed: ${invoiceError.message}` };
    }

    // Update order with invoice number
    const { error: updateError } = await db
      .from('orders')
      .update({
        invoice_number: invoiceNumber,
        invoice_generated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[INVOICE] Failed to update order:', updateError);
    }

    console.log(`[INVOICE] ✅ Invoice created: ${invoiceNumber}`);
    revalidatePath('/admin/finance/invoices');
    revalidatePath(`/admin/orders`);

    return { success: true, invoiceNumber };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[INVOICE] ❌ Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string): Promise<{
  success: boolean;
  invoice?: any;
  error?: string;
}> {
  const db = getAdminClient();

  try {
    const { data: invoice, error } = await db
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, invoice };
  } catch (error) {
    return { success: false, error: 'Failed to fetch invoice' };
  }
}

/**
 * Get invoice by invoice number
 */
export async function getInvoiceByNumber(invoiceNumber: string): Promise<{
  success: boolean;
  invoice?: any;
  error?: string;
}> {
  const db = getAdminClient();

  try {
    const { data: invoice, error } = await db
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, created_at)
      `)
      .eq('invoice_number', invoiceNumber)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, invoice };
  } catch (error) {
    return { success: false, error: 'Failed to fetch invoice' };
  }
}

/**
 * Fetch all invoices for admin
 */
export async function fetchAllInvoices(limit = 100): Promise<any[]> {
  console.log('[INVOICE] Fetching all invoices...');
  const db = getAdminClient();

  try {
    const { data: invoices, error } = await db
      .from('invoices')
      .select(`
        *,
        order:orders(order_number, customer_email)
      `)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[INVOICE] Error fetching invoices:', error);
      return [];
    }

    console.log(`[INVOICE] ✅ Found ${invoices?.length || 0} invoices`);
    return invoices || [];
  } catch (error) {
    console.error('[INVOICE] ❌ Error:', error);
    return [];
  }
}

/**
 * Update invoice payment status
 */
export async function updateInvoicePaymentStatus(
  invoiceNumber: string,
  status: 'pending' | 'paid' | 'failed' | 'refunded'
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();

  try {
    const { error } = await db
      .from('invoices')
      .update({ payment_status: status })
      .eq('invoice_number', invoiceNumber);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/finance/invoices');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update invoice' };
  }
}

/**
 * Delete invoice (admin only)
 */
export async function deleteInvoice(invoiceNumber: string): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();

  try {
    const { error } = await db
      .from('invoices')
      .delete()
      .eq('invoice_number', invoiceNumber);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/finance/invoices');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete invoice' };
  }
}
