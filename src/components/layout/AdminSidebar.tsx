'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  Users,
  Building2,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LogOut,
  Ticket,
  Palette,
  QrCode,
  Tag,
  Percent,
  Gift,
  Star,
  Users2,
  Target,
  MapPin,
  Image,
  MessageSquare,
  Wallet,
  Shield,
  Headphones,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, createContext, useContext, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAdminDashboard } from '@/hooks/useAdmin'
import { useFeatures, FeatureKey } from '@/hooks/useFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import SidebarChatbox from '@/components/support/SidebarChatbox'
import { useBranding } from '@/hooks/useBranding'
import { APP_VERSION } from '@/lib/version'

interface NavigationItem {
  name: string;
  href?: string;
  icon: any;
  permission?: { module: string; action: string } | null;
  feature?: FeatureKey | null;
  isExpandable?: boolean;
  subItems?: any[];
  external?: boolean;
}

// Navigation items with permission requirements and feature requirements
const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home, permission: null, feature: null },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, permission: { module: 'orders', action: 'view' }, feature: 'orders' as FeatureKey },
  { name: 'Barcode Scanner', href: '/admin/scanner', icon: QrCode, permission: { module: 'orders', action: 'view' }, feature: 'orders' as FeatureKey },
  { name: 'Customers', href: '/admin/customers', icon: Users, permission: { module: 'customers', action: 'view' }, feature: 'customers' as FeatureKey },
  { name: 'Inventory', href: '/admin/inventory', icon: Package, permission: { module: 'inventory', action: 'view' }, feature: 'inventory' as FeatureKey },
  { name: 'Services', href: '/admin/service', icon: Sparkles, permission: { module: 'services', action: 'view' }, feature: 'services' as FeatureKey },
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
    permission: null, // Platform support available to all
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
  { name: 'Automation', href: '/admin/automation', icon: RefreshCw, permission: { module: 'settings', action: 'view' }, feature: null },
  {
    name: 'Marketplace',
    icon: ShoppingBag,
    permission: null, // Marketplace available to all
    feature: null,
    isExpandable: true,
    subItems: [
      { name: 'My Add-ons', href: '/admin/addons/my-addons', icon: Package, permission: null, feature: null },
      { name: 'Add-ons', href: '/admin/addons/marketplace', icon: ShoppingBag, permission: null, feature: null },
    ]
  },
  {
    name: 'Content',
    icon: FileText,
    permission: null, // Available to all tenant admins
    feature: null,
    isExpandable: true,
    subItems: [
      { name: 'Blog Posts', href: '/admin/blog/posts', icon: FileText, permission: null, feature: null },
      { name: 'Categories', href: '/admin/blog/categories', icon: Tag, permission: null, feature: null },
      { name: 'Analytics', href: '/admin/blog/analytics', icon: BarChart3, permission: null, feature: null },
    ]
  },
  {
    name: 'Branding',
    icon: Palette,
    permission: { module: 'settings', action: 'view' },
    feature: 'custom_branding' as FeatureKey,
    isExpandable: true,
    subItems: [
      { name: 'Design Settings', href: '/admin/branding', icon: Palette, permission: { module: 'settings', action: 'view' }, feature: 'custom_branding' as FeatureKey },
    ]
  },
  { name: 'Settings', href: '/admin/settings', icon: Settings, permission: { module: 'settings', action: 'view' }, feature: 'settings' as FeatureKey },
  { name: 'Help', href: '/admin/support', icon: HelpCircle, permission: null, feature: null },
]

// Debug: Log navigation array on component load
console.log('🔍 AdminSidebar Navigation Array (Timestamp: ' + new Date().toISOString() + ') - CACHE BUSTER v3.0:', navigation.map(item => ({
  name: item.name,
  isExpandable: item.isExpandable,
  subItems: item.subItems?.length || 0,
  feature: item.feature
})));

