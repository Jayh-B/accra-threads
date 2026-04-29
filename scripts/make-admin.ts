import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseServiceKey = 'sb_secret__9rvhj0Wy-T31-ip_jW1ZQ_cvztNzsY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin(email: string) {
  try {
    // First, get all users and find by email
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError || !authUsers) {
      console.log(`Error listing users: ${authError?.message}`);
      return;
    }

    const authUser = authUsers.users.find(u => u.email === email);
    if (!authUser) {
      console.log(`User with email ${email} not found in auth.users`);
      return;
    }

    const userId = authUser.id;
    console.log(`Found user: ${userId}`);

    // Update the user's role in the public.users table
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        role: 'admin',
        full_name: authUser.user_metadata?.full_name || email.split('@')[0]
      })
      .select();

    if (error) {
      console.error('Error updating user role:', error);
    } else {
      console.log(`✅ Successfully made ${email} an admin!`);
      console.log('User data:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.log('Usage: npx tsx scripts/make-admin.ts <email>');
  console.log('Example: npx tsx scripts/make-admin.ts admin@example.com');
  process.exit(1);
}

makeUserAdmin(email);