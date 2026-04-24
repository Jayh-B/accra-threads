'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Sale', href: '/shop?cat=sale', color: 'var(--color-accent-red)' },
  { label: 'Women', href: '/shop?cat=women' },
  { label: 'Men', href: '/shop?cat=men' },
  { label: 'Shoes', href: '/shop?cat=shoes' },
  { label: 'Accessories', href: '/shop?cat=accessories' },
  { label: 'Kente Drops', href: '/shop?cat=kente' }
];

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (pathname?.startsWith('/admin') || pathname === '/login') return null;

  return (
    <>
      <div className={styles.announcementBar}>
        <p>FREE STANDARD SHIPPING ON ORDERS OVER ₵500 • <b>SHOP NOW</b></p>
      </div>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          
          {/* Top Row */}
          <div className={styles.topRow}>
            {/* Mobile Menu Btn (Left on mobile) */}
            <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <span className={styles.logoMark}>AT</span>
              <span className={styles.logoText}>ACCRA THREADS</span>
            </Link>

            {/* Always-on Search */}
            <form 
              className={styles.searchBarDesk} 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQ.trim()) {
                  router.push(`/shop?q=${encodeURIComponent(searchQ)}`);
                }
              }}
            >
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className={styles.searchInputDesk}
              />
              <button type="submit" className={styles.searchBtnDesk}><Search size={18} /></button>
            </form>

            {/* Icons */}
            <div className={styles.icons}>
              <Link href="/account?tab=wishlist" className={styles.iconBtn} aria-label="Wishlist">
                <Heart size={20} />
                {wishCount > 0 && <span className={styles.badge}>{wishCount}</span>}
              </Link>
              <Link href="/cart" className={styles.iconBtn} aria-label="Cart">
                <ShoppingBag size={20} />
                {totalItems > 0 && <span className={`${styles.badge} ${styles.badgeCart}`}>{totalItems}</span>}
              </Link>
              <Link href="/account" className={styles.iconBtn} aria-label="Account">
                <User size={20} />
              </Link>
            </div>
          </div>

          {/* Bottom Row: Desktop Nav */}
          <div className={styles.bottomRow}>
            <ul className={styles.navLinks}>
              {navLinks.map(link => (
                <li key={link.label} className={styles.navItem}>
                  <Link href={link.href} className={styles.navLink} style={link.color ? { color: link.color, fontWeight: 700 } : {}}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <div className={styles.mobileMenu}>
            <div className={styles.mobileHeader}>
              <span className={styles.logo}><span className={styles.logoMark}>AT</span></span>
              <button className={styles.iconBtn} onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <nav className={styles.mobileNav}>
              {navLinks.map(link => (
                <div key={link.label}>
                  <Link href={link.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)} style={link.color ? { color: link.color } : {}}>
                    {link.label}
                  </Link>
                </div>
              ))}
            </nav>
            <div className={styles.mobileBottom}>
              <Link href="/account" className="btn btn-secondary btn-md" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                My Account
              </Link>
              <Link href="/cart" className="btn btn-primary btn-md" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                <ShoppingBag size={16} /> Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
