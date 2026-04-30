'use server';

console.log('🔌 payment-actions.ts module loading...');

import { verifyAndUpdateOrderPayment } from './paystack';
import { sendOrderConfirmation, sendPaymentConfirmation, OrderEmailData } from './email';
import { getAdminClient } from './admin-data';
import { revalidatePath } from 'next/cache';

console.log('✅ payment-actions.ts imports loaded');

/**
 * Create order and initialize Paystack payment
 */
export async function createOrderWithPayment(input: {
  userId: string | null;
  email: string;
  items: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string;
    qty: number;
    size?: string;
    color?: string;
  }[];
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
}): Promise<{
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  paymentUrl?: string;
  error?: string;
}> {
  console.log('🔧 Getting admin client...');
  const db = getAdminClient();
  console.log('✅ Admin client created');

  try {
    console.log('[SERVER] 🛒 Starting order creation...');
    
    // Test database connection first
    console.log('[SERVER] 🔍 Testing database connection...');
    const { data: testData, error: testError } = await db.from('orders').select('count').limit(1);
    if (testError) {
      console.error('[SERVER] ❌ Database test failed:', testError);
      throw new Error(`DB_TEST_FAILED: ${testError.message}`);
    }
    console.log('[SERVER] ✅ Database connection OK');
    
    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = Math.round(subtotal * 0.15);
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;
    console.log('💰 Totals calculated:', { subtotal, tax, shipping, total });

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).toUpperCase().slice(2, 4)}`;
    console.log('🏷️ Order number:', orderNumber);

    // Create order
    console.log('📝 Inserting order into database...');
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: input.userId,
        status: 'pending_payment',
        subtotal: Math.round(subtotal * 100), // pesewas
        vat_amount: tax * 100,
        shipping_cost: shipping * 100,
        total: total * 100,
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
        payment_status: 'pending',
      })
      .select()
      .single();

    console.log('📦 Order insert result:', { order, orderError, hasData: !!order, hasError: !!orderError });
    
    if (orderError) {
      console.error('[SERVER] ❌ ORDER_INSERT_ERROR:', orderError);
      throw new Error(`ORDER_INSERT_FAILED: ${orderError.message}`);
    }
    if (!order) {
      console.error('[SERVER] ❌ ORDER_IS_NULL - RLS or insert failed silently');
      throw new Error('ORDER_INSERT_RETURNED_NULL');
    }
    console.log('[SERVER] ✅ Order created:', order.id);

    // Create order items
    for (const item of input.items) {
      const { error: itemError } = await db.from('order_items').insert({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.qty,
        unit_price: item.price * 100,
        total_price: item.price * item.qty * 100,
        size: item.size,
        color: item.color,
      });

      if (itemError) {
        console.error('[SERVER] ❌ ORDER_ITEM_ERROR:', itemError);
        throw new Error(`ORDER_ITEM_FAILED: ${itemError.message}`);
      }
    }

    // Use Paystack Shop for payment (instead of API initialization)
    const paystackShopUrl = 'https://paystack.shop/pay/accrathreads';
    console.log('[SERVER] 🌐 Using Paystack Shop:', paystackShopUrl);

    // Reserve inventory (optional - may fail if RPC doesn't exist)
    try {
      for (const item of input.items) {
        await db.rpc('reserve_inventory', {
          p_product_id: item.id,
          p_quantity: item.qty,
        });
      }
    } catch (e) {
      console.log('[SERVER] Inventory reservation skipped:', e);
    }

    // Create delivery record
    await db.from('deliveries').insert({
      delivery_number: `DEL-${orderNumber}`,
      type: 'customer_order',
      status: 'pending',
      order_id: order.id,
      destination_address: `${input.shippingAddress.address}, ${input.shippingAddress.city}, ${input.shippingAddress.region}`,
      recipient_name: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`,
      recipient_phone: input.shippingAddress.phone,
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Send order confirmation email
    const emailData: OrderEmailData = {
      orderNumber,
      customerName: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`,
      customerEmail: input.email,
      items: input.items.map(item => ({
        name: item.name,
        quantity: item.qty,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image,
      })),
      subtotal,
      vat: tax,
      shipping,
      total,
      shippingAddress: input.shippingAddress,
      status: 'pending_payment',
      paymentMethod: input.paymentMethod === 'card' ? 'Paystack (Card)' : 'Mobile Money',
    };

    await sendOrderConfirmation(emailData).catch(err => {
      console.error('Failed to send order confirmation:', err);
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber,
      paymentUrl: paystackShopUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    console.error('[SERVER] ❌ CATCH_BLOCK_ERROR:', errorMessage, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify payment and send confirmation email
 */
export async function verifyPaymentAndSendConfirmation(
  orderId: string,
  reference: string
): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  const db = getAdminClient();

  try {
    // Verify payment with Paystack
    const verification = await verifyAndUpdateOrderPayment(orderId, reference);

    if (!verification.success) {
      return { success: false, error: verification.error };
    }

    // Fetch order details for email
    const { data: order } = await db
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('id', orderId)
      .single();

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Send payment confirmation email if payment was successful
    if (verification.status === 'success') {
      const emailData: OrderEmailData = {
        orderNumber: order.order_number,
        customerName: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        customerEmail: order.customer_email,
        items: (order.items || []).map((item: any) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price / 100,
          size: item.size,
          color: item.color,
        })),
        subtotal: order.subtotal / 100,
        vat: order.vat_amount / 100,
        shipping: order.shipping_cost / 100,
        total: order.total / 100,
        shippingAddress: {
          firstName: order.shipping_address.first_name,
          lastName: order.shipping_address.last_name,
          address: order.shipping_address.address,
          city: order.shipping_address.city,
          region: order.shipping_address.region,
          phone: order.shipping_address.phone,
        },
        status: 'paid',
        paymentMethod: order.payment_method === 'card' ? 'Paystack (Card)' : 'Mobile Money',
      };

      await sendPaymentConfirmation(emailData).catch(err => {
        console.error('Failed to send payment confirmation:', err);
      });
    }

    revalidatePath('/admin/orders');

    return {
      success: true,
      orderNumber: order.order_number,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}
