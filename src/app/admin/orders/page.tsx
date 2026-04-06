import Link from 'next/link';
import { orders } from '@/lib/data';
import styles from '../page.module.css';

export default function AdminOrders() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Order Management</h1>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Orders</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-primary">
                     <Link href={`/orders/${o.id}/track`}>{o.id}</Link>
                  </td>
                  <td className="text-secondary">{o.date}</td>
                  <td>{o.items.length} items</td>
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
