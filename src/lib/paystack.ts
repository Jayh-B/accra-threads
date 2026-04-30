import { getAdminClient } from './admin-data';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackPaymentData {
  email: string;
  amount: number; // in pesewas (cents)
  reference: string;
  currency?: string;
  channels?: string[];
  metadata?: Record<string, any>;
  callback_url?: string;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerificationResponse {
  status: boolean;
  message: string;
  data?: {
    status: 'success' | 'failed' | 'pending';
    reference: string;
    amount: number;
    currency: string;
    transaction_date: string;
    metadata?: Record<string, any>;
    channel: string;
    customer: {
      email: string;
    };
    fees: number;
    paid_at: string | null;
  };
}

/**
 * Initialize a Paystack payment
 */
export async function initializePayment(
  data: PaystackPaymentData
): Promise<PaystackResponse> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        amount: data.amount,
        reference: data.reference,
        currency: data.currency || 'GHS',
        channels: data.channels || ['card', 'mobile_money'],
        metadata: data.metadata,
        callback_url: data.callback_url,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Failed to initialize payment',
    };
  }
}

/**
 * Verify a Paystack payment
 */
export async function verifyPayment(reference: string): Promise<VerificationResponse> {
  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack verification error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Failed to verify payment',
    };
  }
}

/**
 * Check payment status and update order
 */
export async function verifyAndUpdateOrderPayment(
  orderId: string,
  reference: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Verify payment with Paystack
    const verification = await verifyPayment(reference);
    
    if (!verification.status || !verification.data) {
      return { success: false, error: verification.message };
    }
    
    const paymentStatus = verification.data.status;
    
    // Update order payment status
    const { error } = await db
      .from('orders')
      .update({
        payment_status: paymentStatus === 'success' ? 'paid' : 'failed',
        paystack_reference: reference,
        paystack_channel: verification.data.channel,
        paystack_fees: verification.data.fees,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('Failed to update order:', error);
      return { success: false, error: error.message };
    }
    
    // If payment successful, update order status to pending fulfillment
    if (paymentStatus === 'success') {
      await db
        .from('orders')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }
    
    return { success: true, status: paymentStatus };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Generate a unique payment reference
 */
export async function generatePaymentReference(orderNumber: string): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `PAY-${orderNumber}-${timestamp}`;
}

/**
 * Initialize payment for an order and store the reference
 */
export async function initializeOrderPayment(
  orderId: string,
  orderNumber: string,
  email: string,
  amountInPesewas: number,
  callbackUrl?: string
): Promise<{ success: boolean; authorizationUrl?: string; reference?: string; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Generate unique reference
    const reference = await generatePaymentReference(orderNumber);
    
    // Initialize payment with Paystack
    const result = await initializePayment({
      email,
      amount: amountInPesewas,
      reference,
      currency: 'GHS',
      channels: ['card', 'mobile_money'],
      metadata: {
        order_id: orderId,
        order_number: orderNumber,
      },
      callback_url: callbackUrl,
    });
    
    if (!result.status || !result.data) {
      return { success: false, error: result.message };
    }
    
    // Store payment reference in order
    const { error } = await db
      .from('orders')
      .update({
        paystack_reference: reference,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('Failed to update order with reference:', error);
    }
    
    return {
      success: true,
      authorizationUrl: result.data.authorization_url,
      reference,
    };
  } catch (error) {
    console.error('Payment initialization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize payment',
    };
  }
}
