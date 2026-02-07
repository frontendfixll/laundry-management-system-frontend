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
  '_next',
  'favicon.ico',
  'images',
  'public',
  'www',
  'superadmin',
  'marketing'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Get the first segment of the path
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  // Extract subdomain from hostname
  const subdomain = extractSubdomain(hostname)

  // Disable logging to prevent spam - only log for debugging
  if (process.env.NODE_ENV === 'development' && pathname !== '/login') {
    console.log('🌐 Middleware - Hostname:', hostname, 'Subdomain:', subdomain, 'Path:', pathname)
  }

  // CRITICAL FIX: If subdomain exists and path starts with a reserved route,
  // treat it as a global route, NOT a tenant route
  if (subdomain && RESERVED_ROUTES.includes(firstSegment)) {
    console.log('🔧 Reserved route on subdomain detected:', firstSegment, '- treating as global route')
    const response = NextResponse.next()
    // Still set tenant context for the application to use
    response.headers.set('x-tenant-slug', subdomain)
    response.headers.set('x-tenant-subdomain', subdomain)
    response.cookies.set('tenant-slug', subdomain, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    return response
  }

  // Determine tenant identifier (subdomain or first path segment)
  let tenantIdentifier: string | null = null

  if (subdomain && !RESERVED_ROUTES.includes(subdomain)) {
    tenantIdentifier = subdomain
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

    // Standard tenant route (e.g., /dgsfg or subdomain access)
    const response = NextResponse.next()
    response.headers.set('x-tenant-slug', tenantIdentifier)
    if (subdomain) {
      response.headers.set('x-tenant-subdomain', subdomain)
    }

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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
