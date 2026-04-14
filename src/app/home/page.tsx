'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { supabase } from '@/lib/supabase';
import { fetchFeaturedProducts } from '@/lib/data';
import { categories } from '@/lib/data';
import type { Product } from '@/lib/data';
import styles from './page.module.css';

type UserMeta = {
  name: string;
  email: string;
  avatarInitials: string;
};

const QUICK_LINKS = [
  { label: '🔥 Flash Sale', href: '/shop?cat=sale' },
  { label: '✨ New Arrivals', href: '/shop?sort=new' },
  { label: '🏺 Kente Drops', href: '/shop?cat=kente' },
  { label: '👗 Women', href: '/shop?cat=women' },
  { label: '👔 Men', href: '/shop?cat=men' },
  { label: '🧢 Accessories', href: '/shop?cat=accessories' },
  { label: '📦 Track Order', href: '/orders' },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMeta | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify session — middleware handles redirect but this is a UX safety net
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
        return;
      }

      const { user: authUser } = session;
      const fullName: string =
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        authUser.email?.split('@')[0] ??
        'Friend';

      const words = fullName.trim().split(' ');
      const initials = words.length >= 2
        ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

      setUser({ name: fullName, email: authUser.email ?? '', avatarInitials: initials });
    });

    fetchFeaturedProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [router]);

  const firstName = user?.name.split(' ')[0] ?? '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const trending = products.slice(0, 5);
  const newArrivals = products.slice(5);

  return (
    <>
      {/* ── Personalised Welcome Banner ── */}
      <section className={styles.welcomeBanner}>
        <div className={styles.welcomeLeft}>
          <p className={styles.welcomeGreeting}>{greeting} 👋</p>
          <h1 className={styles.welcomeTitle}>
            {user ? `Welcome back, ${firstName}!` : 'Welcome back!'}
          </h1>
          <p className={styles.welcomeSub}>
            Here's what's trending in Accra today.
          </p>
        </div>

        <div className={styles.cowrieChip}>
          <div className={styles.cowrieIcon}>🐚</div>
          <div>
            <div className={styles.cowrieLabel}>Cowrie Points</div>
            <div className={styles.cowrieValue}>0</div>
          </div>
        </div>
      </section>

      {/* ── Quick Navigation Bar ── */}
      <nav className={styles.quickBar} aria-label="Category shortcuts">
        {QUICK_LINKS.map((l) => (
          <Link key={l.label} href={l.href} className={styles.quickLink}>
            {l.label}
          </Link>
        ))}
      </nav>

      {/* ── Flash Sale Hero ── */}
      <section className={styles.flashHero}>
        <img
          src="/hero_main.png"
          alt="SS25 Collection — Flash Sale"
          className={styles.flashHeroImg}
        />
        <div className={styles.flashHeroOverlay}>
          <div className={styles.flashContent}>
            <div className={styles.flashBadge}>
              <span>⚡</span> Flash Sale — Limited Time
            </div>
            <h2 className={styles.flashTitle}>SS25 Collection</h2>
            <p className={styles.flashSub}>
              Up to 50% off + Free Delivery across Accra.
            </p>
            <div className={styles.flashActions}>
              <Link href="/shop?cat=sale" className={styles.flashBtnPrimary}>
                Shop the Sale →
              </Link>
              <Link href="/lookbook" className={styles.flashBtnOutline}>
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Quick-Links ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionTag}>Browse</p>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
          </div>
        </div>
        <div className={styles.catScroll}>
          {categories.map((c: any) => (
            <Link key={c.id} href={c.href} className={styles.circleCat}>
              <div className={styles.circleWrap}>
                <img src={c.image} alt={c.label} className={styles.circleImg} />
              </div>
              <span className={styles.circleLabel}>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="marquee-item">
              NEW ARRIVALS ✦ FREE DELIVERY ACCRA ✦ COWRIE POINTS ✦ KENTE DROPS ✦
            </span>
          ))}
        </div>
      </div>

      {/* ── Trending Products ── */}
      <section className={`${styles.section} ${styles.sectionBg}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionTag}>Trending Now</p>
            <h2 className={styles.sectionTitle}>Flash Sale / Trending</h2>
          </div>
          <Link href="/shop" className={styles.sectionLink}>View All →</Link>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`} />
            ))}
          </div>
        ) : (
          <div className={styles.productGrid}>
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── New Arrivals Horizontal Scroll ── */}
      {newArrivals.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionTag}>Just In</p>
              <h2 className={styles.sectionTitle}>New Arrivals</h2>
            </div>
            <Link href="/shop?sort=new" className={styles.sectionLink}>See All →</Link>
          </div>
          <div className={styles.hScroll}>
            {newArrivals.map((product) => (
              <div key={product.id} className={styles.scrollCard}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cowrie Rewards Banner ── */}
      <section className={styles.rewardsBanner}>
        <div className={styles.rewardsLeft}>
          <div className={styles.rewardsIcon}>🐚</div>
          <h2 className={styles.rewardsTitle}>Earn Cowrie Points</h2>
          <p className={styles.rewardsSub}>
            Every purchase earns you Cowrie Points. Redeem them for exclusive
            discounts, early access to drops, and special gifts.
          </p>
        </div>
        <div className={styles.rewardsBadges}>
          {[
            { icon: '🛍️', label: 'Per order', value: '10 pts' },
            { icon: '👥', label: 'Per referral', value: '50 pts' },
            { icon: '⭐', label: 'Per review', value: '20 pts' },
          ].map((b) => (
            <div key={b.label} className={styles.rewardBadge}>
              <span className={styles.rewardBadgeIcon}>{b.icon}</span>
              <div>
                <div className={styles.rewardBadgeText}>{b.label}</div>
                <div className={styles.rewardBadgeValue}>{b.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
