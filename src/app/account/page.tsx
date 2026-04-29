'use client';
import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Heart, CreditCard, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { orders } from '@/lib/data';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedSearchParams = use(searchParams);
  const [tab, setTab] = useState(resolvedSearchParams.tab || 'overview');
  const { items: wishlist } = useWishlist();
  const { user, profile, isAuthenticated, loading, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?redirectTo=/account');
    }
  }, [isAuthenticated, loading, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className="font-display text-4xl" style={{ marginBottom: '40px' }}>Loading...</h1>
      </div>
    );
  }

  // If not authenticated, don't render (the useEffect will redirect)
  if (!isAuthenticated || !user || !profile) {
    return null;
  }

  const userName = profile.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const userPoints = profile.loyalty_points || 0;

  return (
    <div className={styles.page}>
      <h1 className="font-display text-4xl" style={{ marginBottom: '40px' }}>My Account</h1>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <button className={`${styles.navItem} ${tab === 'overview' ? styles.active : ''}`} onClick={() => setTab('overview')}>
              <User size={18} /> Overview
            </button>
            <button className={`${styles.navItem} ${tab === 'orders' ? styles.active : ''}`} onClick={() => setTab('orders')}>
              <Package size={18} /> Orders
            </button>
            <button className={`${styles.navItem} ${tab === 'wishlist' ? styles.active : ''}`} onClick={() => setTab('wishlist')}>
              <Heart size={18} /> Wishlist ({wishlist.length})
            </button>
            <button className={`${styles.navItem} ${tab === 'points' ? styles.active : ''}`} onClick={() => setTab('points')}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🐚</span> Cowrie Points
            </button>
            <div className="divider" style={{ margin: '16px 0' }} />
            <button className={styles.navItem} style={{ color: 'var(--color-accent-red)' }} onClick={handleSignOut} disabled={isSigningOut}>
              <LogOut size={18} /> {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className={styles.content}>
          
          {tab === 'overview' && (
            <div className="page-enter">
              <div className={styles.welcomeBox}>
                <div>
                  <h2 className="text-2xl" style={{ marginBottom: '8px' }}>Welcome back, {userName}.</h2>
                  <p className="text-secondary">{userEmail}</p>
                </div>
                <div className={styles.pointsBadgeMini}>
                  <div className={styles.pointsNum}>{userPoints}</div>
                  <div className={styles.pointsLabel}>Cowrie Points</div>
                </div>
              </div>

              <h3 className="text-xl" style={{ margin: '40px 0 24px' }}>Recent Orders</h3>
              <div className={styles.orderList}>
                {orders.length === 0 ? (
                  <p className="text-secondary">No orders yet. <Link href="/shop">Start shopping!</Link></p>
                ) : (
                  orders.map(o => (
                    <div key={o.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <span className="font-mono" style={{ color: 'var(--color-primary)', marginRight: '16px' }}>{o.id}</span>
                          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{o.date}</span>
                        </div>
                        <span className={`badge ${o.status === 'delivered' ? 'badge-cowrie' : 'badge-new'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className={styles.orderBody}>
                        <div className={styles.orderImgs}>
                          {o.items.slice(0, 3).map((item, i) => (
                             <div key={i} className={styles.orderImgWrap}>
                               <Image src={item.image} alt={item.name} fill className={styles.orderImg} />
                             </div>
                          ))}
                        </div>
                        <div className={styles.orderActions}>
                          <span className="font-mono text-lg">GHS {o.total.toLocaleString()}</span>
                          <Link href={`/orders/${o.id}/track`} className="btn btn-secondary btn-sm">Track Order</Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="page-enter">
              <h2 className="text-2xl" style={{ marginBottom: '24px' }}>Your Wishlist</h2>
              {wishlist.length === 0 ? (
                <p className="text-secondary">Your wishlist is empty. Start saving your favorite pieces! <Link href="/shop">Browse products</Link></p>
              ) : (
                <div className={styles.wishlistGrid}>
                  {wishlist.map(item => (
                    <div key={item.id} className={styles.wishCard}>
                      <Link href={`/shop/${item.slug}`} className={styles.wishImgWrap}>
                        <Image src={item.image} alt={item.name} fill className={styles.wishImg} />
                      </Link>
                      <div className={styles.wishInfo}>
                        <Link href={`/shop/${item.slug}`} className={styles.wishName}>{item.name}</Link>
                        <p className={styles.wishPrice}>GHS {item.price.toLocaleString()}</p>
                        <Link href={`/shop/${item.slug}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>View Product</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div className="page-enter">
              <h2 className="text-2xl" style={{ marginBottom: '24px' }}>Order History</h2>
              <div className={styles.orderList}>
                {orders.length === 0 ? (
                  <p className="text-secondary">No orders yet. <Link href="/shop">Start shopping!</Link></p>
                ) : (
                  orders.map(o => (
                    <div key={o.id} className={styles.orderCard}>
                       <div className={styles.orderHeader}>
                        <div>
                          <span className="font-mono" style={{ color: 'var(--color-primary)', marginRight: '16px' }}>{o.id}</span>
                          <span className="text-secondary" style={{ fontSize: '0.875rem' }}>{o.date}</span>
                        </div>
                        <span className={`badge ${o.status === 'delivered' ? 'badge-cowrie' : 'badge-new'}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className={styles.orderBody}>
                        <div className={styles.orderItemsList}>
                          {o.items.map((item, i) => (
                             <div key={i} className={styles.orderItemRow}>
                                <div className={styles.orderImgWrap} style={{ width: 48, borderRadius: 4 }}>
                                  <Image src={item.image} alt={item.name} fill className={styles.orderImg} />
                                </div>
                                <div style={{ flex: 1, fontSize: '0.875rem' }}>
                                  <p>{item.name}</p>
                                  <p className="text-secondary" style={{ fontSize: '0.75rem' }}>Qty: {item.qty}</p>
                                </div>
                                <span className="font-mono" style={{ fontSize: '0.875rem' }}>GHS {item.price.toLocaleString()}</span>
                             </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span className="font-mono text-lg">Total: GHS {o.total.toLocaleString()}</span>
                         <Link href={`/orders/${o.id}/track`} className="btn btn-secondary btn-sm">Track Package</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'points' && (
            <div className="page-enter">
              <div className={styles.pointsBanner}>
                 <div style={{ fontSize: '4rem' }}>🐚</div>
                 <h2 className="font-display text-4xl" style={{ margin: '16px 0 8px' }}>{userPoints} Points</h2>
                 <p style={{ color: 'rgba(255,255,255,0.8)' }}>You're {Math.max(0, 200 - userPoints)} points away from a GHS 100 discount.</p>
              </div>

              <h3 className="text-xl" style={{ margin: '40px 0 24px' }}>Points History</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-secondary)' }}>
                        No points earned yet. <Link href="/shop">Make your first purchase!</Link>
                      </td>
                    </tr>
                  ) : (
                    orders.slice(0, 5).map((o, i) => (
                      <tr key={i}>
                        <td>{o.date}</td>
                        <td>Earned from purchase</td>
                        <td className="font-mono text-primary">{o.id}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-accent-green)' }}>+{Math.floor(o.total / 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
