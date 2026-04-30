import Link from 'next/link';
import { ShoppingCart, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { fetchPurchaseOrders } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

function statusClass(status: string) {
  const map: Record<string, string> = {
    draft: styles.statusPending,
    sent: styles.statusProcessing,
    confirmed: styles.statusConfirmed,
    partial: styles.statusShipped,
    received: styles.statusDelivered,
    cancelled: styles.statusCancelled,
    returned: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

function paymentStatusClass(status: string) {
  const map: Record<string, string> = {
    unpaid: styles.statusCancelled,
    partial: styles.statusPending,
    paid: styles.statusDelivered,
    refunded: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

export default async function PurchaseOrdersPage() {
  const orders = await fetchPurchaseOrders();

  const draftCount = orders.filter(o => o.status === 'draft').length;
  const pendingCount = orders.filter(o => ['sent', 'confirmed'].includes(o.status)).length;
  const receivedCount = orders.filter(o => o.status === 'received').length;
  const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const unpaidValue = orders
    .filter(o => o.payment_status !== 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Purchase Orders</h1>
          <p className={styles.pageSubtitle}>{orders.length} POs • {formatGHS(totalValue)} total • {formatGHS(unpaidValue)} unpaid</p>
        </div>
        <Link href="/admin/supply-chain/purchase-orders/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Create PO
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Draft</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Clock size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{draftCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <AlertCircle size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{pendingCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Received</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
              <CheckCircle size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{receivedCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Unpaid Value</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
              <ShoppingCart size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ fontSize: '1.5rem' }}>
            {formatGHS(unpaidValue)}
          </div>
        </div>
      </div>

      {/* ── Purchase Orders Table ─────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Purchase Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No purchase orders</p>
            <p className={styles.emptyText}>Create purchase orders to procure inventory from suppliers.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Expected</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <span className={styles.orderId}>{po.po_number}</span>
                    </td>
                    <td>
                      <div className={styles.customerName}>{po.supplier_name}</div>
                    </td>
                    <td>{po.item_count || 0} items</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${paymentStatusClass(po.payment_status)}`}>
                        {po.payment_status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {po.expected_delivery 
                        ? new Date(po.expected_delivery).toLocaleDateString('en-GH')
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.totalCell}>{formatGHS(po.total)}</span>
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

function formatGHS(amount: number) {
  return `GHS ${(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}
