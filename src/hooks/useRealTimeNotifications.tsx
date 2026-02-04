'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuthStore, UserRole } from '@/store/authStore'
import { useUnifiedNotifications } from './useUnifiedNotifications'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Package,
  CreditCard,
  User,
  Settings,
  Star,
  TrendingUp
} from 'lucide-react'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  icon: string
  severity: 'info' | 'success' | 'warning' | 'error'
  data?: any
  createdAt: string
  isRead: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    const data = localStorage.getItem('laundry-auth')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch { }
  return localStorage.getItem('token')
}

const getNotificationIcon = (iconName: string, severity: string) => {
  const iconProps = { className: "w-5 h-5" }

  switch (iconName) {
    case 'shield-check':
    case 'shield':
      return <Shield {...iconProps} className={`w-5 h-5 ${severity === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
    case 'package':
    case 'package-plus':
    case 'package-check':
      return <Package {...iconProps} className={`w-5 h-5 ${severity === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
    case 'credit-card':
      return <CreditCard {...iconProps} className={`w-5 h-5 ${severity === 'error' ? 'text-red-500' : 'text-green-500'}`} />
    case 'user-check':
    case 'user-plus':
      return <User {...iconProps} className="w-5 h-5 text-blue-500" />
    case 'settings':
      return <Settings {...iconProps} className="w-5 h-5 text-gray-500" />
    case 'star':
      return <Star {...iconProps} className="w-5 h-5 text-yellow-500" />
    case 'trending-up':
      return <TrendingUp {...iconProps} className="w-5 h-5 text-green-500" />
    case 'check-circle':
      return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />
    case 'alert-triangle':
      return <AlertTriangle {...iconProps} className="w-5 h-5 text-yellow-500" />
    case 'x-circle':
      return <XCircle {...iconProps} className="w-5 h-5 text-red-500" />
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-blue-500" />
  }
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPollRef = useRef<string>(new Date().toISOString())
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)

  // Add debounce mechanism to prevent rapid re-fetches
  const lastFetchTimeRef = useRef<number>(0)
  const FETCH_DEBOUNCE_MS = 5000 // 5 seconds minimum between fetches

  // Use unified notification system - Smart notifications with both flash and bell
  const {
    showPermissionUpdateNotification,
    showFeatureUpdateNotification,
    showRoleChangeNotification,
    showRealtimeUpdate
  } = useUnifiedNotifications()

  // Polling fallback for serverless environments
  const startPolling = () => {
    if (pollingIntervalRef.current) return

    console.log('🔄 Starting notification polling (serverless fallback)')

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch(`${API_URL}/notifications/poll?since=${lastPollRef.current}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })

        const data = await response.json()

        if (data.success && data.data.hasNew) {
          console.log('📬 New notifications via polling:', data.data.notifications.length)

          // Add new notifications
          data.data.notifications.forEach((notification: Notification) => {
            setNotifications(prev => {
              // Check if notification already exists to prevent duplicates
              const exists = prev.find(n => n._id === notification._id)
              if (exists) return prev

              const updated = [notification, ...prev]
              // Sort by createdAt to maintain proper order
              const sorted = updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              console.log('🔔 Bell notification added via polling (persistent)')
              return sorted
            })

            // Show flash notification (SEPARATE from bell notification)
            showToastNotification(notification)

            // Emit custom event for bell component (without auto-opening modal)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('newNotificationReceived', {
                detail: notification
              }))
            }
          })

          // Update unread count
          setUnreadCount(data.data.unreadCount)

          // Update last poll timestamp
          lastPollRef.current = data.data.timestamp
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 10000) // Poll every 10 seconds
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const token = getAuthToken()
    if (!token) return

    // Create socket connection
    const socket = io(API_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔗 Connected to notification server')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.log('❌ WebSocket connection error:', error.message)
      setIsConnected(false)

      // Start polling fallback if WebSocket fails
      if (!pollingIntervalRef.current) {
        console.log('🔄 Starting polling fallback for notifications')
        startPolling()
      }
    })

    // Listen for all notification types with smart routing
    socket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification)

      // Add to notifications list (bell notifications) - maintain chronological order
      // These are PERSISTENT and independent of flash messages
      setNotifications(prev => {
        const updated = [notification, ...prev]
        // Sort by createdAt to maintain proper order
        const sorted = updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        console.log('🔔 Bell notification added (persistent, independent of flash)')
        return sorted
      })
      setUnreadCount(prev => prev + 1)

      // Emit custom event for bell component (without auto-opening modal)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('newNotificationReceived', {
          detail: notification
        }))
      }

      // Show contextual flash notification based on type (SEPARATE from bell notification)
      showRealtimeUpdate(
        notification.severity,
        notification.title,
        notification.message,
        notification.severity === 'error' || notification.type.includes('payment')
      )
    })

    // Listen for permission updates - both flash and bell notifications
    socket.on('permissionsUpdated', (data: any) => {
      console.log('🔄 Permissions updated (legacy event):', data)
      handlePermissionUpdate(data)
    })

    socket.on('tenancyPermissionsUpdated', (data: any) => {
      console.log('� Tenancy permissions updated:', data)
      handlePermissionUpdate(data)
    })

    // Listen for role changes - both flash and bell notifications
    socket.on('roleChanged', (data: any) => {
      console.log('👤 Role changed:', data)

      if (data.newRole) {
        const { updateUser } = useAuthStore.getState()
        updateUser({ role: data.newRole as UserRole })

        // Use smart notification system
        showRoleChangeNotification(data.oldRole || 'previous role', data.newRole)

        console.log('✅ Role updated in store without reload')
      }
    })

    // Listen for feature updates - both flash and bell notifications
    socket.on('tenancyFeaturesUpdated', (data: any) => {
      console.log('✨ Tenancy features updated:', data)
      showFeatureUpdateNotification(data)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  // Fetch initial notifications and start fallback if needed - PREVENT UNNECESSARY RE-FETCHES
  const hasInitiallyFetchedRef = useRef(false)

  useEffect(() => {
    // Only fetch on initial mount, not on every isConnected change
    if (!hasInitiallyFetchedRef.current) {
      console.log('🔄 Initial notification fetch (first time only)')
      fetchNotifications()
      fetchUnreadCount()
      hasInitiallyFetchedRef.current = true
    }

    // Start polling fallback after 5 seconds if WebSocket hasn't connected
    const fallbackTimer = setTimeout(() => {
      if (!isConnected && !pollingIntervalRef.current) {
        console.log('🔄 WebSocket not connected, starting polling fallback')
        startPolling()
      }
    }, 5000)

    return () => clearTimeout(fallbackTimer)
  }, []) // Remove isConnected dependency to prevent re-fetches

  const fetchNotifications = async () => {
    // DEBOUNCE: Prevent rapid re-fetches that could overwrite recent notifications
    const now = Date.now()
    if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
      console.log('🚫 Fetch debounced - preventing rapid re-fetch that could overwrite recent notifications')
      return
    }
    lastFetchTimeRef.current = now

    try {
      const token = getAuthToken()
      // Use universal notifications endpoint instead of role-specific one
      const response = await fetch(`${API_URL}/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        // Sort notifications by createdAt in descending order (newest first)
        const serverNotifications = (data.data.notifications || []).sort((a: Notification, b: Notification) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        // PRESERVE RECENT NOTIFICATIONS: Merge with existing notifications, prioritizing recent ones
        setNotifications(prev => {
          if (prev.length === 0) {
            // First fetch - use server data
            console.log('🔄 First notification fetch - using server data')
            return serverNotifications
          } else {
            // Subsequent fetch - preserve recent notifications and merge with server data
            console.log('🔄 Preserving recent notifications during fetch')

            // Get the most recent notification timestamp from current state
            const mostRecentTime = prev.length > 0 ? new Date(prev[0].createdAt).getTime() : 0

            // Only add server notifications that are newer than what we have, or fill gaps
            const newServerNotifications = serverNotifications.filter(serverNotif => {
              const serverTime = new Date(serverNotif.createdAt).getTime()
              const existsInCurrent = prev.find(currentNotif => currentNotif._id === serverNotif._id)

              // Include if it's newer than our most recent, or if it doesn't exist in current
              return !existsInCurrent && serverTime >= mostRecentTime - (24 * 60 * 60 * 1000) // Within last 24 hours
            })

            // Merge and sort
            const merged = [...prev, ...newServerNotifications]
            const uniqueNotifications = merged.filter((notif, index, arr) =>
              arr.findIndex(n => n._id === notif._id) === index
            )

            return uniqueNotifications.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ).slice(0, 50) // Keep only latest 50
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/notifications/mark-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds })
      })

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const showToastNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.icon, notification.severity)

    const toastOptions = {
      duration: notification.severity === 'error' ? 15000 : 15000, // Changed both to 15000 (15 seconds)
      style: {
        background: '#fff',
        color: '#333',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '400px'
      }
    }

    // Custom toast component
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {notification.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    ), toastOptions)
  }

  // Helper function to handle permission updates from WebSocket
  const handlePermissionUpdate = useCallback(async (data: any) => {
    console.log('🔄 Processing permission update:', data)

    try {
      // Always refresh from server to get latest data
      const response = await fetch(`${API_URL}/auth/profile`, {
        credentials: 'include'
      })

      if (response.ok) {
        const profileData = await response.json()
        if (profileData.success) {
          const { handlePermissionUpdate } = useAuthStore.getState()

          // Use the optimized permission update method to prevent re-renders
          handlePermissionUpdate({
            permissions: profileData.data.permissions,
            features: profileData.data.features,
            role: profileData.data.role
          })

          console.log('✅ Permissions refreshed from server without page re-render')

          // Show smart notification - both flash (warning) and bell (system)
          showPermissionUpdateNotification(data)

          // Add to notification center for bell icon (batched update) - PERSISTENT
          const notificationForCenter = {
            _id: `permission-update-${Date.now()}`,
            type: 'tenancy_permissions_updated',
            title: 'Permissions Updated',
            message: 'Your access permissions have been updated by SuperAdmin',
            icon: 'shield-check',
            severity: 'warning' as const,
            data: {
              permissions: profileData.data.permissions,
              features: profileData.data.features
            },
            createdAt: new Date().toISOString(),
            isRead: false
          }

          // Batch state updates to prevent multiple re-renders - BELL NOTIFICATIONS ARE PERSISTENT
          setNotifications(prev => {
            const updated = [notificationForCenter, ...prev]
            const sorted = updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            console.log('🔔 Permission update added to bell (persistent, independent of flash)')
            return sorted
          })
          setUnreadCount(prev => prev + 1)

          // Trigger custom events for components to react WITHOUT causing re-renders
          if (typeof window !== 'undefined') {
            // Use a debounced custom event to prevent multiple rapid updates
            clearTimeout((window as any).__permissionUpdateTimeout)
              ; (window as any).__permissionUpdateTimeout = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('permissionsUpdated', {
                  detail: {
                    permissions: profileData.data.permissions,
                    features: profileData.data.features
                  }
                }))
              }, 100) // 100ms debounce
          }
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing permissions:', error)

      // Fallback: use data from WebSocket if server refresh fails
      if (data.updates?.permissions || data.permissions) {
        const { handlePermissionUpdate } = useAuthStore.getState()
        handlePermissionUpdate({
          permissions: data.updates?.permissions || data.permissions
        })

        // Show smart notification - both flash (warning) and bell (system)
        showPermissionUpdateNotification(data)

        // Add to notification center for bell icon (batched update) - PERSISTENT
        const fallbackNotification = {
          _id: `permission-fallback-${Date.now()}`,
          type: 'tenancy_permissions_updated',
          title: 'Permissions Updated',
          message: 'Your access permissions have been updated by SuperAdmin',
          icon: 'shield-check',
          severity: 'warning' as const,
          data: {
            permissions: data.updates?.permissions || data.permissions
          },
          createdAt: new Date().toISOString(),
          isRead: false
        }

        // Batch state updates to prevent multiple re-renders - BELL NOTIFICATIONS ARE PERSISTENT
        setNotifications(prev => {
          const updated = [fallbackNotification, ...prev]
          const sorted = updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          console.log('🔔 Fallback permission update added to bell (persistent)')
          return sorted
        })
        setUnreadCount(prev => prev + 1)

        // Trigger custom events for components to react WITHOUT causing re-renders
        if (typeof window !== 'undefined') {
          // Use a debounced custom event to prevent multiple rapid updates
          clearTimeout((window as any).__permissionUpdateTimeout)
            ; (window as any).__permissionUpdateTimeout = setTimeout(() => {
              window.dispatchEvent(new CustomEvent('permissionsUpdated', {
                detail: {
                  permissions: data.updates?.permissions || data.permissions
                }
              }))
            }, 100) // 100ms debounce
        }
      }
    }
  }, [showPermissionUpdateNotification])

  return {
    notifications,
    unreadCount,
    isConnected,
    showNotificationPanel,
    setShowNotificationPanel,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount
  }
}