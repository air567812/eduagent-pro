import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept Admin Route
  if (pathname.startsWith('/admin')) {
    const emailCookie = request.cookies.get('eduagent_email')?.value?.toLowerCase();
    const roleCookie = request.cookies.get('eduagent_role')?.value;

    const isPrimaryAdmin = emailCookie === 'arykothari@gmail.com';
    const isSuperAdmin = roleCookie === 'SUPER_ADMIN' || isPrimaryAdmin;

    // If cookies are present but not admin, deny access immediately
    if (emailCookie && !isSuperAdmin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(loginUrl);
    }

    // If no session cookie at all, redirect to login
    if (!emailCookie && !request.cookies.get('eduagent_token')?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
