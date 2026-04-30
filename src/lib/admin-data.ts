/**
 * admin-data.ts — SERVER-ONLY
 * Uses the service-role key to bypass RLS for admin reads.
 * Never import this in 'use client' components.
 */
import { createClient } from '@supabase/supabase-js';

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type AdminOrder = {
  id: string;
  created_at: string;
  status: string;
  payment_status: string | null;
  subtotal: number | null;
  vat_amount: number | null;
  total: number | null;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  item_count: number;
  paystack_reference: string | null;
};

export type AdminCustomer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  loyalty_points: number | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  email: string | null;
};

export type AdminStats = {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  openTickets: number;
};

export type AdminTicket = {
  id: string;
  subject: string | null;
  category: string | null;
  status: string | null;
  priority: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  user_id: string | null;
};

export type TicketMessage = {
  id: string;
  ticket_id: string | null;
  sender_id: string | null;
  body: string | null;
  is_ai_draft: boolean | null;
  created_at: string;
  sender_name: string | null;
  sender_role: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminStats(): Promise<AdminStats> {
  const db = getAdminClient();

  const [
    { count: orderCount, data: revenueData },
    { count: productCount },
    { count: customerCount },
    { count: ticketCount },
  ] = await Promise.all([
    db.from('orders').select('total', { count: 'exact' }),
    db.from('products').select('id', { count: 'exact', head: true }).eq('published', true),
    db.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    db.from('tickets').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum: number, o: { total: number | null }) => sum + (o.total ?? 0),
    0
  );

  return {
    totalRevenue,
    totalOrders: orderCount ?? 0,
    totalProducts: productCount ?? 0,
    totalCustomers: customerCount ?? 0,
    openTickets: ticketCount ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminOrders(limit = 100): Promise<AdminOrder[]> {
  console.log('[ADMIN] Fetching orders...');
  const db = getAdminClient();

  // Fetch orders
  const { data: orders, error } = await db
    .from('orders')
    .select('id, created_at, status, payment_status, subtotal, vat_amount, total, user_id, paystack_reference, order_number')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ADMIN] ❌ Error fetching orders:', error);
    return [];
  }
  if (!orders || orders.length === 0) {
    console.log('[ADMIN] No orders found in database');
    return [];
  }
  console.log(`[ADMIN] ✅ Found ${orders.length} orders`);

  // Fetch user info for each unique user_id
  const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))] as string[];
  const { data: users } = userIds.length
    ? await db.from('users').select('id, full_name').in('id', userIds)
    : { data: [] };

  // Fetch auth emails
  let authEmails: Record<string, string> = {};
  if (userIds.length) {
    const { data: authUsers } = await db.auth.admin.listUsers();
    authEmails = Object.fromEntries(
      (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ''])
    );
  }

  // Fetch item counts
  const orderIds = orders.map((o) => o.id);
  const { data: itemCounts } = orderIds.length
    ? await db
        .from('order_items')
        .select('order_id, id')
        .in('order_id', orderIds)
    : { data: [] };

  const countMap: Record<string, number> = {};
  (itemCounts ?? []).forEach((row: { order_id: string }) => {
    countMap[row.order_id] = (countMap[row.order_id] ?? 0) + 1;
  });

  const userMap = Object.fromEntries(
    (users ?? []).map((u: { id: string; full_name: string | null }) => [u.id, u.full_name])
  );

  return orders.map((o) => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status ?? 'pending',
    payment_status: o.payment_status ?? 'pending',
    subtotal: o.subtotal,
    vat_amount: o.vat_amount,
    total: o.total,
    user_id: o.user_id,
    customer_name: o.user_id ? (userMap[o.user_id] ?? 'Unknown') : 'Guest',
    customer_email: o.user_id ? (authEmails[o.user_id] ?? null) : null,
    item_count: countMap[o.id] ?? 0,
    paystack_reference: o.paystack_reference,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  const db = getAdminClient();

  const { data: users, error } = await db
    .from('users')
    .select('id, full_name, phone, role, loyalty_points, created_at')
    .order('created_at', { ascending: false });

  if (error || !users) return [];

  const userIds = users.map((u: { id: string }) => u.id);

  // Fetch auth emails
  const { data: authData } = await db.auth.admin.listUsers();
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  );

  // Fetch order stats per user
  const { data: orderStats } = userIds.length
    ? await db.from('orders').select('user_id, total').in('user_id', userIds)
    : { data: [] };

  const spendMap: Record<string, number> = {};
  const countMap2: Record<string, number> = {};
  (orderStats ?? []).forEach((o: { user_id: string | null; total: number | null }) => {
    if (!o.user_id) return;
    spendMap[o.user_id] = (spendMap[o.user_id] ?? 0) + (o.total ?? 0);
    countMap2[o.user_id] = (countMap2[o.user_id] ?? 0) + 1;
  });

  return users.map((u: { id: string; full_name: string | null; phone: string | null; role: string | null; loyalty_points: number | null; created_at: string }) => ({
    id: u.id,
    full_name: u.full_name,
    phone: u.phone,
    role: u.role,
    loyalty_points: u.loyalty_points,
    created_at: u.created_at,
    email: emailMap[u.id] ?? null,
    order_count: countMap2[u.id] ?? 0,
    total_spent: spendMap[u.id] ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminFinance() {
  const db = getAdminClient();

  const { data: orders } = await db
    .from('orders')
    .select('id, created_at, subtotal, vat_amount, total, status')
    .order('created_at', { ascending: false });

  const list = orders ?? [];

  const grossRevenue = list.reduce((s: number, o: { total: number | null }) => s + (o.total ?? 0), 0);
  const vatCollected = list.reduce((s: number, o: { vat_amount: number | null }) => s + (o.vat_amount ?? 0), 0);
  const netRevenue = grossRevenue - vatCollected;

  return { grossRevenue, vatCollected, netRevenue, orders: list };
}

// ─────────────────────────────────────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminTickets(): Promise<AdminTicket[]> {
  const db = getAdminClient();

  const { data: tickets, error } = await db
    .from('tickets')
    .select('id, subject, category, status, priority, created_at, updated_at, user_id')
    .order('created_at', { ascending: false });

  if (error || !tickets) return [];

  const userIds = [...new Set(tickets.map((t: { user_id: string | null }) => t.user_id).filter(Boolean))] as string[];

  const { data: users } = userIds.length
    ? await db.from('users').select('id, full_name').in('id', userIds)
    : { data: [] };

  const { data: authData } = await db.auth.admin.listUsers();
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  );
  const nameMap = Object.fromEntries(
    (users ?? []).map((u: { id: string; full_name: string | null }) => [u.id, u.full_name])
  );

  return tickets.map((t: { id: string; subject: string | null; category: string | null; status: string | null; priority: string | null; created_at: string; updated_at: string; user_id: string | null }) => ({
    id: t.id,
    subject: t.subject,
    category: t.category,
    status: t.status,
    priority: t.priority,
    created_at: t.created_at,
    updated_at: t.updated_at,
    user_id: t.user_id,
    customer_name: t.user_id ? (nameMap[t.user_id] ?? 'Unknown') : 'Guest',
    customer_email: t.user_id ? (emailMap[t.user_id] ?? null) : null,
  }));
}

export async function fetchAdminTicket(id: string): Promise<AdminTicket | null> {
  const db = getAdminClient();
  const { data, error } = await db
    .from('tickets')
    .select('id, subject, category, status, priority, created_at, updated_at, user_id')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  const { data: authData } = await db.auth.admin.listUsers();
  const emailMap = Object.fromEntries(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ''])
  );

  let customerName: string | null = null;
  if (data.user_id) {
    const { data: user } = await db.from('users').select('full_name').eq('id', data.user_id).single();
    customerName = user?.full_name ?? 'Unknown';
  }

  return {
    id: data.id,
    subject: data.subject,
    category: data.category,
    status: data.status,
    priority: data.priority,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id,
    customer_name: customerName,
    customer_email: data.user_id ? (emailMap[data.user_id] ?? null) : null,
  };
}

