'use client'

import { SimpleSidebar } from '@/components/layout/SimpleSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import NotificationContainer from '@/components/NotificationContainer'
import ModernToaster from '@/components/ModernToast'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'
import { useAuthStore } from '@/store/authStore'
import { useAdminTheme } from '@/hooks/useAdminTheme'
import { SocketIOProvider } from '@/contexts/SocketIOContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import '@/styles/admin-layout-consolidated.css' // FINAL FIX - Consolidated all layout rules
import '@/styles/admin-theme.css' // Dynamic theme styles

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated, sidebarCollapsed } = useAuthStore() // Add sidebarCollapsed
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('')

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Remove the scroll padding useEffect as it's no longer needed with Fixed Shell layout

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 admin-layout">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SimpleSidebar searchQuery={sidebarSearchQuery} />

        {/* Right Side Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area">
          {/* Header - Stays at top */}
          <AdminHeader
            onMenuClick={() => setMobileOpen(true)}
            onSearchChange={setSidebarSearchQuery}
          />

          {/* Page Content - Independent Scroll */}
          <main className="flex-1 overflow-y-auto outline-none dashboard-content p-3 lg:p-4 text-[13px]">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Modern Toast Notifications */}
      <ModernToaster />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const allowedRoles = [
    'admin', 'tenant_owner', 'tenant_admin', 'tenant_ops_manager',
    'tenant_finance_manager', 'tenant_staff', 'super_admin',
    'platform_support', 'platform_finance', 'platform_auditor',
    'branch_admin', 'staff'
  ];

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router, _hasHydrated]);

  const { loading: themeLoading } = useAdminTheme() // Load tenant theme
  const isComplete = _hasHydrated && !isLoading && isAuthenticated && !!user && !themeLoading;
  const { progress, message, subMessage } = useLoadingProgress(isComplete)

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
          <p className="text-gray-600 mb-1">You don&apos;t have permission to access the admin panel.</p>
          <p className="text-sm text-gray-500 mb-6">Your role: <strong>{user?.role}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Go Back
            </button>
            <button onClick={() => router.push('/auth/login')} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">
              Switch Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isComplete || progress < 100) {
    return (
      <ProgressLoader
        progress={progress}
        message={message}
        subMessage={subMessage}
      />
    )
  }

  return (
    <SocketIOProvider>
      <div>
        <AdminLayoutContent>{children}</AdminLayoutContent>
        {/* Smart Notification System - Both flash and bell notifications */}
        <NotificationContainer />
      </div>
    </SocketIOProvider>
  )
}
