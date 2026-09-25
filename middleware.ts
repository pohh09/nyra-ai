import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_ONLY_ROUTES = [
  '/tasks',
  '/documents',
  '/memory',
  '/career',
  '/dashboard',
  '/projects',
  '/research',
  '/admin',
  '/onboarding',
];

const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let isAuthenticated = false;

  // Check custom local auth session token cookie
  const localSessionCookie = request.cookies.get('nyra_session_token')?.value;
  if (localSessionCookie && localSessionCookie.startsWith('session_')) {
    isAuthenticated = true;
  }

  // Check Supabase session if configured
  if (!isAuthenticated && supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
      }
    } catch {
      // Ignore edge lookup error
    }
  }

  const isGuest = request.cookies.get('nyra_is_guest')?.value === 'true';
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) => pathname.startsWith(route));
  const isChatRoute = pathname.startsWith('/chat-ui');
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // If user is authenticated and trying to access login/signup, redirect to chat-ui
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = new URL('/chat-ui', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated-only routes strictly require authenticated status (guests blocked)
  if (!isAuthenticated && isAuthOnlyRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Chat-UI route requires either an authenticated user or an active guest session
  if (!isAuthenticated && !isGuest && isChatRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};