export async function fetchTicketMessages(ticketId: string): Promise<TicketMessage[]> {
  const db = getAdminClient();

  const { data: messages, error } = await db
    .from('ticket_messages')
    .select('id, ticket_id, sender_id, body, is_ai_draft, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error || !messages) return [];

  const senderIds = [...new Set(messages.map((m: { sender_id: string | null }) => m.sender_id).filter(Boolean))] as string[];

  const { data: senders } = senderIds.length
    ? await db.from('users').select('id, full_name, role').in('id', senderIds)
    : { data: [] };

  const senderMap = Object.fromEntries(
    (senders ?? []).map((s: { id: string; full_name: string | null; role: string | null }) => [
      s.id,
      { name: s.full_name, role: s.role },
    ])
  );

  return messages.map((m: { id: string; ticket_id: string | null; sender_id: string | null; body: string | null; is_ai_draft: boolean | null; created_at: string }) => ({
    id: m.id,
    ticket_id: m.ticket_id,
    sender_id: m.sender_id,
    body: m.body,
    is_ai_draft: m.is_ai_draft,
    created_at: m.created_at,
    sender_name: m.sender_id ? (senderMap[m.sender_id]?.name ?? 'Unknown') : null,
    sender_role: m.sender_id ? (senderMap[m.sender_id]?.role ?? null) : null,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN USER INFO
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAdminUser(userId: string) {
  const db = getAdminClient();
  const { data } = await db
    .from('users')
    .select('id, full_name, role')
    .eq('id', userId)
    .single();
  return data;
}
