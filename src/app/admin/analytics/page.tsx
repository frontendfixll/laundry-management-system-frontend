'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Star,
  Repeat,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

// Dynamic Daily Orders Chart Component
function DailyOrdersChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(1), 100)
    return () => clearTimeout(timer)
  }, [data])

  const maxOrders = Math.max(...data.map(d => d.orders), 1)
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  const barColors = [
    { bg: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-400/40' },
    { bg: 'from-indigo-400 to-indigo-600', shadow: 'shadow-indigo-400/40' },
    { bg: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-400/40' },
    { bg: 'from-cyan-400 to-cyan-600', shadow: 'shadow-cyan-400/40' },
    { bg: 'from-teal-400 to-teal-600', shadow: 'shadow-teal-400/40' },
    { bg: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-400/40' },
    { bg: 'from-green-400 to-green-600', shadow: 'shadow-green-400/40' },
  ]

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="w-px h-10 bg-blue-200"></div>
        <div className="text-center flex-1">
          <p className="text-2xl font-bold text-indigo-600">₹{(totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        {data.map((day, i) => {
          const isHovered = hoveredIndex === i
          const barWidth = Math.max((day.orders / maxOrders) * 100, 8) * animationProgress
          const color = barColors[i % barColors.length]

          return (
            <div
              key={i}
              className={`relative cursor-pointer transition-all duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1 }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-xl text-sm whitespace-nowrap">
                  <div className="font-semibold">{day.date}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span>{day.orders} orders</span>
                    <span>•</span>
                    <span>₹{day.revenue.toLocaleString()}</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                    <div className="border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold w-12 transition-colors duration-300 ${isHovered ? 'text-blue-600' : 'text-gray-600'}`}>
                  {day.date}
                </span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className={`h-full bg-gradient-to-r ${color.bg} rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3 ${isHovered ? `shadow-lg ${color.shadow}` : ''}`}
                    style={{ width: `${barWidth}%`, transitionDelay: `${i * 80}ms` }}
                  >
                    {barWidth > 20 && (
                      <span className="text-xs font-bold text-white drop-shadow-sm">{day.orders}</span>
                    )}
                  </div>
                  {barWidth <= 20 && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isHovered ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day.orders}
                    </span>
                  )}
                </div>
                <span className={`w-16 text-sm font-semibold text-right transition-colors duration-300 ${isHovered ? 'text-green-600' : 'text-gray-600'}`}>
                  ₹{(day.revenue / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Dynamic Order Status Chart Component
function OrderStatusChart({ data }: { data: { status: string; count: number; revenue: number }[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(1), 100)
    return () => clearTimeout(timer)
  }, [data])

  const total = data.reduce((sum, item) => sum + item.count, 0) || 1

  const statusColors: Record<string, { stroke: string; bg: string; text: string; light: string }> = {
    'Delivered': { stroke: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-100' },
    'Placed': { stroke: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
    'In Process': { stroke: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' },
    'Picked': { stroke: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' },
    'Ready': { stroke: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-100' },
    'Out For Delivery': { stroke: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-100' },
    'Cancelled': { stroke: '#ef4444', bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' },
  }

  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#6366f1', '#ef4444']

  const getColor = (status: string, index: number) => {
    return statusColors[status] || { 
      stroke: defaultColors[index % defaultColors.length], 
      bg: 'bg-gray-500', 
      text: 'text-gray-600', 
      light: 'bg-gray-100' 
    }
  }

  return (
    <div className="space-y-4">
      {/* Donut Chart */}
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          <svg width="160" height="160" className="transform -rotate-90">
            <circle cx="80" cy="80" r="60" fill="none" stroke="#f3f4f6" strokeWidth="20" />
            {data.map((item, i) => {
              const percentage = item.count / total
              const circumference = 2 * Math.PI * 60
              const prevPercentages = data.slice(0, i).reduce((sum, d) => sum + d.count / total, 0)
              const color = getColor(item.status, i)
              const isHovered = hoveredIndex === i

              return (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth={isHovered ? 24 : 20}
                  strokeDasharray={`${percentage * circumference * animationProgress} ${circumference}`}
                  strokeDashoffset={-prevPercentages * circumference * animationProgress}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${color.stroke}80)` : 'none',
                    opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {hoveredIndex !== null ? (
              <>
                <p className={`text-2xl font-bold ${getColor(data[hoveredIndex].status, hoveredIndex).text}`}>
                  {data[hoveredIndex].count}
                </p>
                <p className="text-xs text-gray-500">{data[hoveredIndex].status}</p>
                <p className="text-xs text-gray-400">{((data[hoveredIndex].count / total) * 100).toFixed(1)}%</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((item, i) => {
          const color = getColor(item.status, i)
          const isHovered = hoveredIndex === i
          const percentage = ((item.count / total) * 100).toFixed(1)

          return (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${isHovered ? color.light : 'hover:bg-gray-50'}`}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="w-3 h-3 rounded-full transition-transform duration-300" 
                style={{ 
                  backgroundColor: color.stroke,
                  transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: isHovered ? `0 0 8px ${color.stroke}80` : 'none'
                }}
              ></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isHovered ? color.text : 'text-gray-700'}`}>{item.status}</p>
              </div>
              <span className={`text-sm font-bold ${isHovered ? color.text : 'text-gray-600'}`}>{item.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface AnalyticsData {
  overview: {
    totalOrders: number
    totalRevenue: number
    totalCustomers: number
    avgOrderValue: number
    orderGrowth: number
    revenueGrowth: number
    customerGrowth: number
    activeBranches: number
  }
  ordersByStatus: { status: string; count: number; revenue: number }[]
  topBranches: { branchName: string; totalOrders: number; totalRevenue: number }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  recentOrders: any[]
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.getAnalytics(dateRange)
      
      if (response.success && response.data) {
        const data = response.data
        
        // Transform API response to match our interface
        setAnalytics({
          overview: {
            totalOrders: data.overview?.totalOrders || 0,
            totalRevenue: data.overview?.totalRevenue || 0,
            totalCustomers: data.overview?.totalCustomers || 0,
            avgOrderValue: data.overview?.averageOrderValue || 0,
            orderGrowth: data.overview?.growth?.orders || 0,
            revenueGrowth: data.overview?.growth?.revenue || 0,
            customerGrowth: data.overview?.growth?.customers || 0,
            activeBranches: data.overview?.activeBranches || 0
          },
          ordersByStatus: (data.orderDistribution || []).map((item: any) => ({
            status: formatStatus(item._id),
            count: item.count,
            revenue: item.revenue || 0
          })),
          topBranches: (data.topBranches || []).map((branch: any) => ({
            branchName: branch.branchName || 'Unknown',
            totalOrders: branch.totalOrders || 0,
            totalRevenue: branch.totalRevenue || 0
          })),
          dailyRevenue: (data.revenue?.daily || []).map((day: any) => ({
            date: formatDate(day._id),
            revenue: day.revenue || 0,
            orders: day.orders || 0
          })),
          recentOrders: data.recentOrders || []
        })
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown'
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateObj: any) => {
    if (!dateObj) return ''
    const { year, month, day } = dateObj
    if (year && month && day) {
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
    }
    return ''
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Analytics</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const GrowthIndicator = ({ value }: { value: number }) => (
    <span className={`flex items-center text-sm ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      {value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">Business performance insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center text-sm ${analytics.overview.orderGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {analytics.overview.orderGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(analytics.overview.orderGrowth).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-blue-100">Total Orders</p>
            <p className="text-3xl font-bold">{analytics.overview.totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center text-sm ${analytics.overview.revenueGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {analytics.overview.revenueGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(analytics.overview.revenueGrowth).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-emerald-100">Total Revenue</p>
            <p className="text-3xl font-bold">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className={`flex items-center text-sm ${analytics.overview.customerGrowth >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {analytics.overview.customerGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(analytics.overview.customerGrowth).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-purple-100">Total Customers</p>
            <p className="text-3xl font-bold">{analytics.overview.totalCustomers.toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-amber-100">Avg Order Value</p>
            <p className="text-3xl font-bold">₹{analytics.overview.avgOrderValue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Orders & Revenue</h3>
          {analytics.dailyRevenue.length > 0 ? (
            <DailyOrdersChart data={[...analytics.dailyRevenue].slice(-7).reverse()} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No data available for this period</p>
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h3>
          {analytics.ordersByStatus.length > 0 ? (
            <OrderStatusChart data={analytics.ordersByStatus} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No order data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Branches & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Branches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Performing Branches</h3>
            <span className="text-sm text-gray-500">{analytics.topBranches.length} branches</span>
          </div>
          {analytics.topBranches.length > 0 ? (
            <div className="space-y-3">
              {analytics.topBranches.map((branch, index) => {
                const maxRevenue = Math.max(...analytics.topBranches.map(b => b.totalRevenue), 1)
                const percentage = (branch.totalRevenue / maxRevenue) * 100
                
                return (
                  <div 
                    key={index} 
                    className="group relative p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-300"
                    onClick={() => window.location.href = `/admin/branches`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-500/30' : 
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-500/30' : 
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-500/30' : 
                        'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-500/30'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{branch.branchName}</p>
                          <p className="font-bold text-emerald-600">₹{branch.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{branch.totalOrders} orders</span>
                          <span>•</span>
                          <span>₹{Math.round(branch.totalRevenue / (branch.totalOrders || 1))} avg</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                              index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No branch data available</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <a href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All →</a>
          </div>
          {analytics.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentOrders.slice(0, 5).map((order, index) => {
                const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
                  'delivered': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '✓' },
                  'placed': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📦' },
                  'in_process': { bg: 'bg-amber-100', text: 'text-amber-700', icon: '⚙️' },
                  'picked': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🚚' },
                  'ready': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '✨' },
                  'out_for_delivery': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🛵' },
                  'cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: '✕' },
                }
                const config = statusConfig[order.status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: '•' }
                
                return (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-300"
                    onClick={() => window.location.href = `/admin/orders`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center text-lg`}>
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">#{order.orderId}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-800">₹{order.totalAmount?.toLocaleString() || 0}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.text}`}>
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent orders</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6" />
            <span className="text-lg font-semibold">Active Branches</span>
          </div>
          <p className="text-3xl font-bold">{analytics.overview.activeBranches}</p>
          <p className="text-blue-100 text-sm mt-1">currently operational</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-lg font-semibold">Period Orders</span>
          </div>
          <p className="text-3xl font-bold">{analytics.dailyRevenue.reduce((sum, d) => sum + d.orders, 0)}</p>
          <p className="text-green-100 text-sm mt-1">in selected timeframe</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6" />
            <span className="text-lg font-semibold">Period Revenue</span>
          </div>
          <p className="text-3xl font-bold">₹{(analytics.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0) / 1000).toFixed(1)}K</p>
          <p className="text-purple-100 text-sm mt-1">in selected timeframe</p>
        </div>
      </div>
    </div>
  )
}
