import { BarChart3, Download, Calendar, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { fetchAdminOrders } from '@/lib/admin-data';
import { fetchAllInvoices } from '@/lib/invoice-actions';
import styles from '../../page.module.css';

function formatGHS(amount: number) {
  return `GHS ${((amount || 0) / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
  });
}

export default async function SalesReports() {
  // Fetch data
  const [orders, invoices] = await Promise.all([
    fetchAdminOrders(500),
    fetchAllInvoices(500),
  ]);

  // Calculate daily sales (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailySales = last30Days.map((date) => {
    const dayOrders = orders.filter((o) => o.created_at.startsWith(date));
    const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { date, revenue, orders: dayOrders.length };
  });

  // Calculate monthly sales (last 12 months)
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7); // YYYY-MM
  }).reverse();

  const monthlySales = last12Months.map((month) => {
    const monthOrders = orders.filter((o) => o.created_at.startsWith(month));
    const revenue = monthOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { 
      month, 
      revenue, 
      orders: monthOrders.length,
      label: new Date(month + '-01').toLocaleDateString('en-GH', { month: 'short', year: '2-digit' })
    };
  });

  // Payment method breakdown
  const paymentMethods = invoices.reduce((acc, inv) => {
    const method = inv.payment_method || 'unknown';
    acc[method] = (acc[method] || 0) + (inv.total || 0);
    return acc;
  }, {} as Record<string, number>);

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidOrders = orders.filter((o) => o.payment_status === 'paid').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sales Reports</h1>
          <p className={styles.pageSubtitle}>Detailed sales analytics and performance metrics</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.kpiGrid} style={{ marginBottom: '32px' }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Revenue</span>
            <TrendingUp size={16} />
          </div>
          <div className={styles.kpiValue}>{formatGHS(totalRevenue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Orders</span>
            <ShoppingBag size={16} />
          </div>
          <div className={styles.kpiValue}>{totalOrders}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Avg. Order Value</span>
            <BarChart3 size={16} />
          </div>
          <div className={styles.kpiValue}>{formatGHS(avgOrderValue)}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Paid Orders</span>
            <Users size={16} />
          </div>
          <div className={styles.kpiValue}>{paidOrders}</div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.section} style={{ marginBottom: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Daily Sales (Last 30 Days)</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px' }}>
            {dailySales.map((day, i) => {
              const maxRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);
              const height = day.revenue > 0 ? (day.revenue / maxRevenue) * 100 : 2;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      background: day.revenue > 0 ? '#2c5f2d' : '#e5e7eb',
                      borderRadius: '2px 2px 0 0',
                      minHeight: '4px',
                    }}
                    title={`${formatDate(day.date)}: ${formatGHS(day.revenue)} (${day.orders} orders)`}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'top left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      <div className={styles.section} style={{ marginBottom: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Monthly Sales (Last 12 Months)</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
            {monthlySales.map((month, i) => {
              const maxRevenue = Math.max(...monthlySales.map((m) => m.revenue), 1);
              const height = month.revenue > 0 ? (month.revenue / maxRevenue) * 100 : 5;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${height}%`,
                      background: month.revenue > 0 ? '#4ade80' : '#e5e7eb',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '8px',
                    }}
                    title={`${month.label}: ${formatGHS(month.revenue)} (${month.orders} orders)`}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontWeight: 500,
                    }}
                  >
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Payment Method Breakdown</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {Object.entries(paymentMethods).map(([method, amount]) => {
              const total = Object.values(paymentMethods).reduce((a: number, b) => a + (b as number), 0);
              const percentage = total > 0 ? (((amount as number) / total) * 100).toFixed(1) : '0';
              return (
                <div
                  key={method}
                  style={{
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {method.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                    {formatGHS(amount as number)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2c5f2d' }}>
                    {percentage}% of total
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
