'use client'

/**
 * Shared Notifications Page View - Microsoft 365 style
 * List on left, right-to-left detail drawer on click. Used by admin, support, branch-admin, center-admin.
 */

import React, { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { cleanNotificationTitle } from '@/lib/notificationUtils'
import {
  Bell,
  Filter,
  Search,
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
  ChevronRight,
  Trash2,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NotificationDetailDrawer } from '@/components/notifications/NotificationDetailDrawer'

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
  const iconProps = { className: 'w-5 h-5' }
  switch (iconName) {
    case 'shield-check':
    case 'shield':
      return <Shield {...iconProps} className={cn(severity === 'success' ? 'text-green-500' : severity === 'warning' ? 'text-yellow-500' : 'text-blue-500')} />
    case 'package':
    case 'package-plus':
    case 'package-check':
      return <Package {...iconProps} className={cn(severity === 'success' ? 'text-green-500' : 'text-blue-500')} />
    case 'credit-card':
      return <CreditCard {...iconProps} className={cn(severity === 'error' ? 'text-red-500' : 'text-green-500')} />
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

const getNotificationCategory = (type: string) => {
  if (type.includes('permission') || type.includes('role') || type.includes('auth')) return { name: 'Security & Permissions', icon: '🔐', color: 'text-purple-600' }
  if (type.includes('payment') || type.includes('billing') || type.includes('refund')) return { name: 'Financial', icon: '💰', color: 'text-green-600' }
  if (type.includes('order') || type.includes('logistics')) return { name: 'Orders & Operations', icon: '📦', color: 'text-blue-600' }
  if (type.includes('feature') || type.includes('system') || type.includes('update')) return { name: 'System', icon: '⚙️', color: 'text-gray-600' }
  if (type.includes('staff') || type.includes('team') || type.includes('user')) return { name: 'Team', icon: '👥', color: 'text-indigo-600' }
  if (type.includes('campaign') || type.includes('promotion') || type.includes('marketing')) return { name: 'Marketing', icon: '🎯', color: 'text-pink-600' }
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

export function NotificationsPageView() {
  const pathname = usePathname() || '/admin/notifications'
  const { notifications, stats, markAsRead, markAllAsRead, clearNotifications, refresh } = useSocketIONotifications()
  const [searchQuery, setSearchQuery] = useState('')
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
    readStatus: 'all',
  })

  const filteredNotifications = useMemo(() => {
    let filtered = notifications as unknown as AppNotification[]
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.eventType || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter((n) => filters.type.includes(getNotificationCategory(n.eventType || n.type || '').name))
    }
    if (filters.severity.length > 0) {
      filtered = filtered.filter((n) => {
        const s = n.priority === 'P0' ? 'error' : n.priority === 'P1' ? 'warning' : 'info'
        return filters.severity.includes(s)
      })
    }
    if (filters.readStatus !== 'all') {
      filtered = filtered.filter((n) => {
        const isRead = !!n.metadata?.isRead || !!n.isRead
        return filters.readStatus === 'unread' ? !isRead : isRead
      })
    }
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const fd = new Date()
      if (filters.dateRange === 'today') fd.setHours(0, 0, 0, 0)
      else if (filters.dateRange === 'week') fd.setDate(now.getDate() - 7)
      else if (filters.dateRange === 'month') fd.setMonth(now.getMonth() - 1)
      filtered = filtered.filter((n) => new Date(n.createdAt) >= fd)
    }
    return filtered
  }, [notifications, searchQuery, filters])

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const availableCategories = useMemo(() => {
    const cats = new Set((notifications as unknown as AppNotification[]).map((n) => getNotificationCategory(n.eventType || n.type || '').name))
    return Array.from(cats)
  }, [notifications])
  const unreadCount = stats.unread

  const handleDeleteNotification = () => {
    toast.success('Notification deleted successfully', { duration: 3000, position: 'top-center', icon: '🗑️' })
    refresh()
    setSelectedNotification(null)
    setShowDeleteModal(false)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-gray-200 bg-white shadow-sm z-10">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => refresh()} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all">
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Input placeholder="Filter by title, message..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 bg-gray-50/50 border-gray-100 rounded-xl text-xs font-medium" />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => { setFilters((p) => ({ ...p, readStatus: 'all' })); setCurrentPage(1); }} className={cn('px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all', filters.readStatus === 'all' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>All</button>
            <button onClick={() => { setFilters((p) => ({ ...p, readStatus: 'unread' })); setCurrentPage(1); }} className={cn('px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all', filters.readStatus === 'unread' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>Unread ({unreadCount})</button>
            <div className="w-px h-6 bg-gray-100 mx-1" />
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className={cn('h-7 px-2 text-[10px] font-black uppercase tracking-widest rounded-full', showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-900')}>
              <Filter className="w-3 h-3 mr-1" /> More
            </Button>
          </div>
          {showFilters && (
            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Range</p>
                <div className="flex flex-wrap gap-1">
                  {(['today', 'week', 'all'] as const).map((range) => (
                    <button key={range} onClick={() => setFilters((p) => ({ ...p, dateRange: range }))} className={cn('px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all', filters.dateRange === range ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100')}>{range}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Category</p>
                <Select onValueChange={(val) => setFilters((p) => ({ ...p, type: val === 'all' ? [] : [val] }))}>
                  <SelectTrigger className="w-full bg-gray-50 border-none text-[10px] font-bold rounded-lg p-1 px-2"><SelectValue placeholder="Everywhere" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everywhere</SelectItem>
                    {availableCategories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {paginatedNotifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {paginatedNotifications.map((notif) => {
                const id = notif.id || notif._id!
                const isActive = selectedNotification?.id === id || selectedNotification?._id === id
                const isRead = !!notif.metadata?.isRead || !!notif.isRead
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedNotification(notif)
                      if (!isRead) markAsRead(id)
                    }}
                    className={cn('w-full text-left p-5 transition-all hover:bg-white group relative border-l-4', isActive ? 'bg-white border-blue-500 shadow-sm z-20' : isRead ? 'bg-transparent border-transparent' : 'bg-blue-50/30 border-blue-200')}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0', isActive ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white border border-gray-100 text-gray-400')}>{getNotificationIcon(notif.icon || 'bell', notif.severity || 'info')}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', notif.priority === 'P0' ? 'bg-red-50 text-red-600 border-red-100' : notif.priority === 'P1' ? 'bg-orange-50 text-orange-600 border-orange-100' : notif.priority === 'P2' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100')}>
                            {notif.priority === 'P0' ? 'Critical' : notif.priority === 'P1' ? 'High' : notif.priority === 'P2' ? 'Medium' : 'Normal'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold whitespace-nowrap">{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                        <h4 className={cn('text-sm leading-tight truncate', isActive ? 'font-black text-gray-900' : isRead ? 'font-bold text-gray-600' : 'font-black text-gray-900')}>{cleanNotificationTitle(notif.title)}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium italic">{notif.message}</p>
                      </div>
                      <ChevronRight className={cn('w-4 h-4 text-gray-200 mt-4 transition-transform', isActive && 'translate-x-1 text-blue-500')} />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-white">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4"><Bell className="w-8 h-8 text-gray-200" /></div>
              <p className="font-black text-[10px] uppercase tracking-widest text-gray-500">No notifications</p>
              <p className="text-xs mt-2 font-medium text-gray-400">No notifications match your current filters.</p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Page {currentPage} / {totalPages}</p>
            <div className="flex gap-2">
              <Button disabled={currentPage === 1} variant="outline" size="sm" onClick={() => setCurrentPage((p) => p - 1)} className="h-8 w-8 p-0 rounded-lg border-gray-100"><ChevronRight className="w-4 h-4 rotate-180" /></Button>
              <Button disabled={currentPage === totalPages} variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} className="h-8 w-8 p-0 rounded-lg border-gray-100 font-black"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-10 flex flex-col items-center justify-center min-h-0">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full scale-125" />
            <div className="relative w-32 h-32 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-blue-50">
              <Bell className="w-12 h-12 text-blue-100 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-xl"><Search className="w-4 h-4" /></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h3>
            <p className="text-gray-400 text-xs max-w-[280px] mx-auto font-medium leading-relaxed">Click a notification on the left to open its full details in the side panel (Microsoft 365 style).</p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Real-time updates</p>
        </div>
      </div>
      <NotificationDetailDrawer notification={selectedNotification} open={!!selectedNotification} onClose={() => setSelectedNotification(null)} onMarkAsRead={(id) => markAsRead(id)} onDelete={() => setShowDeleteModal(true)} notificationsPagePath={pathname} />
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center shadow-lg shadow-red-200/50"><Trash2 className="w-10 h-10 text-red-600" /></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Delete Notification?</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-sm">Are you sure you want to delete this notification? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full pt-4">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 h-12 rounded-[16px] font-black uppercase tracking-widest text-xs border-2 hover:bg-gray-50">Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteNotification} className="flex-1 h-12 rounded-[16px] font-black uppercase tracking-widest text-xs shadow-lg shadow-red-200/50 hover:shadow-xl">Delete</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
