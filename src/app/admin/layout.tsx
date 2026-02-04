'use client'

import { SimpleSidebar } from '@/components/layout/SimpleSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import NotificationContainer from '@/components/NotificationContainer'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import ModernToaster from '@/components/ModernToast'
import ProgressLoader from '@/components/ui/ProgressLoader'
import { useLoadingProgress } from '@/hooks/useLoadingProgress'
import { useAuthStore } from '@/store/authStore'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import '@/styles/admin-layout-consolidated.css' // FINAL FIX - Consolidated all layout rules

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated, sidebarCollapsed } = useAuthStore() // Add sidebarCollapsed
  const [isMobile, setIsMobile] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
        <SimpleSidebar />

        {/* Right Side Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden main-content-area">
          {/* Header - Stays at top */}
          <AdminHeader
            onMenuClick={() => setMobileOpen(true)}
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

  useEffect(() => {
    // Wait for store to hydrate
    if (!_hasHydrated) {
      return;
    }

    // Quick check for better UX - no timeout needed
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Check if user has admin access (any admin role)
    const allowedRoles = [
      'admin', 'tenant_owner', 'tenant_admin', 'tenant_ops_manager',
      'tenant_finance_manager', 'tenant_staff', 'super_admin',
      'platform_support', 'platform_finance', 'platform_auditor',
      'branch_admin', 'staff' // Legacy roles for backward compatibility
    ];

    if (!allowedRoles.includes(user.role)) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router, _hasHydrated]);

  const { progress, message, subMessage } = useLoadingProgress(_hasHydrated && !isLoading && isAuthenticated && !!user)

  if (!_hasHydrated || isLoading || !isAuthenticated || !user || progress < 100) {
    return (
      <ProgressLoader
        progress={progress}
        message={message}
        subMessage={subMessage}
      />
    )
  }

  return (
    <div>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      {/* Smart Notification System - Both flash and bell notifications */}
      <NotificationContainer />
    </div>
  )
}
