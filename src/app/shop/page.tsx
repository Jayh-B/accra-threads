'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, Check } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { products } from '@/lib/data';
import styles from './page.module.css';

export default function ShopPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState('newest');
  
  // Basic mock filtering state
  const [viewState, setViewState] = useState(products);

  return (
    <div className={styles.shopLayout}>
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} hide-mobile`}>
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Category</h3>
          <div className="pill-group">
            <button className="pill selected">All Categories</button>
            <button className="pill">Men</button>
            <button className="pill">Women</button>
            <button className="pill">Accessories</button>
            <button className="pill">Kente Drops</button>
          </div>
        </div>
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Size</h3>
          <div className="pill-group">
            {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => (
              <button key={s} className="pill">{s}</button>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Price Range</h3>
          <input type="range" min="0" max="2000" className={styles.rangeInput} />
          <div className={styles.rangeLabels}>
            <span>GHS 0</span>
            <span>GHS 2,000+</span>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolLeft}>
            <button className={`${styles.filterBtn} hide-desktop`} onClick={() => setFilterOpen(true)}>
              <Filter size={16} /> Filters
            </button>
            <span className={styles.prodCount}>{products.length} products</span>
          </div>
          <div className={styles.toolRight}>
            <div className={styles.sortWrap}>
              <select className={`input-field input-select ${styles.sortSelect}`} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {viewState.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Mobile Drawer */}
      {filterOpen && (
        <>
          <div className="overlay" onClick={() => setFilterOpen(false)} />
          <div className="drawer" style={{ padding: '24px' }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Filters</h2>
            {/* Same filters as sidebar */}
            <div className={styles.filterGroup}>
              <h3 className={styles.filterTitle}>Category</h3>
              <div className="pill-group">
                <button className="pill selected">All Categories</button>
                <button className="pill">Men</button>
                <button className="pill">Women</button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '32px' }} onClick={() => setFilterOpen(false)}>Apply Filters</button>
          </div>
        </>
      )}
    </div>
  );
}
