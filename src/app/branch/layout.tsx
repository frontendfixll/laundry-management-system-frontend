'use client'

import { useState } from 'react'
import { BranchSidebar } from '@/components/layout/BranchSidebar'
import { BranchNavbar } from '@/components/layout/BranchNavbar'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function BranchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, token, _hasHydrated, updateUser } = useAuthStore()
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Refresh user permissions from backend
  useEffect(() => {
    const refreshPermissions = async () => {
      if (!token || !user || user.role !== 'center_admin') return
      
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

    if (_hasHydrated && isAuthenticated && user?.role === 'center_admin') {
      refreshPermissions()
    }
  }, [_hasHydrated, isAuthenticated, user?.role, token])

  useEffect(() => {
    // Wait for store to hydrate from localStorage
    if (!_hasHydrated) {
      return
    }
    
    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'center_admin') {
      router.push('/auth/login')
      return
    }
    
    setIsReady(true)
  }, [isAuthenticated, user, router, _hasHydrated])

  if (!_hasHydrated || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Branch Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchNavbar />
      <div className="flex pt-16">
        <BranchSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <main className={`flex-1 p-4 lg:p-6 overflow-x-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
