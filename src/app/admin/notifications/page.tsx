'use client'

import { useState, useEffect } from 'react'
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
  TrendingUp,
  Check,
  CheckCheck,
  Filter,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withRouteGuard } from '@/components/withRouteGuard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    const data = localStorage.getItem('laundry-auth')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch {}
  return localStorage.getItem('token')
}

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

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'bg-green-50 border-l-green-400 hover:bg-green-100'
    case 'warning':
      return 'bg-yellow-50 border-l-yellow-400 hover:bg-yellow-100'
    case 'error':
      return 'bg-red-50 border-l-red-400 hover:bg-red-100'
    default:
      return 'bg-blue-50 border-l-blue-400 hover:bg-blue-100'
  }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return new Date(dateString).toLocaleDateString()
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [filter, setFilter] = useState('all') // all, unread, read
  const [severityFilter, setSeverityFilter] = useState('all') // all, info, success, warning, error
  const [searchTerm, setSearchTerm] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, filter, severityFilter, searchTerm])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setNotifications(data.data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
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

  const filterNotifications = () => {
    let filtered = notifications

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead)
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(n => n.severity === severityFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredNotifications(filtered)
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id])
    }
    
    // Navigate to relevant page if link exists
    if (notification.data?.link) {
      window.location.href = notification.data.link
    }
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id))
    }
  }

  const handleMarkSelectedAsRead = () => {
    if (selectedNotifications.length > 0) {
      markAsRead(selectedNotifications)
      setSelectedNotifications([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7" />
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with all your business activities
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedNotifications.length} notification(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleMarkSelectedAsRead}>
                <Check className="w-4 h-4 mr-1" />
                Mark as Read
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedNotifications([])}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' || severityFilter !== 'all' 
                ? 'No notifications match your filters' 
                : 'No notifications yet'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' || severityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You\'ll see notifications here when they arrive'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredNotifications.length})
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 transition-colors cursor-pointer border-l-4 ${
                    getSeverityStyles(notification.severity)
                  } ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
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
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.icon, notification.severity)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-base font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              notification.severity === 'success' ? 'bg-green-100 text-green-800' :
                              notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.severity === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {notification.severity.charAt(0).toUpperCase() + notification.severity.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default withRouteGuard(NotificationsPage, {
  module: 'dashboard',
  action: 'view'
})