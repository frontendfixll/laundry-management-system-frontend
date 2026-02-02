'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { getMenusForRole, filterMenusByPermissions, MenuSection, MenuItem } from '@/config/roleBasedMenus'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Building2,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Home,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  FileText,
  Activity,
  Eye,
  UserCheck,
  Wrench,
  Calendar,
  Tag,
  Receipt,
  TestTube,
  Truck,
  Bell,
  Palette,
  MapPin,
  MessageSquare,
  RefreshCw,
  QrCode,
  Sparkles,
  Gift,
  Target,
  Image,
  Percent,
  Users2,
  Star,
  Wallet,
  Ticket,
  HelpCircle,
  LayoutDashboard,
  Building,
  RotateCcw,
  Store,
  Key,
  GitCommit,
  FileCheck,
  LifeBuoy,
  Bug,
  UserPlus,
  CheckSquare,
  User,
  Lock,
  Search,
  LogIn,
  Download,
  Banknote,
  Calculator,
  Grid3x3,
  AlertCircle,
  AlertOctagon,
  Template,
  FileBarChart
} from 'lucide-react'

// Icon mapping for menu items
const iconMap: Record<string, React.ComponentType<any>> = {
  // Dashboard & Overview
  LayoutDashboard,
  Home,
  TrendingUp,
  Building2,
  AlertTriangle,
  BarChart3,
  
  // Business Operations
  ShoppingBag,
  Package,
  Users,
  Building,
  Wrench,
  Calendar,
  UserCheck,
  
  // Financial
  DollarSign,
  CreditCard,
  Receipt,
  RotateCcw,
  Banknote,
  Calculator,
  FileBarChart,
  
  // Marketing & Programs
  Tag,
  Gift,
  Target,
  Image,
  Percent,
  Users2,
  Star,
  Wallet,
  
  // Operations
  Truck,
  QrCode,
  Sparkles,
  MapPin,
  Grid3x3,
  
  // Support & Security
  Shield,
  LifeBuoy,
  Bug,
  MessageSquare,
  Ticket,
  HelpCircle,
  
  // Settings & Admin
  Settings,
  Palette,
  Bell,
  Key,
  
  // Actions
  Eye,
  RefreshCw,
  TestTube,
  Activity,
  FileText,
  Download,
  
  // User Management
  UserPlus,
  CheckSquare,
  User,
  Lock,
  
  // Navigation
  Search,
  LogIn,
  LogOut,
  
  // Alerts & Status
  AlertCircle,
  AlertOctagon,
  
  // Templates & Tools
  Template,
  GitCommit,
  FileCheck,
  Store
}

// Context for sidebar state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandedItems: string[]
  toggleExpanded: (itemName: string) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function useEnhancedSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useEnhancedSidebar must be used within an EnhancedSidebarProvider')
  }
  return context
}

interface EnhancedSidebarProviderProps {
  children: React.ReactNode
}

export function EnhancedSidebarProvider({ children }: EnhancedSidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('enhanced-sidebar-expanded')
    if (saved) {
      try {
        setExpandedItems(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading sidebar state:', error)
      }
    }
  }, [])

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('enhanced-sidebar-expanded', JSON.stringify(expandedItems))
  }, [expandedItems])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const value = {
    isCollapsed,
    setIsCollapsed,
    mobileOpen,
    setMobileOpen,
    expandedItems,
    toggleExpanded
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

interface MenuItemComponentProps {
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
  level: number
}

function MenuItemComponent({ item, isActive, isCollapsed, level }: MenuItemComponentProps) {
  const { expandedItems, toggleExpanded } = useEnhancedSidebar()
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.includes(item.id)
  const IconComponent = item.icon ? iconMap[item.icon] : null
  
  const paddingLeft = level === 0 ? 'pl-3' : level === 1 ? 'pl-8' : 'pl-12'
  
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleExpanded(item.id)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl
            transition-all duration-200 group
            ${isActive 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
            ${paddingLeft}
          `}
        >
          <div className="flex items-center">
            {IconComponent && (
              <IconComponent className={`
                w-5 h-5 mr-3 transition-colors duration-200
                ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
              `} />
            )}
            {!isCollapsed && (
              <span className="truncate">{item.label}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center">
              {item.badge && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full mr-2">
                  {item.badge}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )}
        </button>
        
        {isExpanded && !isCollapsed && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                isActive={false} // Child items don't have active state in this implementation
                isCollapsed={isCollapsed}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.path) {
    return null
  }

  return (
    <Link
      href={item.path}
      className={`
        flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
        transition-all duration-200 group
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }
        ${paddingLeft}
      `}
      title={isCollapsed ? item.label : undefined}
    >
      {IconComponent && (
        <IconComponent className={`
          w-5 h-5 mr-3 transition-colors duration-200
          ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
        `} />
      )}
      {!isCollapsed && (
        <div className="flex items-center justify-between w-full">
          <span className="truncate">{item.label}</span>
          {item.badge && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full ml-2">
              {item.badge}
            </span>
          )}
        </div>
      )}
      {item.description && !isCollapsed && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          {item.description}
        </div>
      )}
    </Link>
  )
}

interface MenuSectionComponentProps {
  section: MenuSection
  isCollapsed: boolean
  pathname: string
}

function MenuSectionComponent({ section, isCollapsed, pathname }: MenuSectionComponentProps) {
  const { userPermissions, userRole, userFeatures } = usePermissions()
  
  // Filter menu items based on permissions
  const filteredItems = section.items.filter(item => {
    // Check permission requirement
    if (item.requiredPermission) {
      const [module, action] = item.requiredPermission.split('.')
      if (!userPermissions.includes(`${module}.${action}`)) {
        return false
      }
    }
    
    // Check role requirement
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
      return false
    }
    
    // Check feature requirement
    if (item.requiredFeature) {
      const featureValue = userFeatures[item.requiredFeature]
      if (!featureValue || featureValue === false || featureValue === 0) {
        return false
      }
    }
    
    return true
  })

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {section.label}
        </h3>
      )}
      <div className="space-y-1">
        {filteredItems.map((item) => (
          <MenuItemComponent
            key={item.id}
            item={item}
            isActive={pathname === item.path || pathname.startsWith(item.path + '/')}
            isCollapsed={isCollapsed}
            level={0}
          />
        ))}
      </div>
    </div>
  )
}

export function EnhancedAdminSidebar() {
  const { isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen } = useEnhancedSidebar()
  const { user, logout } = useAuthStore()
  const { userRole, userPermissions, userFeatures } = usePermissions()
  const pathname = usePathname()

  // Determine user type for menu selection
  const userType = user?.role?.startsWith('platform_') || user?.role === 'superadmin' || user?.role === 'super_admin' 
    ? 'platform' 
    : 'tenant'

  // Get role-appropriate menus
  const menuSections = getMenusForRole(userRole, userType)
  
  // Filter menus by permissions
  const filteredMenus = filterMenusByPermissions(
    menuSections,
    userPermissions,
    userRole,
    userFeatures
  )

  // Sort sections by order
  const sortedSections = filteredMenus.sort((a, b) => a.order - b.order)

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">LaundryLobby</h1>
                <p className="text-xs text-gray-500 capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedSections.map((section) => (
            <MenuSectionComponent
              key={section.id}
              section={section}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl
              text-red-600 hover:bg-red-50 transition-colors duration-200
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}