'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Info, XCircle, Shield, Package, CreditCard, User, Settings, Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cleanNotificationTitle } from '@/lib/notificationUtils'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { useRouter } from 'next/navigation'
import { NotificationInbox } from './NotificationInbox'
import { NotificationPriorityHandler } from './NotificationPriorityHandler'
import { toast } from 'react-hot-toast'

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
  groupCount?: number
}

const getNotificationIcon = (priority: string, eventType: string) => {
  const iconProps = { className: "w-4 h-4" }

  switch (priority) {
    case 'P0':
      return <AlertTriangle {...iconProps} className="w-4 h-4 text-red-500" />
    case 'P1':
      return <XCircle {...iconProps} className="w-4 h-4 text-orange-500" />
    case 'P2':
      return <Info {...iconProps} className="w-4 h-4 text-blue-500" />
    case 'P3':
      return <Bell {...iconProps} className="w-4 h-4 text-gray-500" />
    case 'P4':
      return <Bell {...iconProps} className="w-4 h-4 text-gray-400" />
    default:
      return <Bell {...iconProps} className="w-4 h-4 text-blue-500" />
  }
}

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'P0':
      return 'border-l-red-500 bg-red-50 hover:bg-red-100'
    case 'P1':
      return 'border-l-orange-500 bg-orange-50 hover:bg-orange-100'
    case 'P2':
      return 'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
    case 'P3':
      return 'border-l-gray-500 bg-gray-50 hover:bg-gray-100'
    case 'P4':
      return 'border-l-gray-300 bg-gray-25 hover:bg-gray-50'
    default:
      return 'border-l-blue-400 bg-blue-50 hover:bg-blue-100'
  }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) return 'Just now'
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    stats,
    isConnected,
    isConnecting,
    connectionError,
    acknowledgeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect,
    isLoading
  } = useSocketIONotifications()

  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id)
  }, [markAsRead])

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  const handleToggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleShowInbox = useCallback(() => {
    setIsOpen(false)
    setShowInbox(true)
  }, [])

  const handleAcknowledge = useCallback((notificationId: string) => {
    acknowledgeNotification(notificationId)
    toast.success('Notification acknowledged')
  }, [acknowledgeNotification])

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, { notification: Notification; count: number }> = {}

    notifications.forEach(notif => {
      const key = `${notif.title}-${notif.message}`
      if (groups[key]) {
        groups[key].count++
        // Use the newest timestamp
        if (new Date(notif.createdAt) > new Date(groups[key].notification.createdAt)) {
          groups[key].notification = notif
        }
      } else {
        groups[key] = { notification: { ...notif }, count: 1 }
      }
    })

    return Object.values(groups).map(group => ({
      ...group.notification,
      groupCount: group.count
    }))
  }, [notifications])

  // Don't slice - show all notifications and let the user scroll
  const displayedNotifications = groupedNotifications
  const hasMoreNotifications = false // No longer needed since we show all

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleToggleOpen}
          className={cn(
            'notification-bell-button',
            'relative p-2 rounded-xl transition-all duration-300',
            'hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            isOpen ? 'bg-blue-50 shadow-inner' : 'bg-transparent',
            !isConnected && 'opacity-50'
          )}
        >
          <Bell className={cn(
            "w-5 h-5 transition-transform duration-300",
            isOpen && "scale-110",
            isConnected ? 'text-gray-600' : 'text-red-500'
          )} />

          {!isConnected && (
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
              isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            )} />
          )}

          {stats.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white ring-1 ring-red-100">
              {stats.unread > 99 ? '99+' : stats.unread}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="notification-dropdown absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 z-[1000] overflow-clip transform origin-top-right transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white/50">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Notifications
                </h3>
                {!isConnected && (
                  <button
                    onClick={reconnect}
                    className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold hover:bg-red-100 transition-colors uppercase tracking-wider"
                  >
                    Offline
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors flex items-center space-x-1"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {connectionError && (
              <div className="px-6 py-2 bg-red-50/50 border-b border-red-100">
                <p className="text-[10px] text-red-600 font-medium">Reconnecting...</p>
              </div>
            )}

            <div className="px-6 py-2 bg-white flex items-center space-x-4 overflow-x-auto no-scrollbar border-b border-gray-50">
              {stats.byPriority.P0 > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-bold text-red-600">P0: {stats.byPriority.P0}</span>
                </div>
              )}
              {stats.byPriority.P1 > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-bold text-orange-600">P1: {stats.byPriority.P1}</span>
                </div>
              )}
              {stats.byPriority.P2 > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600">P2: {stats.byPriority.P2}</span>
                </div>
              )}
              {stats.byPriority.P3 > 0 && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500">P3: {stats.byPriority.P3}</span>
                </div>
              )}
            </div>

            <div
              className="no-scrollbar"
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-medium text-gray-400">Loading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-blue-200" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">No notifications yet</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {displayedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'px-6 py-4 cursor-pointer transition-all duration-200 border-l-4 group relative',
                        getPriorityStyles(notification.priority),
                        !((notification as any).isRead || notification.metadata?.isRead) ? 'bg-white' : 'bg-gray-50/30'
                      )}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                          notification.priority === 'P0' ? 'bg-red-50' :
                            notification.priority === 'P1' ? 'bg-orange-50' :
                              notification.priority === 'P2' ? 'bg-blue-50' : 'bg-gray-50'
                        )}>
                          {getNotificationIcon(notification.priority, notification.eventType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              notification.priority === 'P0' ? 'text-red-600' :
                                notification.priority === 'P1' ? 'text-orange-600' :
                                  notification.priority === 'P2' ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              {notification.priority} {notification.groupCount && notification.groupCount > 1 && `• ${notification.groupCount} Alerts`}
                            </span>
                            <span className="text-[10px] font-medium text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-bold truncate leading-snug">{cleanNotificationTitle(notification.title)}</p>
                          <p className="text-xs mt-1 line-clamp-2 leading-relaxed text-gray-600">{notification.message}</p>

                          {/* Module tags for permission updates */}
                          {(notification.eventType === 'tenancy_permissions_updated' || notification.eventType === 'permission_updated') && notification.metadata?.permissions && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.keys(notification.metadata.permissions).map(module => (
                                <span key={module} className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                  {module}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Actions */}
                          <div className="mt-3 flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                                router.push('/admin/notifications');
                                setIsOpen(false);
                              }}
                              className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              View Details
                            </button>
                            {!((notification as any).isRead || notification.metadata?.isRead) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-[10px] text-gray-500 hover:text-blue-600 font-bold px-1"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                        {!((notification as any).isRead || notification.metadata?.isRead) && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                  {hasMoreNotifications && (
                    <div className="px-6 py-3 bg-gray-50/50 text-center border-t border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        +{notifications.length - 8} more notifications
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowInbox(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View All History
                </button>
                <button onClick={clearNotifications} className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Clear All</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showInbox && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-4">
          <div className="relative w-full max-w-4xl mx-4 my-auto">
            <button onClick={() => setShowInbox(false)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
            <NotificationInbox
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onAcknowledge={handleAcknowledge}
              onClear={clearNotifications}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </>
  )
}
