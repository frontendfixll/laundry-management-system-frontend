'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications' // Use Socket.IO notifications
import { usePermissionSync } from '@/hooks/usePermissionSync'

export function PermissionSyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const { isConnected } = useSocketIONotifications() // Use Socket.IO connection status
  const { refreshPermissions } = usePermissionSync()

  // Initialize permission sync for authenticated users
  useEffect(() => {
    if (isAuthenticated && user && isConnected) {
      console.log('🔄 Permission sync initialized for user:', user.email)
    }
  }, [isAuthenticated, user, isConnected])

  return <>{children}</>
}