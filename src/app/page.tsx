import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { products, categories, lookbookItems } from '@/lib/data';
import styles from './page.module.css';

export default function Home() {
  const newArrivals = products.slice(0, 4);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src="/hero_main.png" alt="Accra Threads Hero" fill priority className={styles.heroImg} sizes="100vw" />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Wear the City.</h1>
          <p className={styles.heroSub}>Contemporary streetwear rooted in Kente culture.</p>
          <div className={styles.heroActions}>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop New Arrivals</Link>
            <Link href="/lookbook" className="btn btn-ghost btn-lg">Explore Lookbook</Link>
          </div>
        </div>
      </section>

      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-item">NEW ARRIVALS ✦ FREE DELIVERY ACCRA ✦ COWRIE POINTS ✦ KENTE DROPS ✦</span>
          ))}
        </div>
      </div>

      <section className="section bg-dark">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Drops</h2>
              <p className="section-subtitle">The freshest pieces in the city. Grab them before they're gone.</p>
            </div>
            <Link href="/shop" className="section-link">View All</Link>
          </div>
          <div className={styles.productGrid}>
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-surface">
        <div className="container">
          <div className={styles.catGrid}>
            {categories.map((c, i) => (
              <Link key={c.id} href={c.href} className={`${styles.catCard} ${i === 3 ? styles.catCardTall : ''}`}>
                <Image src={c.image} alt={c.label} fill sizes="(max-width: 640px) 100vw, 50vw" className={styles.catImg} />
                <div className={styles.catOverlay}>
                  <h3 className={styles.catTitle}>{c.label}</h3>
                  <span className={styles.catLink}>Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-dark">
        <div className="container" style={{ paddingRight: 0 }}>
          <div className="section-header" style={{ paddingRight: 'var(--space-20)' }}>
            <div>
              <h2 className="section-title">Lookbook SS25</h2>
            </div>
            <Link href="/lookbook" className="section-link hide-mobile">Explore Full Story</Link>
          </div>
          <div className="h-scroll">
            {lookbookItems.map(item => (
              <div key={item.id} className={styles.lookbookCard}>
                <Image src={item.image} alt={item.title} fill sizes="300px" className={styles.lbImg} />
                <div className={styles.lbContent}>
                  <span className="badge" style={{ backgroundColor: item.color, color: '#fff' }}>{item.label}</span>
                  <h3 className={styles.lbTitle}>{item.title}</h3>
                </div>
              </div>
            ))}
            <div style={{ width: 24, flexShrink: 0 }} />
          </div>
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className="container">
          <div className={styles.aiGrid}>
            <div className={styles.aiContent}>
              <span className="badge badge-feat" style={{ color: 'var(--color-primary)' }}>Powered by Claude</span>
              <h2 className="section-title" style={{ marginTop: '16px' }}>Meet Your AI Stylist</h2>
              <p className={styles.aiText}>
                Not sure what to wear to Detty December? Need sizing advice? Chat with our Accra styling assistant for personalized recommendations based on our current stock and your vibe.
              </p>
              <Link href="/support" className="btn btn-secondary btn-md" style={{ marginTop: '24px' }}>Start Styling Session</Link>
            </div>
            <div className={styles.aiPreview}>
              <div className="chat-bubble chat-bubble--user" style={{ animationDelay: '0s' }}>I need an outfit for a wedding in Osu this weekend.</div>
              <div className="typing-indicator" style={{ marginTop: '16px', marginLeft: 'auto', marginRight: '60px' }}>
                <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.loyaltySection}>
        <div className="container text-center">
          <div className={styles.loyaltyInner}>
            <span className={styles.loyaltyIcon}>🐚</span>
            <h2 className="section-title" style={{ margin: '16px 0 8px' }}>Cowrie Points</h2>
            <p className={styles.loyaltySub}>Earn with every purchase. Redeem for exclusive drops.</p>
            <div className={styles.loyaltyBadges}>
              <span className="badge badge-cowrie">Join Now for 50 Points</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
