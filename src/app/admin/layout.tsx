import { fetchAdminStats, fetchAdminUser } from '@/lib/admin-data';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import AdminLayoutClient from './AdminLayoutClient';

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
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // This shouldn't happen due to middleware, but just in case
    return <div>Access denied</div>;
  }

  let adminProfile = null;
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    openTickets: 0,
  };

  try {
    const [profileResult, statsResult] = await Promise.all([
      fetchAdminUser(user.id),
      fetchAdminStats(),
    ]);
    adminProfile = profileResult;
    stats = statsResult;
  } catch (error) {
    console.error('Error loading admin data:', error);
    // Continue with default values
  }

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