// Find Platform Support specifically
const platformSupportItem = navigation.find(item => item.name === 'Platform Support');
console.log('🎯 Platform Support Item Found:', platformSupportItem ? 'YES ✅' : 'NO ❌');
if (platformSupportItem) {
  console.log('🎯 Platform Support Details - CACHE BUSTER v3.0:', {
    name: platformSupportItem.name,
    icon: platformSupportItem.icon?.name || 'HelpCircle',
    permission: platformSupportItem.permission,
    feature: platformSupportItem.feature,
    isExpandable: platformSupportItem.isExpandable,
    subItemsCount: platformSupportItem.subItems?.length || 0,
    subItemNames: platformSupportItem.subItems?.map(sub => sub.name) || []
  });
}

// AGGRESSIVE DEBUG: Log all navigation items
console.log('🚨 FULL NAVIGATION DEBUG - CACHE BUSTER v3.0:');
navigation.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name}`, {
    href: item.href,
    isExpandable: item.isExpandable,
    permission: item.permission,
    feature: item.feature,
    subItems: item.subItems?.map(sub => sub.name) || []
  });

  // Special debug for Platform Support
  if (item.name === 'Platform Support') {
    console.log('🎯 PLATFORM SUPPORT FOUND - CACHE BUSTER v3.0:', {
      hasLiveChat: item.subItems?.some(sub => sub.name === 'Live Chat') ? 'YES ✅' : 'NO ❌',
      allSubItems: item.subItems?.map(sub => sub.name) || []
    });
  }
});

// Helper to check if user has permission (updated to use usePermissions hook)
const hasPermissionCheck = (permission: { module: string; action: string } | null, checkUserPermissionFn: (module: string, action: string) => boolean, isSuperAdmin: boolean) => {
  if (!permission) return true // No permission required (Dashboard, Help)

  // Debug logging for permission checks
  console.log(`🔐 Checking permission: ${permission.module}.${permission.action}`);
  console.log(`🔐 User is SuperAdmin: ${isSuperAdmin}`);

  // SuperAdmin bypasses all permission checks - BUT let's add debug info
  if (isSuperAdmin) {
    console.log(`🔐 SuperAdmin bypass: ${permission.module}.${permission.action} = true (BYPASSED)`)
    return true
  }

  const hasIt = checkUserPermissionFn(permission.module, permission.action)

  // Debug logging for specific permissions
  if (permission.module === 'inventory' || permission.module === 'support' || permission.module === 'orders') {
    console.log(`🔐 Permission check result: ${permission.module}.${permission.action} = ${hasIt}`)
  }

  return hasIt
}

// Helper to check if feature is enabled for tenant's plan
const checkFeature = (hasFeatureFn: (key: FeatureKey) => boolean, feature: FeatureKey | null) => {
  if (!feature) return true // No feature restriction
  return hasFeatureFn(feature)
}

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandedItems: string[]
  toggleExpanded: (itemName: string) => void
  sidebarScrollTop: number
  setSidebarScrollTop: (scrollTop: number) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
  expandedItems: [],
  toggleExpanded: () => { },
  sidebarScrollTop: 0,
  setSidebarScrollTop: () => { },
})

export const useAdminSidebar = () => useContext(SidebarContext)

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Programs']) // Programs expanded by default
  const [sidebarScrollTop, setSidebarScrollTop] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed')
    if (saved) {
      setIsCollapsed(JSON.parse(saved))
    }

    const savedExpanded = localStorage.getItem('admin-sidebar-expanded')
    if (savedExpanded) {
      setExpandedItems(JSON.parse(savedExpanded))
    }

    const savedScrollTop = localStorage.getItem('admin-sidebar-scroll')
    if (savedScrollTop) {
      setSidebarScrollTop(parseInt(savedScrollTop))
    }
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(value))
  }

  const toggleExpanded = (itemName: string) => {
    const newExpanded = expandedItems.includes(itemName)
      ? expandedItems.filter(item => item !== itemName)
      : [itemName] // Only one dropdown open at a time

    setExpandedItems(newExpanded)
    localStorage.setItem('admin-sidebar-expanded', JSON.stringify(newExpanded))
  }

  const handleSetSidebarScrollTop = (scrollTop: number) => {
    setSidebarScrollTop(scrollTop)
    localStorage.setItem('admin-sidebar-scroll', scrollTop.toString())
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed: handleSetCollapsed,
        mobileOpen,
        setMobileOpen,
        expandedItems,
        toggleExpanded,
        sidebarScrollTop,
        setSidebarScrollTop: handleSetSidebarScrollTop
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

import { APP_VERSION } from '@/lib/version'

export function AdminSidebar() {
  // CACHE BUSTER - Force new version load
  console.log('🚀 AdminSidebar Component Loading - CACHE BUSTER v3.0 - Timestamp:', new Date().toISOString());
  console.log('🎯 Live Chat should be in Platform Support section - CACHE BUSTER v3.0');

  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen, expandedItems, toggleExpanded, sidebarScrollTop, setSidebarScrollTop } = useAdminSidebar()
  const { user, logout, updateUser } = useAuthStore()
  const { branding } = useBranding()

  // Debug log for branding
  React.useEffect(() => {
    if (branding && process.env.NODE_ENV === 'development') {
      console.log('💎 AdminSidebar - Branding loaded:', {
        name: branding.name,
        slug: branding.slug,
        businessName: branding.branding?.businessName,
        logoUrl: branding.branding?.logo?.url
      });
    }
  }, [branding]);

  // Dynamic navigation with branding slug
  const dynamicNavigation = React.useMemo(() => {
    return navigation.map(item => {
      if (item.name === 'Branding' && item.subItems) {
        const updatedSubItems = [...item.subItems];
        if (branding?.slug) {
          updatedSubItems.push({
            name: 'View Landing Page',
            href: `/${branding.slug}`,
            icon: Image,
            permission: { module: 'settings', action: 'view' },
            feature: 'custom_branding' as FeatureKey,
            external: true
          });
        }
        return { ...item, subItems: updatedSubItems };
      }
      return item;
    });
  }, [branding?.slug]);
  const { metrics, loading: metricsLoading } = useAdminDashboard()
  const { hasFeature, planName, isTrialPeriod, trialEndsAt } = useFeatures()
  const { hasPermission: checkUserPermission, isSuperAdmin } = usePermissions()
  const navRef = useRef<HTMLElement>(null)
  const [forceRender, setForceRender] = useState(0)

  // Expose updateUser function globally for WebSocket access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__updateAuthStore = (userData: any) => {
        console.log('🔥 Global auth store update called with:', userData);
        updateUser(userData);
      };
      console.log('🌐 Exposed __updateAuthStore globally from AdminSidebar');
    }
  }, [updateUser]);

  // Listen for real-time updates and force re-render
  useEffect(() => {
    const handleUpdate = (event: CustomEvent) => {
      console.log('🔄 AdminSidebar: Real-time update detected, forcing re-render');
      setForceRender(prev => prev + 1);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('permissionsUpdated', handleUpdate as EventListener);
      window.addEventListener('tenancyFeaturesUpdated', handleUpdate as EventListener);
      window.addEventListener('userDataRefreshed', handleUpdate as EventListener);

      return () => {
        window.removeEventListener('permissionsUpdated', handleUpdate as EventListener);
        window.removeEventListener('tenancyFeaturesUpdated', handleUpdate as EventListener);
        window.removeEventListener('userDataRefreshed', handleUpdate as EventListener);
      };
    }
  }, []);

  // Restore scroll position after navigation changes
  useEffect(() => {
    if (navRef.current && sidebarScrollTop > 0) {
      navRef.current.scrollTop = sidebarScrollTop;
    }
  }, [pathname, expandedItems, sidebarScrollTop]);



  // Debug: Log when sidebar re-renders
  console.log('🔄 AdminSidebar rendered with user:', {
    email: user?.email,
    role: user?.role,
    featuresCount: Object.keys(user?.features || {}).length,
    enabledFeatures: Object.keys(user?.features || {}).filter(k => user?.features?.[k])
  });

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

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

  const closeMobile = () => {
    setMobileOpen(false)
  }

  // Check if any sub-item is active
  const isParentActive = (item: any) => {
    if (item.href) {
      return pathname === item.href || (pathname && pathname.startsWith(item.href + '/'))
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) =>
        pathname === subItem.href || (pathname && pathname.startsWith(subItem.href + '/'))
      )
    }
    return false
  }

  const renderNavItem = (item: any, isMobile = false) => {
    const isActive = isParentActive(item)
    const Icon = item.icon
    const isExpanded = expandedItems.includes(item.name)
    const showText = isMobile || !isCollapsed

    if (item.isExpandable && item.subItems) {
      return (
        <div key={item.name}>
          {/* Parent Item */}
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
              isActive
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-700 hover:bg-blue-50'
            )}
          >
            <Icon
              className={cn(
                'flex-shrink-0 w-5 h-5',
                showText ? 'mr-3' : 'mx-auto',
                isActive
                  ? 'text-white'
                  : 'text-gray-400 group-hover:text-blue-500'
              )}
            />
            {showText && (
              <>
                <span className="truncate flex-1 text-left">{item.name}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </>
            )}
          </button>

          {/* Sub Items */}
          {showText && isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems
                .filter((subItem: any) => hasPermissionCheck(subItem.permission, checkUserPermission, isSuperAdmin) && checkFeature(hasFeature, subItem.feature as FeatureKey | null))
                .map((subItem: any) => {
                  const isSubActive = pathname === subItem.href || (pathname && pathname.startsWith(subItem.href + '/'))
                  const SubIcon = subItem.icon

                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      scroll={false}
                      onClick={closeMobile}
                      target={subItem.external ? "_blank" : undefined}
                      rel={subItem.external ? "noopener noreferrer" : undefined}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all',
                        isSubActive
                          ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <SubIcon
                        className={cn(
                          'flex-shrink-0 w-4 h-4 mr-3',
                          isSubActive
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      <span className="truncate">{subItem.name}</span>
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
        scroll={false}
        onClick={closeMobile}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        title={!showText ? item.name : undefined}
        className={cn(
          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all',
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-gray-700 hover:bg-blue-50'
        )}
      >
        <Icon
          className={cn(
            'flex-shrink-0 w-5 h-5',
            showText ? 'mr-3' : 'mx-auto',
            isActive
              ? 'text-white'
              : 'text-gray-400 group-hover:text-blue-500'
          )}
        />
        {showText && <span className="truncate">{item.name}</span>}
      </Link>
    )
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%'
        }}
      >
        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Logo/Brand - Only show when expanded or mobile */}
          {(isMobile || !isCollapsed) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: branding?.branding?.theme?.primaryColor || 'linear-gradient(to right, #3b82f6, #6366f1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {branding?.branding?.logo?.url ? (
                  <img
                    src={branding.branding.logo.url}
                    alt={branding.branding.businessName || branding.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                    {(branding?.branding?.businessName || branding?.name || 'LaundryLobby').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '15px', fontWeight: 'bold', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {branding?.branding?.businessName || branding?.name || 'LaundryLobby'}
              </h1>
            </div>
          )}

          {/* Spacer when collapsed to push button to right */}
          {!isMobile && isCollapsed && <div style={{ flex: 1 }} />}

          {/* Collapse/Close Button - Always positioned on the right */}
          {isMobile ? (
            <button
              onClick={closeMobile}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
          ) : (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div
          style={{
            flex: '1 1 0%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            height: '100%',
            overflow: 'hidden'
          }}
        >
          {/* Navigation - Fixed with proper scroll */}
          <nav
            ref={navRef}
            className="flex-1 px-2 py-4 space-y-1"
            style={{
              overflowY: 'auto',
              height: 'calc(100vh - 200px)',
              minHeight: '400px'
            }}
            onScroll={(e) => {
              const target = e.target as HTMLElement;
              if (target) {
                setSidebarScrollTop(target.scrollTop);
              }
            }}
          >
            {(() => {
              console.log('🔍 Starting navigation filter...');
              console.log('👤 Current user role:', user?.role);
              console.log('👤 Is SuperAdmin:', isSuperAdmin);
              console.log('👤 Current user features:', Object.keys(user?.features || {}));
              console.log('👤 Current user permissions:', user?.permissions ? Object.keys(user.permissions) : 'No permissions');

              const filteredNav = dynamicNavigation
                .filter(item => {
                  const hasPermissionResult = hasPermissionCheck(item.permission || null, checkUserPermission, isSuperAdmin);
                  const hasFeatureResult = checkFeature(hasFeature, item.feature as FeatureKey | null);

                  // Enhanced debug logging for each item
                  console.log(`📋 Checking ${item.name}:`, {
                    permission: item.permission,
                    feature: item.feature,
                    hasPermission: hasPermissionResult,
                    hasFeature: hasFeatureResult,
                    isSuperAdmin: isSuperAdmin
                  });

                  // Debug Platform Support specifically
                  if (item.name === 'Platform Support') {
                    console.log('🎯 Platform Support Debug - ENHANCED v3.0:', {
                      hasPermissionResult,
                      hasFeatureResult,
                      feature: item.feature,
                      userHasFeature: hasFeature(item.feature as FeatureKey),
                      availableFeatures: Object.keys(user?.features || {}),
                      SHOULD_SHOW: hasPermissionResult && hasFeatureResult ? 'YES ✅' : 'NO ❌'
                    });
                  }

                  // For expandable items, check if any subitems would be visible
                  if (item.isExpandable && item.subItems) {
                    const visibleSubItems = item.subItems.filter(subItem =>
                      hasPermissionCheck(subItem.permission, checkUserPermission, isSuperAdmin) && checkFeature(hasFeature, subItem.feature as FeatureKey | null)
                    );

                    // Only show parent if it has permission/feature AND has visible subitems
                    const shouldShow = hasPermissionResult && hasFeatureResult && visibleSubItems.length > 0;

                    console.log(`📁 ${item.name}: ${shouldShow ? 'SHOWING' : 'HIDING'} (${visibleSubItems.length} subitems, hasPermission: ${hasPermissionResult}, hasFeature: ${hasFeatureResult})`);

                    return shouldShow;
                  }

                  const willShow = hasPermissionResult && hasFeatureResult;
                  console.log(`📄 ${item.name}: ${willShow ? 'SHOWING' : 'HIDING'} (hasPermission: ${hasPermissionResult}, hasFeature: ${hasFeatureResult})`);

                  return willShow;
                });

              console.log('✅ Final navigation items:', filteredNav.map(i => i.name));
              console.log('🚨 IMPORTANT: If all items are showing despite removed permissions, check if user is SuperAdmin!');

              const navItems = filteredNav.map(item => renderNavItem(item, isMobile));

              // Show message if no items are visible
              if (filteredNav.length === 0) {
                navItems.push(
                  <div key="no-access-notice" className="px-3 py-4 mt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            No Navigation Items
                          </h3>
                          <div className="mt-1 text-sm text-yellow-700">
                            <p>No navigation items are available. Please check your permissions.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return navItems;
            })()}
          </nav>

          {/* Quick Stats - Only show when expanded */}
          {(isMobile || !isCollapsed) && (
            <div style={{ padding: '16px' }}>
              <div style={{
                background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Today&apos;s Overview
                </h3>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>New Orders</span>
                    <span style={{ fontWeight: '500', color: '#2563eb' }}>0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Pending</span>
                    <span style={{ fontWeight: '500', color: '#ea580c' }}>30</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Completed</span>
                    <span style={{ fontWeight: '500', color: '#16a34a' }}>0</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="flex-shrink-0 border-t border-gray-200 p-2">
          <button
            onClick={handleLogout}
            className={cn(
              'group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors',
              (isMobile || !isCollapsed) ? '' : 'justify-center'
            )}
          >
            <LogOut
              className={cn(
                'flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-red-500',
                (isMobile || !isCollapsed) ? 'mr-3' : ''
              )}
            />
            {(isMobile || !isCollapsed) && (
              <div className="flex items-center justify-between w-full">
                <span>Sign Out</span>
                <div className="text-xs text-gray-400 text-center">
                  v{APP_VERSION}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-transform duration-300 flex flex-col w-64 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ height: '100vh' }}
      >
        <SidebarContent isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 flex-col hidden lg:flex',
          isCollapsed ? 'w-16' : 'w-64'
        )}
        style={{ height: '100vh' }}
      >
        <SidebarContent isMobile={false} />
      </div>

      {/* Sidebar Chatbox - Only show for tenant admins */}
      <SidebarChatbox />
    </>
  )
}
