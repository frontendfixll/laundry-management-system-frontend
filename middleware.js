import { NextResponse } from 'next/server';

// Routes that require authentication (server-side check)
const PROTECTED_PREFIXES = [
  '/admin',
  '/customer',
  '/branch-admin',
  '/center-admin',
  '/branch',
  '/support',
  '/dashboard',
  '/staff',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // --- 1. Block direct /auth routes for customers (must use /[tenant]/auth) ---
  // /auth/register is admin-only — customers must register via tenant page
  if (pathname === '/auth/register') {
    const token = request.cookies.get('laundry_access_token')?.value;
    // If no token (not logged in), redirect to home — they should find their tenant
    if (!token) {
      const homeUrl = url.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }
  }

  // --- 2. Auth Protection for Protected Routes ---
  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isProtectedRoute) {
    // Check for auth token in cookies (HTTP-only cookie set by backend)
    const token = request.cookies.get('laundry_access_token')?.value
      || request.cookies.get('laundry_superadmin_token')?.value;

    if (!token) {
      // No token found — redirect to login
      // Try to preserve the intended destination
      const loginUrl = url.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- 2. Tenant Subdomain Routing (existing logic) ---
  if (!host) return NextResponse.next();

  const parts = host.split('.');
  const subdomain = parts[0];

  const skipSubdomains = [
    'laundrylobby',
    'laundrypro',
    'www',
    'localhost',
    '127',
    'vercel'
  ];

  // Skip if it's a main domain or localhost
  if (skipSubdomains.some(skip => subdomain.includes(skip)) || parts.length <= 2) {
    return NextResponse.next();
  }

  // For tenant subdomains (e.g., tenant1.laundrylobby.com)
  if (parts.length > 2 && subdomain && !subdomain.includes('vercel')) {
    url.searchParams.set('tenant', subdomain);

    const response = NextResponse.rewrite(url);
    response.headers.set('X-Tenant', subdomain);
    response.headers.set('X-Original-Host', host);

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
