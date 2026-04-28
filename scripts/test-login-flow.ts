import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZHFvanV4c2l4dHhiYXZtcndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTQ0NDUsImV4cCI6MjA5MDU3MDQ0NX0.255kqWLPOMUNVd6ESlTdr-xFRKKQFpTNuIjFxnaURho';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('🔍 Testing login flow...\n');

    const email = 'dm570692@gmail.com';
    const password = 'Atonko-13';

    // Step 1: Try to sign in
    console.log('Step 1: Attempting sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return;
    }

    console.log('✅ Sign in successful!');
    console.log('User ID:', signInData.user?.id);
    console.log('User Email:', signInData.user?.email);

    // Step 2: Try to get user profile
    console.log('\nStep 2: Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', signInData.user!.id)
      .single();

    if (profileError) {
      console.log('❌ Profile fetch failed:', profileError.message);
      console.log('Error details:', profileError);
      return;
    }

    console.log('✅ Profile fetch successful!');
    console.log('Role:', profile?.role);
    console.log('Full Name:', profile?.full_name);

    if (profile?.role === 'admin') {
      console.log('\n✅ User is admin - should redirect to /admin');
    } else {
      console.log('\n❌ User is not admin');
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

testLogin();
