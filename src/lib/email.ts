'use server';

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@accrathreads.com';

const resend = new Resend(RESEND_API_KEY);

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    region: string;
    phone: string;
  };
  status: string;
  paymentMethod: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `Accra Threads <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber}`,
      html: generateOrderConfirmationHtml(data),
    });

    if (error) {
      console.error('Failed to send order confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

/**
 * Send payment received confirmation
 */
export async function sendPaymentConfirmation(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `Accra Threads <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Payment Received - Order #${data.orderNumber}`,
      html: generatePaymentConfirmationHtml(data),
    });

    if (error) {
      console.error('Failed to send payment confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

/**
 * Send shipping notification with tracking
 */
export async function sendShippingNotification(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `Accra Threads <${FROM_EMAIL}>`,
      to: data.customerEmail,
      subject: `Your Order #${data.orderNumber} Has Shipped!`,
      html: generateShippingHtml(data),
    });

    if (error) {
      console.error('Failed to send shipping notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

/**
 * Send order cancellation notification
 */
export async function sendCancellationNotification(
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `Accra Threads <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order #${orderNumber} Cancelled`,
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #222;">Order Cancelled</h1>
          <p>Hi ${customerName},</p>
          <p>Your order <strong>#${orderNumber}</strong> has been cancelled.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br/>The Accra Threads Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send cancellation email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(
  invoiceData: {
    invoiceNumber: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from: `Accra Threads <${FROM_EMAIL}>`,
      to: invoiceData.customerEmail,
      subject: `Invoice #${invoiceData.invoiceNumber} - Accra Threads`,
      html: generateInvoiceEmailHtml(invoiceData),
    });

    if (error) {
      console.error('Failed to send invoice email:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] ✅ Invoice email sent to ${invoiceData.customerEmail}`);
    return { success: true };
  } catch (err) {
    console.error('Email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send email' };
  }
}

function generateOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />` : ''}
          <div>
            <p style="margin: 0; font-weight: 600;">${item.name}</p>
            ${item.size ? `<p style="margin: 4px 0 0; font-size: 14px; color: #666;">Size: ${item.size}</p>` : ''}
            ${item.color ? `<p style="margin: 4px 0 0; font-size: 14px; color: #666;">Color: ${item.color}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">GHS ${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', serif; font-size: 32px; color: #222; margin: 0;">Accra Threads</h1>
        <p style="color: #666; margin: 8px 0 0;">Wear the City. Own Your Story.</p>
      </div>
      
      <h2 style="color: #222; font-size: 24px; margin-bottom: 8px;">Thank you for your order!</h2>
      <p style="color: #666; margin-bottom: 24px;">Hi ${data.customerName}, we've received your order and are preparing it now.</p>
      
      <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #666;">Order Number</p>
        <p style="margin: 4px 0 0; font-family: monospace; font-size: 20px; color: #222;">${data.orderNumber}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f7f7f7;">
            <th style="padding: 12px; text-align: left;">Product</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal</span>
          <span>GHS ${data.subtotal.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>VAT (15%)</span>
          <span>GHS ${data.vat.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Shipping</span>
          <span>${data.shipping === 0 ? 'FREE' : `GHS ${data.shipping.toLocaleString()}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #ddd; font-weight: 600;">
          <span>Total</span>
          <span>GHS ${data.total.toLocaleString()}</span>
        </div>
      </div>
      
      <div style="margin-bottom: 24px;">
        <h3 style="color: #222; font-size: 16px; margin-bottom: 12px;">Delivery Address</h3>
        <p style="margin: 0; color: #666;">
          ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br/>
          ${data.shippingAddress.address}<br/>
          ${data.shippingAddress.city}, ${data.shippingAddress.region}<br/>
          ${data.shippingAddress.phone}
        </p>
      </div>
      
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #eee;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://accrathreads.com'}/orders/${data.orderNumber}" 
           style="display: inline-block; padding: 12px 24px; background: #222; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
          Track Your Order
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
        If you have any questions, reply to this email or contact us at support@accrathreads.com
      </p>
    </div>
  `;
}

function generatePaymentConfirmationHtml(data: OrderEmailData): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #2B8A3E;">Payment Received!</h2>
      <p>Hi ${data.customerName},</p>
      <p>We've received your payment for order <strong>#${data.orderNumber}</strong>.</p>
      <p>Your order is now being processed and we'll notify you when it ships.</p>
      <p>Total Paid: <strong>GHS ${data.total.toLocaleString()}</strong></p>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://accrathreads.com'}/orders/${data.orderNumber}" 
           style="display: inline-block; padding: 12px 24px; background: #222; color: white; text-decoration: none; border-radius: 4px;">
          View Order Details
        </a>
      </div>
    </div>
  `;
}

function generateShippingHtml(data: OrderEmailData): string {
  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #222;">Your Order is on Its Way!</h2>
      <p>Hi ${data.customerName},</p>
      <p>Great news! Your order <strong>#${data.orderNumber}</strong> has been shipped.</p>
      
      ${data.trackingNumber ? `
      <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Tracking Number</p>
        <p style="margin: 0; font-family: monospace; font-size: 18px; color: #222;">${data.trackingNumber}</p>
        ${data.trackingUrl ? `<a href="${data.trackingUrl}" style="display: inline-block; margin-top: 12px; color: #222; text-decoration: underline;">Track Package</a>` : ''}
      </div>
      ` : ''}
      
      ${data.estimatedDelivery ? `<p>Estimated Delivery: <strong>${data.estimatedDelivery}</strong></p>` : ''}
      
      <p>Thank you for shopping with Accra Threads!</p>
    </div>
  `;
}

function generateInvoiceEmailHtml(data: {
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}): string {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">GHS ${(item.price / 100).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #2c5f2d; margin: 0;">ACCRA THREADS</h1>
        <p style="color: #666; margin: 8px 0 0;">Premium Streetwear from Ghana</p>
      </div>
      
      <h2 style="color: #222; border-bottom: 2px solid #2c5f2d; padding-bottom: 8px;">Invoice #${data.invoiceNumber}</h2>
      
      <p>Hi ${data.customerName},</p>
      <p>Thank you for your purchase! Please find your invoice details below:</p>
      
      <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 8px;"><strong>Order Number:</strong> #${data.orderNumber}</p>
        <p style="margin: 0;"><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="background: #f7f7f7;">
            <th style="padding: 12px; text-align: left;">Item</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="background: #f7f7f7; padding: 16px; border-radius: 8px; text-align: right;">
        <p style="margin: 0; font-size: 18px; font-weight: 600;">
          Total: GHS ${(data.total / 100).toLocaleString()}
        </p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; text-align: center;">
        <p style="margin: 0 0 16px;">You can download your full invoice PDF from your account:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://accrathreads.com'}/account/orders" 
           style="display: inline-block; padding: 12px 24px; background: #2c5f2d; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">
          View Orders
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
        If you have any questions about this invoice, please contact us at support@accrathreads.com
      </p>
    </div>
  `;
}
