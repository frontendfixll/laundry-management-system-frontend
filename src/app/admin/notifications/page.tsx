'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Eye,
  Trash2,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDistanceToNow } from 'date-fns'
import { Tag, FileText, ArrowRight, ExternalLink, ShieldAlert, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
    case 'shield-alert':
      return <ShieldAlert {...iconProps} className="w-5 h-5 text-red-500" />
    case 'alert-circle':
      return <AlertCircle {...iconProps} className="w-5 h-5 text-orange-500" />
    default:
      return <Bell {...iconProps} className="w-5 h-5 text-blue-500" />
  }
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'border-l-green-400 bg-green-50'
    case 'warning':
      return 'border-l-yellow-400 bg-yellow-50'
    case 'error':
      return 'border-l-red-400 bg-red-50'
    default:
      return 'border-l-blue-400 bg-blue-50'
  }
}

const getNotificationCategory = (type: string) => {
  if (type.includes('permission') || type.includes('role') || type.includes('auth')) {
    return { name: 'Security & Permissions', icon: '🔐', color: 'text-purple-600' }
  }
  if (type.includes('payment') || type.includes('billing') || type.includes('refund')) {
    return { name: 'Financial', icon: '💰', color: 'text-green-600' }
  }
  if (type.includes('order') || type.includes('logistics')) {
    return { name: 'Orders & Operations', icon: '📦', color: 'text-blue-600' }
  }
  if (type.includes('feature') || type.includes('system') || type.includes('update')) {
    return { name: 'System', icon: '⚙️', color: 'text-gray-600' }
  }
  if (type.includes('staff') || type.includes('team') || type.includes('user')) {
    return { name: 'Team', icon: '👥', color: 'text-indigo-600' }
  }
  if (type.includes('campaign') || type.includes('promotion') || type.includes('marketing')) {
    return { name: 'Marketing', icon: '🎯', color: 'text-pink-600' }
  }
  return { name: 'General', icon: '📢', color: 'text-gray-600' }
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

const parsePermissionDetails = (data: any) => {
  if (!data || !data.permissions) return null

  const changes: { module: string; actions: string[] }[] = []
  for (const [module, permissions] of Object.entries(data.permissions)) {
    if (typeof permissions === 'object' && permissions !== null) {
      const enabledActions = Object.entries(permissions as Record<string, boolean>)
        .filter(([_, enabled]) => enabled)
        .map(([action, _]) => action)

      if (enabledActions.length > 0) {
        changes.push({
          module: module.charAt(0).toUpperCase() + module.slice(1),
          actions: enabledActions
        })
      }
    }
  }
  return changes
}

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, stats, markAsRead, markAllAsRead, clearNotifications, refresh } = useSocketIONotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set())
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [filters, setFilters] = useState<NotificationFilter>({
    type: [],
    severity: [],
    dateRange: 'all',
    readStatus: 'all'
  })

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications as unknown as AppNotification[]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.eventType || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(notification => {
        const category = getNotificationCategory(notification.eventType || notification.type || '')
        return filters.type.includes(category.name)
      })
    }

    // Severity filter
    if (filters.severity.length > 0) {
      filtered = filtered.filter(notification => {
        const severity = notification.priority === 'P0' ? 'error' :
          notification.priority === 'P1' ? 'warning' : 'info'
        return filters.severity.includes(severity)
      })
    }

    // Read status filter
    if (filters.readStatus !== 'all') {
      filtered = filtered.filter(notification => {
        const isRead = !!notification.metadata?.isRead || !!notification.isRead
        return filters.readStatus === 'unread' ? !isRead : isRead
      })
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()

      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter(notification =>
        new Date(notification.createdAt) >= filterDate
      )
    }

    return filtered
  }, [notifications, searchQuery, filters])

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Get unique categories for filter options
  const availableCategories = useMemo(() => {
    const categories = new Set((notifications as unknown as AppNotification[]).map(n => getNotificationCategory(n.eventType || n.type || '').name))
    return Array.from(categories)
  }, [notifications])

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const handleBulkMarkAsRead = () => {
    if (selectedNotifications.size > 0) {
      Array.from(selectedNotifications).forEach(id => markAsRead(id))
      setSelectedNotifications(new Set())
    }
  }

  const handleNotificationClick = (notification: AppNotification) => {
    const isRead = !!notification.metadata?.isRead || !!notification.isRead
    if (!isRead) {
      markAsRead(notification.id || notification._id!)
    }
  }

  const handleDeleteNotification = () => {
    toast.success('Notification deleted successfully', {
      duration: 3000,
      position: 'top-center',
      icon: '🗑️',
    });
    refresh();
    setSelectedNotification(null);
    setShowDeleteModal(false);
  }

  const unreadCount = stats.unread

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      {/* Sidebar: List of Notifications */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-200 bg-white shadow-sm z-10">
        {/* List Header */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 transition-colors group-focus-within:text-blue-500" />
            <Input
              placeholder="Filter by title, message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-gray-50/50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-xs font-medium"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => { setFilters(prev => ({ ...prev, readStatus: 'all' })); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                filters.readStatus === 'all'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              All
            </button>
            <button
              onClick={() => { setFilters(prev => ({ ...prev, readStatus: 'unread' })); setCurrentPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                filters.readStatus === 'unread'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              Unread ({unreadCount})
            </button>
            <div className="w-px h-6 bg-gray-100 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-7 px-2 text-[10px] font-black uppercase tracking-widest rounded-full",
                showFilters ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-900"
              )}
            >
              <Filter className="w-3 h-3 mr-1" />
              More
            </Button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Range</p>
                <div className="flex flex-wrap gap-1">
                  {(['today', 'week', 'all'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                      className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                        filters.dateRange === range ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Select Category</p>
                <Select onValueChange={(val) => setFilters(prev => ({ ...prev, type: val === 'all' ? [] : [val] }))}>
                  <SelectTrigger className="w-full bg-gray-50 border-none text-[10px] font-bold rounded-lg p-1 px-2 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Everywhere" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everywhere</SelectItem>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {paginatedNotifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {paginatedNotifications.map((notif) => {
                const id = notif.id || notif._id!;
                const isActive = selectedNotification?.id === id || selectedNotification?._id === id;
                const isRead = !!notif.metadata?.isRead || !!notif.isRead;
                const category = getNotificationCategory(notif.eventType || notif.type || '');

                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedNotification(notif);
                      if (!isRead) markAsRead(id);
                    }}
                    className={cn(
                      "w-full text-left p-5 transition-all hover:bg-white group relative border-l-4",
                      isActive ? "bg-white border-blue-500 shadow-sm z-20" : isRead ? "bg-transparent border-transparent" : "bg-blue-50/30 border-blue-200"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 shrink-0",
                        isActive ? "bg-blue-600 text-white shadow-blue-100" : "bg-white border border-gray-100 text-gray-400"
                      )}>
                        {getNotificationIcon(notif.icon || 'bell', notif.severity || 'info')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            notif.priority === 'P0' ? "bg-red-50 text-red-600 border-red-100" :
                              notif.priority === 'P1' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                notif.priority === 'P2' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                  "bg-gray-50 text-gray-500 border-gray-100"
                          )}>
                            {notif.priority === 'P0' ? 'Critical' :
                              notif.priority === 'P1' ? 'High' :
                                notif.priority === 'P2' ? 'Medium' :
                                  'Normal'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <h4 className={cn(
                          "text-sm leading-tight truncate",
                          isActive ? "font-black text-gray-900" : isRead ? "font-bold text-gray-600" : "font-black text-gray-900"
                        )}>
                          {cleanNotificationTitle(notif.title)}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium italic">
                          {notif.message}
                        </p>
                      </div>

                      <ChevronRight className={cn(
                        "w-4 h-4 text-gray-200 mt-4 transition-transform",
                        isActive && "translate-x-1 text-blue-500"
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-white">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-200" />
              </div>
              <p className="font-black text-[10px] uppercase tracking-widest text-gray-500">Silence is Golden</p>
              <p className="text-xs mt-2 font-medium text-gray-400">No notifications match your current filters.</p>
            </div>
          )}
        </div>

        {/* List Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Page {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                className="h-8 w-8 p-0 rounded-lg border-gray-100"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Button>
              <Button
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                className="h-8 w-8 p-0 rounded-lg border-gray-100 font-black"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Detailed View */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10">
        {selectedNotification ? (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[24px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
              {(() => {
                const notification = selectedNotification;
                const isRead = (notification as any).isRead || notification.metadata?.isRead;
                const priorityConfig = notification.priority === 'P0' ? { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-500', icon: ShieldAlert } :
                  notification.priority === 'P1' ? { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-500', icon: AlertCircle } :
                    notification.priority === 'P2' ? { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-500', icon: Info } :
                      { label: 'Normal', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-300', icon: Bell };

                const category = getNotificationCategory(notification.eventType || notification.type || '');
                const IconComponent = priorityConfig.icon;

                return (
                  <>
                    {/* Top Priority Accent Bar */}
                    <div className={cn("h-3 w-full shrink-0", priorityConfig.border.replace('border-', 'bg-'))} />

                    <div className="p-10 flex-1 overflow-y-auto">
                      {/* Header: Icon & Badges */}
                      <div className="flex items-start justify-between mb-8">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-gray-100 transition-transform hover:scale-105",
                          priorityConfig.bg
                        )}>
                          <IconComponent className={cn("w-8 h-8", priorityConfig.color)} />
                        </div>
                        <div className="text-right flex flex-col items-end gap-3">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] border-2 px-3 py-1 rounded-full flex items-center gap-2",
                            priorityConfig.bg, priorityConfig.color, priorityConfig.border.replace('border-', 'border-').replace('500', '100')
                          )}>
                            <div className={cn("w-1.2 h-1.2 rounded-full animate-ping", priorityConfig.border.replace('border-', 'bg-'))} />
                            {priorityConfig.label}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 tracking-widest uppercase">
                            <Clock className="w-3.5 h-3.5" />
                            Registered {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{category.icon}</span>
                            <p className={cn("text-xs font-black uppercase tracking-[0.3em]", category.color)}>
                              {category.name}
                            </p>
                          </div>
                          <h2 className="text-2xl font-black text-gray-900 leading-tight tracking-tight max-w-xl">
                            {cleanNotificationTitle(notification.title)}
                          </h2>
                        </div>

                        <div className="bg-gray-50/70 p-6 rounded-[20px] border border-gray-100/50 shadow-inner group">
                          <p className="text-base text-gray-800 leading-relaxed font-semibold tracking-tight">
                            {notification.message}
                          </p>
                        </div>

                        {/* Meta Information / Metadata */}
                        <div className="space-y-6 pt-6">
                          <div className="flex items-center gap-3">
                            <div className="h-px bg-gray-100 flex-1"></div>
                            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 shrink-0 px-2">Data Integrity Report</h5>
                            <div className="h-px bg-gray-100 flex-1"></div>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-gray-200/20 transition-all duration-300">
                              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1.5">Official Timeline</p>
                              <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                <p className="text-sm font-black text-gray-700 tracking-tight">
                                  {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Extended Metadata Display */}
                          {(() => {
                            const data = { ...notification.metadata, ...notification.data };
                            const entries = Object.entries(data).filter(([key, value]) =>
                              !['link', 'permissions', 'isRead', 'isActioned', 'isSystem', 'isPersistent', 'icon', 'type', 'severity', 'priority', 'id', '_id', 'createdAt', 'updatedAt', '__v'].includes(key) &&
                              typeof value !== 'object'
                            );

                            if (entries.length > 0) {
                              return (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                  {entries.map(([key, value]) => (
                                    <div key={key} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group/item hover:bg-white hover:shadow-md transition-all">
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                      </p>
                                      <p className="text-xs font-black text-gray-900 truncate" title={String(value)}>{String(value)}</p>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-10 border-t border-gray-50 bg-gray-50/30 flex flex-col gap-4 sticky bottom-0 z-20">
                      {(() => {
                        const data = { ...notification.metadata, ...notification.data };
                        if (data.link) {
                          return (
                            <button
                              onClick={() => {
                                router.push(data.link);
                              }}
                              className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-[16px] font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Take Action / View Details
                            </button>
                          );
                        }
                        return null;
                      })()}

                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full h-12 rounded-[16px] flex items-center justify-center gap-2 shadow-lg shadow-red-100/50 hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">Delete</span>
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">End of Record</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-125"></div>
              <div className="relative w-32 h-32 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-blue-50">
                <Bell className="w-12 h-12 text-blue-100 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-xl">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Briefing</h3>
              <p className="text-gray-400 text-xs max-w-[280px] mx-auto font-medium leading-relaxed">
                Select a transmission from the left telemetry feed to analyze its metadata and execute required protocols.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-3 h-3 rounded-full bg-blue-100 border-2 border-gray-50"></div>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Monitoring real-time uplink</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-lg shadow-red-200/50">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  Delete Notification?
                </h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-sm">
                  Are you sure you want to delete this notification? This action cannot be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 rounded-[16px] font-black uppercase tracking-widest text-xs border-2 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteNotification}
                  className="flex-1 h-12 rounded-[16px] font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200/50 hover:shadow-xl"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >

  )
}
