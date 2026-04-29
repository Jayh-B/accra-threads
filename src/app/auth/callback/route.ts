import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // After OAuth / email-verify redirect, send user to /home (not landing page)
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore — middleware handles cookie refresh
            }
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('❌ Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    // After successful auth, create or verify user profile exists
    if (data.user) {
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        // If user profile doesn't exist, create it
        if (fetchError || !existingProfile) {
          console.log('📝 Creating new user profile for:', data.user.id);
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
                role: 'customer',
                loyalty_points: 0,
              },
            ]);

          if (insertError) {
            console.error('⚠️ Error creating user profile:', insertError.message);
            // Don't fail the auth flow - user will still be authenticated
          } else {
            console.log('✅ User profile created successfully');
          }
        } else {
          console.log('✅ User profile already exists');
        }
      } catch (err) {
        console.error('❌ Error in profile creation:', err);
        // Continue anyway - user is authenticated
      }
    }

    // Redirect to next page or home
    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(`${origin}/login`);
};
