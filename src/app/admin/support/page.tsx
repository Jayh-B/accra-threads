import Link from 'next/link';
import { Headphones, ChevronRight } from 'lucide-react';
import { fetchAdminTickets } from '@/lib/admin-data';
import styles from '../page.module.css';

function statusClass(status: string | null) {
  const map: Record<string, string> = {
    open:        styles.statusCancelled,
    'in-progress': styles.statusPending,
    resolved:    styles.statusDelivered,
  };
  return map[status ?? ''] ?? styles.statusPending;
}

function priorityClass(priority: string | null) {
  const map: Record<string, string> = {
    high:   styles.priorityHigh,
    normal: styles.priorityNormal,
    low:    styles.priorityLow,
  };
  return map[priority ?? 'normal'] ?? styles.priorityNormal;
}

export default async function AdminSupport() {
  const tickets = await fetchAdminTickets();

  const open = tickets.filter((t) => t.status === 'open').length;
  const inProgress = tickets.filter((t) => t.status === 'in-progress').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Support Tickets</h1>
          <p className={styles.pageSubtitle}>{tickets.length} total tickets</p>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Open</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
              <Headphones size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#f87171' }}>{open}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>In Progress</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <Headphones size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>{inProgress}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Resolved</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Headphones size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#4ade80' }}>{resolved}</div>
        </div>
      </div>

      {/* ── Ticket List ───────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Tickets</h2>
        </div>

        {tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <Headphones size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No support tickets</p>
            <p className={styles.emptyText}>
              Customer support tickets will appear here when customers submit them from the store.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.customerName}>{t.subject ?? 'No subject'}</div>
                      <div className={styles.customerEmail} style={{ fontFamily: 'monospace' }}>
                        {t.id.slice(0, 8)}…
                      </div>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerInitial}>
                          {(t.customer_name ?? 'G')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>{t.customer_name ?? 'Guest'}</div>
                          {t.customer_email && (
                            <div className={styles.customerEmail}>{t.customer_email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.dateCell} style={{ textTransform: 'capitalize' }}>
                      {t.category ?? '—'}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${priorityClass(t.priority)}`}>
                        {t.priority ?? 'normal'}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(t.status)}`}>
                        {t.status?.replace('-', ' ') ?? 'open'}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(t.created_at).toLocaleDateString('en-GH', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <Link
                        href={`/admin/support/${t.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', gap: 4 }}
                      >
                        View <ChevronRight size={14} />
                      </Link>
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
