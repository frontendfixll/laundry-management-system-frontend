'use client'

import { useState, useEffect } from 'react'
import { usePermissions, PermissionGate } from '@/hooks/usePermissions'
import {
  ShoppingBag,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Package,
  UserPlus,
  Eye,
  ArrowRight,
  RefreshCw,
  BarChart3,
  DollarSign,
  Star,
  Activity,
  Settings,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useAdminTheme } from '@/hooks/useAdminTheme'

interface AdminMetrics {
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  totalStaff: number
  activeStaff: number
  totalCustomers: number
  newCustomers: number
  totalRevenue: number
  monthlyRevenue: number
  averageOrderValue: number
  customerSatisfaction: number
}

interface RecentOrder {
  id: string
  customerName: string
  items: number
  status: 'pending' | 'processing' | 'completed' | 'delivered'
  assignedTo?: string
  timestamp: string
  amount: number
}

interface StaffMember {
  id: string
  name: string
  role: string
  status: 'active' | 'busy' | 'offline'
  assignedOrders: number
  lastActivity: string
}

interface ChartData {
  ordersByStatus: { name: string; value: number; color: string }[]
  revenueByWeek: { week: string; revenue: number; orders: number }[]
  serviceDistribution: { service: string; percentage: number; color: string }[]
  customerGrowth: { month: string; customers: number }[]
}

// Simple Chart Components (using CSS and SVG)
const PieChart = ({ data, size = 200 }: { data: { name: string; value: number; color: string }[], size?: number }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const createPath = (percentage: number, cumulativePercentage: number) => {
    const startAngle = cumulativePercentage * 3.6 - 90
    const endAngle = (cumulativePercentage + percentage) * 3.6 - 90
    const largeArcFlag = percentage > 50 ? 1 : 0

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
  }

  return (
    <div className="flex items-center space-x-4">
      <svg width={size} height={size} viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const path = createPath(percentage, cumulativePercentage)
          cumulativePercentage += percentage

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-600">
              {item.name}: {item.value} ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const BarChart = ({ data, height = 200 }: { data: { week: string; revenue: number; orders: number }[], height?: number }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue))

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.revenue / maxRevenue) * (height - 40)
          return (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div className="text-xs text-gray-600 text-center">
                ₹{(item.revenue / 1000).toFixed(1)}k
              </div>
              <div
                className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md w-full min-w-[40px] transition-all duration-500 hover:from-blue-600 hover:to-blue-500"
                style={{ height: `${barHeight}px` }}
                title={`Week ${item.week}: ₹${item.revenue.toLocaleString()} (${item.orders} orders)`}
              ></div>
              <div className="text-xs text-gray-500 text-center font-medium">
                {item.week}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const LineChart = ({ data }: { data: { month: string; customers: number }[] }) => {
  const maxCustomers = Math.max(...data.map(d => d.customers))
  const minCustomers = Math.min(...data.map(d => d.customers))
  const range = maxCustomers - minCustomers

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 300
    const y = 100 - ((item.customers - minCustomers) / range) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="space-y-4">
      <svg width="300" height="100" viewBox="0 0 300 120" className="w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#f3f4f6" strokeWidth="1" />
        ))}

        {/* Area under curve */}
        <polygon
          points={`0,100 ${points} 300,100`}
          fill="url(#lineGradient)"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 300
          const y = 100 - ((item.customers - minCustomers) / range) * 80
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
      </svg>

      <div className="flex justify-between text-xs text-gray-500">
        {data.map((item, index) => (
          <span key={index}>{item.month}</span>
        ))}
      </div>
    </div>
  )
}

