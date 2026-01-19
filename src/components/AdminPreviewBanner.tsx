'use client'

import { usePreviewStore } from '@/store/previewStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Eye, ArrowLeft, Shield } from 'lucide-react'
import { useRoleNavigation } from '@/hooks/useRoleNavigation'

/**
 * Banner shown when admin is in preview mode
 * Shows at top of customer pages with option to return to admin dashboard
 */
export function AdminPreviewBanner() {
  const { isAdminPreviewMode, originalRole, clearPreviewMode } = usePreviewStore()
  const { user } = useAuthStore()
  const { goToDashboard } = useRoleNavigation()
  const router = useRouter()

  // Only show if in preview mode
  if (!isAdminPreviewMode || !originalRole) {
    return null
  }

  const returnToAdminDashboard = () => {
    clearPreviewMode()
    
    // Navigate to original admin dashboard
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      center_admin: '/center-admin/dashboard',
      branch_admin: '/branch-admin/dashboard',
      branch_manager: '/center-admin/dashboard'
    }
    
    const adminDashboard = dashboardRoutes[originalRole] || '/admin/dashboard'
    router.push(adminDashboard)
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 sticky top-0">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="text-sm font-medium">
          Admin Preview Mode - Viewing as Customer
        </span>
      </div>
      
      <button
        onClick={returnToAdminDashboard}
        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
      >
        <Shield className="w-4 h-4" />
        Back to Admin Dashboard
      </button>
    </div>
  )
}