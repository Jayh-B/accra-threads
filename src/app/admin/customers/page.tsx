import { Users } from 'lucide-react';
import { fetchAdminCustomers } from '@/lib/admin-data';
import styles from '../page.module.css';

function formatGHS(amount: number) {
  return `GHS ${(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

function roleBadge(role: string | null) {
  if (role === 'admin') return { label: 'Admin', cls: styles.statusShipped };
  if (role === 'supplier') return { label: 'Supplier', cls: styles.statusProcessing };
  return { label: 'Customer', cls: styles.statusDelivered };
}

export default async function AdminCustomers() {
  const customers = await fetchAdminCustomers();

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>CRM & Customers</h1>
          <p className={styles.pageSubtitle}>{customers.length} registered accounts</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Customer Directory</h2>
        </div>

        {customers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No customers yet</p>
            <p className={styles.emptyText}>
              Registered users will appear here once people sign up on the store.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Cowrie Points 🐚</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Lifetime Spend</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const badge = roleBadge(c.role);
                  const name = c.full_name ?? c.email?.split('@')[0] ?? 'Unknown';
                  const initial = name[0].toUpperCase();
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className={styles.customerCell}>
                          <div className={styles.customerInitial}>{initial}</div>
                          <div>
                            <div className={styles.customerName}>{name}</div>
                            <div className={styles.customerEmail} style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                              {c.id.slice(0, 8)}…
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.dateCell}>{c.email ?? '—'}</td>
                      <td className={styles.dateCell}>
                        {new Date(c.created_at).toLocaleDateString('en-GH', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className={styles.itemCount}>{c.order_count}</td>
                      <td>
                        <span style={{ color: '#d4a017', fontWeight: 600 }}>
                          {(c.loyalty_points ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={styles.totalCell}>{formatGHS(c.total_spent)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
