'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './Navbar.module.css';

const navLinks = [
  { label: 'Shop', href: '/shop', sub: ['New Arrivals', 'Men', 'Women', 'Accessories', 'Kente Drops'] },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About', href: '/about' },
  { label: 'Support', href: '/support' },
];

export default function Navbar() {
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

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoMark}>AT</span>
            <span className={styles.logoText}>ACCRA THREADS</span>
          </Link>

          {/* Desktop Nav */}
          <ul className={styles.navLinks}>
            {navLinks.map(link => (
              <li
                key={link.label}
                className={styles.navItem}
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link href={link.href} className={styles.navLink}>
                  {link.label}
                  {link.sub && <ChevronDown size={13} strokeWidth={2.5} />}
                </Link>
                {link.sub && activeDropdown === link.label && (
                  <div className={styles.dropdown}>
                    {link.sub.map(s => (
                      <Link key={s} href={`/shop?cat=${s.toLowerCase().replace(' ', '-')}`} className={styles.dropItem}>
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className={styles.icons}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>
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
            <button className={`${styles.iconBtn} ${styles.menuBtn}`} onClick={() => setMobileOpen(true)} aria-label="Menu">
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className={styles.searchBar}>
            <div className={styles.searchInner}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products, brands, collections..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className={styles.searchInput}
                onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); }}
              />
              <button className={styles.searchClose} onClick={() => setSearchOpen(false)}><X size={18} /></button>
            </div>
            {searchQ && (
              <div className={styles.searchResults}>
                <p className={styles.searchHint}>Press Enter to search for &ldquo;<strong>{searchQ}</strong>&rdquo;</p>
              </div>
            )}
          </div>
        )}
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
                  <Link href={link.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className={styles.mobileSub}>
                      {link.sub.map(s => (
                        <Link key={s} href={`/shop?cat=${s.toLowerCase().replace(' ','-')}`} className={styles.mobileSubLink} onClick={() => setMobileOpen(false)}>
                          {s}
                        </Link>
                      ))}
                    </div>
                  )}
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
