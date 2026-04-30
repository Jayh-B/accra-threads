import Link from 'next/link';
import { Globe, Plus, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { fetchMarketplaceListings } from '@/lib/supply-chain-data';
import styles from '../../page.module.css';

function platformIcon(platform: string) {
  const icons: Record<string, string> = {
    jumia: '🛒',
    amazon: '📦',
    etsy: '🎨',
    shopify: '🛍️',
    instagram: '📸',
    facebook: '👥',
    tiktok: '🎵',
    website: '🌐',
  };
  return icons[platform] || '🌐';
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    active: styles.statusDelivered,
    paused: styles.statusPending,
    ended: styles.statusCancelled,
    sold_out: styles.statusReturned,
  };
  return map[status] ?? styles.statusPending;
}

export default async function MarketplacePage() {
  const listings = await fetchMarketplaceListings();

  const activeListings = listings.filter(l => l.listing_status === 'active');
  const totalSales = listings.reduce((sum, l) => sum + (l.total_sales || 0), 0);
  const monthlySales = listings.reduce((sum, l) => sum + (l.monthly_sales || 0), 0);

  // Group by platform
  const byPlatform = listings.reduce((acc, l) => {
    if (!acc[l.platform]) acc[l.platform] = { count: 0, sales: 0 };
    acc[l.platform].count++;
    acc[l.platform].sales += l.total_sales || 0;
    return acc;
  }, {} as Record<string, { count: number; sales: number }>);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>E-Marketplace</h1>
          <p className={styles.pageSubtitle}>{activeListings.length} active listings • {totalSales} total sales • {monthlySales} this month</p>
        </div>
        <Link href="/admin/supply-chain/marketplace/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Listing
        </Link>
      </div>

      {/* ── Platform Stats ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {Object.entries(byPlatform).map(([platform, data]) => (
          <div key={platform} style={{ 
            padding: 16, 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{platformIcon(platform)}</div>
            <div style={{ fontSize: '0.875rem', textTransform: 'capitalize', marginBottom: 8 }}>
              {platform}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>{data.count} listings</span>
              <span style={{ color: 'var(--color-cowrie)' }}>{data.sales} sales</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Listings Table ────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Listings</h2>
        </div>

        {listings.length === 0 ? (
          <div className={styles.emptyState}>
            <Globe size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No marketplace listings</p>
            <p className={styles.emptyText}>Add products to external marketplaces like Jumia, Amazon, or your own Shopify store.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Product</th>
                  <th>Partner</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Commission</th>
                  <th style={{ textAlign: 'center' }}>Sales</th>
                  <th>Last Sync</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{platformIcon(l.platform)}</span>
                        <span style={{ textTransform: 'capitalize' }}>{l.platform}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.customerName}>{l.product_name}</div>
                      {l.external_id && (
                        <div className={styles.customerEmail}>ID: {l.external_id}</div>
                      )}
                    </td>
                    <td>{l.partner_name || '—'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(l.listing_status)}`}>
                        {l.listing_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {l.price_override ? (
                        <span className={styles.totalCell}>
                          GHS {l.price_override.toLocaleString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-3)' }}>Default</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {l.commission_fee > 0 ? (
                        <span style={{ color: '#fbbf24' }}>{l.commission_fee}%</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <TrendingUp size={14} />
                        {l.total_sales || 0}
                      </div>
                      {l.monthly_sales > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-3)' }}>
                          +{l.monthly_sales} this month
                        </div>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {l.last_synced_at 
                        ? new Date(l.last_synced_at).toLocaleDateString('en-GH')
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── External Links ────────────────────────────────── */}
      <div className={styles.section} style={{ marginTop: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Quick Links</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { name: 'Jumia Seller Center', url: 'https://vendorhub.jumia.com.gh', icon: '🛒' },
            { name: 'Amazon Seller Central', url: 'https://sellercentral.amazon.com', icon: '📦' },
            { name: 'Shopify Admin', url: 'https://admin.shopify.com', icon: '🛍️' },
            { name: 'Etsy Seller', url: 'https://www.etsy.com/your-shop', icon: '🎨' },
          ].map(link => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.06)',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.name}</span>
              <ExternalLink size={14} style={{ color: 'var(--color-text-3)' }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
