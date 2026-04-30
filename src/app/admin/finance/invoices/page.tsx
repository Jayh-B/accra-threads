import { FileText, Download, Mail, Eye, RefreshCw } from 'lucide-react';
import { fetchAllInvoices } from '@/lib/invoice-actions';
import { createInvoice } from '@/lib/invoice-actions';
import { revalidatePath } from 'next/cache';
import styles from '../../page.module.css';

function formatGHS(amount: number) {
  return `GHS ${((amount || 0) / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function paymentStatusClass(status: string | null) {
  const map: Record<string, string> = {
    paid: styles.statusDelivered,
    pending: styles.statusPending,
    failed: styles.statusCancelled,
    refunded: styles.statusReturned,
  };
  return map[status ?? 'pending'] ?? styles.statusPending;
}

async function generateInvoice(formData: FormData) {
  'use server';
  const orderId = formData.get('orderId') as string;
  await createInvoice(orderId);
  revalidatePath('/admin/finance/invoices');
}

export default async function AdminInvoices() {
  const invoices = await fetchAllInvoices(200);

  // Calculate stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.payment_status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  const pendingAmount = invoices
    .filter((inv) => inv.payment_status === 'pending')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Invoice Management</h1>
          <p className={styles.pageSubtitle}>{invoices.length} total invoices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.kpiGrid} style={{ marginBottom: '32px' }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Invoiced</span>
            <FileText size={16} />
          </div>
          <div className={styles.kpiValue}>{formatGHS(totalRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Paid Amount</span>
            <FileText size={16} />
          </div>
          <div className={styles.kpiValue} style={{ color: '#16a34a' }}>
            {formatGHS(paidAmount)}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending Payment</span>
            <FileText size={16} />
          </div>
          <div className={styles.kpiValue} style={{ color: '#d97706' }}>
            {formatGHS(pendingAmount)}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Invoices</span>
            <FileText size={16} />
          </div>
          <div className={styles.kpiValue}>{invoices.length}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Invoices</h2>
        </div>

        {invoices.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No invoices yet</p>
            <p className={styles.emptyText}>
              Invoices will be generated automatically when orders are created.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <span className={styles.orderId}>{invoice.invoice_number}</span>
                    </td>
                    <td>
                      <span className={styles.orderId}>
                        {invoice.order?.order_number || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerInitial}>
                          {(invoice.customer_name?.[0] || 'G').toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>
                            {invoice.customer_name || 'Guest'}
                          </div>
                          {invoice.customer_email && (
                            <div className={styles.customerEmail}>
                              {invoice.customer_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(invoice.generated_at)}
                    </td>
                    <td className={styles.itemCount}>
                      {(invoice.items?.length || 0)} item
                      {(invoice.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${paymentStatusClass(
                          invoice.payment_status
                        )}`}
                      >
                        {(invoice.payment_status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.totalCell}>
                        {formatGHS(invoice.total)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`/account/orders/${invoice.order_id}/invoice`}
                          target="_blank"
                          className="btn btn-sm btn-ghost"
                          title="View Invoice"
                        >
                          <Eye size={14} />
                        </a>
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
