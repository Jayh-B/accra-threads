import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, lookbookItems } from '@/lib/data';
import styles from './page.module.css';

/* ── Helper data ─────────────────────────────────────────── */

const filmStrip = [
  { img: '/products/accra-fc-streetwear-black-jersey.jpg',  caption: 'Street Culture' },
  { img: '/products/ghana-black-stars-heritage-jersey.jpg', caption: 'Heritage' },
  { img: '/products/stadium-bomber.jpg',                    caption: 'Stadium Nights' },
  { img: '/products/ghanaian-retro-track-suit-top.jpg',     caption: 'Retro Revival' },
  { img: '/products/accra-skyline-crewneck-sweatshirt.jpg', caption: 'City Living' },
  { img: '/products/nkrumah-tribute-graphic-tee.png',       caption: 'Legacy' },
  { img: '/products/black-stars-away-kit-hoodie.png',       caption: 'Away Kit' },
  { img: '/products/blue-adinkra-sports-polo.png',          caption: 'Crafted Details' },
];

const editorials = [
  {
    img: '/products/stadium-bomber.jpg',
    tag: 'Feature Story',
    title: 'Asafo Warriors — The Stadium Bomber',
    desc: 'Heritage stitched into every seam.',
  },
  {
    img: '/products/ghana-black-stars-heritage-jersey.jpg',
    tag: 'Heritage Collection',
    title: 'Black Stars Reborn',
    desc: 'Vintage styling. Modern soul.',
  },
  {
    img: '/products/accra-skyline-crewneck-sweatshirt.jpg',
    tag: 'City Series',
    title: 'Osu Nights',
    desc: 'Wearing the skyline, owning the night.',
  },
];

const collections = [
  {
    name: 'Match Day',
    desc: 'Jerseys and hoodies built for the stands and the streets.',
    img: '/products/accra-fc-streetwear-black-jersey.jpg',
    href: '/shop?cat=men',
    num: '01',
    badge: 'New Arrivals',
  },
  {
    name: 'Heritage Drops',
    desc: 'Kente-inspired pieces carrying the weight of Ghanaian history.',
    img: '/products/stadium-bomber.jpg',
    href: '/shop?cat=kente',
    num: '02',
    badge: 'Kente',
  },
  {
    name: 'Pan-African Active',
    desc: 'Built for movement. Designed for Accra\'s heat.',
    img: '/products/ghanaian-retro-track-suit-top.jpg',
    href: '/shop?cat=men',
    num: '03',
    badge: 'Active Wear',
  },
];

/* Grab 8 products to populate "Shop the Look" */
const shopLook = products.slice(0, 8);

/* ── Page ────────────────────────────────────────────────── */

