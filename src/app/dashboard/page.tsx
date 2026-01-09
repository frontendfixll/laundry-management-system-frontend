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

    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'center_admin':
      case 'branch_manager':
        router.push('/center-admin/dashboard')
        break
      case 'customer':
        router.push('/customer/dashboard')
        break
      default:
        // If role is unknown, try customer dashboard
        router.push('/customer/dashboard')
    }
  }, [user, _hasHydrated, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
