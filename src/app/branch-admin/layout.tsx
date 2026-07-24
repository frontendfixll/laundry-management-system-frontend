'use client'

import {
  BranchAdminSidebar,
  BranchAdminSidebarProvider,
  useBranchAdminSidebar,
} from '@/components/layout/BranchAdminSidebar'
import BranchAdminHeader from '@/components/layout/BranchAdminHeader'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function BranchAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setMobileOpen } = useBranchAdminSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <BranchAdminSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Header - Fixed */}
        <BranchAdminHeader onMenuClick={() => setMobileOpen(true)} sidebarCollapsed={isCollapsed} />

        {/* Page Content - Normal padding for sticky header */}
        <main className="p-4 lg:p-6">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default function BranchAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    if (!_hasHydrated) return

    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'branch_admin') {
      setAccessDenied(true)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, user, router, _hasHydrated])

  if (!_hasHydrated || isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">{!_hasHydrated ? 'Loading...' : 'Checking access...'}</p>
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
          <p className="text-gray-600 mb-1">You don&apos;t have permission to access this section.</p>
          <p className="text-sm text-gray-500 mb-6">Your role: <strong>{user?.role}</strong> | Required: <strong>branch_admin</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Go Back</button>
            <button onClick={() => router.push('/auth/login')} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Switch Account</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BranchAdminSidebarProvider>
      <BranchAdminLayoutContent>{children}</BranchAdminLayoutContent>
    </BranchAdminSidebarProvider>
  )
}
