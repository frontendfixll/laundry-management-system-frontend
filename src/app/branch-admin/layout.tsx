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
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Quick check for better UX - no timeout needed
    if (!isAuthenticated || !user) {
      router.push('/auth/login')
      return
    }

    if (user.role !== 'branch_admin') {
      router.push('/auth/login')
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
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
