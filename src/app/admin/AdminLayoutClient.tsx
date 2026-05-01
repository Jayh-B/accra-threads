'use client';

import { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
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

type NavChild = { label: string; href: string };

type NavItem = {
  label: string;
  href: string;
  icon: string;
  children?: NavChild[];
};


type Props = {
  children: React.ReactNode;
  navItems: NavItem[];
  displayName: string;
  initials: string;
  openTickets: number;
};

function NavSection({
  item,
  pathname,
  openTickets,
}: {
  item: NavItem;
  pathname: string;
  openTickets: number;
}) {
  const [isExpanded, setIsExpanded] = useState(
    pathname.startsWith(item.href) && item.href !== '/admin'
  );
  const Icon = iconMap[item.icon];
  const isActive =
    pathname === item.href ||
    (pathname.startsWith(item.href) && item.href !== '/admin');
  const isSupport = item.href === '/admin/support';

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={styles.navSection}>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`${styles.navItem} ${isActive ? styles.active : ''} ${hasChildren ? styles.hasChildren : ''}`}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <div className={styles.navItemContent}>
          {Icon && <Icon size={18} />}
          <span className={styles.navLabel}>{item.label}</span>
        </div>
        <div className={styles.navItemRight}>
          {isSupport && openTickets > 0 && (
            <span className={styles.navBadge}>{openTickets}</span>
          )}
          {hasChildren && (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          )}
        </div>
      </button>

      {hasChildren && isExpanded && (
        <div className={styles.navChildren}>
          {item.children?.map((child) => {
            const isChildActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`${styles.navChild} ${isChildActive ? styles.active : ''}`}
              >
                <span className={styles.navChildDot} />
                <span className={styles.navChildLabel}>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
          {navItems.map((item) => (
            <NavSection
              key={item.href}
              item={item}
              pathname={pathname}
              openTickets={openTickets}
            />
          ))}
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
