import { useState, useEffect, useMemo } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatures } from '@/hooks/useFeatures'
import { 
  ShoppingBag, Users, Building2, Package, Sparkles, CreditCard, 
  BarChart3, Settings, Truck, MessageSquare, RefreshCw, QrCode,
  Award, Gift, Megaphone, Ticket, UserCheck, Zap
} from 'lucide-react'

interface QuickAction {
  id: string
  name: string
  description: string
  href: string
  icon: any
  gradient: string
  shadowColor: string
  permission: {
    module: string
    action: string
  }
  feature?: string
  clickCount?: number
  lastClicked?: Date
}

// All possible quick actions with their permissions
const ALL_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'orders',
    name: 'Manage Orders',
    description: 'Assign & track orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/30',
    permission: { module: 'orders', action: 'view' },
    feature: 'orders'
  },
  {
    id: 'customers',
    name: 'Customer Management',
    description: 'View & manage customers',
    href: '/admin/customers',
    icon: Users,
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/30',
    permission: { module: 'customers', action: 'view' },
    feature: 'customers'
  },
  {
    id: 'branches',
    name: 'Branch Operations',
    description: 'Monitor branches',
    href: '/admin/branches',
    icon: Building2,
    gradient: 'from-purple-500 to-pink-600',
    shadowColor: 'shadow-purple-500/30',
    permission: { module: 'branches', action: 'view' },
    feature: 'branches'
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock management',
    href: '/admin/inventory',
    icon: Package,
    gradient: 'from-orange-500 to-red-600',
    shadowColor: 'shadow-orange-500/30',
    permission: { module: 'inventory', action: 'view' },
    feature: 'inventory'
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Manage services',
    href: '/admin/services',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/30',
    permission: { module: 'services', action: 'view' },
    feature: 'services'
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Financial overview',
    href: '/admin/payments',
    icon: CreditCard,
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/30',
    permission: { module: 'performance', action: 'view' },
    feature: 'payments'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Performance insights',
    href: '/admin/analytics',
    icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/30',
    permission: { module: 'performance', action: 'view' },
    feature: 'advanced_analytics'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration',
    href: '/admin/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-600',
    shadowColor: 'shadow-gray-500/30',
    permission: { module: 'settings', action: 'view' }
    // No feature requirement for settings
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Delivery management',
    href: '/admin/logistics',
    icon: Truck,
    gradient: 'from-amber-500 to-yellow-600',
    shadowColor: 'shadow-amber-500/30',
    permission: { module: 'logistics', action: 'view' },
    feature: 'logistics'
  },
  {
    id: 'tickets',
    name: 'Support Tickets',
    description: 'Customer support',
    href: '/admin/tickets',
    icon: Ticket,
    gradient: 'from-rose-500 to-pink-600',
    shadowColor: 'shadow-rose-500/30',
    permission: { module: 'tickets', action: 'view' },
    feature: 'tickets'
  },
  {
    id: 'scanner',
    name: 'Barcode Scanner',
    description: 'Scan order items',
    href: '/admin/scanner',
    icon: QrCode,
    gradient: 'from-indigo-500 to-blue-600',
    shadowColor: 'shadow-indigo-500/30',
    permission: { module: 'orders', action: 'view' },
    feature: 'orders'
  },
  {
    id: 'loyalty',
    name: 'Loyalty Program',
    description: 'Manage rewards',
    href: '/admin/loyalty',
    icon: Award,
    gradient: 'from-yellow-500 to-orange-600',
    shadowColor: 'shadow-yellow-500/30',
    permission: { module: 'coupons', action: 'view' },
    feature: 'loyalty_points'
  },
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Marketing campaigns',
    href: '/admin/campaigns',
    icon: Megaphone,
    gradient: 'from-pink-500 to-rose-600',
    shadowColor: 'shadow-pink-500/30',
    permission: { module: 'coupons', action: 'view' },
    feature: 'campaigns'
  },
  {
    id: 'refunds',
    name: 'Refunds',
    description: 'Process refunds',
    href: '/admin/refunds',
    icon: RefreshCw,
    gradient: 'from-red-500 to-pink-600',
    shadowColor: 'shadow-red-500/30',
    permission: { module: 'orders', action: 'cancel' },
    feature: 'refunds'
  }
]

/**
 * Smart Quick Actions Hook
 * - Filters actions based on permissions and features
 * - Tracks usage analytics (clicks in last 24 hours)
 * - Orders by popularity and relevance
 */
export function useSmartQuickActions(maxActions: number = 6) {
  const { hasPermission } = usePermissions()
  const { hasFeature } = useFeatures()
  const [clickAnalytics, setClickAnalytics] = useState<Record<string, { count: number; lastClicked: Date }>>({})

  // Load click analytics from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('admin-quick-actions-analytics')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects and filter last 24 hours
        const now = new Date()
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        
        const filtered: Record<string, { count: number; lastClicked: Date }> = {}
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          const lastClicked = new Date(value.lastClicked)
          if (lastClicked > last24Hours) {
            filtered[key] = {
              count: value.count || 0,
              lastClicked
            }
          }
        })
        
        setClickAnalytics(filtered)
      } catch (error) {
        console.error('Failed to parse quick actions analytics:', error)
      }
    }
  }, [])

  // Save analytics to localStorage
  const saveAnalytics = (analytics: Record<string, { count: number; lastClicked: Date }>) => {
    localStorage.setItem('admin-quick-actions-analytics', JSON.stringify(analytics))
  }

  // Track click on an action
  const trackClick = (actionId: string) => {
    const now = new Date()
    const newAnalytics = {
      ...clickAnalytics,
      [actionId]: {
        count: (clickAnalytics[actionId]?.count || 0) + 1,
        lastClicked: now
      }
    }
    
    setClickAnalytics(newAnalytics)
    saveAnalytics(newAnalytics)
  }

  // Get smart quick actions based on permissions, features, and usage
  const smartQuickActions = useMemo(() => {
    // Filter actions based on permissions and features
    const allowedActions = ALL_QUICK_ACTIONS.filter(action => {
      // Check permission
      const hasRequiredPermission = hasPermission(action.permission.module, action.permission.action)
      if (!hasRequiredPermission) return false
      
      // Check feature if specified
      if (action.feature && !hasFeature(action.feature)) return false
      
      return true
    })

    // Add click analytics to actions
    const actionsWithAnalytics = allowedActions.map(action => ({
      ...action,
      clickCount: clickAnalytics[action.id]?.count || 0,
      lastClicked: clickAnalytics[action.id]?.lastClicked
    }))

    // Sort by popularity (click count) and recency
    const sortedActions = actionsWithAnalytics.sort((a, b) => {
      // Primary sort: click count (descending)
      if (b.clickCount !== a.clickCount) {
        return b.clickCount - a.clickCount
      }
      
      // Secondary sort: recency of last click
      if (a.lastClicked && b.lastClicked) {
        return b.lastClicked.getTime() - a.lastClicked.getTime()
      }
      
      // If one has been clicked and other hasn't, prioritize clicked one
      if (a.lastClicked && !b.lastClicked) return -1
      if (!a.lastClicked && b.lastClicked) return 1
      
      // Default order if no clicks
      return 0
    })

    // Return top N actions
    return sortedActions.slice(0, maxActions)
  }, [hasPermission, hasFeature, clickAnalytics, maxActions])

  return {
    quickActions: smartQuickActions,
    trackClick,
    totalAllowedActions: ALL_QUICK_ACTIONS.filter(action => 
      hasPermission(action.permission.module, action.permission.action) &&
      (!action.feature || hasFeature(action.feature))
    ).length
  }
}