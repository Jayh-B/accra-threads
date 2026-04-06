import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, Users } from 'lucide-react';
import { orders, products } from '@/lib/data';
import styles from './page.module.css';

export default function AdminDashboard() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const activeProducts = products.length;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard Overview</h1>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Gross Revenue
            <TrendingUp size={16} />
          </div>
          <div className={styles.metricValue}>GHS {totalRevenue.toLocaleString()}</div>
          <div className={`${styles.metricChange} ${styles.positive}`}>
            <ArrowUpRight size={14} /> +12.5% from last month
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Total Orders
            <Package size={16} />
          </div>
          <div className={styles.metricValue}>{totalOrders}</div>
          <div className={`${styles.metricChange} ${styles.positive}`}>
            <ArrowUpRight size={14} /> +4.2% from last month
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Active Products
            <Users size={16} />
          </div>
          <div className={styles.metricValue}>{activeProducts}</div>
          <div className={`${styles.metricChange} ${styles.negative}`}>
            <ArrowDownRight size={14} /> -2 items out of stock
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-primary">
                    <Link href={`/orders/${o.id}/track`}>{o.id}</Link>
                  </td>
                  <td className="text-secondary">{o.date}</td>
                  <td>
                    <span className={`badge ${o.status === 'delivered' ? 'badge-cowrie' : 'badge-new'}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>
                    GHS {o.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
