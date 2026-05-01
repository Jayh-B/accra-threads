import { fetchAdminStats, fetchAdminUser } from '@/lib/admin-data';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import AdminLayoutClient from './AdminLayoutClient';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'LayoutDashboard',
    children: [
      { label: 'Overview', href: '/admin' },
      { label: 'Analytics', href: '/admin/analytics' },
    ],
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: 'PackageOpen',
    children: [
      { label: 'All Orders', href: '/admin/orders' },
      { label: 'Pending', href: '/admin/orders?status=pending' },
      { label: 'Processing', href: '/admin/orders?status=processing' },
      { label: 'Deliveries', href: '/admin/orders?status=shipped' },
    ],
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'ShoppingBag',
    children: [
      { label: 'All Products', href: '/admin/products' },
      { label: 'Add New', href: '/admin/products/new' },
      { label: 'Inventory', href: '/admin/supply-chain/inventory' },
      { label: 'Categories', href: '/admin/products/categories' },
    ],
  },
  {
    label: 'Finance',
    href: '/admin/finance',
    icon: 'DollarSign',
    children: [
      { label: 'Overview', href: '/admin/finance' },
      { label: 'Invoices', href: '/admin/finance/invoices' },
      { label: 'Reports', href: '/admin/finance/reports' },
      { label: 'VAT Compliance', href: '/admin/finance/vat' },
    ],
  },
  {
    label: 'Customers',
    href: '/admin/customers',
    icon: 'Users',
    children: [
      { label: 'All Customers', href: '/admin/customers' },
      { label: 'Feedback', href: '/admin/customers/feedback' },
      { label: 'Communications', href: '/admin/customers/communications' },
    ],
  },
  {
    label: 'Supply Chain',
    href: '/admin/supply-chain',
    icon: 'Truck',
    children: [
      { label: 'Dashboard', href: '/admin/supply-chain' },
      { label: 'Suppliers', href: '/admin/supply-chain/suppliers' },
      { label: 'Partners', href: '/admin/supply-chain/partners' },
      { label: 'Purchase Orders', href: '/admin/supply-chain/purchase-orders' },
      { label: 'Inventory', href: '/admin/supply-chain/inventory' },
      { label: 'Deliveries', href: '/admin/supply-chain/deliveries' },
      { label: 'Marketplace', href: '/admin/supply-chain/marketplace' },
    ],
  },
  {
    label: 'Support',
    href: '/admin/support',
    icon: 'Headphones',
    children: [
      { label: 'Tickets', href: '/admin/support' },
      { label: 'Knowledge Base', href: '/admin/support/kb' },
    ],
  },
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
