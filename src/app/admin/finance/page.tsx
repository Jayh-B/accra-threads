import { DollarSign, Landmark, PieChart } from 'lucide-react';
import { orders } from '@/lib/data';
import styles from '../page.module.css';

export default function AdminFinance() {
  const grossRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  
  // Ghanaian Tax mockup (e.g. standard roughly 21.9% flat combination of VAT+NHIL+GETFund+Covid on some goods)
  // Let's assume an effective blended rate of 15% for simplicity in this mockup dashboard.
  const blendedTaxRate = 0.15;
  const totalTaxCollected = grossRevenue * blendedTaxRate;
  const netRevenue = grossRevenue - totalTaxCollected;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Finance & Tax</h1>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Gross Revenue
            <DollarSign size={16} />
          </div>
          <div className={styles.metricValue}>GHS {grossRevenue.toLocaleString()}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Est. Tax Liabilities (15%)
            <Landmark size={16} />
          </div>
          <div className={styles.metricValue} style={{ color: 'var(--color-accent-red)' }}>
            GHS {totalTaxCollected.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '8px' }}>Includes VAT, NHIL, GETFund</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            Net Revenue
            <PieChart size={16} />
          </div>
          <div className={styles.metricValue} style={{ color: 'var(--color-accent-green)' }}>
            GHS {netRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className={styles.section}>
         <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Taxable Transactions</h2>
         </div>
         <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
             <Landmark size={48} style={{ opacity: 0.2, margin: '0 auto 16px', display: 'block' }} />
             <p>Connect your Ghana Revenue Authority (GRA) integration to view automated compliance reports.</p>
         </div>
      </div>
    </div>
  );
}
