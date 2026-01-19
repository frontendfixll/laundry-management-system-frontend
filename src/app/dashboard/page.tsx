'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function DashboardRedirect() {
  const router = useRouter()
  const { user, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!_hasHydrated) return

    // If not logged in, redirect to login
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Strict role-based redirect - each role goes to their specific dashboard
    const roleRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      center_admin: '/center-admin/dashboard',
      branch_admin: '/branch-admin/dashboard',
      branch_manager: '/center-admin/dashboard', // Map to center-admin
      staff: '/staff/dashboard',
      customer: '/customer/dashboard',
      superadmin: '/superadmin/dashboard'
    }

    const redirectPath = roleRoutes[user.role]
    
    if (redirectPath) {
      console.log(`🔄 Redirecting ${user.role} to: ${redirectPath}`)
      router.replace(redirectPath)
    } else {
      console.warn('Unknown role:', user.role, 'redirecting to login')
      router.push('/auth/login')
    }
  }, [user, _hasHydrated, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
