import { Package, RefreshCw } from 'lucide-react';
import { fetchAdminOrders } from '@/lib/admin-data';
import { verifyPaymentAndSendConfirmation } from '@/lib/payment-actions';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import styles from '../page.module.css';

function formatGHS(amount: number) {
  return `GHS ${(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending:    styles.statusPending,
    confirmed:  styles.statusConfirmed,
    processing: styles.statusProcessing,
    shipped:    styles.statusShipped,
    delivered:  styles.statusDelivered,
    returned:   styles.statusReturned,
    cancelled:  styles.statusCancelled,
  };
  return map[status] ?? styles.statusPending;
}

function paymentStatusClass(status: string | null) {
  const map: Record<string, string> = {
    paid:       styles.statusDelivered,
    pending:    styles.statusPending,
    failed:     styles.statusCancelled,
    refunded:   styles.statusReturned,
  };
  return map[status ?? 'pending'] ?? styles.statusPending;
}

const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'cancelled', 'pending_payment',
];

async function verifyOrderPayment(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const reference = formData.get('reference') as string;
  
  const result = await verifyPaymentAndSendConfirmation(orderId, reference);
  
  if (result.success) {
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
  }
}

async function updateOrderStatus(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  const newStatus = formData.get('status') as string;

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  await db.from('orders').update({ status: newStatus }).eq('id', orderId);
  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}

export default async function AdminOrders() {
  const orders = await fetchAdminOrders(200);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Order Management</h1>
          <p className={styles.pageSubtitle}>{orders.length} total orders</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptyText}>
              Orders placed by customers through the checkout flow will appear here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className={styles.orderId}>
                        {o.order_number || o.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerInitial}>
                          {(o.customer_name ?? 'G')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>{o.customer_name ?? 'Guest'}</div>
                          {o.customer_email && (
                            <div className={styles.customerEmail}>{o.customer_email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(o.created_at).toLocaleDateString('en-GH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className={styles.itemCount}>
                      {o.item_count} item{o.item_count !== 1 ? 's' : ''}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${paymentStatusClass(o.payment_status)}`}>
                        {(o.payment_status ?? 'pending').replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.totalCell}>{formatGHS((o.total ?? 0) / 100)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <form action={updateOrderStatus} style={{ flex: 1 }}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <select
                            name="status"
                            defaultValue={o.status}
                            className={styles.statusSelect}
                            onChange={(e) => {
                              const form = e.target.closest('form') as HTMLFormElement;
                              form?.requestSubmit();
                            }}
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </form>
                        {o.paystack_reference && o.payment_status !== 'paid' && (
                          <form action={verifyOrderPayment}>
                            <input type="hidden" name="orderId" value={o.id} />
                            <input type="hidden" name="reference" value={o.paystack_reference} />
                            <button 
                              type="submit" 
                              className="btn btn-sm btn-ghost"
                              title="Verify Payment"
                            >
                              <RefreshCw size={14} />
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
