'use client'

import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useAdminTheme } from '@/hooks/useAdminTheme'
import { SuperAdminDashboard } from './SuperAdminDashboard'
import { PlatformSupportDashboard } from './PlatformSupportDashboard'
import { PlatformFinanceDashboard } from './PlatformFinanceDashboard'
import { PlatformAuditorDashboard } from './PlatformAuditorDashboard'
import { TenantOwnerDashboard } from './TenantOwnerDashboard'
import { TenantAdminDashboard } from './TenantAdminDashboard'
import { TenantOpsManagerDashboard } from './TenantOpsManagerDashboard'
import { TenantFinanceManagerDashboard } from './TenantFinanceManagerDashboard'
import { TenantStaffDashboard } from './TenantStaffDashboard'
import { DefaultAdminDashboard } from './DefaultAdminDashboard'
import { AlertTriangle } from 'lucide-react'

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