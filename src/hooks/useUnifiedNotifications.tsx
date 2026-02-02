'use client'

import { useRef } from 'react'
import toast from 'react-hot-toast'

interface NotificationState {
  lastPermissionUpdate: number
  activeNotifications: Set<string>
}

export const useUnifiedNotifications = () => {
  const notificationState = useRef<NotificationState>({
    lastPermissionUpdate: 0,
    activeNotifications: new Set()
  })

  // Prevent duplicate notifications within a time window
  const shouldShowNotification = (type: string, windowMs: number = 5000): boolean => {
    const now = Date.now()
    const key = `${type}-${Math.floor(now / windowMs)}`
    
    if (notificationState.current.activeNotifications.has(key)) {
      console.log(`🚫 Preventing duplicate notification: ${type}`)
      return false
    }
    
    notificationState.current.activeNotifications.add(key)
    
    // Clean up old notifications
    setTimeout(() => {
      notificationState.current.activeNotifications.delete(key)
    }, windowMs)
    
    return true
  }

  // Smart notification system - both flash and bell notifications
  const showSmartNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    options?: { 
      duration?: number
      preventDuplicates?: boolean
      showFlash?: boolean
      showBell?: boolean
      category?: 'system' | 'action' | 'realtime'
    }
  ) => {
    const { 
      duration = 15000, // Changed from 5000 to 15000 (15 seconds) for tenant admin
      preventDuplicates = true,
      showFlash = true,
      showBell = true,
      category = 'system'
    } = options || {}
    
    if (preventDuplicates && !shouldShowNotification(`${type}-${title}`, 3000)) {
      return
    }

    // Show flash notification (contextual, auto-dismiss)
    if (showFlash) {
      try {
        if (typeof window !== 'undefined' && window && (window as any).__addSlideNotification) {
          (window as any).__addSlideNotification({
            type,
            title,
            message,
            duration,
            category
          })
          console.log('📢 Flash notification sent (independent of bell notifications)')
        } else {
          console.warn('⚠️ Slide notification function not available, using fallback')
          // Fallback to simple console log for now
          console.log(`📢 Fallback notification: ${type} - ${title}: ${message}`)
        }
      } catch (error) {
        console.warn('⚠️ Failed to show slide notification:', error)
      }
    }

    // Bell notifications are handled by useSocketIONotifications hook (Socket.IO-based)
    // These persist independently of flash messages
    if (showBell) {
      console.log('🔔 Bell notification will be handled by useSocketIONotifications hook (Socket.IO-based, persistent)')
    }

    console.log(`📢 Smart notification shown: ${type} - ${title}`)
  }

  // Permission update notification - both flash (warning) and bell (system)
  const showPermissionUpdateNotification = (data?: any) => {
    const now = Date.now()
    
    // Prevent spam - only show one permission notification per 8 seconds
    if (now - notificationState.current.lastPermissionUpdate < 8000) {
      console.log('🚫 Preventing permission notification spam')
      return
    }
    
    notificationState.current.lastPermissionUpdate = now
    
    showSmartNotification(
      'warning',
      'Permissions Updated',
      'Your access permissions have been updated by SuperAdmin',
      {
        duration: 15000, // Changed from 5000 to 15000 (15 seconds)
        showFlash: true,
        showBell: true,
        category: 'system'
      }
    )
  }

  // Feature update notification - both flash (success) and bell (system)
  const showFeatureUpdateNotification = (data?: any) => {
    if (!shouldShowNotification('feature-update', 8000)) return
    
    showSmartNotification(
      'success',
      'Features Updated',
      'Your tenancy features have been updated',
      {
        duration: 15000, // Changed from 4000 to 15000 (15 seconds)
        showFlash: true,
        showBell: true,
        category: 'system'
      }
    )
  }

  // Role change notification - both flash (info) and bell (system)
  const showRoleChangeNotification = (oldRole: string, newRole: string) => {
    if (!shouldShowNotification('role-change', 5000)) return
    
    showSmartNotification(
      'info',
      'Role Changed',
      `Your role has been updated to ${newRole}`,
      {
        duration: 15000, // Changed from 6000 to 15000 (15 seconds)
        showFlash: true,
        showBell: true,
        category: 'system'
      }
    )
  }

  // Action feedback notification - flash only (no bell spam)
  const showActionFeedback = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options?: { duration?: number }
  ) => {
    const { duration = 15000 } = options || {} // Changed from 3000 to 15000 (15 seconds)
    
    showSmartNotification(
      type,
      type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice',
      message,
      {
        duration,
        showFlash: true,
        showBell: false, // No bell for action feedback
        category: 'action',
        preventDuplicates: false // Allow multiple action feedbacks
      }
    )
  }

  // Real-time update notification - contextual based on importance
  const showRealtimeUpdate = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    important: boolean = false
  ) => {
    showSmartNotification(
      type,
      title,
      message,
      {
        duration: important ? 15000 : 15000, // Changed both to 15000 (15 seconds)
        showFlash: true,
        showBell: important, // Only important updates go to bell
        category: 'realtime'
      }
    )
  }

  return {
    showPermissionUpdateNotification,
    showFeatureUpdateNotification,
    showRoleChangeNotification,
    showSmartNotification,
    showActionFeedback,
    showRealtimeUpdate,
    shouldShowNotification
  }
}