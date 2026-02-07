'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  Users,
  Package,
  Settings,
  HelpCircle,
  LogOut,
  QrCode,
  Sparkles,
  MapPin,
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
  MessageSquare,
  RefreshCw,
  CreditCard,
  BarChart3,
  Palette,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Building2,
  X,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useFeatures, FeatureKey } from '@/hooks/useFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { useState, useEffect } from 'react'
import { useBranding } from '@/hooks/useBranding'
import { APP_VERSION } from '@/lib/version'

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  permission: { module: string; action: string } | null;
  feature: FeatureKey | null;
  isExpandable?: boolean;
  subItems?: any[];
  external?: boolean;
}

const enhancedNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home, permission: null, feature: null },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, permission: { module: 'orders', action: 'view' }, feature: 'orders' as FeatureKey },
  { name: 'Barcode Scanner', href: '/admin/scanner', icon: QrCode, permission: { module: 'orders', action: 'view' }, feature: 'orders' as FeatureKey },
  { name: 'Customers', href: '/admin/customers', icon: Users, permission: { module: 'customers', action: 'view' }, feature: 'customers' as FeatureKey },
  { name: 'Inventory', href: '/admin/inventory', icon: Package, permission: { module: 'inventory', action: 'view' }, feature: 'inventory' as FeatureKey },
  { name: 'Services', href: '/admin/services', icon: Sparkles, permission: { module: 'services', action: 'view' }, feature: 'services' as FeatureKey },
  { name: 'Branches', href: '/admin/branches', icon: MapPin, permission: { module: 'branches', action: 'view' }, feature: 'branches' as FeatureKey },
  { name: 'Branch Admins', href: '/admin/branch-admins', icon: Users, permission: { module: 'branchAdmins', action: 'view' }, feature: 'branch_admins' as FeatureKey },
  {
    name: 'Programs',
    icon: Gift,
    permission: { module: 'coupons', action: 'view' },
    feature: 'campaigns' as FeatureKey,
    isExpandable: true,
    subItems: [
      { name: 'Campaigns', href: '/admin/campaigns', icon: Target, permission: { module: 'coupons', action: 'view' }, feature: 'campaigns' as FeatureKey },
      { name: 'Banners', href: '/admin/banners', icon: Image, permission: { module: 'coupons', action: 'view' }, feature: 'banners' as FeatureKey },
      { name: 'Coupons', href: '/admin/coupons', icon: Tag, permission: { module: 'coupons', action: 'view' }, feature: 'coupons' as FeatureKey },
      { name: 'Discounts', href: '/admin/discounts', icon: Percent, permission: { module: 'coupons', action: 'view' }, feature: 'discounts' as FeatureKey },
      { name: 'Referrals', href: '/admin/referrals', icon: Users2, permission: { module: 'coupons', action: 'view' }, feature: 'referral_program' as FeatureKey },
      { name: 'Loyalty', href: '/admin/loyalty', icon: Star, permission: { module: 'coupons', action: 'view' }, feature: 'loyalty_points' as FeatureKey },
      { name: 'Wallet', href: '/admin/wallet', icon: Wallet, permission: { module: 'coupons', action: 'view' }, feature: 'wallet' as FeatureKey },
    ]
  },
  { name: 'Logistics', href: '/admin/logistics', icon: Truck, permission: { module: 'logistics', action: 'view' }, feature: 'logistics' as FeatureKey },
  {
    name: 'Support',
    icon: Shield,
    permission: { module: 'support', action: 'view' },
    feature: 'tickets' as FeatureKey,
    isExpandable: true,
    subItems: [
      { name: 'Support Users', href: '/admin/support/users', icon: Users, permission: { module: 'support', action: 'manage' }, feature: 'tickets' as FeatureKey },
      { name: 'Support Tickets', href: '/admin/tickets', icon: Ticket, permission: { module: 'tickets', action: 'view' }, feature: 'tickets' as FeatureKey },
    ]
  },
  {
    name: 'Platform Support',
    icon: HelpCircle,
    permission: null,
    feature: 'platform_support' as FeatureKey,
    isExpandable: true,
    subItems: [
      { name: 'Live Chat', href: '/admin/chat', icon: Headphones, permission: null, feature: 'platform_support' as FeatureKey },
      { name: 'Create Ticket', href: '/admin/platform-support/create', icon: Ticket, permission: null, feature: 'platform_support' as FeatureKey },
      { name: 'My Tickets', href: '/admin/platform-support/tickets', icon: MessageSquare, permission: null, feature: 'platform_support' as FeatureKey },
    ]
  },
  { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare, permission: { module: 'customers', action: 'view' }, feature: 'reviews' as FeatureKey },
  { name: 'Refunds', href: '/admin/refunds', icon: RefreshCw, permission: { module: 'orders', action: 'view' }, feature: 'refunds' as FeatureKey },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard, permission: { module: 'orders', action: 'view' }, feature: 'payments' as FeatureKey },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, permission: { module: 'analytics', action: 'view' }, feature: 'advanced_analytics' as FeatureKey },
  {
    name: 'Marketplace',
    icon: ShoppingBag,
    permission: null,
    feature: null,
    isExpandable: true,
    subItems: [
      { name: 'My Add-ons', href: '/admin/addons/my-addons', icon: Package, permission: null, feature: null },
      { name: 'Add-ons', href: '/admin/addons/marketplace', icon: ShoppingBag, permission: null, feature: null },
    ]
  },
  { name: 'Branding', href: '/admin/branding', icon: Palette, permission: { module: 'settings', action: 'view' }, feature: 'custom_branding' as FeatureKey },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: { module: 'settings', action: 'view' }, feature: 'settings' as FeatureKey },
  { name: 'Help', href: '/admin/support', icon: HelpCircle, permission: null, feature: null },
]

