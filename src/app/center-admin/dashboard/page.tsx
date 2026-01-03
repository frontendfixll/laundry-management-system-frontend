'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  ShoppingBag,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Package,
  ArrowRight,
  RefreshCw,
  Loader2,
  IndianRupee,
  Zap,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { branchApi } from '@/lib/centerAdminApi'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface DashboardData {
  branch: { _id: string; name: string; code: string }
  metrics: {
    todayOrders: number
    pendingOrders: number
    processingOrders: number
    readyOrders: number
    completedToday: number
    weeklyOrders: number
    todayRevenue: number
    staffCount: number
    activeStaff: number
  }
  recentOrders: Array<{
    _id: string
    orderNumber: string
    status: string
    amount: number
    itemCount: number
    isExpress: boolean
    createdAt: string
    customer: { name: string; phone: string }
  }>
  staffPerformance: Array<{ name: string; role: string; ordersProcessed: number }>
  alerts: Array<{ type: string; title: string; message: string }>
}

export default function BranchDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics data for charts
  const [dailyData, setDailyData] = useState<Array<{ name: string; orders: number; revenue: number }>>([])
  const [statusData, setStatusData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [serviceData, setServiceData] = useState<Array<{ name: string; value: number; color: string }>>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await branchApi.getDashboard()
      if (response.success) {
        setData(response.data)
        
        // Set status data from metrics
        if (response.data.metrics) {
          setStatusData([
            { name: 'Pending', value: response.data.metrics.pendingOrders, color: '#f59e0b' },
            { name: 'Processing', value: response.data.metrics.processingOrders, color: '#3b82f6' },
            { name: 'Ready', value: response.data.metrics.readyOrders, color: '#10b981' },
            { name: 'Completed', value: response.data.metrics.completedToday, color: '#8b5cf6' },
          ])
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard')
      toast.error(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const response = await branchApi.getAnalytics('7d')
      if (response.success) {
        // Format daily stats for chart
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        if (response.data.dailyStats) {
          const formattedDaily = response.data.dailyStats.map((day: any) => ({
            name: dayNames[new Date(day._id.year, day._id.month - 1, day._id.day).getDay()],
            orders: day.orders,
            revenue: day.revenue || 0
          }))
          setDailyData(formattedDaily)
        }

        // Format service stats
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
        if (response.data.serviceStats) {
          const formattedServices = response.data.serviceStats.slice(0, 6).map((service: any, idx: number) => ({
            name: service._id?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Other',
            value: service.count,
            color: colors[idx % colors.length]
          }))
          setServiceData(formattedServices)
        }
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    fetchAnalytics()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_process': return 'text-blue-700 bg-blue-100 border border-blue-200'
      case 'ready': return 'text-emerald-700 bg-emerald-100 border border-emerald-200'
      case 'assigned_to_branch': case 'picked': return 'text-amber-700 bg-amber-100 border border-amber-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'assigned_to_branch': 'Pending',
      'picked': 'Picked Up',
      'in_process': 'Processing',
      'ready': 'Ready',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 rounded-2xl text-center border border-red-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">{error || 'Failed to load'}</h3>
        <Button onClick={fetchDashboard} className="mt-4 bg-red-600 hover:bg-red-700">Try Again</Button>
      </div>
    )
  }

  const stats = [
    { name: 'Orders Today', value: data.metrics.todayOrders, icon: ShoppingBag, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
    { name: 'In Progress', value: data.metrics.processingOrders, icon: Clock, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
    { name: 'Completed', value: data.metrics.completedToday, icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
    { name: 'Staff', value: `${data.metrics.activeStaff}/${data.metrics.staffCount}`, icon: Users, gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/30' },
  ]

  return (
    <div className="space-y-6 w-full pb-8">
      {/* Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
              <p className="text-emerald-100">{data.branch.name} ({data.branch.code})</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button variant="outline" onClick={fetchDashboard} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Link href="/center-admin/orders">
              <Button className="bg-white text-emerald-600 hover:bg-gray-100 shadow-lg">
                <ShoppingBag className="w-5 h-5 mr-2" />View Orders
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative z-10 mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 inline-flex items-center gap-3">
          <IndianRupee className="w-5 h-5" />
          <div>
            <span className="text-sm text-emerald-100">Today's Revenue</span>
            <p className="text-2xl font-bold">₹{data.metrics.todayRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending & Ready */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending</p>
              <p className="text-4xl font-bold text-amber-700">{data.metrics.pendingOrders}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Ready</p>
              <p className="text-4xl font-bold text-emerald-700">{data.metrics.readyOrders}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Weekly Orders</h2>
            <p className="text-sm text-gray-500">Orders this week</p>
          </div>
          <div className="h-56">
            {analyticsLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="orders" fill="url(#branchGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="branchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">Order Status</h2>
            <p className="text-sm text-gray-500">Current distribution</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <Link href="/center-admin/orders" className="text-emerald-600 text-sm font-medium flex items-center group">
              View All<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-all border-l-4 ${order.isExpress ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                        {order.isExpress && <Zap className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-sm text-gray-500">{order.customer?.name} • {order.itemCount} items</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} mb-1`}>
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-sm font-bold text-gray-800">₹{order.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/center-admin/orders" className="flex items-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Process Orders</div>
                  <div className="text-xs text-gray-500">Assign & track</div>
                </div>
              </Link>
              <Link href="/center-admin/staff" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Manage Staff</div>
                  <div className="text-xs text-gray-500">Assign tasks</div>
                </div>
              </Link>
              <Link href="/center-admin/performance" className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Analytics</div>
                  <div className="text-xs text-gray-500">Performance</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Staff */}
          {data.staffPerformance.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Top Staff</h2>
              <div className="space-y-3">
                {data.staffPerformance.map((staff, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{staff.name || 'Staff'}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{staff.ordersProcessed} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {data.alerts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Alerts</h2>
              <div className="space-y-3">
                {data.alerts.map((alert, idx) => (
                  <div key={idx} className={`flex items-start p-4 rounded-xl border ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                    <AlertTriangle className={`w-5 h-5 mr-3 ${alert.type === 'warning' ? 'text-amber-600' : 'text-red-600'}`} />
                    <div>
                      <div className={`text-sm font-semibold ${alert.type === 'warning' ? 'text-amber-800' : 'text-red-800'}`}>{alert.title}</div>
                      <div className={`text-xs ${alert.type === 'warning' ? 'text-amber-600' : 'text-red-600'}`}>{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
