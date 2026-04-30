import Link from 'next/link';
import { Truck, Plus, Package, Store, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { fetchDeliveries } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: styles.statusPending,
    picked: styles.statusProcessing,
    packed: styles.statusConfirmed,
    shipped: styles.statusShipped,
    in_transit: styles.statusShipped,
    out_for_delivery: styles.statusProcessing,
    delivered: styles.statusDelivered,
    failed: styles.statusReturned,
    returned: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

function deliveryTypeIcon(type: string) {
  switch (type) {
    case 'customer_order': return <Package size={16} />;
    case 'partner_transfer': return <Store size={16} />;
    case 'supplier_return': return <RotateCcw size={16} />;
    case 'inter_warehouse': return <ArrowRightLeft size={16} />;
    default: return <Truck size={16} />;
  }
}

export default async function DeliveriesPage() {
  const deliveries = await fetchDeliveries();

  const activeDeliveries = deliveries.filter(d => 
    ['pending', 'picked', 'packed', 'shipped', 'in_transit', 'out_for_delivery'].includes(d.status)
  );
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in_transit').length;
  const outForDeliveryCount = deliveries.filter(d => d.status === 'out_for_delivery').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deliveries & Distribution</h1>
          <p className={styles.pageSubtitle}>{activeDeliveries.length} active • {deliveredCount} completed • {inTransitCount} in transit</p>
        </div>
        <Link href="/admin/supply-chain/deliveries/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> New Delivery
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Package size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>
            {deliveries.filter(d => ['pending', 'picked', 'packed'].includes(d.status)).length}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>In Transit</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <Truck size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{inTransitCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Out for Delivery</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
              <Truck size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{outForDeliveryCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Delivered</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
              <Package size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#4ade80' }}>{deliveredCount}</div>
        </div>
      </div>

      {/* ── Deliveries Table ───────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Deliveries</h2>
        </div>

        {deliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No deliveries</p>
            <p className={styles.emptyText}>Create deliveries to track shipments to customers and partners.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Delivery #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Carrier</th>
                  <th>Destination</th>
                  <th>Tracking</th>
                  <th>Est. Delivery</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className={styles.orderId}>{d.delivery_number}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {deliveryTypeIcon(d.type)}
                        <span style={{ textTransform: 'capitalize' }}>
                          {d.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{d.carrier || '—'}</td>
                    <td>
                      <div className={styles.customerName}>
                        {d.recipient_name || d.partner_name || 'Customer'}
                      </div>
                      <div className={styles.customerEmail} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {d.destination_address.slice(0, 40)}...
                      </div>
                    </td>
                    <td>
                      {d.tracking_number ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {d.tracking_number.slice(0, 20)}
                          </div>
                          {d.tracking_url && (
                            <a 
                              href={d.tracking_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}
                            >
                              Track →
                            </a>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {d.estimated_delivery 
                        ? new Date(d.estimated_delivery).toLocaleDateString('en-GH')
                        : '—'}
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
