'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  Users,
  DollarSign,
  Headphones,
  Bell,
  LogOut,
  Truck,
} from 'lucide-react';
import styles from './layout.module.css';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  Users,
  DollarSign,
  Headphones,
  Truck,
};

type NavItem = { label: string; href: string; icon: string };

type Props = {
  children: React.ReactNode;
  navItems: NavItem[];
  displayName: string;
  initials: string;
  openTickets: number;
};

export default function AdminLayoutClient({
  children,
  navItems,
  displayName,
  initials,
  openTickets,
}: Props) {
  const pathname = usePathname();

  return (
    <div className={styles.adminContainer}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>AT</div>
          <div>
            <span className={styles.logoText}>ADMIN</span>
            <div className={styles.logoBadge}>Accra Threads</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== '/admin');
            const isSupport = item.href === '/admin/support';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                {Icon && <Icon size={18} />}
                <span className={styles.navLabel}>{item.label}</span>
                {isSupport && openTickets > 0 && (
                  <span className={styles.navBadge}>{openTickets}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className={styles.sidebarBottom}>
          <Link href="/home" className={styles.navItem} style={{ color: 'var(--color-text-secondary)' }}>
            <LogOut size={16} />
            <span className={styles.navLabel}>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h2 className={styles.topbarTitle}>Accra Threads — Store Management</h2>
          </div>
          <div className={styles.userProfile}>
            {openTickets > 0 && (
              <Link href="/admin/support" className={styles.bellBtn} title={`${openTickets} open tickets`}>
                <Bell size={20} />
                <span className={styles.bellDot}>{openTickets}</span>
              </Link>
            )}
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{displayName}</span>
              <span className={styles.adminRole}>Administrator</span>
            </div>
          </div>
        </header>

        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
