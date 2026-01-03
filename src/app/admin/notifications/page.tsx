'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bell,
  CheckCircle,
  Package,
  DollarSign,
  MessageSquare,
  AlertCircle,
  Clock,
  Check,
  CheckCheck,
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  data?: {
    orderId?: string
    ticketId?: string
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 })
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/notifications?page=${page}&limit=20&unreadOnly=${filter === 'unread'}`)
      if (response.data.success) {
        setNotifications(response.data.data.notifications || [])
        setPagination({
          totalPages: response.data.data.pagination?.totalPages || 1,
          totalItems: response.data.data.pagination?.totalItems || 0
        })
      }
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page, filter])

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await api.put('/admin/notifications/mark-read', { notificationIds })
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n._id) ? { ...n, isRead: true } : n)
      )
      toast.success('Marked as read')
    } catch (error) {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/admin/notifications/mark-all-read')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ASSIGNED':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'REFUND_REQUEST':
        return <DollarSign className="w-5 h-5 text-orange-600" />
      case 'NEW_COMPLAINT':
        return <MessageSquare className="w-5 h-5 text-red-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'ORDER_PLACED':
      case 'ORDER_ASSIGNED':
        return 'bg-blue-100'
      case 'REFUND_REQUEST':
        return 'bg-orange-100'
      case 'NEW_COMPLAINT':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setFilter('all'); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('unread'); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === 'unread' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Unread
            </button>
          </div>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-5 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationBg(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-base ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatTime(notification.createdAt)}</span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead([notification._id])}
                          className="flex-shrink-0"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {pagination.totalPages} ({pagination.totalItems} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
