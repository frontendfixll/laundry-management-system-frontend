import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Reserved routes that should not be treated as tenant slugs
const RESERVED_ROUTES = [
  'admin',
  'auth',
  'api',
  'branch',
  'center-admin',
  'customer',
  'debug-login',
  'help',
  'pricing',
  'role-switcher',
  'services',
  'test-auth',
  'track',
  'version',
  'releases',
  'preview-templates',
  '_next',
  'favicon.ico',
  'icon',
  'icon.svg',
  'apple-icon',
  'apple-icon.png',
  'images',
  'public',
  'www',
  'superadmin',
  'marketing',
  // 'tenacy' is the canonical no-tenant subdomain that hosts the
  // "Find Your Laundry" search page. Treating it as a reserved
  // segment keeps app/page.tsx routing it as the root, instead of
  // looking up "tenacy" as a tenant.
  'tenacy'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Get all path segments
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0] || ''
  const secondSegment = pathSegments[1] || ''

  // Extract subdomain from hostname (only matches *.laundrylobby.com).
  // Custom domain falls back: if a tenant configured `customDomain`
  // (e.g. ramlaundry.com), middleware treats the full host as the tenant
  // identifier. Backend's /branding/:identifier handler already does an OR
  // match across slug/subdomain/customDomain, so the lookup just works.
  const subdomain = extractSubdomain(hostname)
  const customDomain = !subdomain ? extractCustomDomain(hostname) : null
  const hostTenant = subdomain || customDomain

  // Enhanced logging for production troubleshooting
  // Always log in development, and log important transitions in production (especially for admin routes)
  if (process.env.NODE_ENV === 'development' || (pathname.includes('admin') && !pathname.includes('_next'))) {
    console.log(`🌐 [Middleware] Host: ${hostname} | Sub: ${subdomain} | Path: ${pathname} | Seg1: ${firstSegment} | Seg2: ${secondSegment}`)
  }

  // /auth/register is admin-only — unauthenticated users must register via /[tenant]/auth/register.
  // If no token, send them to home so they pick a tenant first.
  if (pathname === '/auth/register') {
    const token = request.cookies.get('laundry_access_token')?.value
    if (!token) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
    }
  }

  // CRITICAL FIX: If path starts with a reserved route, treat it as a global route immediately.
  // This ensures /admin/* is NEVER rewritten to a tenant-specific path like /services.
  if (RESERVED_ROUTES.includes(firstSegment)) {
    if (hostTenant) {
      console.log(`🔧 [Middleware] Reserved route '${firstSegment}' on host '${hostname}' -> Passing as global route with tenant context`)
      const response = NextResponse.next()
      // Set tenant headers for components to use (branding, etc.)
      response.headers.set('x-tenant-slug', hostTenant)
      if (subdomain) response.headers.set('x-tenant-subdomain', subdomain)
      if (customDomain) response.headers.set('x-tenant-custom-domain', customDomain)
      response.cookies.set('tenant-slug', hostTenant, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return response
    }

    // Main domain, reserved route - standard behavior
    return NextResponse.next()
  }

  // Determine tenant identifier — prefer host (subdomain or customDomain)
  // over path-based fallback, so e.g. ram.laundrylobby.com always wins
  // over /someslug in the URL.
  let tenantIdentifier: string | null = null

  if (hostTenant) {
    tenantIdentifier = hostTenant
  } else if (firstSegment && !RESERVED_ROUTES.includes(firstSegment)) {
    tenantIdentifier = firstSegment
  }

  // If we have a tenant identifier, handle tenant routing/context
  if (tenantIdentifier) {
    console.log('🏢 Tenant detected:', tenantIdentifier)

    // Check if the next segment is a reserved route (e.g., /dgsfg/admin)
    const secondSegment = pathSegments[1]
    if (secondSegment && RESERVED_ROUTES.includes(secondSegment)) {
      // Rewrite to the global route but keep the tenant context
      const newPathname = '/' + pathSegments.slice(1).join('/')
      const url = request.nextUrl.clone()
      url.pathname = newPathname

      const response = NextResponse.rewrite(url)
      response.headers.set('x-tenant-slug', tenantIdentifier)
      response.cookies.set('tenant-slug', tenantIdentifier, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return response
    }

    // Host-derived tenant access (subdomain like prakash.laundrylobby.com OR
    // a custom domain like ramlaundry.com). Next.js's app/[tenant]/* routes
    // need the slug in the path, so rewrite to inject it. Skip when the user
    // already typed the slug redundantly (e.g. prakash.laundrylobby.com/prakash).
    if (hostTenant && tenantIdentifier === hostTenant && firstSegment !== hostTenant) {
      const url = request.nextUrl.clone()
      url.pathname = `/${tenantIdentifier}${pathname === '/' ? '' : pathname}`

      const response = NextResponse.rewrite(url)
      response.headers.set('x-tenant-slug', tenantIdentifier)
      if (subdomain) response.headers.set('x-tenant-subdomain', subdomain)
      if (customDomain) response.headers.set('x-tenant-custom-domain', customDomain)
      response.cookies.set('tenant-slug', tenantIdentifier, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      return response
    }

    // Standard tenant route (e.g., /dgsfg path-based, or subdomain access where
    // the path already starts with the slug, or custom-domain access where
    // the rewrite branch above already returned)
    const response = NextResponse.next()
    response.headers.set('x-tenant-slug', tenantIdentifier)
    if (subdomain) response.headers.set('x-tenant-subdomain', subdomain)
    if (customDomain) response.headers.set('x-tenant-custom-domain', customDomain)

    // Store in cookie for client-side access
    response.cookies.set('tenant-slug', tenantIdentifier, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return response
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register']

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route)

  // If it's a public route or matches reserved routes directly (no tenant prefix), allow access
  if (isPublicRoute || RESERVED_ROUTES.includes(firstSegment)) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle authentication on the client side
  return NextResponse.next()
}

/**
 * Returns the host as a tenant identifier when the request comes in via a
 * tenant's CUSTOM domain (i.e. anything that isn't laundrylobby.com,
 * vercel.app, localhost, or an IP). The middleware then rewrites the path
 * so app/[tenant]/* matches and the layout fetches branding by customDomain.
 *
 * Examples:
 * - ramlaundry.com → 'ramlaundry.com'
 * - www.ramlaundry.com → 'www.ramlaundry.com'
 * - prakash.laundrylobby.com → null (handled by extractSubdomain)
 * - some-preview.vercel.app → null
 * - localhost:3005 → null
 */
function extractCustomDomain(hostname: string): string | null {
  const cleanHostname = hostname.split(':')[0]

  if (cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) return null
  if (cleanHostname.endsWith('.vercel.app')) return null
  if (cleanHostname === 'laundrylobby.com' || cleanHostname.endsWith('.laundrylobby.com')) return null

  return cleanHostname
}

/**
 * Extract subdomain from hostname
 * Examples:
 * - prakash.laundrylobby.com → prakash
 * - www.laundrylobby.com → null (reserved)
 * - laundrylobby.com → null (main domain)
 * - localhost:3002 → null (development)
 */
function extractSubdomain(hostname: string): string | null {
  // Remove port if present
  const cleanHostname = hostname.split(':')[0]

  // Skip localhost and IP addresses
  if (cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) {
    return null
  }

  // Skip Vercel preview URLs
  if (cleanHostname.endsWith('.vercel.app')) {
    return null
  }

  // Split hostname into parts
  const parts = cleanHostname.split('.')

  // Need at least 3 parts for subdomain (subdomain.domain.com)
  if (parts.length < 3) {
    return null
  }

  // Check if it's our main domain
  const domain = parts.slice(-2).join('.') // Get last 2 parts (domain.com)
  if (domain !== 'laundrylobby.com') {
    return null
  }

  // Get subdomain (first part)
  const subdomain = parts[0]

  // Skip reserved subdomains
  if (RESERVED_ROUTES.includes(subdomain)) {
    return null
  }

  return subdomain
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon|icon.svg|apple-icon|apple-icon.png).*)',
  ],
}
