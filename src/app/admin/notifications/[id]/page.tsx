'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cleanNotificationTitle } from '@/lib/notificationUtils'
import {
    ArrowLeft,
    Bell,
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
    Clock,
    Trash2,
    Copy,
    ExternalLink,
    Tag,
    FileText,
    CheckCheck,
    Circle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const getNotificationIcon = (iconName: string, severity: string) => {
    const iconProps = { className: "w-6 h-6" }

    switch (iconName) {
        case 'shield-check':
        case 'shield':
            return <Shield {...iconProps} className={`w-6 h-6 ${severity === 'success' ? 'text-green-500' : severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
        case 'package':
        case 'package-plus':
        case 'package-check':
            return <Package {...iconProps} className={`w-6 h-6 ${severity === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
        case 'credit-card':
            return <CreditCard {...iconProps} className={`w-6 h-6 ${severity === 'error' ? 'text-red-500' : 'text-green-500'}`} />
        case 'user-check':
        case 'user-plus':
            return <User {...iconProps} className="w-6 h-6 text-blue-500" />
        case 'settings':
            return <Settings {...iconProps} className="w-6 h-6 text-gray-500" />
        case 'star':
            return <Star {...iconProps} className="w-6 h-6 text-yellow-500" />
        case 'trending-up':
            return <TrendingUp {...iconProps} className="w-6 h-6 text-green-500" />
        case 'check-circle':
            return <CheckCircle {...iconProps} className="w-6 h-6 text-green-500" />
        case 'alert-triangle':
            return <AlertTriangle {...iconProps} className="w-6 h-6 text-yellow-500" />
        case 'x-circle':
            return <XCircle {...iconProps} className="w-6 h-6 text-red-500" />
        default:
            return <Bell {...iconProps} className="w-6 h-6 text-blue-500" />
    }
}

const getPriorityConfig = (priority: string) => {
    switch (priority) {
        case 'P0':
            return { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', borderColor: 'border-red-200' }
        case 'P1':
            return { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', borderColor: 'border-orange-200' }
        case 'P2':
            return { label: 'Medium', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-200' }
        case 'P3':
            return { label: 'Low', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50', borderColor: 'border-gray-200' }
        case 'P4':
            return { label: 'Silent', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50', borderColor: 'border-gray-200' }
        default:
            return { label: 'Normal', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50', borderColor: 'border-gray-200' }
    }
}

const getSeverityConfig = (severity: string) => {
    switch (severity) {
        case 'success':
            return { label: 'Success', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
        case 'warning':
            return { label: 'Warning', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
        case 'error':
            return { label: 'Error', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
        case 'info':
        default:
            return { label: 'Info', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    }
}


const getNotificationCategory = (eventType: string) => {
    if (eventType.includes('order')) return { name: 'Orders', color: 'bg-blue-100 text-blue-700' }
    if (eventType.includes('permission')) return { name: 'Permissions', color: 'bg-purple-100 text-purple-700' }
    if (eventType.includes('feature')) return { name: 'Features', color: 'bg-green-100 text-green-700' }
    if (eventType.includes('payment')) return { name: 'Payments', color: 'bg-emerald-100 text-emerald-700' }
    if (eventType.includes('role')) return { name: 'Roles', color: 'bg-indigo-100 text-indigo-700' }
    if (eventType.includes('admin')) return { name: 'Admin', color: 'bg-pink-100 text-pink-700' }
    return { name: 'System', color: 'bg-gray-100 text-gray-700' }
}

export default function NotificationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { notifications, markAsRead, clearNotifications } = useSocketIONotifications()

    const notificationId = params.id as string

    // Find the notification
    const notification = useMemo(() => {
        return notifications.find(n => n.id === notificationId || (n as any)._id === notificationId)
    }, [notifications, notificationId])

    // Mark as read when viewing
    React.useEffect(() => {
        if (notification && !(notification as any).isRead && !notification.metadata?.isRead) {
            markAsRead(notification.id)
        }
    }, [notification, markAsRead])

    if (!notification) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Not Found</h2>
                    <p className="text-gray-600 mb-6">This notification may have been deleted or doesn't exist.</p>
                    <Button onClick={() => router.push('/admin/notifications')} className="bg-blue-600 hover:bg-blue-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Notifications
                    </Button>
                </div>
            </div>
        )
    }

    const priorityConfig = getPriorityConfig(notification.priority)
    const severityConfig = getSeverityConfig(notification.severity || 'info')
    const category = getNotificationCategory(notification.eventType || notification.type)
    const isRead = (notification as any).isRead || notification.metadata?.isRead

    const handleCopyId = () => {
        navigator.clipboard.writeText(notification.id)
        toast.success('Notification ID copied to clipboard!')
    }

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this notification?')) {
            clearNotifications()
            router.push('/admin/notifications')
            toast.success('Notification deleted')
        }
    }

    const handleToggleRead = () => {
        markAsRead(notification.id)
        toast.success(isRead ? 'Marked as unread' : 'Marked as read')
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/admin/notifications')}
                        className="mb-4 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Notifications
                    </Button>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className={cn("p-8 border-b border-gray-100", priorityConfig.bgLight)}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={cn("p-3 rounded-xl", severityConfig.bg)}>
                                    {getNotificationIcon(notification.icon || 'bell', notification.severity || 'info')}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Badge className={cn("font-bold", priorityConfig.color, "text-white")}>
                                            {notification.priority} - {priorityConfig.label}
                                        </Badge>
                                        <Badge className={category.color}>
                                            {category.name}
                                        </Badge>
                                        {!isRead && (
                                            <Badge className="bg-blue-500 text-white">
                                                <Circle className="w-2 h-2 mr-1 fill-current" />
                                                Unread
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        {cleanNotificationTitle(notification.title)}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="p-8 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-gray-600" />
                            Message
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                            {notification.message}
                        </p>
                    </div>

                    {/* Details Section */}
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-gray-600" />
                            Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Event Type</p>
                                <p className="text-gray-900 font-medium">{notification.eventType || notification.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Severity</p>
                                <div className="flex items-center space-x-2">
                                    <severityConfig.icon className={cn("w-4 h-4", severityConfig.color)} />
                                    <span className={cn("font-medium", severityConfig.color)}>{severityConfig.label}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Priority</p>
                                <p className={cn("font-bold", priorityConfig.textColor)}>
                                    {notification.priority} - {priorityConfig.label}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Category</p>
                                <Badge className={category.color}>{category.name}</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    {(notification.data || notification.metadata) && (
                        <div className="p-8 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <Tag className="w-5 h-5 mr-2 text-gray-600" />
                                Additional Information
                            </h2>

                            {/* Display specific data fields */}
                            {notification.data && (
                                <div className="space-y-4">
                                    {notification.data.link && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-1">Related Link</p>
                                            <a
                                                href={notification.data.link}
                                                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>{notification.data.link}</span>
                                            </a>
                                        </div>
                                    )}

                                    {notification.data.orderId && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-1">Order ID</p>
                                            <p className="text-gray-900 font-mono">{notification.data.orderId}</p>
                                        </div>
                                    )}

                                    {notification.data.permissions && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Affected Modules</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.keys(notification.data.permissions).map(module => (
                                                    <Badge key={module} className="bg-purple-100 text-purple-700">
                                                        {module}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {notification.data.features && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-2">Feature Changes</p>
                                            <div className="space-y-2">
                                                {notification.data.enabledFeatures && notification.data.enabledFeatures.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-green-600 font-semibold mb-1">Enabled:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {notification.data.enabledFeatures.map((feature: string) => (
                                                                <Badge key={feature} className="bg-green-100 text-green-700 text-xs">
                                                                    {feature}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {notification.data.disabledFeatures && notification.data.disabledFeatures.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-red-600 font-semibold mb-1">Disabled:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {notification.data.disabledFeatures.map((feature: string) => (
                                                                <Badge key={feature} className="bg-red-100 text-red-700 text-xs">
                                                                    {feature}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Raw JSON for debugging */}
                                    <details className="mt-4">
                                        <summary className="text-sm font-semibold text-gray-500 cursor-pointer hover:text-gray-700">
                                            View Raw Data (JSON)
                                        </summary>
                                        <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-xs font-mono">
                                            {JSON.stringify(notification.data, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions Section */}
                    <div className="p-8 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleToggleRead}
                                variant="outline"
                                className="border-blue-200 hover:bg-blue-50"
                            >
                                {isRead ? (
                                    <>
                                        <Circle className="w-4 h-4 mr-2" />
                                        Mark as Unread
                                    </>
                                ) : (
                                    <>
                                        <CheckCheck className="w-4 h-4 mr-2" />
                                        Mark as Read
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={handleCopyId}
                                variant="outline"
                                className="border-gray-200 hover:bg-gray-50"
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy ID
                            </Button>

                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700">
                                <span className="font-semibold">Notification ID:</span> <code className="font-mono">{notification.id}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
