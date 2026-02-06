'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cleanNotificationTitle } from '@/lib/notificationUtils'
import {
  Bell,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Shield,
  Package,
  CreditCard,
  User,
  Settings,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  ExternalLink,
  Tag,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'

interface AppNotification {
  id: string
  _id?: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  severity: string
  eventType: string
  type: string
  createdAt: string
  isRead?: boolean
  metadata?: any
  data?: any
  icon: string
  requiresAck?: boolean
}

interface NotificationFilter {
  type: string[]
  severity: string[]
  dateRange: 'all' | 'today' | 'week' | 'month'
  readStatus: 'all' | 'unread' | 'read'
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

const getNotificationCategory = (type: string) => {
  if (type.includes('permission') || type.includes('role') || type.includes('auth')) {
    return { name: 'Security & Permissions', icon: '🔐', color: 'bg-purple-100 text-purple-700' }
  }
  if (type.includes('payment') || type.includes('billing') || type.includes('refund')) {
    return { name: 'Financial', icon: '💰', color: 'bg-green-100 text-green-700' }
  }
  if (type.includes('order') || type.includes('logistics')) {
    return { name: 'Orders & Operations', icon: '📦', color: 'bg-blue-100 text-blue-700' }
  }
  if (type.includes('feature') || type.includes('system') || type.includes('update')) {
    return { name: 'System', icon: '⚙️', color: 'bg-gray-100 text-gray-700' }
  }
  if (type.includes('staff') || type.includes('team') || type.includes('user')) {
    return { name: 'Team', icon: '👥', color: 'bg-indigo-100 text-indigo-700' }
  }
  if (type.includes('campaign') || type.includes('promotion') || type.includes('marketing')) {
    return { name: 'Marketing', icon: '🎯', color: 'bg-pink-100 text-pink-700' }
  }
  return { name: 'General', icon: '📢', color: 'bg-gray-100 text-gray-600' }
}


export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { notifications, stats, markAsRead, markAllAsRead, clearNotifications } = useSocketIONotifications()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // URL Deep Link Support
  useEffect(() => {
    const id = searchParams?.get('id')
    if (id && notifications.length > 0) {
      const found = notifications.find(n => n.id === id || (n as any)._id === id) as unknown as AppNotification
      if (found) {
        setSelectedNotification(found)
        const isRead = !!found.metadata?.isRead || !!found.isRead
        if (!isRead) markAsRead(found.id || found._id!)
      }
    }
  }, [searchParams, notifications])

  const [filters, setFilters] = useState<NotificationFilter>({
    type: [],
    severity: [],
    dateRange: 'all',
    readStatus: 'all'
  })

  // Filter Logic
  const filteredNotifications = useMemo(() => {
    let filtered = notifications as unknown as AppNotification[]

    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.eventType || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filters.type.length > 0) {
      filtered = filtered.filter(notification => {
        const category = getNotificationCategory(notification.eventType || notification.type || '')
        return filters.type.includes(category.name)
      })
    }

    if (filters.readStatus !== 'all') {
      filtered = filtered.filter(notification => {
        const isRead = !!notification.metadata?.isRead || !!notification.isRead
        return filters.readStatus === 'unread' ? !isRead : isRead
      })
    }

    // Sort by date desc
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, searchQuery, filters])

  const availableCategories = useMemo(() => {
    const categories = new Set((notifications as unknown as AppNotification[]).map(n => getNotificationCategory(n.eventType || n.type || '').name))
    return Array.from(categories)
  }, [notifications])

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F8FAFC]">
      {/* Left Pane: List */}
      <div className="w-1/2 flex flex-col border-r border-gray-200 bg-white">
        {/* Header & Filters */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-gray-200 text-sm w-full"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => setFilters(prev => ({ ...prev, readStatus: 'all' }))}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                  filters.readStatus === 'all' ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, readStatus: 'unread' }))}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all",
                  filters.readStatus === 'unread' ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                Unread ({stats.unread})
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />
              {availableCategories.slice(0, 3).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    type: prev.type.includes(cat) ? prev.type.filter(t => t !== cat) : [...prev.type, cat]
                  }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                    filters.type.includes(cat)
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredNotifications.map((notif) => {
                const isRead = !!notif.metadata?.isRead || !!notif.isRead
                const category = getNotificationCategory(notif.eventType || notif.type || '')
                const isSelected = selectedNotification?.id === notif.id || selectedNotification?._id === notif._id

                return (
                  <button
                    key={notif.id || notif._id}
                    onClick={() => {
                      setSelectedNotification(notif)
                      if (!isRead) markAsRead(notif.id || notif._id!)
                    }}
                    className={cn(
                      "w-full text-left p-4 transition-all hover:bg-gray-50 group relative border-l-4",
                      isSelected ? "bg-blue-50/50 border-l-blue-500" : "border-l-transparent bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1 flex-shrink-0", isRead ? "opacity-50" : "")}>
                        {getNotificationIcon(notif.icon || 'bell', notif.severity || 'info')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className={cn("text-[10px] font-bold border-none px-2 py-0.5", category.color)}>
                            {category.name}
                          </Badge>
                          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className={cn("text-sm leading-tight truncate mb-1", !isRead ? "font-bold text-gray-900" : "text-gray-600 font-medium")}>
                          {cleanNotificationTitle(notif.title)}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>

                      <ChevronRight className={cn(
                        "w-4 h-4 text-gray-300 mt-5 transition-transform",
                        isSelected ? "translate-x-1 text-blue-500" : ""
                      )} />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Details */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
        {selectedNotification ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            {(() => {
              // Prepare details data similar to the original modal
              const notification = selectedNotification
              const priorityConfig = notification.priority === 'P0' ? { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' } :
                notification.priority === 'P1' ? { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' } :
                  notification.priority === 'P2' ? { label: 'Medium', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' } :
                    { label: 'Normal', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' }

              const severityConfig = notification.severity === 'success' ? { label: 'Success', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' } :
                notification.severity === 'warning' ? { label: 'Warning', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' } :
                  notification.severity === 'error' ? { label: 'Error', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' } :
                    { label: 'Info', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' }

              const category = getNotificationCategory(notification.eventType || notification.type || '')

              return (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  {/* Colored header line */}
                  <div className={cn("h-2", priorityConfig.color)} />

                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105", severityConfig.bg)}>
                        {getNotificationIcon(notification.icon || 'bell', notification.severity || 'info')}
                      </div>
                      <div className="text-right">
                        <div className="flex justify-end gap-2 mb-2">
                          <Badge className={cn("font-bold", priorityConfig.bgLight, priorityConfig.textColor, "border-none hover:bg-opacity-80")}>
                            Priority {notification.priority || 'Normal'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">
                          Received {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-4">
                      {cleanNotificationTitle(notification.title)}
                    </h2>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Message
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {notification.message}
                      </p>
                    </div>

                    {/* Rich Metadata Section */}
                    {(notification.data || notification.metadata) && (
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <Tag className="w-3 h-3" />
                          Related Information
                        </h5>

                        {(() => {
                          const data = { ...notification.metadata, ...notification.data };

                          return (
                            <div className="grid grid-cols-1 gap-4">
                              {/* Generic Key-Value Grid */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Category</p>
                                  <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <span>{category.icon}</span>
                                    {category.name}
                                  </p>
                                </div>

                                {Object.entries(data).map(([key, value]) => {
                                  if (key === 'link' || key === 'permissions' || typeof value === 'object') return null

                                  // Hide ID fields if they are too long, or truncate
                                  const displayValue = String(value)

                                  return (
                                    <div key={key} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </p>
                                      <p className="text-sm font-bold text-gray-700 truncate" title={displayValue}>
                                        {displayValue}
                                      </p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-100">
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider px-4 py-2"
                    >
                      Close View
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this notification?')) {
                          // Actual delete not always supported by hook, falling back to clear all logic or just local hide if singular delete missing
                          // Assuming clearNotifications is for all... beware.
                          // If specific delete is not in hook, we might just hide it locally for now or need to extend hook.
                          // The original code used clearNotifications() inside handleDelete which seemed to clear ALL. 
                          // I'll keep it safe and just unselect for now if no specific delete.
                          toast.error("Single delete not supported yet")
                        }
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/10 mb-8 border border-blue-50 relative">
              <div className="absolute inset-0 rounded-full bg-blue-50/50 animate-ping opacity-20" />
              <Bell className="w-12 h-12 text-blue-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Select a notification</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
              Click on any notification in the list to view its comprehensive details and take action.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
