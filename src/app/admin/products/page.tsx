import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/data';
import styles from '../page.module.css';

export default async function AdminProducts() {
  const productsList = await fetchProducts();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="font-display text-3xl">Product Catalog</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Products</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Stock</th>
                <th style={{ textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {productsList.map(p => {
                const totalStock = p.sizes ? p.sizes.reduce((sum: number, s: any) => sum + s.stock, 0) : 10;
                const status = totalStock > 0 ? 'Active' : 'Out of Stock';
                
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                          <Image src={p.images?.[0] || '/hero-fallback.jpg'} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="40px" />
                        </div>
                        <div>
                          <Link href={`/shop/${p.slug}`} style={{ fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none' }}>
                            {p.name}
                          </Link>
                          <div className="text-secondary font-mono" style={{ fontSize: '0.75rem', marginTop: '4px' }}>{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                    <td>
                      <span className={`badge ${totalStock > 0 ? 'badge-cowrie' : 'badge-new'}`}>
                        {status}
                      </span>
                    </td>
                    <td>{totalStock} units</td>
                    <td className="font-mono" style={{ textAlign: 'right' }}>
                      GHS {p.price?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
