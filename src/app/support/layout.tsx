'use client'

import {
  SupportSidebar,
  SupportSidebarProvider,
  useSupportSidebar,
} from '@/components/layout/SupportSidebar'
import SupportHeader from '@/components/layout/SupportHeader'
import NotificationContainer from '@/components/NotificationContainer'
import RefreshPrompt from '@/components/RefreshPrompt'
import ModernToaster from '@/components/ModernToast'
import ConnectionStatus from '@/components/ConnectionStatus'
import { useAuthStore } from '@/store/authStore'
import { useRefreshPromptStore } from '@/store/refreshPromptStore'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePermissionSync } from '@/hooks/usePermissionSync'

function SupportLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed, setMobileOpen } = useSupportSidebar()
  const { setAuth, user, _hasHydrated } = useAuthStore()
  const { showPrompt, setShowPrompt } = useRefreshPromptStore()
  const { isConnected } = useSocketIONotifications()

  // Enable real-time permission sync for support users too
  usePermissionSync({
    autoReload: false,
    onPermissionsUpdated: () => {
      console.log('🔄 Support permissions updated, showing refresh prompt')
    },
    onRoleChanged: (oldRole, newRole) => {
      console.log(`👤 Support role changed: ${oldRole} → ${newRole}`)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Refresh Prompt */}
      {showPrompt && (
        <RefreshPrompt
          onRefresh={() => {
            setShowPrompt(false);
            window.location.reload();
          }}
          onDismiss={() => setShowPrompt(false)}
        />
      )}

      {/* Sidebar - Using Support Sidebar for support-specific navigation */}
      <SupportSidebar />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        {/* Header - Using Support Header for consistent theme */}
        <SupportHeader onMenuClick={() => setMobileOpen(true)} sidebarCollapsed={isCollapsed} />

        {/* Page Content - Add padding for fixed header (h-16 = 64px) */}
        <main className="p-4 lg:p-6 mt-16">
          <div className="max-w-screen-2xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Real-time Connection Status */}
      <ConnectionStatus isConnected={isConnected} />

      {/* Modern Toast Notifications */}
      <ModernToaster />
    </div>
  )
}

export default function SupportLayout({
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

    if (user.role !== 'support') {
      router.push('/auth/login');
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router, _hasHydrated]);

  if (!_hasHydrated || isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SupportSidebarProvider>
      <SupportLayoutContent>{children}</SupportLayoutContent>
      {/* Real-time notification toasts */}
      <NotificationContainer />
    </SupportSidebarProvider>
  )
}