export function TenantAdminDashboard() {
  const { hasPermission } = usePermissions()
  const { theme } = useAdminTheme()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Enhanced mock data with charts
        setMetrics({
          totalOrders: 1247,
          todayOrders: 23,
          pendingOrders: 8,
          completedOrders: 1239,
          totalStaff: 12,
          activeStaff: 9,
          totalCustomers: 456,
          newCustomers: 5,
          totalRevenue: 125000,
          monthlyRevenue: 45000,
          averageOrderValue: 850,
          customerSatisfaction: 4.8
        })

        setRecentOrders([
          {
            id: 'ORD-001',
            customerName: 'John Smith',
            items: 5,
            status: 'pending',
            timestamp: '5 minutes ago',
            amount: 1200
          },
          {
            id: 'ORD-002',
            customerName: 'Sarah Johnson',
            items: 3,
            status: 'processing',
            assignedTo: 'Mike Wilson',
            timestamp: '15 minutes ago',
            amount: 850
          },
          {
            id: 'ORD-003',
            customerName: 'Mike Davis',
            items: 8,
            status: 'completed',
            assignedTo: 'Lisa Chen',
            timestamp: '1 hour ago',
            amount: 1500
          },
          {
            id: 'ORD-004',
            customerName: 'Emily Wilson',
            items: 4,
            status: 'delivered',
            assignedTo: 'Tom Brown',
            timestamp: '2 hours ago',
            amount: 950
          }
        ])

        setStaffMembers([
          {
            id: '1',
            name: 'Mike Wilson',
            role: 'Senior Staff',
            status: 'active',
            assignedOrders: 3,
            lastActivity: '5 minutes ago'
          },
          {
            id: '2',
            name: 'Lisa Chen',
            role: 'Staff',
            status: 'busy',
            assignedOrders: 5,
            lastActivity: '10 minutes ago'
          },
          {
            id: '3',
            name: 'Tom Brown',
            role: 'Staff',
            status: 'active',
            assignedOrders: 2,
            lastActivity: '15 minutes ago'
          },
          {
            id: '4',
            name: 'Sarah Davis',
            role: 'Part-time Staff',
            status: 'offline',
            assignedOrders: 0,
            lastActivity: '2 hours ago'
          }
        ])

        // Chart data
        setChartData({
          ordersByStatus: [
            { name: 'Completed', value: 1239, color: theme.primaryColor }, // Use theme primary
            { name: 'Pending', value: 8, color: '#f59e0b' },
            { name: 'Processing', value: 15, color: theme.accentColor }, // Use theme accent
            { name: 'Cancelled', value: 3, color: '#ef4444' }
          ],
          revenueByWeek: [
            { week: 'W1', revenue: 12000, orders: 45 },
            { week: 'W2', revenue: 15000, orders: 52 },
            { week: 'W3', revenue: 18000, orders: 61 },
            { week: 'W4', revenue: 22000, orders: 68 },
            { week: 'W5', revenue: 19000, orders: 58 }
          ],
          serviceDistribution: [
            { service: 'Wash & Fold', percentage: 45, color: theme.primaryColor },
            { service: 'Dry Cleaning', percentage: 30, color: theme.secondaryColor },
            { service: 'Ironing', percentage: 15, color: '#10b981' },
            { service: 'Express', percentage: 10, color: '#f59e0b' }
          ],
          customerGrowth: [
            { month: 'Jan', customers: 320 },
            { month: 'Feb', customers: 350 },
            { month: 'Mar', customers: 380 },
            { month: 'Apr', customers: 420 },
            { month: 'May', customers: 456 }
          ]
        })
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading Spinner */}
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            {/* Animated Spinner */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150"></div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Loading Dashboard
              </h3>
              <p className="text-gray-600 text-sm">
                Preparing your operations overview...
              </p>
            </div>

            {/* Loading Progress Dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>

          {/* Optional: Skeleton Cards for Better UX */}
          <div className="mt-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/50 rounded-2xl p-6 h-32 shadow-sm border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between h-full">
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                      <div className="h-2 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom CSS for animation delays */}
        <style jsx>{`
          .animation-delay-100 {
            animation-delay: 0.1s;
          }
          .animation-delay-150 {
            animation-delay: 0.15s;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
        `}</style>
      </div>
    )
  }

  const getOrderStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'delivered':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getOrderStatusIcon = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getStaffStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'busy':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'offline':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-lg sm:text-xl font-light bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Operations Overview
          </h1>
          <p className="text-[11px] text-gray-500">
            Tenant Admin Dashboard - Real-time business insights
          </p>
        </div>

        {/* Key Metrics - Vibrant Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-blue-100 text-[10px] font-medium uppercase tracking-wider">Total Orders</p>
                  <p className="text-xl font-bold mt-0.5">{metrics?.totalOrders.toLocaleString()}</p>
                  <p className="text-blue-200 text-xs mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{metrics?.todayOrders} today
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="group bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-emerald-100 text-[10px] font-medium uppercase tracking-wider">Monthly Revenue</p>
                  <p className="text-xl font-bold mt-0.5">₹{metrics?.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-emerald-200 text-xs mt-1 flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Avg: ₹{metrics?.averageOrderValue}
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'staff_management', action: 'view' }]}>
            <div className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-purple-100 text-[10px] font-medium uppercase tracking-wider">Active Staff</p>
                  <p className="text-xl font-bold mt-0.5">{metrics?.activeStaff}</p>
                  <p className="text-purple-200 text-xs mt-1 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {metrics?.totalStaff} total staff
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'customer_management', action: 'view' }]}>
            <div className="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:scale-105 shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-amber-100 text-[10px] font-medium uppercase tracking-wider">Rating</p>
                  <p className="text-xl font-bold mt-0.5">{metrics?.customerSatisfaction}/5</p>
                  <p className="text-amber-200 text-xs mt-1 flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Excellent rating
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Star className="w-5 h-5" />
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Charts Section - Different Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Order Status Pie Chart */}
          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Order Distribution</h3>
                  <p className="text-[11px] text-gray-500">Current order status breakdown</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-rose-600" />
                </div>
              </div>
              {chartData && (
                <div className="flex justify-center">
                  <PieChart data={chartData.ordersByStatus} size={140} />
                </div>
              )}
            </div>
          </PermissionGate>

          {/* Revenue Trend Bar Chart */}
          <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Weekly Revenue</h3>
                  <p className="text-[11px] text-gray-500">Revenue trends over time</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                </div>
              </div>
              {chartData && (
                <BarChart data={chartData.revenueByWeek} height={140} />
              )}
            </div>
          </PermissionGate>
        </div>

        {/* Customer Growth Chart */}
        <PermissionGate permissions={[{ module: 'customer_management', action: 'view' }]}>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Customer Growth</h3>
                <p className="text-[11px] text-gray-500">Monthly acquisition</p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            {chartData && (
              <div className="flex justify-center">
                <LineChart data={chartData.customerGrowth} />
              </div>
            )}
          </div>
        </PermissionGate>

        {/* Quick Actions - Colorful Buttons */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-[11px] text-gray-500">Common tasks</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'orders_update_status', action: 'edit' }]}>
              <Link href="/admin/orders/pending" className="group">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Manage Orders</span>
                  </div>
                </div>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'assign_staff', action: 'create' }]}>
              <Link href="/admin/staff/assign" className="group">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Assign Staff</span>
                  </div>
                </div>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'services_pricing', action: 'view' }]}>
              <Link href="/admin/services" className="group">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">View Services</span>
                  </div>
                </div>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
              <Link href="/admin/reports" className="group">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl p-4 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">View Reports</span>
                  </div>
                </div>
              </Link>
            </PermissionGate>
          </div>
        </div>

        {/* Recent Orders & Staff Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Orders */}
          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
                  <p className="text-[11px] text-gray-500">Latest activity</p>
                </div>
                <Link href="/admin/orders" className="group">
                  <div className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">View All</span>
                  </div>
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusIcon(order.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {order.id} • {order.items} items • ₹{order.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">{order.timestamp}</p>
                        {order.assignedTo && (
                          <p className="text-xs text-blue-600">Assigned to {order.assignedTo}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>

          {/* Staff Status */}
          <PermissionGate permissions={[{ module: 'staff_management', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Staff Status</h3>
                  <p className="text-[11px] text-gray-500">Availability</p>
                </div>
                <button className="group flex items-center space-x-1.5 text-gray-600 hover:text-gray-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Refresh</span>
                </button>
              </div>
              <div className="space-y-4">
                {staffMembers.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
                        <p className="text-xs text-gray-600">{staff.role}</p>
                        <p className="text-xs text-gray-500">Last activity: {staff.lastActivity}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStaffStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                      {staff.assignedOrders > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {staff.assignedOrders} orders assigned
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link href="/admin/staff" className="text-sm text-blue-600 hover:text-blue-700 flex items-center group transition-colors">
                  <span>Manage all staff</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Operations Summary - Colorful Cards */}
        <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Operations Summary</h3>
                <p className="text-[11px] text-gray-500">Key performance indicators</p>
              </div>
              <Link href="/admin/analytics" className="group">
                <div className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">View Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Order Completion Rate</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">98.7%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 sm:p-6 border border-emerald-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Avg Processing Time</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">2.4h</p>
                  </div>
                  <Clock className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Staff Efficiency</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">94.2%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 sm:p-6 border border-amber-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-900">Customer Satisfaction</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">4.8/5</p>
                  </div>
                  <Users className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </div>
  )
}