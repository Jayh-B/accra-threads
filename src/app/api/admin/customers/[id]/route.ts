import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch customer profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch order stats
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, total, status, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Fetch customer stats
    const { data: stats } = await supabaseAdmin
      .rpc('get_customer_stats', { p_customer_id: id });

    const customerData = {
      ...profile,
      total_orders: orders?.length || 0,
      total_spent: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
      recent_orders: orders?.slice(0, 5) || [],
      stats: stats?.[0] || null,
    };

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
