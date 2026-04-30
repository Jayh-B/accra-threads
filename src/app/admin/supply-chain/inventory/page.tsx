import Link from 'next/link';
import { Package, AlertTriangle, CheckCircle, Truck, Store } from 'lucide-react';
import { fetchInventory } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

export default async function InventoryPage() {
  const inventory = await fetchInventory();

  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const totalAvailable = inventory.reduce((sum, i) => sum + i.available_quantity, 0);
  const totalReserved = inventory.reduce((sum, i) => sum + i.reserved_quantity, 0);
  const lowStockCount = inventory.filter(i => i.needs_reorder).length;

  const byLocation = inventory.reduce((acc, item) => {
    const key = item.location_type;
    if (!acc[key]) acc[key] = { count: 0, value: 0 };
    acc[key].count += item.quantity;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Inventory Management</h1>
          <p className={styles.pageSubtitle}>{inventory.length} SKUs • {totalItems} total units • {lowStockCount} low stock</p>
        </div>
        <Link href="/admin/supply-chain/inventory/adjust" className="btn btn-primary btn-sm">
          Stock Adjustment
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Units</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Package size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{totalItems.toLocaleString()}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Available</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGreen}`}>
              <CheckCircle size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#4ade80' }}>
            {totalAvailable.toLocaleString()}
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Reserved</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <Truck size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#fbbf24' }}>
            {totalReserved.toLocaleString()}
          </div>
        </div>
        <div className={`${styles.kpiCard} ${lowStockCount > 0 ? styles.kpiCardAlert : ''}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Low Stock</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className={styles.kpiValue} style={{ color: lowStockCount > 0 ? '#f87171' : undefined }}>
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* ── Location Breakdown ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Object.entries(byLocation).map(([location, data]) => (
          <div key={location} style={{ 
            padding: 16, 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {location === 'warehouse' && <Package size={16} />}
              {location === 'partner_store' && <Store size={16} />}
              {location === 'supplier' && <Truck size={16} />}
              <span style={{ textTransform: 'capitalize' }}>{location.replace('_', ' ')}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{data.count.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>units</div>
          </div>
        ))}
      </div>

      {/* ── Inventory Table ───────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Stock Levels</h2>
        </div>

        {inventory.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No inventory</p>
            <p className={styles.emptyText}>Inventory will appear when products are stocked.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'center' }}>On Hand</th>
                  <th style={{ textAlign: 'center' }}>Reserved</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  <th style={{ textAlign: 'center' }}>Reorder Pt</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className={item.needs_reorder ? styles.rowAlert : undefined}>
                    <td>
                      <div className={styles.customerName}>{item.product_name}</div>
                      <div className={styles.customerEmail}>{item.product_sku}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.location_type === 'warehouse' && <Package size={14} />}
                        {item.location_type === 'partner_store' && <Store size={14} />}
                        {item.location_type === 'supplier' && <Truck size={14} />}
                        {item.location_type === 'in_transit' && <Truck size={14} />}
                        <span>{item.location_name}</span>
                      </div>
                      {item.bin_location && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                          Bin: {item.bin_location}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'center', color: '#fbbf24' }}>{item.reserved_quantity}</td>
                    <td style={{ 
                      textAlign: 'center', 
                      fontWeight: 600,
                      color: item.available_quantity <= item.reorder_point ? '#f87171' : '#4ade80'
                    }}>
                      {item.available_quantity}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.reorder_point}</td>
                    <td>
                      {item.needs_reorder ? (
                        <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>
                          <AlertTriangle size={12} style={{ marginRight: 4 }} />
                          Reorder
                        </span>
                      ) : item.reserved_quantity > 0 ? (
                        <span className={`${styles.statusBadge} ${styles.statusProcessing}`}>
                          Reserved
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.statusDelivered}`}>
                          OK
                        </span>
                      )}
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
