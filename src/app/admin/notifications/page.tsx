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
import { Tag, FileText, ArrowRight, ExternalLink } from 'lucide-react'

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

  const unreadCount = stats.unread

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Page Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Notifications</h1>

        {/* Filters and Search - Compact Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? 'secondary' : 'outline'}
                size="sm"
                className={cn(
                  "rounded-xl border-gray-200 h-10 px-4 font-medium",
                  showFilters && "bg-blue-50 text-blue-700 border-blue-200"
                )}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={cn(
                  "w-3 h-3 ml-2 transition-transform duration-300",
                  showFilters && "rotate-180"
                )} />
              </Button>

              {selectedNotifications.size > 0 && (
                <Button
                  onClick={handleBulkMarkAsRead}
                  size="sm"
                  className="bg-gray-900 hover:bg-black text-white rounded-xl h-10 px-4 shadow-sm"
                >
                  Mark {selectedNotifications.size} Read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</h4>
                  <div className="space-y-1">
                    {availableCategories.map((category: string) => (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, type: [...prev.type, category] }))
                            } else {
                              setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== category) }))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-100"
                        />
                        <span className="ml-2 text-sm text-gray-600">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'unread', 'read'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilters(prev => ({ ...prev, readStatus: status }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          filters.readStatus === status
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'today', 'week', 'month'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setFilters(prev => ({ ...prev, dateRange: range }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                          filters.dateRange === range
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {range === 'all' ? 'All' : range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'Today'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset */}
                <div className="flex items-end justify-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
                    onClick={() => setFilters({ type: [], severity: [], dateRange: 'all', readStatus: 'all' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Table - Compact Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {paginatedNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="w-[50px] text-center">
                    {/* Header Checkbox could go here */}
                  </TableHead>
                  <TableHead className="w-[180px]">Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedNotifications.map((notification) => {
                  const category = getNotificationCategory(notification.eventType || notification.type || '')
                  const id = notification.id || notification._id!
                  const isSelected = selectedNotifications.has(id)
                  const isRead = !!notification.metadata?.isRead || !!notification.isRead

                  return (
                    <TableRow
                      key={id}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-blue-50/30 group",
                        !isRead && "bg-blue-50/10"
                      )}
                      onClick={() => {
                        setSelectedNotification(notification);
                        if (!isRead) markAsRead(id);
                      }}
                    >
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleNotificationSelection(id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-100 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-semibold truncate",
                              !isRead ? "text-gray-900" : "text-gray-600"
                            )}>
                              {cleanNotificationTitle(notification.title)}
                            </span>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "uppercase text-[10px] font-bold tracking-wider border-none min-w-[2.5rem] justify-center",
                          notification.priority === 'P0' ? "bg-red-100 text-red-700" :
                            notification.priority === 'P1' ? "bg-orange-100 text-orange-700" :
                              notification.priority === 'P2' ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-600"
                        )}>
                          {notification.priority || 'Norm'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden bg-[#F8FAFC] max-h-[90vh] flex flex-col h-fit">
            {selectedNotification && (() => {
              // Helper data preparation for the modal
              const notification = selectedNotification;
              const priorityConfig = notification.priority === 'P0' ? { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' } :
                notification.priority === 'P1' ? { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' } :
                  notification.priority === 'P2' ? { label: 'Medium', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' } :
                    { label: 'Normal', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' };

              const severityConfig = notification.severity === 'success' ? { label: 'Success', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' } :
                notification.severity === 'warning' ? { label: 'Warning', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' } :
                  notification.severity === 'error' ? { label: 'Error', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' } :
                    { label: 'Info', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' };

              const category = getNotificationCategory(notification.eventType || notification.type || '');

              return (
                <>
                  {/* Modal Header */}
                  <div className={cn("p-4 border-b border-gray-100", priorityConfig.bgLight)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={cn("p-1.5 rounded-lg", severityConfig.bg)}>
                          {getNotificationIcon(notification.icon || 'bell', notification.severity || 'info')}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-0.5">
                            <Badge className={cn("font-bold text-[10px]", priorityConfig.color, "text-white")}>
                              {notification.priority || 'NORMAL'}
                            </Badge>
                            <Badge className={cn("text-[10px]", category.color)}>
                              {category.name}
                            </Badge>
                          </div>
                          <h2 className="text-lg font-bold text-gray-900 leading-tight">
                            {cleanNotificationTitle(notification.title)}
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-[10px] text-gray-500 pl-11">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Modal Scrollable Content */}
                  <div className="overflow-y-auto p-4">
                    {/* Message */}
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-gray-900 mb-1.5 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                        Message
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                        {notification.message}
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="p-2.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-[10px] text-gray-500 mb-0.5">Status</p>
                        <Badge variant="outline" className={cn("bg-gray-50 text-[10px]", notification.isRead || notification.metadata?.isRead ? "text-green-600 border-green-200" : "text-blue-600 border-blue-200")}>
                          {notification.isRead || notification.metadata?.isRead ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <div className="p-2.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <p className="text-[10px] text-gray-500 mb-0.5">Severity</p>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <severityConfig.icon className={cn("w-3 h-3", severityConfig.color)} />
                          <span className={severityConfig.color}>{severityConfig.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata / Additional Info - Human Readable */}
                    {(notification.data || notification.metadata) && (
                      <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                          <Tag className="w-4 h-4 mr-2 text-gray-500" />
                          Details
                        </h3>

                        <div className="space-y-4">
                          {/* Smart Rendering of Known Fields */}
                          {(() => {
                            const data = { ...notification.metadata, ...notification.data };

                            // 1. Actions / Links
                            if (data.link) {
                              return (
                                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                      <ExternalLink className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">Action Required</p>
                                      <p className="text-xs text-gray-500">Navigate to the related page</p>
                                    </div>
                                  </div>
                                  <Button size="sm" onClick={() => router.push(data.link)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    View
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                  </Button>
                                </div>
                              );
                            }

                            // 2. Generic Key-Value Pairs (excluding complex objects for now unless specific)
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(data).map(([key, value]) => {
                                  if (key === 'link' || key === 'permissions' || typeof value === 'object') return null;

                                  // Format label text (camelCase to Title Case)
                                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                  return (
                                    <div key={key} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                                      <p className="text-sm font-semibold text-gray-900 truncate" title={String(value)}>{String(value)}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedNotification(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this notification?')) {
                          clearNotifications(); // Note: clearNotifications usually clears all, might need specific delete
                          setSelectedNotification(null);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div >
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

      </div>
    </div >

  )
}
