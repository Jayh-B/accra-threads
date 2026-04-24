import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchProducts } from '@/lib/data';
import styles from './page.module.css';

export default async function LookbookPage() {
  const allProducts = await fetchProducts();
  
  // Pick some specific items that have high visual impact
  const heroLook = allProducts.find(p => p.slug === 'boubou-dress-modern') || allProducts[0];
  const statementPiece1 = allProducts.find(p => p.slug === 'kente-kimono-jacket') || allProducts[1];
  const statementPiece2 = allProducts.find(p => p.slug === 'kente-denim-maxi-skirt') || allProducts[2];
  
  const shopLook = allProducts.slice(0, 8);

  return (
    <div className={styles.lookbookWrapper}>
      {/* ── Hero Video/Image Header ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroWrapper}>
          <Image
            src={heroLook?.images[0] || '/hero-fallback.jpg'}
            alt="Lookbook Hero"
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
          />
          <div className={styles.heroOverlay}>
            <div className={styles.heroTextContent}>
              <h1 className={styles.heroTitle}>A TALE OF<br />TWO WORLDS</h1>
              <p className={styles.heroSubtitle}>ACCRA THREADS SS25</p>
            </div>
            <div className={styles.scrollIndicator}>
              <span>Discover</span>
              <div className={styles.scrollLine}></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial Text ── */}
      <section className={styles.editorialIntro}>
        <div className={styles.editorialContainer}>
          <h2 className={styles.editorialHeading}>
            Heritage Redefined.<br />
            Woven for the Global Streets.
          </h2>
          <p className={styles.editorialParagraph}>
            This collection bridges the gap between traditional Ghanaian craftsmanship and modern streetwear silhouettes. 
            We took the vibrant energy of Makola market, the regal history of Kente, and the architectural lines of modern Accra 
            to create garments that demand attention.
          </p>
        </div>
      </section>

      {/* ── Asymmetrical Grid Feature ── */}
      <section className={styles.featureGridSection}>
        <div className={styles.featureGrid}>
          <div className={`${styles.gridItem} ${styles.gridItemLarge}`}>
            <Image 
              src={statementPiece1?.images[0] || '/hero-fallback.jpg'} 
              alt={statementPiece1?.name || 'Look 1'} 
              fill 
              className={styles.gridImage} 
            />
            <Link href={`/shop/${statementPiece1?.slug}`} className={styles.gridLink}>
              <span>Shop {statementPiece1?.name}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className={styles.gridItemText}>
            <h3 className={styles.gridItemHeading}>The Signature Look</h3>
            <p className={styles.gridItemDesc}>
              {statementPiece1?.description} Bold, unapologetic, and crafted with meticulous attention to heritage details.
            </p>
            <Link href="/shop" className="btn btn-outline">Explore the Collection</Link>
          </div>

          <div className={`${styles.gridItem} ${styles.gridItemPortrait}`}>
             <Image 
              src={statementPiece2?.images[0] || '/hero-fallback.jpg'} 
              alt={statementPiece2?.name || 'Look 2'} 
              fill 
              className={styles.gridImage} 
            />
            <Link href={`/shop/${statementPiece2?.slug}`} className={styles.gridLink}>
              <span>Shop {statementPiece2?.name}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Parallax Divider ── */}
      <section className={styles.parallaxBanner}>
        <Image
          src={allProducts.find(p => p.slug === 'accra-heat-oversized-hoodie')?.images[0] || '/hero-fallback.jpg'}
          alt="Parallax Banner"
          fill
          className={styles.parallaxImage}
        />
        <div className={styles.parallaxOverlay}>
          <p className={styles.parallaxText}>"NO RULES. JUST HERITAGE."</p>
        </div>
      </section>

      {/* ── The Pieces Carousel / Shop The Look ── */}
      <section className={styles.shopTheLookSection}>
        <div className={styles.shopTheLookHeader}>
          <h2>Key Silhouettes</h2>
          <Link href="/shop" className={styles.shopAllLink}>View All <ArrowRight size={16} /></Link>
        </div>
        
        <div className={styles.shopCarousel}>
          {shopLook.map((item) => (
            <Link key={item.id} href={`/shop/${item.slug}`} className={styles.carouselItem}>
              <div className={styles.carouselImageWrap}>
                <Image 
                  src={item.images[0]} 
                  alt={item.name} 
                  fill 
                  className={styles.carouselImage} 
                />
              </div>
              <div className={styles.carouselMeta}>
                <p className={styles.carouselTitle}>{item.name}</p>
                <p className={styles.carouselPrice}>GHS {item.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
