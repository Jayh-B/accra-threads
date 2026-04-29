import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ── Public routes — no auth required ────────────────────────────────────────
const PUBLIC_ROUTES = ['/', '/login', '/admin-login', '/shop', '/lookbook', '/support', '/home'];
const PUBLIC_PREFIXES = ['/shop/', '/auth/', '/_next/', '/favicon', '/api/', '/public/'];

// ── Routes that require authentication ──────────────────────────────────────
const PROTECTED_ROUTES = ['/account', '/cart', '/checkout', '/orders'];

// ── Routes that require admin role ─────────────────────────────────────────
const ADMIN_ROUTES = ['/admin'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through public routes and static assets immediately
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

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Admin Route Guard ──────────────────────────────────────────────────────
  if (isAdminRoute(pathname)) {
    if (!user) {
      console.log('🔐 [Middleware] Admin route - no user, redirecting to admin-login');
      const adminLoginUrl = new URL('/admin-login', request.url);
      adminLoginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        console.log('❌ [Middleware] Admin access denied - not an admin');
        const homeUrl = new URL('/home', request.url);
        homeUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(homeUrl);
      }

      console.log('✅ [Middleware] Admin access granted');
    } catch (err) {
      console.error('❌ [Middleware] Admin role check error:', err);
      const homeUrl = new URL('/home', request.url);
      homeUrl.searchParams.set('error', 'auth_error');
      return NextResponse.redirect(homeUrl);
    }

    return response;
  }

  // ── Protected Routes (require authentication) ───────────────────────────────
  if (isProtectedRoute(pathname)) {
    if (!user) {
      console.log('🔐 [Middleware] Protected route - no user, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log('✅ [Middleware] Access to protected route granted');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
