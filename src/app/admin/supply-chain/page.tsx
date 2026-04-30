import Link from 'next/link';
import {
  Truck,
  Package,
  Users,
  Store,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Globe,
} from 'lucide-react';
import {
  fetchSupplyChainStats,
  fetchSuppliers,
  fetchPartners,
  fetchPurchaseOrders,
  fetchInventory,
  fetchDeliveries,
  fetchMarketplaceListings,
} from '@/lib/supply-chain-data';
import styles from '../page.module.css';

function formatGHS(amount: number) {
  return `GHS ${(amount ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: styles.statusDelivered,
    inactive: styles.statusCancelled,
    pending: styles.statusPending,
    draft: styles.statusPending,
    sent: styles.statusProcessing,
    confirmed: styles.statusConfirmed,
    received: styles.statusDelivered,
    shipped: styles.statusShipped,
    in_transit: styles.statusProcessing,
    delivered: styles.statusDelivered,
  };
  return map[status] ?? styles.statusPending;
}

export default async function SupplyChainDashboard() {
  const [
    stats,
    suppliers,
    partners,
    purchaseOrders,
    inventory,
    deliveries,
    listings,
  ] = await Promise.all([
    fetchSupplyChainStats(),
    fetchSuppliers('active'),
    fetchPartners('active'),
    fetchPurchaseOrders(),
    fetchInventory(),
    fetchDeliveries(),
    fetchMarketplaceListings(),
  ]);

  const lowStockItems = inventory.filter(i => i.needs_reorder).slice(0, 5);
  const pendingDeliveries = deliveries.filter(d => 
    ['pending', 'picked', 'packed', 'shipped', 'in_transit', 'out_for_delivery'].includes(d.status)
  ).slice(0, 5);
  const recentPOs = purchaseOrders.slice(0, 5);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Supply Chain Management</h1>
          <p className={styles.pageSubtitle}>E-marketplace, Distribution, Suppliers & Partners</p>
        </div>
      </div>

      {stats.error && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #f59e0b',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          color: '#92400e'
        }}>
          <strong>⚠️ Database Setup Required</strong>
          <p style={{ margin: '8px 0 0' }}>{stats.error}</p>
          <p style={{ margin: '8px 0 0', fontSize: 14 }}>
            Run <code>scripts/supply-chain-schema.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Suppliers</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconBlue}`}>
              <Users size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.activeSuppliers}</div>
          <div className={styles.kpiFooter}>
            of {stats.totalSuppliers} total
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Channel Partners</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconPurple}`}>
              <Store size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.activePartners}</div>
          <div className={styles.kpiFooter}>
            across {stats.activeListings} listings
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Pending POs</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconGold}`}>
              <ShoppingCart size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.pendingPurchaseOrders}</div>
          <div className={styles.kpiFooter}>
            {formatGHS(stats.totalPurchaseOrderValue)} value
          </div>
        </div>

        <div className={`${styles.kpiCard} ${stats.lowStockItems > 0 ? styles.kpiCardAlert : ''}`}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Low Stock Alert</span>
            <span className={`${styles.kpiIcon} ${styles.kpiIconRed}`}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <div className={styles.kpiValue}>{stats.lowStockItems}</div>
          <div className={styles.kpiFooter}>
            items need reordering
          </div>
        </div>
      </div>

      {/* ── Quick Navigation ───────────────────────────────── */}
      <div className={styles.quickLinks} style={{ marginTop: 24 }}>
        <Link href="/admin/supply-chain/suppliers" className={styles.quickCard}>
          <Users size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Suppliers</div>
            <div className={styles.quickSub}>Manage vendors & artisans →</div>
          </div>
        </Link>
        <Link href="/admin/supply-chain/partners" className={styles.quickCard}>
          <Store size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Partners</div>
            <div className={styles.quickSub}>Retail & marketplace partners →</div>
          </div>
        </Link>
        <Link href="/admin/supply-chain/inventory" className={styles.quickCard}>
          <Package size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Inventory</div>
            <div className={styles.quickSub}>Stock levels & locations →</div>
          </div>
        </Link>
        <Link href="/admin/supply-chain/purchase-orders" className={styles.quickCard}>
          <ShoppingCart size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Purchase Orders</div>
            <div className={styles.quickSub}>Procurement & receiving →</div>
          </div>
        </Link>
        <Link href="/admin/supply-chain/deliveries" className={styles.quickCard}>
          <Truck size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>Deliveries</div>
            <div className={styles.quickSub}>Distribution & tracking →</div>
          </div>
        </Link>
        <Link href="/admin/supply-chain/marketplace" className={styles.quickCard}>
          <Globe size={22} className={styles.quickIcon} />
          <div>
            <div className={styles.quickTitle}>E-Marketplace</div>
            <div className={styles.quickSub}>Multi-channel listings →</div>
          </div>
        </Link>
      </div>

      {/* ── Low Stock Alert ────────────────────────────────── */}
      {lowStockItems.length > 0 && (
        <div className={styles.section} style={{ marginTop: 24 }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⚠️ Low Stock Items</h2>
            <Link href="/admin/supply-chain/inventory" className={`btn btn-secondary btn-sm`}>View All</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Location</th>
                  <th style={{ textAlign: 'center' }}>Available</th>
                  <th style={{ textAlign: 'center' }}>Reorder Point</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.customerName}>{item.product_name}</div>
                      <div className={styles.customerEmail}>{item.product_sku}</div>
                    </td>
                    <td>{item.location_name}</td>
                    <td style={{ textAlign: 'center', color: '#f87171', fontWeight: 600 }}>
                      {item.available_quantity}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.reorder_point}</td>
                    <td>
                      <Link 
                        href={`/admin/supply-chain/purchase-orders/new?product=${item.product_id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Create PO
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent Purchase Orders ────────────────────────── */}
      <div className={styles.section} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Purchase Orders</h2>
          <Link href="/admin/supply-chain/purchase-orders" className={`btn btn-secondary btn-sm`}>View All</Link>
        </div>
        {recentPOs.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingCart size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No purchase orders</p>
            <p className={styles.emptyText}>Create purchase orders to manage supplier procurement.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Expected</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <span className={styles.orderId}>{po.po_number}</span>
                    </td>
                    <td>{po.supplier_name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {po.expected_delivery 
                        ? new Date(po.expected_delivery).toLocaleDateString('en-GH')
                        : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={styles.totalCell}>{formatGHS(po.total)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Active Deliveries ───────────────────────────────── */}
      <div className={styles.section} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Active Deliveries</h2>
          <Link href="/admin/supply-chain/deliveries" className={`btn btn-secondary btn-sm`}>View All</Link>
        </div>
        {pendingDeliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No active deliveries</p>
            <p className={styles.emptyText}>Deliveries in progress will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Delivery #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Carrier</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody>
                {pendingDeliveries.map((del) => (
                  <tr key={del.id}>
                    <td>
                      <span className={styles.orderId}>{del.delivery_number}</span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {del.type.replace('_', ' ')}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(del.status)}`}>
                        {del.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{del.carrier || '—'}</td>
                    <td className={styles.dateCell}>
                      {del.recipient_name || del.partner_name || 'Customer'}
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
