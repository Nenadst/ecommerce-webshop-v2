import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

// The header name next-intl uses internally to pass the locale to server components
const NEXT_INTL_LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';

export default function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Detect locale from URL prefix
  const locale =
    routing.locales.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ??
    routing.defaultLocale;

  // Run next-intl middleware to handle redirects (e.g. / → /en/) and cookie syncing
  const intlResponse = intlMiddleware(request);

  // If it's a redirect, return it as-is — the browser will follow it and hit
  // the middleware again for the redirected URL.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // For pass-through responses: in Next.js 15, calling response.headers.set()
  // on a NextResponse.next({ request: { headers } }) silently drops the
  // forwarded request headers that next-intl set (X-NEXT-INTL-LOCALE).
  // Build a fresh response with all needed headers instead.
  const newHeaders = new Headers(request.headers);
  newHeaders.set(NEXT_INTL_LOCALE_HEADER, locale);
  newHeaders.set('x-locale', locale);

  const newResponse = NextResponse.next({ request: { headers: newHeaders } });

  // Preserve any Set-Cookie headers that intlMiddleware added (locale cookie sync)
  const setCookie = intlResponse.headers.get('set-cookie');
  if (setCookie) {
    newResponse.headers.set('set-cookie', setCookie);
  }

  return newResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
