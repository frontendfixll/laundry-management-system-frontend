'use client'

import dynamic from 'next/dynamic'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useAdminTheme } from '@/hooks/useAdminTheme'
import { AlertTriangle } from 'lucide-react'

// Lazy-load every role dashboard. A logged-in user only renders one of them at
// a time, but the previous static imports pulled all 11 into the initial
// admin bundle (~70% wasted JS per user). `next/dynamic` splits each into its
// own chunk fetched on demand. ssr:false is fine here — these are admin
// surfaces gated by client auth, not SEO surfaces.
//
// NOTE: Next.js requires the options object to be a literal at every call
// site (its SWC plugin scans the AST and won't follow a const reference).
// Don't extract `{ ssr: false }` to a shared constant — it breaks the build.

const SuperAdminDashboard = dynamic(
    () => import('./SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })),
    { ssr: false }
)
const PlatformSupportDashboard = dynamic(
    () => import('./PlatformSupportDashboard').then(m => ({ default: m.PlatformSupportDashboard })),
    { ssr: false }
)
const PlatformFinanceDashboard = dynamic(
    () => import('./PlatformFinanceDashboard').then(m => ({ default: m.PlatformFinanceDashboard })),
    { ssr: false }
)
const PlatformAuditorDashboard = dynamic(
    () => import('./PlatformAuditorDashboard').then(m => ({ default: m.PlatformAuditorDashboard })),
    { ssr: false }
)
const TenantOwnerDashboard = dynamic(
    () => import('./TenantOwnerDashboard').then(m => ({ default: m.TenantOwnerDashboard })),
    { ssr: false }
)
const TenantAdminDashboard = dynamic(
    () => import('./TenantAdminDashboard').then(m => ({ default: m.TenantAdminDashboard })),
    { ssr: false }
)
const TenantOpsManagerDashboard = dynamic(
    () => import('./TenantOpsManagerDashboard').then(m => ({ default: m.TenantOpsManagerDashboard })),
    { ssr: false }
)
const TenantFinanceManagerDashboard = dynamic(
    () => import('./TenantFinanceManagerDashboard').then(m => ({ default: m.TenantFinanceManagerDashboard })),
    { ssr: false }
)
const TenantStaffDashboard = dynamic(
    () => import('./TenantStaffDashboard').then(m => ({ default: m.TenantStaffDashboard })),
    { ssr: false }
)
const DefaultAdminDashboard = dynamic(
    () => import('./DefaultAdminDashboard').then(m => ({ default: m.DefaultAdminDashboard })),
    { ssr: false }
)

/**
 * Role-Based Dashboard Router
 * Renders appropriate dashboard based on user's role
 */
export function RoleBasedDashboard() {
  const { user } = useAuthStore()
  const { userRole } = usePermissions()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  // Platform-level dashboards
  switch (userRole) {
    case 'super_admin':
    case 'superadmin':
      return <SuperAdminDashboard />

    case 'platform_support':
      return <PlatformSupportDashboard />

    case 'platform_finance':
      return <PlatformFinanceDashboard />

    case 'platform_auditor':
      return <PlatformAuditorDashboard />

    // Tenant-level dashboards
    case 'tenant_owner':
      return <TenantOwnerDashboard />

    case 'tenant_admin':
      return <TenantAdminDashboard />

    case 'tenant_ops_manager':
      return <TenantOpsManagerDashboard />

    case 'tenant_finance_manager':
      return <TenantFinanceManagerDashboard />

    case 'tenant_staff':
      return <TenantStaffDashboard />

    // Legacy roles
    case 'admin':
    case 'branch_admin':
    case 'staff':
      return <DefaultAdminDashboard />

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unknown Role</h2>
            <p className="text-gray-600">
              Role "{userRole}" is not recognized. Please contact support.
            </p>
          </div>
        </div>
      )
  }
}

/**
 * Dashboard Wrapper with Role-Specific Styling
 */
interface DashboardWrapperProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  roleColor?: string
}

export function DashboardWrapper({
  children,
  title,
  subtitle,
  roleColor = 'blue'
}: DashboardWrapperProps) {
  const { theme } = useAdminTheme()
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    gray: 'from-gray-500 to-gray-600'
  }

  // Use theme colors for the header if branding is available
  const headerStyle = {
    background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role-specific header - now theme aware */}
      <div
        className="text-white py-2 mb-3"
        style={headerStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-light tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-blue-100 text-[10px] opacity-90">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-4">
        {children}
      </div>
    </div>
  )
}