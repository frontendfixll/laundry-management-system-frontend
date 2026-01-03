'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Bell,
  Menu,
  Clock,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Ticket,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { supportApi } from '@/lib/supportApi'

interface Notification {
  _id: string
  ticketNumber: string
  title: string
  status: string
  priority: string
  createdAt: string
  isNew?: boolean
}

interface SupportHeaderProps {
  onMenuClick?: () => void
}

export default function SupportHeader({ onMenuClick }: SupportHeaderProps) {
  const { user, logout } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const notifDropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await supportApi.getTickets({ limit: 10, status: 'open' })
      const tickets = response.data.data || []
      setNotifications(tickets.map((t: any) => ({
        _id: t._id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        isNew: isWithinHours(t.createdAt, 2),
      })))
      setUnreadCount(tickets.filter((t: any) => isWithinHours(t.createdAt, 2)).length)
    } catch (error) {
      console.log('Could not fetch notifications')
    }
  }

  const isWithinHours = (date: string, hours: number) => {
    const ticketDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - ticketDate.getTime()
    return diffMs < hours * 60 * 60 * 1000
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-amber-600 bg-amber-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Ticket className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown)
                setShowUserDropdown(false)
              }}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h3 className="font-semibold text-gray-800">New Tickets</h3>
                  <span className="text-xs text-purple-600 font-medium">{unreadCount} new</span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No new tickets</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <Link 
                          key={notif._id}
                          href={`/support/tickets/${notif._id}`}
                          onClick={() => setShowNotifDropdown(false)}
                          className={`block p-4 hover:bg-gray-50 transition-colors ${notif.isNew ? 'bg-purple-50/50' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getStatusIcon(notif.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-medium ${notif.isNew ? 'text-gray-800' : 'text-gray-600'}`}>
                                  {notif.ticketNumber}
                                </p>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(notif.priority)}`}>
                                  {notif.priority}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.title}</p>
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(notif.createdAt)}
                              </p>
                            </div>
                            {notif.isNew && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Link 
                    href="/support/tickets"
                    onClick={() => setShowNotifDropdown(false)}
                    className="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All Tickets
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown)
                setShowNotifDropdown(false)
              }}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">Support Agent</p>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <Link 
                    href="/support/settings" 
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <Link 
                    href="/support/settings" 
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
