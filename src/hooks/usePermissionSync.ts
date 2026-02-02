'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface UsePermissionSyncOptions {
  autoReload?: boolean
  onPermissionsUpdated?: () => void
  onRoleChanged?: (oldRole: string, newRole: string) => void
}

export const usePermissionSync = (options: UsePermissionSyncOptions = {}) => {
  const { 
    autoReload = false, 
    onPermissionsUpdated, 
    onRoleChanged 
  } = options
  
  const { user, refreshUserData, updateUser } = useAuthStore()
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncRef = useRef<string>(new Date().toISOString())

  // Manual permission refresh
  const refreshPermissions = useCallback(async () => {
    try {
      console.log('🔄 Manually refreshing permissions...')
      await refreshUserData()
      
      // Call callback if provided
      if (onPermissionsUpdated) {
        onPermissionsUpdated()
      }
      
      // Removed toast to prevent notification spam - unified system handles this
      return true
    } catch (error) {
      console.error('Failed to refresh permissions:', error)
      // Keep error toast for actual failures
      toast.error('Failed to refresh permissions', {
        icon: '❌',
        duration: 3000
      })
      return false
    }
  }, [refreshUserData, onPermissionsUpdated])

  // Check for permission updates (polling fallback)
  const checkPermissionUpdates = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return

      const response = await fetch(`${API_URL}/auth/permission-status?since=${lastSyncRef.current}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.data.hasUpdates) {
          console.log('🔄 Permission updates detected via polling')
          
          if (autoReload) {
            await refreshUserData()
          } else {
            // Call callback instead of auto-reloading
            if (onPermissionsUpdated) {
              onPermissionsUpdated()
            }
          }
          
          lastSyncRef.current = new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }, [user, refreshUserData, autoReload, onPermissionsUpdated])

  // Start periodic permission checking (fallback for when WebSocket is not available)
  const startPeriodicSync = useCallback((intervalMs: number = 30000) => {
    if (syncIntervalRef.current) return

    console.log('🔄 Starting periodic permission sync')
    syncIntervalRef.current = setInterval(checkPermissionUpdates, intervalMs)
  }, [checkPermissionUpdates])

  // Stop periodic permission checking
  const stopPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
      console.log('⏹️ Stopped periodic permission sync')
    }
  }, [])

  // Listen for custom permission update events - PREVENT PAGE RELOADS
  useEffect(() => {
    const handlePermissionUpdate = (event: CustomEvent) => {
      console.log('🔄 Custom permission update event received:', event.detail)
      
      // IMPORTANT: Don't trigger page reload here
      if (autoReload) {
        refreshPermissions()
      } else {
        // Just call the callback, don't reload
        if (onPermissionsUpdated) {
          onPermissionsUpdated()
        }
      }
    }

    const handleRoleChange = (event: CustomEvent) => {
      console.log('👤 Role change event received:', event.detail)
      
      if (onRoleChanged && event.detail.oldRole && event.detail.newRole) {
        onRoleChanged(event.detail.oldRole, event.detail.newRole)
      }
    }

    // Listen for permission and role change events
    window.addEventListener('permissionsUpdated', handlePermissionUpdate as EventListener)
    window.addEventListener('roleChanged', handleRoleChange as EventListener)
    
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate as EventListener)
      window.removeEventListener('roleChanged', handleRoleChange as EventListener)
    }
  }, [refreshPermissions, autoReload, onPermissionsUpdated, onRoleChanged])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPeriodicSync()
    }
  }, [stopPeriodicSync])

  return {
    refreshPermissions,
    startPeriodicSync,
    stopPeriodicSync,
    checkPermissionUpdates
  }
}