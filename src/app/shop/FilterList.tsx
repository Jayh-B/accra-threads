'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'kente', label: 'Kente Drops' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'jackets', label: 'Outerwear' }
];

export function FilterList() {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat') || 'all';

  return (
    <div className={styles.filterGroup}>
      <h3 className={styles.filterTitle}>Categories</h3>
      <div className="pill-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
        {categories.map(c => {
          const isActive = currentCat === c.id;
          const href = c.id === 'all' ? '/shop' : `/shop?cat=${c.id}`;
          
          return (
            <Link 
              key={c.id} 
              href={href}
              className={`pill ${isActive ? 'selected' : ''}`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
