import Link from 'next/link';
import { Store, Plus, Globe, TrendingUp, Target } from 'lucide-react';
import { fetchPartners } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

function partnerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    retail_boutique: 'Retail Boutique',
    online_marketplace: 'Online Marketplace',
    international_distributor: 'Int\'l Distributor',
    department_store: 'Department Store',
    popup_store: 'Pop-up Store',
  };
  return labels[type] || type;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: styles.statusDelivered,
    inactive: styles.statusCancelled,
    pending: styles.statusPending,
    suspended: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

function formatCurrency(amount: number): string {
  return `GHS ${(amount || 0).toLocaleString()}`;
}

export default async function PartnersPage() {
  const partners = await fetchPartners();

  const activeCount = partners.filter(p => p.status === 'active').length;
  const marketplaceCount = partners.filter(p => p.type === 'online_marketplace').length;
  const totalSales = partners.reduce((sum, p) => sum + (p.current_sales || 0), 0);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Channel Partners</h1>
          <p className={styles.pageSubtitle}>{partners.length} partners • {activeCount} active • {formatCurrency(totalSales)} total sales</p>
        </div>
        <Link href="/admin/supply-chain/partners/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Partner
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        {['online_marketplace', 'retail_boutique', 'international_distributor', 'department_store'].map(type => {
          const count = partners.filter(p => p.type === type).length;
          return (
            <div key={type} className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>{partnerTypeLabel(type)}s</span>
              </div>
              <div className={styles.kpiValue}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* ── Partners Table ────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Partners</h2>
        </div>

        {partners.length === 0 ? (
          <div className={styles.emptyState}>
            <Store size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No partners</p>
            <p className={styles.emptyText}>Add retail partners and marketplace integrations.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Commission</th>
                  <th>Sales Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerInitial}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>{p.name}</div>
                          <div className={styles.customerEmail}>{p.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>{partnerTypeLabel(p.type)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Globe size={14} />
                        {p.city ? `${p.city}, ${p.country}` : p.country}
                      </div>
                      {p.region_served && p.region_served.length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', marginTop: 2 }}>
                          Serves: {p.region_served.slice(0, 2).join(', ')}{p.region_served.length > 2 ? '...' : ''}
                        </div>
                      )}
                    </td>
                    <td>
                      {p.commission_rate > 0 ? (
                        <span style={{ color: '#fbbf24' }}>{p.commission_rate}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {p.sales_target > 0 ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                            <span>{formatCurrency(p.current_sales || 0)}</span>
                            <span>{formatCurrency(p.sales_target)}</span>
                          </div>
                          <div style={{ 
                            height: 6, 
                            background: 'rgba(255,255,255,0.1)', 
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(100, ((p.current_sales || 0) / p.sales_target) * 100)}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--color-primary), var(--color-cowrie))',
                              borderRadius: 3,
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-3)' }}>No target set</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(p.status)}`}>
                        {p.status}
                      </span>
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
