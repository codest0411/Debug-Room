import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isLoginPage = 
    request.nextUrl.pathname.startsWith('/admin/login') || 
    request.nextUrl.pathname.startsWith('/auth/login');

  let user = null;
  // ONLY check session if we are NOT on a login page to avoid 10s timeouts on public routes
  if (!isLoginPage) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      // Network jitter
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    if (user && !isLoginPage) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!userData?.is_admin) {
        return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
      }
    }
  }

  // Protect profile and room routes
  const isProtectedUserRoute = 
    request.nextUrl.pathname.startsWith('/profile') || 
    request.nextUrl.pathname.startsWith('/room');

  if (isProtectedUserRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/room/:path*'
  ],
};
