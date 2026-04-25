import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { LayoutDashboard, ShoppingBag, PackageOpen, Users, DollarSign, Headphones } from 'lucide-react';
import { fetchAdminStats, fetchAdminUser } from '@/lib/admin-data';
import AdminLayoutClient from './AdminLayoutClient';
import styles from './layout.module.css';

const navItems = [
  { label: 'Dashboard',   href: '/admin',            icon: 'LayoutDashboard' },
  { label: 'Orders',      href: '/admin/orders',      icon: 'PackageOpen' },
  { label: 'Products',    href: '/admin/products',    icon: 'ShoppingBag' },
  { label: 'Customers',   href: '/admin/customers',   icon: 'Users' },
  { label: 'Finance & Tax', href: '/admin/finance',   icon: 'DollarSign' },
  { label: 'Support',     href: '/admin/support',     icon: 'Headphones' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Get logged-in user
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const [adminProfile, stats] = await Promise.all([
    user ? fetchAdminUser(user.id) : null,
    fetchAdminStats(),
  ]);

  const displayName = adminProfile?.full_name ?? user?.email?.split('@')[0] ?? 'Admin';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AdminLayoutClient
      navItems={navItems}
      displayName={displayName}
      initials={initials}
      openTickets={stats.openTickets}
    >
      {children}
    </AdminLayoutClient>
  );
}
