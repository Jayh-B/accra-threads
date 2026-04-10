import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { fetchFeaturedProducts } from '@/lib/data';
import { categories, lookbookItems } from '@/lib/data';
import styles from './page.module.css';

export default async function Home() {
  const newArrivals = await fetchFeaturedProducts();


  return (
    <>
      <section className={styles.promoBanner}>
        <div className={styles.promoBg}>
          <Image src="/hero_main.png" alt="Accra Threads New Collection" fill priority className={styles.promoImg} sizes="100vw" />
          <div className={styles.promoOverlay} />
        </div>
        <div className={`container ${styles.promoContent}`}>
          <h1 className={styles.promoTitle}>SS25 COLLECTION</h1>
          <p className={styles.promoSub}>Up to 50% Off Selected Styles + Free Delivery across Accra.</p>
          <div className={styles.promoActions}>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
            <Link href="/shop?cat=sale" className="btn btn-ghost btn-lg">View Sale</Link>
          </div>
        </div>
      </section>

      <section className={styles.quickLinks}>
        <div className="container" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
          {categories.map((c: any) => (
            <Link key={c.id} href={c.href} className={styles.circleCat}>
              <div className={styles.circleCatImgWrap}>
                <Image src={c.image} alt={c.label} fill sizes="120px" className={styles.circleCatImg} />
              </div>
              <span className={styles.circleCatLabel}>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-item">NEW ARRIVALS ✦ FREE DELIVERY ACCRA ✦ COWRIE POINTS ✦ KENTE DROPS ✦</span>
          ))}
        </div>
      </div>

      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Flash Sale / Trending</h2>
              <p className="section-subtitle">Snag the latest pieces before they sell out.</p>
            </div>
            <Link href="/shop" className="section-link">View All</Link>
          </div>
          <div className={styles.productGrid}>
            {newArrivals.slice(0, 5).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className={styles.catGrid}>
            {categories.map((c: any, i: number) => (
              <Link key={c.id} href={c.href} className={styles.catCard}>
                <Image src={c.image} alt={c.label} fill sizes="(max-width: 640px) 100vw, 50vw" className={styles.catImg} />
                <div className={styles.catOverlay}>
                  <h3 className={styles.catTitle}>{c.label}</h3>
                  <span className="btn btn-primary btn-sm">Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container" style={{ paddingRight: 0 }}>
          <div className="section-header" style={{ paddingRight: 'var(--space-20)' }}>
            <div>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            <Link href="/shop" className="section-link hide-mobile">See All</Link>
          </div>
          <div className="h-scroll">
            {newArrivals.slice(5).map(product => (
              <div key={product.id} className={styles.lookbookCard}>
                <ProductCard product={product} />
              </div>
            ))}
            <div style={{ width: 24, flexShrink: 0 }} />
          </div>
        </div>
      </section>

      <section className={styles.loyaltySection}>
        <div className="container text-center">
          <div className={styles.loyaltyInner}>
            <span className={styles.loyaltyIcon}>✨</span>
            <h2 className="section-title" style={{ margin: '16px 0 8px' }}>Join Rewards</h2>
            <p className={styles.loyaltySub}>Sign up now and get 20% off your first order!</p>
            <div className={styles.loyaltyBadges}>
              <Link href="/account" className="btn btn-primary btn-md">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
