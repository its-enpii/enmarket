/**
 * Middleware untuk:
 * 1. Locale routing via next-intl (root `/` → `/id`, dll.)
 * 2. /admin/* auth gate (redirect ke /[locale]/login kalau tidak ada cookie)
 * 3. /akun/* customer auth gate (redirect ke /[locale]/masuk kalau tidak ada cookie)
 *
 * API routes (`app/api/**`) dikecualikan dari matcher — tidak butuh locale.
 */

import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // Jalankan next-intl dulu: handle `/` → `/id`, prefix locale, dll.
  const intlResp = intl(request);
  const pathname = request.nextUrl.pathname;

  // Admin auth gate — jalan SETELAH intl agar path sudah locale-prefixed.
  const isAdminPath = /^\/(id|en)\/admin(\/|$)/.test(pathname);
  if (isAdminPath) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      const localeMatch = pathname.match(/^\/(id|en)/);
      const locale = localeMatch?.[1] ?? routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Customer auth gate — jalan SETELAH intl agar path sudah locale-prefixed.
  const isCustomerAccountPath = /^\/(id|en)\/akun(\/|$)/.test(pathname);
  if (isCustomerAccountPath) {
    const customerToken = request.cookies.get('customer_token')?.value;
    if (!customerToken) {
      const localeMatch = pathname.match(/^\/(id|en)/);
      const locale = localeMatch?.[1] ?? routing.defaultLocale;
      const strippedPath = pathname.replace(/^\/(id|en)/, '') || '/akun';
      const masukUrl = new URL(`/${locale}/masuk`, request.url);
      masukUrl.searchParams.set('next', strippedPath);
      return NextResponse.redirect(masukUrl);
    }
  }

  return intlResp;
}

export const config = {
  // Skip Next internals, static assets, dan SEMUA API routes (locale-unaware).
  matcher: ['/((?!api|tripay|_next|_vercel|.*\\..*).*)'],
};
