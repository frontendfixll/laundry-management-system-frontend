'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { cn } from '@/lib/utils'
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  Command,
  HelpCircle,
} from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout, sidebarCollapsed } = useAuthStore()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Click outside handler for profile dropdown only
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    // Redirect to tenant landing page if available to maintain context
    const cookies = typeof document !== 'undefined' ? document.cookie.split('; ') : []
    const tenantCookie = cookies.find(row => row.startsWith('tenant-slug='))
    let slug = tenantCookie ? tenantCookie.split('=')[1] : null

    // Fallback: Check URL path if cookie is missing
    if (!slug && typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      const potentialSlug = pathSegments[0]
      // Check if the first segment is not a reserved route
      const reserved = ['customer', 'admin', 'auth', 'api', 'login', 'register', '_next', 'static']
      if (potentialSlug && !reserved.includes(potentialSlug)) {
        slug = potentialSlug
      }
    }

    window.location.href = slug ? `/${slug}` : '/'
  }

  return (
    <header className="admin-header bg-white h-12 border-b border-gray-200 shadow-sm transition-all duration-300 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side - Notifications + Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications - Using NotificationBell component */}
            <NotificationBell />

            {/* Profile Menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Admin' : 'User'}</p>
                </div>
              </button>

              {/* Profile Dropdown - Portal to body to escape header z-index */}
              {showUserDropdown && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-[999]" onClick={() => setShowUserDropdown(false)} />

                  {/* Dropdown */}
                  <div className={cn(
                    "fixed top-20 right-6 w-64 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl z-[1000] overflow-hidden transform origin-top-right transition-all duration-300",
                    showUserDropdown ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  )}>
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <span className="text-white font-bold text-base">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.name || 'Admin User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || 'admin@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">My Profile</span>
                      </button>

                      <button
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Settings</span>
                      </button>

                      <button
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <span className="font-semibold">Support</span>
                      </button>

                      <div className="my-2 border-t border-gray-100"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-white transition-colors">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <span className="font-bold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}