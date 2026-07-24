'use client'

import { useState } from 'react'
import { CenterAdminSidebar } from '@/components/layout/CenterAdminSidebar'
import { CenterAdminNavbar } from '@/components/layout/CenterAdminNavbar'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CenterAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, token, _hasHydrated, updateUser } = useAuthStore()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Refresh user permissions from backend
  useEffect(() => {
    const refreshPermissions = async () => {
      if (!token || !user || user.role !== 'admin') return
      
      try {
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data?.user?.permissions) {
            // Update permissions in store if they changed
            const newPermissions = data.data.user.permissions
            if (JSON.stringify(newPermissions) !== JSON.stringify(user.permissions)) {
              updateUser({ permissions: newPermissions })
            }
          }
        }
      } catch (error) {
        console.error('Failed to refresh permissions:', error)
      }
    }

    if (_hasHydrated && isAuthenticated && user?.role === 'admin') {
      refreshPermissions()
    }
  }, [_hasHydrated, isAuthenticated, user?.role, token])

  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return

    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    // Accept both 'admin' and legacy 'center_admin' roles
    if (user.role !== 'admin' && user.role !== 'center_admin') {
      setAccessDenied(true)
      setIsReady(true)
      return
    }

    setIsReady(true)
  }, [isAuthenticated, user, router, _hasHydrated])

  if (!_hasHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{!_hasHydrated ? 'Loading...' : 'Loading Admin Panel...'}</p>
        </div>
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-1">You don&apos;t have permission to access the center admin panel.</p>
          <p className="text-sm text-gray-500 mb-6">Your role: <strong>{user?.role}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Go Back</button>
            <button onClick={() => router.push('/auth/login')} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Switch Account</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CenterAdminNavbar onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex pt-16">
        <CenterAdminSidebar 
          collapsed={sidebarCollapsed} 
          onCollapsedChange={setSidebarCollapsed}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <main className={`flex-1 p-4 lg:p-6 overflow-x-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
