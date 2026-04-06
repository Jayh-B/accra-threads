import styles from '../page.module.css';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Kwame Osei', email: 'kwame.osei@example.com', ltv: 3450, points: 450, status: 'VIP' },
  { id: 'CUST-002', name: 'Ama Mensah', email: 'ama.m@example.com', ltv: 1200, points: 120, status: 'Active' },
  { id: 'CUST-003', name: 'David Appiah', email: 'd.appiah@example.com', ltv: 850, points: 85, status: 'Active' },
  { id: 'CUST-004', name: 'Grace Addo', email: 'grace.addo@example.com', ltv: 0, points: 50, status: 'New' },
];

export default function AdminCustomers() {
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">CRM & Customers</h1>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Customer Directory</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Cowrie Points</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Lifetime Value (LTV)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div className="text-secondary font-mono" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{c.id}</div>
                  </td>
                  <td className="text-secondary">{c.email}</td>
                  <td>{c.points} 🐚</td>
                  <td>
                     <span className={`badge ${c.status === 'VIP' ? 'badge-cowrie' : 'badge-new'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="font-mono" style={{ textAlign: 'right' }}>
                    GHS {c.ltv.toLocaleString()}
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
