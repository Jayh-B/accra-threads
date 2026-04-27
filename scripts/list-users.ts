import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  try {
    // Get all users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }

    console.log('📋 Current Users:');
    console.log('================');

    for (const authUser of authUsers.users) {
      const userId = authUser.id;
      const email = authUser.email;

      // Get profile from public.users table
      const { data: profile } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      const role = profile?.role || 'customer';
      const name = profile?.full_name || 'No name';

      console.log(`👤 ${email} (${name}) - Role: ${role}`);
    }

    console.log('\nTo make a user an admin, run:');
    console.log('npx tsx scripts/make-admin.ts <email>');

  } catch (err) {
    console.error('Error:', err);
  }
}

listUsers();