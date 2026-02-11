'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Shield, Package, CreditCard, User, Settings, Star, TrendingUp, ArrowLeft, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const getNotificationIcon = (iconName: string, severity: string) => {
  const iconProps = { className: "w-5 h-5" }
  
  switch (iconName) {
    case 'shield-check':
    case 'shield':
      return <Shield {...iconProps} className={`w-5 h-5 ${severity === 'success' ? 'text-green-500' : severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
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

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'border-l-green-400 bg-green-50 hover:bg-green-100'
    case 'warning':
      return 'border-l-yellow-400 bg-yellow-50 hover:bg-yellow-100'
    case 'error':
      return 'border-l-red-400 bg-red-50 hover:bg-red-100'
    default:
      return 'border-l-blue-400 bg-blue-50 hover:bg-blue-100'
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  // For older notifications, show full date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AllNotificationsPage() {
  const router = useRouter()
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead
  } = useSocketIONotifications()

  // Socket.IO notifications are automatically fetched, no need for manual fetch

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'unread') return !notification.isRead
      if (filter === 'read') return notification.isRead
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (!notification.metadata?.isRead) {
      markAsRead(notification.id)
    }
  }, [markAsRead])

  const handleSelectNotification = useCallback((notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id))
    }
  }, [selectedNotifications, filteredNotifications])

  const handleMarkSelectedAsRead = useCallback(() => {
    if (selectedNotifications.length > 0) {
      markAsRead(selectedNotifications)
      setSelectedNotifications([])
    }
  }, [selectedNotifications, markAsRead])

  const handleDeleteSelected = useCallback(() => {
    // TODO: Implement delete functionality when backend supports it
    console.log('Delete selected notifications:', selectedNotifications)
    setSelectedNotifications([])
  }, [selectedNotifications])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">All Notifications</h1>
                <p className="text-sm text-gray-500">
                  {notifications.length} total • {unreadCount} unread
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={fetchNotifications}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh notifications"
              >
                <RotateCcw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({notifications.length})</SelectItem>
                    <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
                    <SelectItem value="read">Read ({notifications.length - unreadCount})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={handleMarkSelectedAsRead}
                  className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  Mark Read
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredNotifications.length})
                  </span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      'px-6 py-4 hover:bg-gray-50 transition-colors border-l-4',
                      getSeverityStyles(notification.severity),
                      !notification.isRead && 'bg-blue-50/30'
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.icon, notification.severity)}
                      </div>
                      
                      {/* Content */}
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={cn(
                            'text-sm font-medium truncate',
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          )}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatDateTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className={cn(
                          'text-sm leading-relaxed',
                          notification.isRead ? 'text-gray-600' : 'text-gray-800'
                        )}>
                          {notification.message}
                        </p>
                        
                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <div className="flex items-center mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs text-blue-600 font-medium">Unread</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}