export function SimpleSidebar() {
  // Debug: Confirm SimpleSidebar is loading
  console.log('🚀 SimpleSidebar Component Loading - LIVE CHAT ADDED v3.0!', new Date().toISOString());
  console.log('📋 SimpleSidebar Navigation Items:', enhancedNavigation.map(item => ({
    name: item.name,
    hasSubItems: !!item.subItems,
    subItemCount: item.subItems?.length || 0
  })));

  // Special debug for Platform Support
  const platformSupport = enhancedNavigation.find(item => item.name === 'Platform Support');
  if (platformSupport) {
    console.log('🎯 Platform Support Details - LIVE CHAT ADDED v3.0:', {
      name: platformSupport.name,
      subItemCount: platformSupport.subItems?.length || 0,
      subItems: platformSupport.subItems?.map(sub => sub.name) || [],
      hasLiveChat: platformSupport.subItems?.some(sub => sub.name === 'Live Chat') ? 'YES ✅' : 'NO ❌'
    });
  }

  const pathname = usePathname()
  const { user, logout, sidebarCollapsed, setSidebarCollapsed } = useAuthStore()
  const { branding } = useBranding()

  // Debug log for branding
  useEffect(() => {
    if (branding && process.env.NODE_ENV === 'development') {
      console.log('💎 SimpleSidebar - Branding loaded:', {
        name: branding.name,
        slug: branding.slug,
        businessName: branding.branding?.businessName,
        logoUrl: branding.branding?.logo?.url
      });
    }
  }, [branding]);
  const { hasFeature } = useFeatures()
  const { hasPermission: checkUserPermission, isSuperAdmin } = usePermissions()

  // Dynamic navigation with branding slug
  const dynamicNavigation = React.useMemo(() => {
    return enhancedNavigation.map(item => {
      if (item.name === 'Branding') {
        return {
          ...item,
          isExpandable: true,
          subItems: [
            { name: 'Design Settings', href: '/admin/branding', icon: Palette, permission: { module: 'settings', action: 'view' }, feature: 'custom_branding' as FeatureKey },
            ...(branding?.slug ? [{
              name: 'View Landing Page',
              href: `/${branding.slug}`,
              icon: Image,
              permission: { module: 'settings', action: 'view' },
              feature: 'custom_branding' as FeatureKey,
              external: true
            }] : [])
          ]
        };
      }
      return item;
    });
  }, [branding?.slug]);

  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    // Add a small delay to show the spinner
    await new Promise(resolve => setTimeout(resolve, 800))

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

    window.location.href = slug ? `/${slug}/auth/login` : '/auth/login'
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  // Helper to check if user has permission
  const hasPermissionCheck = (permission: { module: string; action: string } | null) => {
    if (!permission) return true
    if (isSuperAdmin) return true
    return checkUserPermission(permission.module, permission.action)
  }

  // Helper to check if feature is enabled
  const checkFeature = (feature: FeatureKey | null) => {
    if (!feature) return true
    return hasFeature(feature)
  }

  const renderNavItem = (item: any) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)

    if (item.isExpandable && item.subItems) {
      // Filter sub-items by permission and feature
      const visibleSubItems = item.subItems.filter((subItem: any) =>
        hasPermissionCheck(subItem.permission) && checkFeature(subItem.feature as FeatureKey | null)
      )

      // Don't render parent if no sub-items are visible
      if (visibleSubItems.length === 0) return null

      return (
        <div key={item.name} className="relative group/sidebar-item">
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'group flex items-center w-full px-4 py-3 text-sm font-light rounded-lg transition-all duration-200 relative',
              isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
            title={sidebarCollapsed ? item.name : undefined}
          >
            {/* Active Indicator Bar */}
            {isActive && sidebarCollapsed && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
            )}

            <Icon className={cn(
              'flex-shrink-0 w-4 h-4 transition-transform duration-200',
              sidebarCollapsed ? 'mx-auto' : 'mr-3',
              isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
            )} />

            {/* Smooth Text Transition */}
            <span className={cn(
              'text-left whitespace-nowrap transition-all duration-300 font-light',
              sidebarCollapsed ? 'w-0 opacity-0 invisible overflow-hidden flex-none' : 'flex-1 w-auto opacity-100 visible'
            )}>
              {item.name}
            </span>

            {!sidebarCollapsed && (
              <span className="lg:block hidden transition-transform duration-200">
                {isExpanded ? (
                  <ChevronUp className={cn('w-3 h-3 ml-2', isActive ? 'text-blue-600' : 'text-gray-400')} />
                ) : (
                  <ChevronDown className={cn('w-3 h-3 ml-2', isActive ? 'text-blue-600' : 'text-gray-400')} />
                )}
              </span>
            )}
          </button>

          {/* Sub Items - Only show when expanded and NOT collapsed */}
          {!sidebarCollapsed && isExpanded && (
            <div className="ml-8 mt-1 space-y-0">
              {visibleSubItems.map((subItem: any) => {
                const isSubActive = pathname === subItem.href || (pathname && pathname.startsWith(subItem.href + '/'))
                const SubIcon = subItem.icon

                return (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    target={subItem.external ? "_blank" : undefined}
                    rel={subItem.external ? "noopener noreferrer" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center px-4 py-2 text-sm font-light rounded-md transition-colors',
                      isSubActive
                        ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <SubIcon className={cn('flex-shrink-0 w-3 h-3 mr-3', isSubActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
                    <span>{subItem.name}</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Collapsed state: Show dropdown on hover */}
          {sidebarCollapsed && (
            <div className="lg:invisible lg:opacity-0 absolute left-full top-0 pl-2 z-[100] group-hover/sidebar-item:lg:visible group-hover/sidebar-item:lg:opacity-100 translate-x-2 group-hover/sidebar-item:translate-x-0 transition-all duration-300">
              <div className="bg-white/95 backdrop-blur-sm border border-gray-100 rounded-xl shadow-2xl py-2 min-w-[200px] overflow-hidden">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50 border-b border-gray-50 mb-1">
                  {item.name}
                </div>
                {/* Scrollable Sub-items */}
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {visibleSubItems.map((subItem: any) => {
                    const isSubActive = pathname === subItem.href
                    const SubIcon = subItem.icon

                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        target={subItem.external ? "_blank" : undefined}
                        rel={subItem.external ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'group/sub flex items-center px-4 py-2.5 text-sm transition-all duration-200',
                          isSubActive
                            ? 'text-blue-700 bg-blue-50/80 font-medium'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                        )}
                      >
                        <SubIcon className={cn('flex-shrink-0 w-3.5 h-3.5 mr-3 transition-colors', isSubActive ? 'text-blue-600' : 'text-gray-400 group-hover/sub:text-blue-500')} />
                        <span className="flex-1 font-light">{subItem.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
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
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'group flex items-center px-4 py-3 text-sm font-light rounded-lg transition-all duration-200 relative',
          isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        )}
        title={sidebarCollapsed ? item.name : undefined}
      >
        {/* Active Indicator Bar */}
        {isActive && sidebarCollapsed && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
        )}

        <Icon className={cn(
          'flex-shrink-0 w-4 h-4 transition-transform duration-200',
          sidebarCollapsed ? 'mx-auto' : 'mr-3',
          isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
        )} />
        {/* Smooth Text Transition */}
        <span className={cn(
          'whitespace-nowrap transition-all duration-300 font-light',
          sidebarCollapsed ? 'w-0 opacity-0 invisible overflow-hidden flex-none' : 'flex-1 w-auto opacity-100 visible'
        )}>
          {item.name}
        </span>
      </Link>
    )
  }

  // Sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? 'lg:w-16' : 'lg:w-56'

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "admin-sidebar lg:relative fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 transition-all duration-300 flex flex-col w-56",
        sidebarWidth,
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        sidebarCollapsed ? "sidebar-collapsed" : ""
      )}>
        {/* Fixed Header */}
        <div className="sidebar-header flex-shrink-0 flex items-center justify-between h-14 px-6 border-b border-gray-100 bg-white">
          {/* Logo - always show on mobile, conditionally on desktop */}
          <div className={`flex items-center space-x-3 transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm shadow-blue-100/50"
              style={{ background: branding?.branding?.theme?.primaryColor || '#2563eb' }}
            >
              {branding?.branding?.logo?.url ? (
                <img
                  src={branding.branding.logo.url}
                  alt={branding.branding.businessName || branding.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(branding?.branding?.businessName || branding?.name || 'LaundryLobby').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {branding?.branding?.businessName || branding?.name || 'LaundryLobby'}
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-light">Admin Panel</p>
            </div>
          </div>

          {/* Collapsed Logo Icon */}
          {sidebarCollapsed && (
            <div className="hidden lg:flex items-center justify-center w-full transition-all duration-300">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-md shadow-blue-100/50"
                style={{ background: branding?.branding?.theme?.primaryColor || '#2563eb' }}
              >
                {branding?.branding?.logo?.url ? (
                  <img
                    src={branding.branding.logo.url}
                    alt={branding.branding.businessName || branding.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {(branding?.branding?.businessName || branding?.name || 'L').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="sidebar-header-buttons flex items-center">
            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors lg:hidden"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-gray-50 transition-colors hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>


        {/* Scrollable Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Navigation - Conditional Scrollable to prevent clipping of popovers */}
          <nav className={cn(
            'flex-1 px-0 py-6 space-y-0',
            sidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'
          )}>
            {dynamicNavigation
              .filter(item => {
                const hasPermissionResult = hasPermissionCheck(item.permission)
                const hasFeatureResult = checkFeature(item.feature as FeatureKey | null)

                // For expandable items, check if any subitems would be visible
                if (item.isExpandable && item.subItems) {
                  const visibleSubItems = item.subItems.filter((subItem: any) =>
                    hasPermissionCheck(subItem.permission) && checkFeature(subItem.feature as FeatureKey | null)
                  )
                  return hasPermissionResult && hasFeatureResult && visibleSubItems.length > 0
                }

                return hasPermissionResult && hasFeatureResult
              })
              .map((item) => renderNavItem(item))}
          </nav>

          {/* Fixed Footer Elements */}
          <div className="flex-shrink-0">
            {/* Quick Stats */}
            <div className={cn(
              'px-4 py-3 border-t border-gray-100 transition-all duration-300 overflow-hidden',
              sidebarCollapsed ? 'lg:h-0 lg:p-0 lg:opacity-0' : 'lg:h-auto lg:opacity-100'
            )}>
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-4 border border-blue-50/50">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Today's Overview</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="font-light">New Orders</span>
                    <span className="font-medium text-blue-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-light">Pending</span>
                    <span className="font-medium text-orange-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-light">Completed</span>
                    <span className="font-medium text-green-600">45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Version Info */}
            <div className={cn(
              'px-6 py-3 border-t border-gray-50 transition-all duration-300 overflow-hidden',
              sidebarCollapsed ? 'lg:h-0 lg:p-0 lg:opacity-0' : 'lg:h-auto lg:opacity-100'
            )}>
              <div className="text-[10px] text-gray-400 font-light tracking-widest uppercase">
                v{APP_VERSION} Stable
              </div>
            </div>

            {/* Logout */}
            <div className="p-2 lg:p-4 border-t border-gray-50">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  'group flex items-center w-full px-4 py-3 text-sm font-light text-gray-600 hover:text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50/50',
                  sidebarCollapsed ? 'lg:justify-center' : ''
                )}
                title={sidebarCollapsed ? "Sign Out" : undefined}
              >
                {isLoggingOut ? (
                  <div className={cn('w-4 h-4 animate-spin', !sidebarCollapsed && 'mr-3')}>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <LogOut className={cn(
                    'flex-shrink-0 w-4 h-4 transition-all duration-200 text-gray-400 group-hover:text-red-500 group-hover:scale-110',
                    sidebarCollapsed ? 'lg:mr-0' : 'mr-3'
                  )} />
                )}
                <span className={cn(
                  'whitespace-nowrap transition-all duration-300',
                  sidebarCollapsed ? 'w-0 opacity-0 invisible overflow-hidden' : 'w-auto opacity-100 visible'
                )}>
                  {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}