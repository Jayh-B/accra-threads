import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmdqojuxsixtxbavmrwq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZHFvanV4c2l4dHhiYXZtcndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTQ0NDUsImV4cCI6MjA5MDU3MDQ0NX0.255kqWLPOMUNVd6ESlTdr-xFRKKQFpTNuIjFxnaURho';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthSetup() {
  try {
    console.log('🔍 Testing Auth Setup...\n');

    // Test 1: Check if environment variables are set
    console.log('Test 1: Environment Variables');
    console.log('✅ Supabase URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('✅ Anon Key: ' + supabaseAnonKey.substring(0, 20) + '...');

    // Test 2: Check current session
    console.log('\nTest 2: Current Session');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session.session) {
      console.log('✅ User is logged in:', session.session.user.email);
    } else {
      console.log('ℹ️  No active session (expected for fresh login)');
    }

    // Test 3: Test sign out first (to ensure fresh login)
    console.log('\nTest 3: Signing out any existing sessions...');
    await supabase.auth.signOut();
    console.log('✅ Signed out');

    // Test 4: Test sign in
    console.log('\nTest 4: Testing Sign In');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'dm570692@gmail.com',
      password: 'Atonko-13',
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      console.log('Error code:', signInError.status);
      console.log('Full error:', JSON.stringify(signInError, null, 2));
      return;
    }

    console.log('✅ Sign in successful');
    console.log('  - User ID:', signInData.user?.id);
    console.log('  - Email:', signInData.user?.email);
    console.log('  - Session:', signInData.session ? '✅ Yes' : '❌ No');

    // Test 5: Verify user profile exists
    console.log('\nTest 5: Checking User Profile');
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signInData.user!.id)
      .single();

    if (profileError) {
      console.log('❌ Profile fetch failed:', profileError.message);
      console.log('Error code:', profileError.code);
      return;
    }

    console.log('✅ Profile found');
    console.log('  - Full Name:', profile?.full_name);
    console.log('  - Role:', profile?.role);
    console.log('  - Email:', profile?.email);

    if (profile?.role === 'admin') {
      console.log('\n✅ User should have admin access!');
    } else {
      console.log('\n⚠️  User does not have admin role');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testAuthSetup();
