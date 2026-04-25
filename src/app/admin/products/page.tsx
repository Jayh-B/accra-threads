import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { fetchProducts } from '@/lib/data';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import styles from '../page.module.css';

async function togglePublished(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const current = formData.get('current') === 'true';
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  await db.from('products').update({ published: !current }).eq('id', id);
  revalidatePath('/admin/products');
}

async function toggleFeatured(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const current = formData.get('current') === 'true';
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  await db.from('products').update({ featured: !current }).eq('id', id);
  revalidatePath('/admin/products');
}

export default async function AdminProducts() {
  // Fetch all products including unpublished
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const { data: rawProducts } = await db
    .from('products')
    .select('id, name, slug, category, price, images, published, featured, created_at')
    .order('created_at', { ascending: false });

  const productsList = rawProducts ?? [];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Product Catalog</h1>
          <p className={styles.pageSubtitle}>{productsList.length} products total</p>
        </div>
        <a
          href="https://supabase.com/dashboard/project/jmdqojuxsixtxbavmrwq/editor"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          + Add Product (Supabase)
        </a>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Products</h2>
        </div>

        {productsList.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={40} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No products</p>
            <p className={styles.emptyText}>Add products via the Supabase dashboard.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'center' }}>Published</th>
                  <th style={{ textAlign: 'center' }}>Featured</th>
                  <th>Preview</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((p: {
                  id: string;
                  name: string;
                  slug: string;
                  category: string | null;
                  price: number;
                  images: string[] | null;
                  published: boolean | null;
                  featured: boolean | null;
                  created_at: string;
                }) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.customerCell}>
                        <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                          {p.images?.[0] && (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              sizes="44px"
                            />
                          )}
                        </div>
                        <div>
                          <div className={styles.customerName}>{p.name}</div>
                          <div className={styles.customerEmail} style={{ fontFamily: 'monospace' }}>{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.dateCell} style={{ textTransform: 'capitalize' }}>
                      {p.category ?? '—'}
                    </td>
                    <td>
                      <span className={styles.totalCell}>GHS {(p.price ?? 0).toLocaleString()}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <form action={togglePublished}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="current" value={String(p.published ?? false)} />
                        <button type="submit" className={styles.toggle} title="Toggle published">
                          <span className={`${styles.statusBadge} ${p.published ? styles.statusDelivered : styles.statusCancelled}`}>
                            {p.published ? 'Live' : 'Draft'}
                          </span>
                        </button>
                      </form>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <form action={toggleFeatured}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="current" value={String(p.featured ?? false)} />
                        <button type="submit" className={styles.toggle} title="Toggle featured">
                          <span className={`${styles.statusBadge} ${p.featured ? styles.statusShipped : styles.statusPending}`}>
                            {p.featured ? '⭐ Featured' : 'Standard'}
                          </span>
                        </button>
                      </form>
                    </td>
                    <td>
                      <Link
                        href={`/shop/${p.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        View →
                      </Link>
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
