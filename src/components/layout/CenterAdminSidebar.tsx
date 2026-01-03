'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  ShoppingBag, 
  Users, 
  Package2, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  X,
  QrCode,
  Tags
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/center-admin/dashboard', icon: Home, module: null },
  { name: 'Orders', href: '/center-admin/orders', icon: ShoppingBag, module: 'orders' },
  { name: 'Barcode Scanner', href: '/center-admin/scanner', icon: QrCode, module: 'orders' },
  { name: 'Services', href: '/center-admin/services', icon: Sparkles, module: 'services' },
  { name: 'Staff Management', href: '/center-admin/staff', icon: Users, module: 'staff' },
  { name: 'Staff Types', href: '/center-admin/staff-types', icon: Tags, module: 'staff' },
  { name: 'Inventory', href: '/center-admin/inventory', icon: Package2, module: 'inventory' },
  { name: 'Performance', href: '/center-admin/performance', icon: BarChart3, module: 'performance' },
  { name: 'Settings', href: '/center-admin/settings', icon: Settings, module: 'settings' },
]

interface CenterAdminSidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function CenterAdminSidebar({ 
  collapsed: externalCollapsed, 
  onCollapsedChange,
  mobileOpen,
  onMobileClose
}: CenterAdminSidebarProps) {
  const pathname = usePathname()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const { user } = useAuthStore()
  
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  
  const handleToggle = () => {
    const newValue = !collapsed
    if (onCollapsedChange) {
      onCollapsedChange(newValue)
    } else {
      setInternalCollapsed(newValue)
    }
  }

  const hasModuleAccess = (module: string | null) => {
    if (!module) return true
    if (user?.permissions && Object.keys(user.permissions).length > 0) {
      return user.permissions[module]?.view === true
    }
    // Admin role has access to all modules by default
    if (user?.role === 'admin' || user?.role === 'center_admin' || user?.role === 'branch_manager') {
      return true
    }
    return false
  }

  const visibleNavigation = navigation.filter(item => hasModuleAccess(item.module))

  const handleNavClick = () => {
    if (onMobileClose) onMobileClose()
  }

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!collapsed && (
            <Link href="/center-admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Admin Panel</span>
            </Link>
          )}
          
          <button
            onClick={mobileOpen ? onMobileClose : handleToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:block"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-gray-500 lg:hidden" />
            ) : collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                    !collapsed && 'mr-3'
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        
        {!collapsed && (
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Today&apos;s Status</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Pending Orders</span>
                  <span className="font-medium text-orange-600">--</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress</span>
                  <span className="font-medium text-blue-600">--</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed</span>
                  <span className="font-medium text-green-600">--</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
