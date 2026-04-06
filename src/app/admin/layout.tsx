'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, PackageOpen, Users, DollarSign, Bell } from 'lucide-react';
import styles from './layout.module.css';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: PackageOpen },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Finance & Tax', href: '/admin/finance', icon: DollarSign },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>AT</div>
          <span className={styles.logoText}>ADMIN</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for dashboard, prefix match for others to keep them active when navigating deeper
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <h2 className={styles.topbarTitle}>Accra Threads Store Management</h2>
          <div className={styles.userProfile}>
            <button className="btn btn-ghost" style={{ padding: '8px' }}>
              <Bell size={20} />
            </button>
            <div className={styles.avatar}>
               <Users size={18} />
            </div>
            <span>Admin User</span>
          </div>
        </header>

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
