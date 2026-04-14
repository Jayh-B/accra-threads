import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';

export const metadata = {
  title: 'Accra Threads — Wear the City. Own Your Story.',
  description:
    'Premium African streetwear and contemporary fashion from Accra, Ghana. Shop exclusive collections including Kente drops, bold streetwear, and handcrafted accessories.',
};

const collections = [
  {
    tag: 'New Drop',
    name: 'Kente Bomber Collection',
    href: '/shop?cat=kente',
    image: '/product_kente_bomber.png',
  },
  {
    tag: 'Bestseller',
    name: 'Street Hoodies',
    href: '/shop?cat=streetwear',
    image: '/product_streetwear_hoodie.png',
  },
  {
    tag: 'Handcrafted',
    name: 'Agbada Dresses',
    href: '/shop?cat=agbada',
    image: '/product_agbada_dress.png',
  },
  {
    tag: 'Accessories',
    name: 'Kente Caps',
    href: '/shop?cat=caps',
    image: '/product_kente_cap.png',
  },
];

const testimonials = [
  {
    initials: 'AO',
    name: 'Ama Owusu',
    city: 'Accra, GH',
    text: '"I ordered the Kente bomber and it arrived within a day. The quality is insane — everyone at the party was asking where I got it from."',
  },
  {
    initials: 'KM',
    name: 'Kwame Mensah',
    city: 'Kumasi, GH',
    text: '"Finally a brand that understands our culture AND our style. The streetwear hoodie is my most worn piece this year. Will definitely be back."',
  },
  {
    initials: 'AF',
    name: 'Afia Frimpong',
    city: 'Tema, GH',
    text: '"The packaging alone made me feel like I was unwrapping something from a luxury boutique. Accra Threads is on another level."',
  },
];

const whyItems = [
  { icon: '🏺', title: 'Rooted in Culture', desc: 'Every piece honours Ghanaian craft traditions, reimagined for the modern wardrobe.' },
  { icon: '🚚', title: 'Fast Accra Delivery', desc: 'Same-day delivery across Greater Accra. Next-day nationwide.' },
  { icon: '♻️', title: 'Sustainably Made', desc: 'Ethical local production. Less waste, more style. We care about the earth.' },
  { icon: '✨', title: 'Cowrie Rewards', desc: 'Earn points on every order and redeem them for exclusive discounts.' },
];

const marqueeItems = ['SS25 Collection Live', '✦ Free Delivery Accra', '✦ New Kente Drops', '✦ Up to 50% Sale', '✦ Cowrie Rewards', '✦'];

