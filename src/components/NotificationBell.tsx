'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  Package, 
  CreditCard,
  User,
  Settings,
  Star,
  TrendingUp,
  Check,
  CheckCheck,
  X
} from 'lucide-react'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'

interface Notification {
  id: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  category: string
  eventType: string
  createdAt: string
  metadata?: any
  requiresAck?: boolean
}

const getNotificationIcon = (priority: string, category: string) => {
  const iconProps = { className: "w-4 h-4" }
  
  // Priority-based coloring
  const getColorClass = (priority: string) => {
    switch (priority) {
      case 'P0': return 'text-red-600'
      case 'P1': return 'text-orange-500'
      case 'P2': return 'text-blue-500'
      case 'P3': return 'text-gray-500'
      case 'P4': return 'text-gray-400'
      default: return 'text-blue-500'
    }
  }
  
  // Category-based icons
  switch (category) {
    case 'permissions':
    case 'security':
      return <Shield {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'orders':
      return <Package {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'payments':
      return <CreditCard {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'admin':
      return <User {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'system':
      return <Settings {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'rewards':
      return <Star {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    case 'marketing':
      return <TrendingUp {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
    default:
      return <BellRing {...iconProps} className={`w-4 h-4 ${getColorClass(priority)}`} />
  }
}

const getSeverityStyles = (priority: string) => {
  switch (priority) {
    case 'P0':
      return 'bg-red-50 border-l-red-500'
    case 'P1':
      return 'bg-orange-50 border-l-orange-400'
    case 'P2':
      return 'bg-blue-50 border-l-blue-400'
    case 'P3':
      return 'bg-gray-50 border-l-gray-400'
    case 'P4':
      return 'bg-gray-50 border-l-gray-300'
    default:
      return 'bg-blue-50 border-l-blue-400'
  }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export default function NotificationBell() {
  const {
    notifications,
    stats,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    acknowledgeNotification
  } = useSocketIONotifications()

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false)
      }
    }

    if (showNotificationPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotificationPanel, setShowNotificationPanel])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.metadata?.isRead) {
      markAsRead(notification.id)
    }
    
    // Handle acknowledgment for P0/P1 notifications
    if (notification.requiresAck && ['P0', 'P1'].includes(notification.priority)) {
      acknowledgeNotification(notification.id)
    }
    
    // Navigate to relevant page if link exists
    if (notification.metadata?.link) {
      window.location.href = notification.metadata.link
    }
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      selectedNotifications.forEach(id => markAsRead(id))
      setSelectedNotifications([])
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        className="relative p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      >
        <BellRing className="w-6 h-6 text-yellow-500" />
        
        {/* Unread Count Badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
        
        {/* Connection Status Indicator */}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="notification-panel absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[70] max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {stats.unread > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {stats.unread} new
                  </span>
                )}
                {!isConnected && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    Reconnecting...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedNotifications.length > 0 && (
                  <button
                    onClick={handleMarkSelectedAsRead}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Mark Read
                  </button>
                )}
                {stats.unread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellRing className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                      getSeverityStyles(notification.severity)
                    } ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectNotification(notification._id)
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.icon, notification.severity)}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          
                          {/* Unread Indicator */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowNotificationPanel(false)
                  window.location.href = '/admin/notifications'
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}