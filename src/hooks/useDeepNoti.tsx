'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
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

interface DeepNotiNotification {
  id: string
  title: string
  message: string
  icon: string
  severity: 'info' | 'success' | 'warning' | 'error'
  data?: any
  createdAt: string
  isRead?: boolean
  isPending?: boolean
}

interface DeepNotiEvent {
  id: string
  type: string
  timestamp: string
  notification?: DeepNotiNotification
  requiresRefresh?: boolean
  priority?: string
  persistent?: boolean
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

export const useDeepNoti = () => {
  const [notifications, setNotifications] = useState<DeepNotiNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const baseReconnectDelay = 1000 // 1 second

  // Use unified notification system for smart notifications
  const {
    showPermissionUpdateNotification,
    showFeatureUpdateNotification,
    showRoleChangeNotification,
    showRealtimeUpdate
  } = useUnifiedNotifications()

  // Initialize SSE connection
  const connectSSE = useCallback(() => {
    const token = getAuthToken()
    if (!token) {
      console.log('🔐 No auth token available for DeepNoti SSE')
      return
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setConnectionStatus('connecting')
    console.log('🔗 Connecting to DeepNoti SSE stream...')

    try {
      // Create SSE connection with auth token
      const eventSource = new EventSource(`${API_URL}/sse/stream?token=${encodeURIComponent(token)}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('✅ DeepNoti SSE connection established')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0

        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
          reconnectTimeoutRef.current = null
        }
      }

      eventSource.onmessage = (event) => {
        try {
          const data: DeepNotiEvent = JSON.parse(event.data)
          console.log('📨 DeepNoti event received:', data)

          handleDeepNotiEvent(data)
        } catch (error) {
          console.error('❌ Error parsing DeepNoti event:', error)
        }
      }

      // Handle specific event types
      eventSource.addEventListener('notification', (event) => {
        try {
          const data: DeepNotiEvent = JSON.parse(event.data)
          console.log('🔔 DeepNoti notification event:', data)
          handleNotificationEvent(data)
        } catch (error) {
          console.error('❌ Error parsing notification event:', error)
        }
      })

      eventSource.addEventListener('permission_update', (event) => {
        try {
          const data: DeepNotiEvent = JSON.parse(event.data)
          console.log('🔐 DeepNoti permission update:', data)
          handlePermissionUpdateEvent(data)
        } catch (error) {
          console.error('❌ Error parsing permission update:', error)
        }
      })

      eventSource.addEventListener('feature_update', (event) => {
        try {
          const data: DeepNotiEvent = JSON.parse(event.data)
          console.log('✨ DeepNoti feature update:', data)
          handleFeatureUpdateEvent(data)
        } catch (error) {
          console.error('❌ Error parsing feature update:', error)
        }
      })

      eventSource.addEventListener('heartbeat', (event) => {
        // Silent heartbeat handling
        console.log('💓 DeepNoti heartbeat received')
      })

      eventSource.onerror = (error) => {
        console.error('❌ DeepNoti SSE connection error:', error)
        setIsConnected(false)
        setConnectionStatus('error')

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current)
          console.log(`🔄 Attempting DeepNoti reconnection in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connectSSE()
          }, delay)
        } else {
          console.error('❌ DeepNoti max reconnection attempts reached')
          setConnectionStatus('disconnected')
        }
      }

    } catch (error) {
      console.error('❌ Failed to create DeepNoti SSE connection:', error)
      setConnectionStatus('error')
    }
  }, [])

  // Handle generic DeepNoti events
  const handleDeepNotiEvent = (event: DeepNotiEvent) => {
    switch (event.type) {
      case 'connected':
        console.log('🎉 DeepNoti connection confirmed')
        break
      case 'system_event':
        console.log('🔧 DeepNoti system event:', event)
        break
      default:
        console.log('📨 DeepNoti generic event:', event.type)
    }
  }

  // Handle notification events
  const handleNotificationEvent = (event: DeepNotiEvent) => {
    if (!event.notification) return

    const notification = event.notification

    // Add to notifications list (persistent)
    setNotifications(prev => {
      const updated = [notification, ...prev]
      const sorted = updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      console.log('🔔 DeepNoti notification added to bell (persistent)')
      return sorted.slice(0, 50) // Keep latest 50
    })

    // Update unread count
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1)
    }

    // Show flash notification (separate from bell)
    showRealtimeUpdate(
      notification.severity,
      notification.title,
      notification.message,
      notification.severity === 'error' || notification.title.includes('payment')
    )

    // Emit custom event for bell component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('deepNotiNotificationReceived', {
        detail: notification
      }))
    }
  }

  // Handle permission update events
  const handlePermissionUpdateEvent = useCallback(async (event: DeepNotiEvent) => {
    console.log('🔐 Processing DeepNoti permission update:', event)

    try {
      if (event.requiresRefresh) {
        // Refresh user profile from server
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (response.ok) {
          const profileData = await response.json()
          if (profileData.success) {
            const { handlePermissionUpdate } = useAuthStore.getState()

            handlePermissionUpdate({
              permissions: profileData.data.permissions,
              features: profileData.data.features,
              role: profileData.data.role
            })

            console.log('✅ DeepNoti: Permissions refreshed from server')

            // Show smart notification
            showPermissionUpdateNotification(event.notification?.data || {})
          }
        }
      }
    } catch (error) {
      console.error('❌ DeepNoti permission update error:', error)
    }
  }, [showPermissionUpdateNotification])

  // Handle feature update events
  const handleFeatureUpdateEvent = useCallback(async (event: DeepNotiEvent) => {
    console.log('✨ Processing DeepNoti feature update:', event)

    try {
      if (event.requiresRefresh) {
        // Refresh user profile from server
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        })

        if (response.ok) {
          const profileData = await response.json()
          if (profileData.success) {
            const { updateUser } = useAuthStore.getState()

            updateUser({
              features: profileData.data.features,
              permissions: profileData.data.permissions,
              tenancy: profileData.data.tenancy
            })

            console.log('✅ DeepNoti: Features refreshed from server')

            // Show smart notification
            showFeatureUpdateNotification(event.notification?.data || {})
          }
        }
      }
    } catch (error) {
      console.error('❌ DeepNoti feature update error:', error)
    }
  }, [showFeatureUpdateNotification])

  // Initialize connection on mount
  useEffect(() => {
    connectSSE()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connectSSE])

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/notifications?limit=50&sort=createdAt:-1`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        const serverNotifications = (data.data.notifications || []).sort((a: DeepNotiNotification, b: DeepNotiNotification) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        setNotifications(serverNotifications)
        console.log('🔄 DeepNoti: Initial notifications loaded')
      }
    } catch (error) {
      console.error('❌ DeepNoti: Failed to fetch notifications:', error)
    }
  }

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount || 0)
      }
    } catch (error) {
      console.error('❌ DeepNoti: Failed to fetch unread count:', error)
    }
  }

  // Mark notifications as read
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/admin/notifications/mark-read`, {
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
          notificationIds.includes(notif.id)
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
    } catch (error) {
      console.error('❌ DeepNoti: Failed to mark notifications as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/admin/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })

      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('❌ DeepNoti: Failed to mark all notifications as read:', error)
    }
  }

  // Test DeepNoti (development only)
  const testDeepNoti = async (title = 'Test DeepNoti', message = 'This is a test notification from DeepNoti') => {
    if (process.env.NODE_ENV === 'production') return

    try {
      const token = getAuthToken()
      await fetch(`${API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title, message })
      })
      console.log('🧪 DeepNoti test notification sent')
    } catch (error) {
      console.error('❌ DeepNoti test failed:', error)
    }
  }

  // Get connection status info
  const getConnectionInfo = () => ({
    isConnected,
    status: connectionStatus,
    reconnectAttempts: reconnectAttempts.current,
    maxAttempts: maxReconnectAttempts
  })

  // Load initial data on mount
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,

    // Actions
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    fetchUnreadCount,
    testDeepNoti,

    // Connection management
    connectSSE,
    getConnectionInfo
  }
}