import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdmin() {
  try {
    console.log('Testing database tables...');

    // Test if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table exists');
    }

    // Test if orders table exists
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);

    if (ordersError) {
      console.log('❌ Orders table error:', ordersError.message);
    } else {
      console.log('✅ Orders table exists');
    }

    // Test if tickets table exists
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('count')
      .limit(1);

    if (ticketsError) {
      console.log('❌ Tickets table error:', ticketsError.message);
    } else {
      console.log('✅ Tickets table exists');
    }

    // Test if products table exists and has data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (productsError) {
      console.log('❌ Products table error:', productsError.message);
    } else {
      console.log('✅ Products table exists');
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

testAdmin();