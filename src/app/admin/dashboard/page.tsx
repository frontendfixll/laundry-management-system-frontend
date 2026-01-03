'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import {
  ShoppingBag,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  Building2,
  ArrowRight,
  Eye,
  UserCheck,
  Sparkles,
  Zap,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAdminDashboard } from '@/hooks/useAdmin'
import { useAdminAnalytics } from '@/hooks/useAnalytics'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart as RechartsAreaChart,
  Area,
} from 'recharts'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const canViewReports = hasPermission('reports', 'view')
  
  const { metrics, recentOrders, loading, error } = useAdminDashboard()
  const { weeklyOrders, orderStatus, revenueData, loading: analyticsLoading } = useAdminAnalytics()
  const [revenueChartType, setRevenueChartType] = useState<'bar' | 'line' | 'area'>('bar')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">Error loading dashboard</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Orders',
      value: metrics?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingBag,
      change: `${metrics?.todayOrders || 0} today`,
      changeType: 'positive',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'shadow-blue-500/30',
    },
    {
      name: 'Active Customers',
      value: metrics?.activeCustomers?.toLocaleString() || '0',
      icon: Users,
      change: `${metrics?.totalCustomers || 0} total`,
      changeType: 'positive',
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/30',
    },
    {
      name: 'Pending Orders',
      value: metrics?.pendingOrders?.toLocaleString() || '0',
      icon: Clock,
      change: 'Need assignment',
      changeType: metrics?.pendingOrders && metrics.pendingOrders > 0 ? 'warning' : 'positive',
      gradient: 'from-amber-500 to-orange-600',
      shadowColor: 'shadow-amber-500/30',
    },
    {
      name: 'Express Orders',
      value: metrics?.expressOrders?.toLocaleString() || '0',
      icon: Zap,
      change: 'Priority delivery',
      changeType: 'warning',
      gradient: 'from-purple-500 to-pink-600',
      shadowColor: 'shadow-purple-500/30',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
      case 'pending': return 'text-amber-700 bg-amber-100 border border-amber-200'
      case 'assigned_to_branch':
      case 'in_progress': return 'text-blue-700 bg-blue-100 border border-blue-200'
      case 'ready': return 'text-purple-700 bg-purple-100 border border-purple-200'
      case 'delivered': return 'text-emerald-700 bg-emerald-100 border border-emerald-200'
      default: return 'text-gray-700 bg-gray-100 border border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'placed': return 'Pending Assignment'
      case 'assigned_to_branch': return 'Assigned to Branch'
      case 'assigned_to_logistics_pickup': return 'Pickup Assigned'
      case 'picked': return 'Picked Up'
      case 'in_process': return 'In Progress'
      case 'ready': return 'Ready for Delivery'
      case 'assigned_to_logistics_delivery': return 'Delivery Assigned'
      case 'out_for_delivery': return 'Out for Delivery'
      case 'delivered': return 'Delivered'
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getPriorityColor = (order: any) => {
    if (order.isExpress) return 'border-l-red-500'
    if (order.customer?.isVIP) return 'border-l-amber-500'
    return 'border-l-blue-500'
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, {user?.name}! 👋</h1>
              <p className="text-blue-100">Here's what's happening with your laundry business today.</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/admin/orders">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20">
                <ShoppingBag className="w-5 h-5 mr-2" />
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`group relative overflow-hidden rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.gradient} text-white`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-white/90 mb-2">{stat.name}</div>
              <div className="text-xs font-medium text-white/70">
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Only show if user has reports.view permission */}
      {canViewReports && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Orders Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Weekly Orders</h2>
              <p className="text-sm text-gray-500">Order trends this week</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Orders</span>
            </div>
          </div>
          <div className="h-72">
            {analyticsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="orders" fill="url(#colorOrders)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
            <p className="text-sm text-gray-500">Distribution by status</p>
          </div>
          <div className="h-56">
            {analyticsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatus.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-xs text-gray-600">{item.name}</span>
                <span className="text-xs font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Revenue Chart - Only show if user has reports.view permission */}
      {canViewReports && (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Revenue Overview</h2>
            <p className="text-sm text-gray-500">Daily revenue this week</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setRevenueChartType('bar')}
                className={`p-2 rounded-md transition-all ${
                  revenueChartType === 'bar'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Bar Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRevenueChartType('line')}
                className={`p-2 rounded-md transition-all ${
                  revenueChartType === 'line'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Line Chart"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRevenueChartType('area')}
                className={`p-2 rounded-md transition-all ${
                  revenueChartType === 'area'
                    ? 'bg-white shadow-sm text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Area Chart"
              >
                <AreaChart className="w-4 h-4" />
              </button>
            </div>
            {revenueData && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-emerald-600">₹{revenueData.totalRevenue?.toLocaleString()}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenue (₹)</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          {analyticsLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-pulse text-gray-400">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {revenueChartType === 'bar' ? (
                <BarChart data={revenueData?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#colorRevenueBar)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              ) : revenueChartType === 'line' ? (
                <LineChart data={revenueData?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#10b981' }}
                  />
                </LineChart>
              ) : (
                <RechartsAreaChart data={revenueData?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenueArea)"
                  />
                  <defs>
                    <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                </RechartsAreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link href="/admin/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center group">
              View All
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-6 space-y-4">
            {recentOrders && recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-l-4 ${getPriorityColor(order)}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {order.orderNumber}
                      {order.isExpress && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200">Express</span>
                      )}
                      {order.customer?.isVIP && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium border border-amber-200">VIP</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{order.customer?.name} • {order.items?.length || 0} items</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} mb-2`}>
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-sm font-bold text-gray-800">₹{order.pricing?.total?.toLocaleString()}</div>
                  </div>
                  <Link
                    href={`/admin/orders?view=${order._id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Order"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent orders found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/orders"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Manage Orders</div>
                  <div className="text-xs text-gray-500">Assign & track orders</div>
                </div>
              </Link>

              <Link
                href="/admin/customers"
                className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Customer Management</div>
                  <div className="text-xs text-gray-500">View & manage customers</div>
                </div>
              </Link>

              <Link
                href="/admin/branches"
                className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Branch Operations</div>
                  <div className="text-xs text-gray-500">Monitor branches</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Alerts & Notifications</h2>
            <div className="space-y-3">
              {metrics?.pendingOrders && metrics.pendingOrders > 0 && (
                <div className="flex items-start p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-800">{metrics.pendingOrders} Pending Orders</div>
                    <div className="text-xs text-amber-600">Need branch assignment</div>
                  </div>
                </div>
              )}

              {metrics?.expressOrders && metrics.expressOrders > 0 && (
                <div className="flex items-start p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-800">{metrics.expressOrders} Express Orders</div>
                    <div className="text-xs text-blue-600">Priority handling required</div>
                  </div>
                </div>
              )}

              {metrics?.pendingComplaints && metrics.pendingComplaints > 0 && (
                <div className="flex items-start p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-red-800">{metrics.pendingComplaints} Pending Complaints</div>
                    <div className="text-xs text-red-600">Need immediate attention</div>
                  </div>
                </div>
              )}

              <div className="flex items-start p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">System Status: Good</div>
                  <div className="text-xs text-emerald-600">All services operational</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">System Overview</h3>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total Orders</span>
                  <span className="font-bold text-lg">{metrics?.totalOrders?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Active Customers</span>
                  <span className="font-bold text-lg">{metrics?.activeCustomers?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Active Branches</span>
                  <span className="font-bold text-lg">{metrics?.totalBranches?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