export default function LookbookPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/products/stadium-bomber.jpg"
            alt="Accra Threads Lookbook SS25"
            fill
            priority
            className={styles.heroImg}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.heroEyebrow}>Accra Threads — SS25</p>
          <h1 className={styles.heroTitle}>
            Lookbook<br /><em>SS25</em>
          </h1>
          <div className={styles.heroMeta}>
            <span className={styles.heroSeason}>Spring / Summer 2025</span>
            <div className={styles.heroDivider} />
            <span className={styles.heroSeason}>14 Pieces · 3 Collections</span>
            <div className={styles.heroDivider} />
            <span className={styles.heroScroll}>
              <span className={styles.scrollDot} />
              Scroll to explore
            </span>
          </div>
        </div>
      </section>

      {/* ── Film-strip ── */}
      <section className={styles.filmStrip}>
        <div className={styles.stripInner}>
          {/* duplicate for infinite scroll */}
          {[...filmStrip, ...filmStrip].map((f, i) => (
            <div key={i} className={styles.stripFrame}>
              <Image src={f.img} alt={f.caption} fill className={styles.stripImg} sizes="240px" />
              <div className={styles.stripOverlay}>
                <span className={styles.stripCaption}>{f.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Editorial Grid ── */}
      <section className={styles.editorialSection}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Editorial</h2>
              <p className="section-subtitle">Stories from the city&apos;s streets.</p>
            </div>
            <Link href="/shop" className="section-link">Shop All</Link>
          </div>
          <div className={styles.editorialGrid}>
            {editorials.map((e, i) => (
              <div key={i} className={styles.editorialCell}>
                <Image src={e.img} alt={e.title} fill className={styles.editorialImg} sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className={styles.editorialOverlay}>
                  <p className={styles.editorialTag}>{e.tag}</p>
                  <h3 className={styles.editorialTitle}>{e.title}</h3>
                  <span className={styles.editorialCta}>
                    Shop This Look
                    <span className={styles.ctaArrow} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story / Brand Ethos ── */}
      <section className={styles.storySection}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <p className={styles.storyEyebrow}>The Accra Narrative</p>
              <h2 className={styles.storyTitle}>
                Proudly Ghanaian.<br />
                Globally Worn.
              </h2>
              <p className={styles.storyBody}>
                Everything we create begins in Accra — on the terraces of 37, in the traffic
                of Kwame Nkrumah Avenue, under the lights of Osu Oxford Street at midnight.
                Our designs are deeply rooted in West African heritage yet built for the
                global stage. From the Adinkra symbols on our polos to the Kente-woven trim
                on our bombers, every piece tells a story of identity, resilience, and
                unapologetic pride.
              </p>
              <div className={styles.storyStats}>
                <div>
                  <div className={styles.statNum}>14</div>
                  <div className={styles.statLabel}>SS25 Pieces</div>
                </div>
                <div>
                  <div className={styles.statNum}>3</div>
                  <div className={styles.statLabel}>Collections</div>
                </div>
                <div>
                  <div className={styles.statNum}>100%</div>
                  <div className={styles.statLabel}>Accra-born</div>
                </div>
              </div>
            </div>
            <div className={styles.storyImageStack}>
              <div className={styles.storyImgMain}>
                <Image
                  src="/products/nkrumah-tribute-graphic-tee.png"
                  alt="Nkrumah Tribute Tee"
                  fill
                  className={styles.heroImg}
                  sizes="(max-width: 1024px) 100vw, 35vw"
                />
              </div>
              <div className={styles.storyImgAccent}>
                <Image
                  src="/products/accra-fc-streetwear-black-jersey.jpg"
                  alt="Accra FC Jersey"
                  fill
                  className={styles.heroImg}
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collections ── */}
      <section className={styles.collectionsSection}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Collections</h2>
              <p className="section-subtitle">Three chapters. One city.</p>
            </div>
          </div>
          <div className={styles.collectionsGrid}>
            {collections.map((c) => (
              <Link key={c.num} href={c.href} className={styles.collectionCard}>
                <Image src={c.img || ''} alt={c.name} fill className={styles.collectionImg} sizes="(max-width: 768px) 100vw, 33vw" />
                <div className={styles.collectionGradient} />
                <div className={styles.collectionOverlay}>
                  <span className={styles.collectionNum}>{c.num}</span>
                  <div className={styles.collectionBottom}>
                    <span className="badge badge-cowrie" style={{ marginBottom: 12 }}>{c.badge}</span>
                    <h3 className={styles.collectionName}>{c.name}</h3>
                    <p className={styles.collectionDesc}>{c.desc}</p>
                    <span className={styles.collectionLink}>
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quote Banner ── */}
      <section className={styles.quoteBanner}>
        <div className="container">
          <blockquote className={styles.quoteText}>
            &ldquo;Wear the City. Own Your Story.&rdquo;
          </blockquote>
          <p className={styles.quoteAttr}>— Accra Threads, founded in Osu 2020</p>
        </div>
      </section>

      {/* ── Shop the Look ── */}
      <section className={styles.shopSection}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop the Look</h2>
              <p className="section-subtitle">Every piece from SS25, ready to wear.</p>
            </div>
            <Link href="/shop" className="section-link">View Full Shop</Link>
          </div>
          <div className={styles.shopGrid}>
            {shopLook.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className={styles.shopItem}>
                <div className={styles.shopItemImgWrap}>
                  <Image src={p.images[0]} alt={p.name} fill className={styles.shopItemImg} sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className={styles.shopItemOverlay}>
                    <span className={styles.shopItemBtn}>Quick Shop</span>
                  </div>
                </div>
                <div className={styles.shopItemInfo}>
                  <p className={styles.shopItemName}>{p.name}</p>
                  <p className={styles.shopItemPrice}>GHS {p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>
            Ready to<br /><em>Wear the City?</em>
          </h2>
          <p className={styles.ctaSub}>
            Join thousands of style-conscious Ghanaians wearing Accra Threads — from Osu to the world.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/shop" className="btn btn-primary btn-lg">Shop SS25</Link>
            <Link href="/account" className="btn btn-ghost btn-lg">Join &amp; Earn Points</Link>
          </div>
        </div>
      </section>
    </>
  );
}
