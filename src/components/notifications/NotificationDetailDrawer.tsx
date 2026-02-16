'use client'

/**
 * NotificationDetailDrawer - Microsoft 365 style right-to-left slide panel
 * Shows complete notification details when user clicks a notification.
 */

import React, { useEffect } from 'react'
import {
  X,
  Bell,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Shield,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Package,
  CreditCard,
  User,
  Settings,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cleanNotificationTitle } from '@/lib/notificationUtils'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export interface NotificationDetailItem {
  id: string
  _id?: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  severity?: string
  eventType?: string
  type?: string
  createdAt: string
  isRead?: boolean
  metadata?: Record<string, unknown>
  data?: Record<string, unknown> & { link?: string }
  icon?: string
  requiresAck?: boolean
  category?: string
}

interface NotificationDetailDrawerProps {
  notification: NotificationDetailItem | null
  open: boolean
  onClose: () => void
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  notificationsPagePath?: string
}

const getNotificationIcon = (iconName: string, severity: string) => {
  const iconProps = { className: 'w-6 h-6' }
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
      return <User {...iconProps} className="text-blue-500" />
    case 'settings':
      return <Settings {...iconProps} className="text-gray-500" />
    case 'star':
      return <Star {...iconProps} className="text-yellow-500" />
    case 'trending-up':
      return <TrendingUp {...iconProps} className="text-green-500" />
    case 'check-circle':
      return <CheckCircle {...iconProps} className="text-green-500" />
    case 'alert-triangle':
      return <AlertTriangle {...iconProps} className="text-yellow-500" />
    case 'x-circle':
      return <XCircle {...iconProps} className="text-red-500" />
    case 'shield-alert':
      return <ShieldAlert {...iconProps} className="text-red-500" />
    case 'alert-circle':
      return <AlertCircle {...iconProps} className="text-orange-500" />
    default:
      return <Bell {...iconProps} className="text-blue-500" />
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

export function NotificationDetailDrawer({
  notification,
  open,
  onClose,
  onMarkAsRead,
  onDelete,
  notificationsPagePath = '/admin/notifications',
}: NotificationDetailDrawerProps) {
  const nid = notification?.id || notification?._id

  useEffect(() => {
    if (open && nid && onMarkAsRead) {
      onMarkAsRead(nid)
    }
  }, [open, nid, onMarkAsRead])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!notification) return null

  const priorityConfig =
    notification.priority === 'P0'
      ? { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-500', icon: ShieldAlert }
      : notification.priority === 'P1'
        ? { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-500', icon: AlertCircle }
        : notification.priority === 'P2'
          ? { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-500', icon: Info }
          : { label: 'Normal', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-300', icon: Bell }

  const category = getNotificationCategory(notification.eventType || notification.type || '')
  const IconComponent = priorityConfig.icon
  const data = { ...notification.metadata, ...notification.data } as Record<string, unknown>
  const actionLink = (notification.data?.link || data?.link) as string | undefined
  const metaEntries = Object.entries(data).filter(
    ([key, value]) =>
      !['link', 'permissions', 'isRead', 'isActioned', 'isSystem', 'isPersistent', 'icon', 'type', 'severity', 'priority', 'id', '_id', 'createdAt', 'updatedAt', '__v'].includes(key) &&
      typeof value !== 'object'
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - slides from right to left (Microsoft 365 style) */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-lg sm:max-w-xl bg-white shadow-2xl z-50 flex flex-col',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Notification details"
      >
        {/* Header */}
        <div className={cn('h-1 w-full shrink-0', priorityConfig.border.replace('border-', 'bg-'))} />
        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Notification details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center shrink-0', priorityConfig.bg)}>
              {getNotificationIcon(notification.icon || 'bell', notification.severity || 'info')}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={cn(
                  'inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border',
                  priorityConfig.bg,
                  priorityConfig.color,
                  priorityConfig.border.replace('border-', 'border-').replace('500', '200')
                )}
              >
                {priorityConfig.label}
              </span>
              <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <p className={cn('text-xs font-bold uppercase tracking-wider', category.color)}>{category.name}</p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {cleanNotificationTitle(notification.title)}
          </h3>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-800 leading-relaxed">{notification.message}</p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {new Date(notification.createdAt).toLocaleDateString()} at{' '}
              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {metaEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Metadata
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {metaEntries.map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="text-xs font-medium text-gray-900 truncate" title={String(value)}>
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action & Delete */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {actionLink && (
              <Button
                className="w-full gap-2"
                onClick={() => window.location.assign(actionLink)}
              >
                <ExternalLink className="w-4 h-4" />
                Take action / View details
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={() => {
                  if (nid) onDelete(nid)
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
