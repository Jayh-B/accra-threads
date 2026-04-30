import Link from 'next/link';
import { Users, Plus, Star, MapPin, Phone, Mail } from 'lucide-react';
import { fetchSuppliers } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

function supplierTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    manufacturer: 'Manufacturer',
    fabric_supplier: 'Fabric Supplier',
    artisan: 'Artisan',
    logistics: 'Logistics',
    other: 'Other',
  };
  return labels[type] || type;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: styles.statusDelivered,
    inactive: styles.statusCancelled,
    suspended: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

export default async function SuppliersPage() {
  const suppliers = await fetchSuppliers();

  const activeCount = suppliers.filter(s => s.status === 'active').length;
  const artisanCount = suppliers.filter(s => s.type === 'artisan').length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Suppliers</h1>
          <p className={styles.pageSubtitle}>{suppliers.length} suppliers • {activeCount} active • {artisanCount} artisans</p>
        </div>
        <Link href="/admin/supply-chain/suppliers/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Supplier
        </Link>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className={styles.kpiGrid} style={{ marginBottom: 24 }}>
        {['manufacturer', 'fabric_supplier', 'artisan', 'logistics'].map(type => {
          const count = suppliers.filter(s => s.type === type).length;
          return (
            <div key={type} className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>{supplierTypeLabel(type)}s</span>
              </div>
              <div className={styles.kpiValue}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* ── Suppliers Table ────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Suppliers</h2>
        </div>

        {suppliers.length === 0 ? (
          <div className={styles.emptyState}>
            <Users size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No suppliers</p>
            <p className={styles.emptyText}>Add suppliers to manage your supply chain.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerInitial}>
                          {s.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.customerName}>{s.name}</div>
                          <div className={styles.customerEmail}>{s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {supplierTypeLabel(s.type)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} />
                        {s.city ? `${s.city}, ${s.region || s.country}` : s.country}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>
                        {s.contact_person && <div>{s.contact_person}</div>}
                        {s.phone && (
                          <div style={{ color: 'var(--color-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={12} /> {s.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {s.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
                          <Star size={14} fill="#fbbf24" /> {s.rating}/5
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(s.status)}`}>
                        {s.status}
                      </span>
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
