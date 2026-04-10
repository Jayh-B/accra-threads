import Link from 'next/link';
import { Suspense } from 'react';
import ProductCard from '@/components/ui/ProductCard';
// import { FilterList } from '@/components/shop/FilterList';
import { fetchProducts } from '@/lib/data';
import styles from './page.module.css';

interface ShopPageProps {
  searchParams: { cat?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const category = searchParams.cat;
  const productsList = await fetchProducts(category);

  return (
    <div className={styles.shopLayout}>
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} hide-mobile`}>
        {/* <FilterList /> */}
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
