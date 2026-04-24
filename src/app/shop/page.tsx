import Link from 'next/link';
import { Suspense } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { FilterList } from './FilterList';
import { fetchProducts } from '@/lib/data';
import styles from './page.module.css';

interface ShopPageProps {
  searchParams: Promise<{ cat?: string, q?: string }>;
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = await props.searchParams;
  const category = searchParams.cat;
  const q = searchParams.q;
  const productsList = await fetchProducts(category, q);

  return (
    <div className={styles.shopLayout}>
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} hide-mobile`}>
        <Suspense fallback={<div>Loading filters...</div>}>
          <FilterList />
        </Suspense>
      </aside>

      <div className={styles.main}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolLeft}>
            <span className={styles.prodCount}>{productsList.length} products</span>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {productsList.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
