'use client'

import { useEffect, useCallback, useState } from 'react'
import { useSocketIONotifications } from './useSocketIONotifications'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'

interface RBACNotification {
  type: 'role_change' | 'permission_change' | 'session_revoked' | 'force_session_refresh'
  userId?: string
  roleId?: string
  roleName?: string
  changeType?: string
  permissionChanges?: Record<string, any>
  roleChanges?: string[]
  reason?: string
  message?: string
  priority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  timestamp?: string
  changedBy?: string
}

interface RBACNotificationStats {
  totalReceived: number
  permissionUpdates: number
  roleChanges: number
  sessionActions: number
  lastNotification: RBACNotification | null
}

export function useRBACNotifications() {
  const { user, updatePermissions, logout } = useAuthStore()
  const { isConnected } = useSocketIONotifications()
  const [stats, setStats] = useState<RBACNotificationStats>({
    totalReceived: 0,
    permissionUpdates: 0,
    roleChanges: 0,
    sessionActions: 0,
    lastNotification: null
  })

  // Handle permission sync (real-time permission updates)
  const handlePermissionSync = useCallback(async (data: any) => {
    try {
      console.log('🔄 Received permission sync:', data)

      if (data.userId !== user?._id) {
        console.log('⚠️ Permission sync not for current user, ignoring')
        return
      }

      // Update permissions in auth store
      if (data.permissionChanges) {
        await updatePermissions(data.permissionChanges)
        
        // Show success toast
        toast.success('Your permissions have been updated', {
          duration: 4000,
          position: 'top-right',
          icon: '🔄'
        })

        // Optional: Show action toast for page refresh
        setTimeout(() => {
          toast((t) => (
            <div className="flex items-center space-x-3">
              <span>Refresh page to see all changes?</span>
              <button
                onClick={() => {
                  window.location.reload()
                  toast.dismiss(t.id)
                }}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Refresh
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Later
              </button>
            </div>
          ), {
            duration: 8000,
            position: 'top-right'
          })
        }, 2000)
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        totalReceived: prev.totalReceived + 1,
        permissionUpdates: prev.permissionUpdates + 1,
        lastNotification: {
          type: 'permission_change',
          ...data
        }
      }))

    } catch (error) {
      console.error('❌ Error handling permission sync:', error)
      toast.error('Failed to update permissions')
    }
  }, [user?._id, updatePermissions])

  // Handle role change notifications
  const handleRoleChange = useCallback((data: RBACNotification) => {
    try {
      console.log('🔔 Received role change notification:', data)

      // Show notification based on priority
      const toastOptions = {
        duration: data.priority === 'P1' ? 6000 : 4000,
        position: 'top-right' as const,
        icon: data.changeType === 'assigned' ? '✅' : 
              data.changeType === 'revoked' ? '❌' : '🔄'
      }

      if (data.priority === 'P1') {
        toast.error(data.message || 'Important role change', toastOptions)
      } else {
        toast.success(data.message || 'Role updated', toastOptions)
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        totalReceived: prev.totalReceived + 1,
        roleChanges: prev.roleChanges + 1,
        lastNotification: data
      }))

    } catch (error) {
      console.error('❌ Error handling role change:', error)
    }
  }, [])

  // Handle session revocation
  const handleSessionRevoked = useCallback((data: any) => {
    try {
      console.log('🚨 Session revoked:', data)

      toast.error(
        `Your session has been revoked: ${data.reason || 'Security action'}`,
        {
          duration: 8000,
          position: 'top-center',
          icon: '🚨'
        }
      )

      // Force logout after showing message
      setTimeout(() => {
        logout()
        window.location.href = '/auth/login?reason=session_revoked'
      }, 3000)

      // Update stats
      setStats(prev => ({
        ...prev,
        totalReceived: prev.totalReceived + 1,
        sessionActions: prev.sessionActions + 1,
        lastNotification: {
          type: 'session_revoked',
          ...data
        }
      }))

    } catch (error) {
      console.error('❌ Error handling session revocation:', error)
    }
  }, [logout])

  // Handle force session refresh
  const handleForceSessionRefresh = useCallback((data: any) => {
    try {
      console.log('🔄 Force session refresh:', data)

      toast((t) => (
        <div className="flex items-center space-x-3">
          <span>Session refresh required: {data.reason}</span>
          <button
            onClick={() => {
              window.location.reload()
              toast.dismiss(t.id)
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Refresh Now
          </button>
        </div>
      ), {
        duration: 10000,
        position: 'top-center',
        icon: '🔄'
      })

      // Update stats
      setStats(prev => ({
        ...prev,
        totalReceived: prev.totalReceived + 1,
        sessionActions: prev.sessionActions + 1,
        lastNotification: {
          type: 'force_session_refresh',
          ...data
        }
      }))

    } catch (error) {
      console.error('❌ Error handling force session refresh:', error)
    }
  }, [])

  // Handle RBAC audit notifications (for SuperAdmins)
  const handleRBACAudit = useCallback((data: any) => {
    try {
      console.log('📋 RBAC audit notification:', data)

      // Only show to SuperAdmins
      if (user?.role !== 'superadmin') return

      // Show subtle notification for audit events
      if (data.severity === 'high') {
        toast.error(`RBAC Alert: ${data.eventType}`, {
          duration: 5000,
          position: 'bottom-right',
          icon: '⚠️'
        })
      } else {
        toast(`RBAC: ${data.eventType}`, {
          duration: 3000,
          position: 'bottom-right',
          icon: '📋'
        })
      }

    } catch (error) {
      console.error('❌ Error handling RBAC audit:', error)
    }
  }, [user?.role])

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!isConnected) return

    // Get Socket.IO instance from the existing hook
    const socketIOService = (window as any).socketIOService
    if (!socketIOService?.socket) return

    const socket = socketIOService.socket

    // Register RBAC event listeners
    socket.on('permission_sync', handlePermissionSync)
    socket.on('rbac_role_change', handleRoleChange)
    socket.on('rbac_permission_change', handleRoleChange) // Same handler for now
    socket.on('session_revoked', handleSessionRevoked)
    socket.on('force_session_refresh', handleForceSessionRefresh)
    socket.on('rbac_audit', handleRBACAudit)

    console.log('✅ RBAC notification listeners registered')

    // Cleanup listeners on unmount
    return () => {
      socket.off('permission_sync', handlePermissionSync)
      socket.off('rbac_role_change', handleRoleChange)
      socket.off('rbac_permission_change', handleRoleChange)
      socket.off('session_revoked', handleSessionRevoked)
      socket.off('force_session_refresh', handleForceSessionRefresh)
      socket.off('rbac_audit', handleRBACAudit)
      
      console.log('🧹 RBAC notification listeners cleaned up')
    }
  }, [
    isConnected,
    handlePermissionSync,
    handleRoleChange,
    handleSessionRevoked,
    handleForceSessionRefresh,
    handleRBACAudit
  ])

  // Test RBAC notification (for development)
  const testRBACNotification = useCallback(async (type: 'permission_change' | 'role_change' = 'permission_change') => {
    try {
      const token = localStorage.getItem('auth-storage')
      if (!token) throw new Error('No auth token')

      const parsed = JSON.parse(token)
      const authToken = parsed.state?.token
      if (!authToken) throw new Error('Invalid auth token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

      const response = await fetch(`${API_URL}/superadmin/rbac/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: user?._id,
          notificationType: type
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }

      const data = await response.json()
      console.log('✅ Test notification sent:', data)
      
      toast.success('Test notification sent!', {
        duration: 3000,
        position: 'top-right'
      })

      return data
    } catch (error) {
      console.error('❌ Error sending test notification:', error)
      toast.error('Failed to send test notification')
      throw error
    }
  }, [user?._id])

  return {
    // Connection status
    isConnected,
    
    // Statistics
    stats,
    
    // Test function
    testRBACNotification,
    
    // Manual handlers (for testing)
    handlePermissionSync,
    handleRoleChange,
    handleSessionRevoked,
    handleForceSessionRefresh
  }
}