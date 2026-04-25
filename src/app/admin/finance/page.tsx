import { DollarSign, Landmark, TrendingUp, FileText } from 'lucide-react';
import { fetchAdminFinance } from '@/lib/admin-data';
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

export default async function AdminFinance() {
  const { grossRevenue, vatCollected, netRevenue, orders } = await fetchAdminFinance();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Finance & Tax</h1>
          <p className={styles.pageSubtitle}>Revenue breakdown with Ghanaian VAT compliance</p>
        </div>
      </div>

      {/* ── Revenue Cards ───────────────────────────────── */}
      <div className={styles.finGrid}>
        <div className={styles.finCard}>
          <div className={styles.finLabel}>
            <DollarSign size={15} />
            Gross Revenue
          </div>
          <div className={styles.finValue}>{formatGHS(grossRevenue)}</div>
          <div className={styles.finSub}>Total collected from all orders</div>
        </div>

        <div className={styles.finCard}>
          <div className={styles.finLabel}>
            <Landmark size={15} />
            VAT Collected
          </div>
          <div className={styles.finValue} style={{ color: '#f87171' }}>
            {formatGHS(vatCollected)}
          </div>
          <div className={styles.finSub}>VAT, NHIL, GETFund (remit to GRA)</div>
        </div>

        <div className={styles.finCard}>
          <div className={styles.finLabel}>
            <TrendingUp size={15} />
            Net Revenue
          </div>
          <div className={styles.finValue} style={{ color: '#4ade80' }}>
            {formatGHS(netRevenue)}
          </div>
          <div className={styles.finSub}>After tax liabilities</div>
        </div>
      </div>

      {/* ── Tax compliance notice ───────────────────────── */}
      <div className={styles.section} style={{ marginBottom: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ghana Revenue Authority (GRA) Info</h2>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { label: 'TIN', value: 'C0003849284' },
            { label: 'VAT Registration', value: 'V0013288X' },
            { label: 'Standard VAT Rate', value: '15%' },
            { label: 'NHIL', value: '2.5%' },
            { label: 'GETFund Levy', value: '2.5%' },
            { label: 'COVID-19 Levy', value: '1%' },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {item.label}
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Taxable Transactions ─────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Taxable Transactions</h2>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
            {orders.length} orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No transactions yet</p>
            <p className={styles.emptyText}>
              Completed orders will appear here with full tax breakdowns.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'right' }}>VAT</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(orders as { id: string; created_at: string; status: string; subtotal: number | null; vat_amount: number | null; total: number | null }[]).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className={styles.orderId}>{o.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(o.created_at).toLocaleDateString('en-GH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className={styles.totalCell}>
                      {formatGHS(o.subtotal ?? 0)}
                    </td>
                    <td style={{ textAlign: 'right', color: '#f87171' }} className={styles.totalCell}>
                      {formatGHS(o.vat_amount ?? 0)}
                    </td>
                    <td style={{ textAlign: 'right' }} className={styles.totalCell}>
                      {formatGHS(o.total ?? 0)}
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
