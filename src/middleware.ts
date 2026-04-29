import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ── Public routes — no auth required ─────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/admin-login', '/shop', '/lookbook', '/support'];
const PUBLIC_PREFIXES = ['/shop/', '/auth/', '/_next/', '/favicon', '/api/'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through static assets and public routes immediately
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  // Build a Supabase SSR client that can read AND write cookies on this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — keeps access token valid silently
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected route + no user → redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Admin route guard ───────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    console.log('🔐 [Middleware] Admin route access attempt:', { userId: user.id, pathname });
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('🔐 [Middleware] Profile check:', { profile, role: profile?.role });

      if (!profile || profile.role !== 'admin') {
        console.log('❌ [Middleware] Access denied - not admin');
        const homeUrl = new URL('/home', request.url);
        homeUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(homeUrl);
      }
      
      console.log('✅ [Middleware] Access granted - user is admin');
    } catch (err) {
      console.error('❌ [Middleware] Role check error:', err);
      // If the role check fails for any reason, let the page itself handle it
      // rather than blocking the user entirely
      return response;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
