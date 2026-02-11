'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CustomerSidebar from '@/components/layout/CustomerSidebar'
import CustomerHeader from '@/components/layout/CustomerHeader'
import NotificationContainer from '@/components/customer/NotificationContainer'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMenuClick = () => {
    setMobileMenuOpen(true)
  }

  const handleMobileClose = () => {
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    // Wait a bit for store to initialize
    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return

      // Multi-tenant: /customer/* requires tenant context - redirect to tenant equivalent or home
      const pathname = window.location.pathname
      const lastTenant = sessionStorage.getItem('lastVisitedTenant')
      const cookies = document.cookie.split('; ')
      const tenantCookie = cookies.find(row => row.startsWith('tenant-slug='))
      const tenantSlug = tenantCookie ? tenantCookie.split('=')[1] : lastTenant || ''

      // If we have a known tenant, redirect /customer/* to /{tenant}/* (tenant-scoped customer pages)
      if (tenantSlug && pathname.startsWith('/customer/')) {
        const subPath = pathname.replace('/customer', '') || '/dashboard'
        router.replace(`/${tenantSlug}${subPath}`)
        return
      }

      // No tenant context - redirect to home (user must select a tenant first)
      if (!tenantSlug) {
        router.replace('/')
        return
      }

      const loginPath = `/${tenantSlug}/auth/login`

      if (!isAuthenticated || !user) {
        router.push(loginPath)
        return
      }

      if (user.role !== 'customer') {
        router.push(loginPath)
        return
      }

      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Real-time notification toasts */}
      <NotificationContainer />

      {/* Sidebar */}
      <CustomerSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileClose}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        {/* Header */}
        <CustomerHeader onMenuClick={handleMenuClick} sidebarCollapsed={sidebarCollapsed} />

        {/* Page Content - Top padding for fixed header (h-16 = 64px, so pt-20 = 80px gives breathing room) */}
        <main className="pt-20 px-4 pb-4 lg:px-8 lg:pb-8">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
