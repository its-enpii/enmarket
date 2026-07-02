/**
 * Middleware untuk proteksi route /admin/*.
 * Kalau tidak ada cookie admin_token → redirect ke /login.
 *
 * Validasi FULL (verify token ke Laravel /api/admin/me) dilakukan di layout
 * server component — middleware ini hanya gate ringan untuk UX.
 */

import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // /admin/* butuh auth kecuali /admin/login (tidak ada, login di root)
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};