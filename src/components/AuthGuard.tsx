'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    if (!_hasHydrated) return

    console.log('AuthGuard check after hydration:', { isAuthenticated, user, allowedRoles })
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log('Role not allowed:', user.role, 'Required:', allowedRoles)
      // Redirect to appropriate dashboard based on user role
      const roleRoutes = {
        customer: '/customer/dashboard',
        admin: '/admin/dashboard',
        branch_admin: '/branch-admin/dashboard',
        staff: '/staff/dashboard',
        superadmin: '/superadmin/dashboard',
      }
      
      // Backward compatibility: map old roles to admin
      let effectiveRole = user.role
      if (user.role === 'center_admin') {
        effectiveRole = 'admin'
      }
      if (user.role === 'branch_manager') {
        effectiveRole = 'branch_admin'
      }
      
      const redirectPath = roleRoutes[effectiveRole as keyof typeof roleRoutes]
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push('/auth/login')
      }
      return
    }

    console.log('Auth check passed')
  }, [_hasHydrated, isAuthenticated, user, allowedRoles, router])

  // Show loading while store is hydrating or checking auth
  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!_hasHydrated ? 'Loading...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    )
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
          <p className="text-sm text-gray-500">Required: {allowedRoles?.join(', ')}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
