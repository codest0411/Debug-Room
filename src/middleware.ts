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

  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login');

    if (!user && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check admin role for non-login admin routes
    if (!isLoginPage && user) {
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
