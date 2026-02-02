'use client'

import React, { useState, useEffect, createContext, useContext, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import {
  Home,
  ShoppingBag,
  Users,
  Package,
  Sparkles,
  MapPin,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  QrCode,
  CreditCard,
  RefreshCw,
  MessageSquare,
  Palette,
  Gift,
  Target,
  Image,
  Tag,
  Percent,
  Users2,
  Star,
  Wallet,
  Truck,
  Shield,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'

// Navigation items with icons
const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Barcode Scanner', href: '/admin/scanner', icon: QrCode },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Package },
  { name: 'Services', href: '/admin/services', icon: Sparkles },
  { name: 'Branches', href: '/admin/branches', icon: MapPin },
  { name: 'Branch Admins', href: '/admin/branch-admins', icon: Users },
  {
    name: 'Programs',
    icon: Gift,
    isExpandable: true,
    subItems: [
      { name: 'Campaigns', href: '/admin/campaigns', icon: Target },
      { name: 'Banners', href: '/admin/banners', icon: Image },
      { name: 'Coupons', href: '/admin/coupons', icon: Tag },
      { name: 'Discounts', href: '/admin/discounts', icon: Percent },
      { name: 'Referrals', href: '/admin/referrals', icon: Users2 },
      { name: 'Loyalty', href: '/admin/loyalty', icon: Star },
      { name: 'Wallet', href: '/admin/wallet', icon: Wallet },
    ]
  },
  { name: 'Logistics', href: '/admin/logistics', icon: Truck },
  {
    name: 'Support',
    icon: Shield,
    isExpandable: true,
    subItems: [
      { name: 'Support Users', href: '/admin/support/users', icon: Users },
      { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket },
    ]
  },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { name: 'Refunds', href: '/admin/refunds', icon: RefreshCw },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  {
    name: 'Marketplace',
    icon: ShoppingBag,
    isExpandable: true,
    subItems: [
      { name: 'My Add-ons', href: '/admin/addons/my-addons', icon: Package },
      { name: 'Add-ons', href: '/admin/addons/marketplace', icon: ShoppingBag },
    ]
  },
  { name: 'Branding', href: '/admin/branding', icon: Palette },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Help', href: '/admin/support', icon: HelpCircle },
]

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandedItems: string[]
  toggleExpanded: (itemName: string) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
  expandedItems: [],
  toggleExpanded: () => { },
})

export const useAdminSidebar = () => useContext(SidebarContext)

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Programs']) // Programs expanded by default

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }

    const savedExpanded = localStorage.getItem('admin-sidebar-expanded')
    if (savedExpanded) {
      setExpandedItems(JSON.parse(savedExpanded))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
  }

  const toggleExpanded = (itemName: string) => {
    const newExpanded = expandedItems.includes(itemName)
      ? expandedItems.filter(item => item !== itemName)
      : [...expandedItems, itemName]

    setExpandedItems(newExpanded)
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newExpanded))
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        mobileOpen,
        setMobileOpen,
        expandedItems,
        toggleExpanded
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function AdminSidebar() {
  const { logout, user } = useAuthStore()
  const pathname = usePathname() || ''
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, expandedItems, toggleExpanded } = useAdminSidebar()

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

  const handleLinkClick = () => {
    // Only close sidebar on mobile devices
    if (window.innerWidth < 1024) {
      setMobileOpen(false)
    }
  }

  // Check if any sub-item is active
  const isParentActive = (item: any) => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) =>
        pathname === subItem.href || pathname.startsWith(subItem.href + '/')
      )
    }
    return false
  }

  const renderNavItem = (item: any) => {
    const isActive = isParentActive(item)
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)

    if (item.isExpandable && item.subItems) {
      return (
        <div key={item.name}>
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <Icon className={`flex-shrink-0 w-5 h-5 mr-4 ${isCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
            {/* Always show text on mobile, conditionally on desktop */}
            <span className={`flex-1 text-left font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
            {!isCollapsed && (
              <span className="lg:block hidden">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                )}
              </span>
            )}
          </button>

          {/* Sub Items */}
          {!isCollapsed && isExpanded && (
            <div className="ml-8 mt-2 space-y-1">
              {item.subItems.map((subItem: any) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${isSubActive
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <SubIcon className={`flex-shrink-0 w-4 h-4 mr-3 ${isSubActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="font-medium">{subItem.name}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Regular navigation item
    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={handleLinkClick}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <Icon className={`flex-shrink-0 w-5 h-5 mr-4 ${isCollapsed ? 'lg:mx-auto lg:mr-0' : ''} ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
        {/* Always show text on mobile, conditionally on desktop */}
        <span className={`flex-1 font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
      </Link>
    )
  }

  // On mobile: always show full width (w-64), on desktop: respect isCollapsed
  const sidebarWidth = isCollapsed ? 'lg:w-20' : 'lg:w-72'

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Start from top */}
      <div className={`admin-sidebar fixed top-0 bottom-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex flex-col w-72 ${sidebarWidth} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isCollapsed ? 'sidebar-collapsed' : ''}`}>

        {/* Header - Fixed height to match main header */}
        <div className="sidebar-header flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          {/* Logo - always show on mobile, conditionally on desktop */}
          <div className={`sidebar-logo-container flex items-center space-x-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="logo-icon w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">⭐</span>
            </div>
            <div className="logo-text min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">LaundryLobby</h1>
            </div>
          </div>

          {/* Collapsed Logo - show only when collapsed on desktop */}
          {isCollapsed && (
            <div className="sidebar-collapsed-logo hidden lg:flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⭐</span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="sidebar-header-buttons flex items-center flex-shrink-0">
            {/* Mobile close button - Only show on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              title="Close Menu"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Desktop collapse toggle - Main collapse control */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* User Info Section - REMOVED to increase navigation area */}
        {/* More space for navigation items */}

        {/* Navigation - Now has more space without user info */}
        <nav className="sidebar-navigation flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
          {navigation.map(renderNavItem)}
        </nav>

        {/* Version Info */}
        <div className={`sidebar-version flex-shrink-0 px-4 py-2 border-t border-gray-200 ${isCollapsed ? 'lg:hidden' : ''}`}>
          <div className="text-xs text-gray-400 text-center">
            v2.1.0
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className={`group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className={`flex-shrink-0 w-5 h-5 mr-3 ${isCollapsed ? 'lg:mr-0' : ''} text-gray-400 group-hover:text-red-500`} />
            <span className={isCollapsed ? 'lg:hidden' : ''}>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}