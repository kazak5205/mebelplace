/**
 * Middleware - i18n routing and security headers
 */

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Skip i18n middleware for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    
    // Aggressive cache busting for admin pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Add security headers for admin too
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    return response;
  }

  // Redirect /auth/* to /* (for E2E tests compatibility)
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    const newPath = request.nextUrl.pathname.replace('/auth/', '/');
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url);
  }

  const response = intlMiddleware(request);

  // Aggressive cache busting for HTML pages
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  return response;
}

export const config = {
  matcher: ['/', '/(ru|kz|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
