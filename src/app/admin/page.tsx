import Link from 'next/link';
import {
  ArrowUpRight,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Headphones,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import { fetchAdminStats, fetchAdminOrders, type AdminOrder } from '@/lib/admin-data';
import styles from './page.module.css';

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

export default async function AdminDashboard() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    openTickets: 0,
  };
  let recentOrders: AdminOrder[] = [];

  try {
    const [statsResult, ordersResult] = await Promise.all([
      fetchAdminStats(),
      fetchAdminOrders(8),
    ]);
    stats = statsResult;
    recentOrders = ordersResult;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Continue with default values
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Overview of your store performance</p>
        </div>
        <Link href="/admin/orders" className={`btn btn-primary btn-sm`}>View All Orders</Link>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Gross Revenue</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <DollarSign size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{formatGHS(stats.totalRevenue)}</div>
          <div className={styles.kpiFooter}>
            <TrendingUp size={13} />
            All time
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Orders</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Package size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.totalOrders.toLocaleString()}</div>
          <div className={styles.kpiFooter}>
            <ShoppingBag size={13} />
            Lifetime orders
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Customers</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
              <Users size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.totalCustomers.toLocaleString()}</div>
          <div className={styles.kpiFooter}>
            <ArrowUpRight size={13} />
            Registered accounts
          </div>
        </div>

        <div className={`${styles.kpiCard} ${stats.openTickets > 0 ? styles.kpiCardAlert : ''}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Open Tickets</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
              <Headphones size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.openTickets}</div>
          <div className={styles.kpiFooter}>
            <Clock size={13} />
            <Link href="/admin/support" className={styles.kpiLink}>View support →</Link>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className={`btn btn-secondary btn-sm`}>View All</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No orders yet</p>
            <p className={styles.emptyText}>Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className={styles.orderId}>
                        {o.id.slice(0, 8).toUpperCase()}
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
                    <td className={styles.itemCount}>{o.item_count} item{o.item_count !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(o.status)}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.totalCell}>{formatGHS(o.total ?? 0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Quick Links ───────────────────────────────────── */}
      <div className={styles.quickLinks}>
        <Link href="/admin/products" className={styles.quickCard}>
          <ShoppingBag size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>{stats.totalProducts} Active Products</div>
            <div className={styles.quickSub}>Manage catalog →</div>
          </div>
        </Link>
        <Link href="/admin/customers" className={styles.quickCard}>
          <Users size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>{stats.totalCustomers} Customers</div>
            <div className={styles.quickSub}>View CRM →</div>
          </div>
        </Link>
        <Link href="/admin/finance" className={styles.quickCard}>
          <DollarSign size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Finance & Tax</div>
            <div className={styles.quickSub}>View revenue report →</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