export default function LandingPage() {
  return (
    <>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          Accra<span>Threads</span>
        </div>

        <div className={styles.navLinks}>
          <Link href="/shop" className={styles.navLink}>Shop</Link>
          <Link href="/lookbook" className={styles.navLink}>Lookbook</Link>
          <Link href="/support" className={styles.navLink}>Support</Link>
        </div>

        <div className={styles.navActions}>
          <Link href="/login" className={styles.navBtnOutline}>Sign in</Link>
          <Link href="/login?mode=register" className={styles.navBtnFill}>Join Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <img
            src="/hero_main.png"
            alt="Accra Threads hero — SS25 Collection"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroPill}>
            <span className={styles.heroPillDot} />
            SS25 Collection Now Live
          </div>

          <h1 className={styles.heroTitle}>
            Wear the City.<br /><em>Own Your Story.</em>
          </h1>

          <p className={styles.heroSub}>
            Premium African streetwear and cultural fashion from Accra.
            Bold kente drops, contemporary cuts — crafted for those who lead.
          </p>

          <div className={styles.heroActions}>
            <Link href="/shop" className={styles.heroBtnPrimary}>
              Shop the Collection →
            </Link>
            <Link href="/lookbook" className={styles.heroBtnSecondary}>
              View Lookbook
            </Link>
          </div>
        </div>

        <div className={styles.heroScroll}>
          <div className={styles.scrollLine} />
          scroll
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className={styles.statsBar}>
        {[
          { num: '5,000+', label: 'Happy Customers' },
          { num: '39',     label: 'Curated Styles' },
          { num: '1-Day',  label: 'Accra Delivery' },
          { num: '4.9★',   label: 'Average Rating' },
        ].map((s) => (
          <div key={s.label} className={styles.stat}>
            <div className={styles.statNum}>{s.num}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── MARQUEE ── */}
      <div className={styles.marqueeWrap}>
        <div className={styles.marqueeTrack}>
          {[...Array(8)].map((_, i) => (
            <span key={i} className={styles.marqueeItem}>
              {marqueeItems.join('  ')} &nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── COLLECTIONS ── */}
      <section className={styles.collectionsSection}>
        <p className={styles.sectionTag}>Curated for you</p>
        <h2 className={styles.sectionTitle}>
          Shop Our Collections
        </h2>

        <div className={styles.collectionsGrid}>
          {collections.map((c) => (
            <Link key={c.name} href={c.href} className={styles.collCard}>
              <img src={c.image} alt={c.name} className={styles.collImg} />
              <div className={styles.collOverlay}>
                <span className={styles.collTag}>{c.tag}</span>
                <h3 className={styles.collName}>{c.name}</h3>
                <span className={styles.collBtn}>Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={styles.whySection}>
        <p className={styles.sectionTag}>Why Accra Threads</p>
        <h2 className={styles.sectionTitle}>Culture. Quality. Community.</h2>

        <div className={styles.whyGrid}>
          {whyItems.map((w) => (
            <div key={w.title} className={styles.whyCard}>
              <div className={styles.whyIcon}>{w.icon}</div>
              <h3 className={styles.whyTitle}>{w.title}</h3>
              <p className={styles.whyDesc}>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonialsSection}>
        <p className={styles.sectionTag}>Loved by the City</p>
        <h2 className={styles.sectionTitle}>What Accra is Saying</h2>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.name} className={styles.testimonialCard}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>{t.initials}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorCity}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaGlow} />
        <h2 className={styles.ctaTitle}>
          Ready to <em>Own Your Story?</em>
        </h2>
        <p className={styles.ctaSub}>
          Join thousands of Accra Threads fans. Sign up free — get 20% off your first order.
        </p>
        <div className={styles.ctaActions}>
          <Link href="/login?mode=register" className={styles.heroBtnPrimary}>
            Create Free Account →
          </Link>
          <Link href="/shop" className={styles.heroBtnSecondary}>
            Browse Without Account
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div>
            <div className={styles.footerBrand}>Accra<span>Threads</span></div>
            <p className={styles.footerTagline}>Wear the City. Own Your Story.</p>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <div className={styles.footerLinkTitle}>Shop</div>
              <Link href="/shop" className={styles.footerLink}>All Products</Link>
              <Link href="/shop?cat=kente" className={styles.footerLink}>Kente Drops</Link>
              <Link href="/shop?cat=streetwear" className={styles.footerLink}>Streetwear</Link>
              <Link href="/lookbook" className={styles.footerLink}>Lookbook</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <div className={styles.footerLinkTitle}>Account</div>
              <Link href="/login" className={styles.footerLink}>Sign In</Link>
              <Link href="/login?mode=register" className={styles.footerLink}>Register</Link>
              <Link href="/orders" className={styles.footerLink}>Track Order</Link>
              <Link href="/account" className={styles.footerLink}>My Account</Link>
            </div>
            <div className={styles.footerLinkGroup}>
              <div className={styles.footerLinkTitle}>Help</div>
              <Link href="/support" className={styles.footerLink}>Contact Us</Link>
              <Link href="/support" className={styles.footerLink}>FAQ</Link>
              <Link href="/support" className={styles.footerLink}>Returns</Link>
              <Link href="/support" className={styles.footerLink}>Size Guide</Link>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerCopy}>© 2025 Accra Threads. All rights reserved.</p>
          <div className={styles.footerSocials}>
            <div className={styles.socialDot}>IG</div>
            <div className={styles.socialDot}>TK</div>
            <div className={styles.socialDot}>X</div>
          </div>
        </div>
      </footer>
    </>
  );
}
