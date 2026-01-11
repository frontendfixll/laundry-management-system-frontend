'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  MapPin,
  AlertCircle,
  Zap,
  BarChart3,
  ArrowUpRight
} from 'lucide-react'
import api from '@/lib/api'

interface DashboardMetrics {
  todayOrders: number
  pendingOrders: number
  completedTodayOrders: number
  totalStaff: number
  totalOrders: number
  expressOrders: number
  totalCustomers: number
  activeCustomers: number
}

interface BranchInfo {
  _id: string
  name: string
  code: string
  address?: {
    addressLine1?: string
    city?: string
  }
}

interface RecentOrder {
  _id: string
  orderNumber: string
  status: string
  pricing: { total: number }
  createdAt: string
  isExpress: boolean
}

interface DashboardData {
  metrics: DashboardMetrics
  branchInfo: BranchInfo | null
  isBranchAdmin: boolean
  recentOrders: RecentOrder[]
}

export default function BranchAdminDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/admin/dashboard')
        if (response.data.success) {
          setData(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      placed: 'bg-blue-100 text-blue-700',
      assigned_to_branch: 'bg-purple-100 text-purple-700',
      picked: 'bg-indigo-100 text-indigo-700',
      in_process: 'bg-yellow-100 text-yellow-700',
      ready: 'bg-cyan-100 text-cyan-700',
      out_for_delivery: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-2xl mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Branch Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-teal-100 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{user?.name || 'Branch Admin'}</h1>
            <p className="text-teal-100 mt-2">Here&apos;s what&apos;s happening at your branch today.</p>
          </div>
          {data?.branchInfo && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-lg">{data.branchInfo.name}</p>
                  <p className="text-sm text-teal-100">Code: {data.branchInfo.code}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 xl:gap-6">
        {/* Today's Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Today
              </span>
            </div>
            <p className="text-blue-100 text-sm">Today&apos;s Orders</p>
            <p className="text-3xl font-bold mt-1">{data?.metrics?.todayOrders || 0}</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3 mr-1" />
                Action
              </span>
            </div>
            <p className="text-orange-100 text-sm">Pending Orders</p>
            <p className="text-3xl font-bold mt-1">{data?.metrics?.pendingOrders || 0}</p>
          </div>
        </div>

        {/* Completed Today */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Done
              </span>
            </div>
            <p className="text-green-100 text-sm">Completed Today</p>
            <p className="text-3xl font-bold mt-1">{data?.metrics?.completedTodayOrders || 0}</p>
          </div>
        </div>

        {/* Express Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs bg-white/20 px-2 py-1 rounded-full">
                <Zap className="w-3 h-3 mr-1" />
                Express
              </span>
            </div>
            <p className="text-purple-100 text-sm">Express Orders</p>
            <p className="text-3xl font-bold mt-1">{data?.metrics?.expressOrders || 0}</p>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data?.metrics?.totalOrders || 0}</p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Branch Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data?.metrics?.totalCustomers || 0}</p>
              <p className="text-xs text-green-500 mt-1">{data?.metrics?.activeCustomers || 0} active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Performance - New card for xl screens */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow hidden xl:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data?.metrics?.totalOrders ? Math.round((data?.metrics?.completedTodayOrders || 0) / Math.max(data?.metrics?.todayOrders || 1, 1) * 100) : 0}%
              </p>
              <p className="text-xs text-teal-500 mt-1">Today&apos;s efficiency</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 xl:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/branch-admin/orders"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-colors border border-blue-100"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Orders</span>
            </a>
            <a
              href="/branch-admin/staff"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl hover:from-cyan-100 hover:to-teal-100 transition-colors border border-cyan-100"
            >
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Staff</span>
            </a>
            <a
              href="/branch-admin/inventory"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors border border-purple-100"
            >
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Inventory</span>
            </a>
            <a
              href="/branch-admin/reports"
              className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors border border-green-100"
            >
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </a>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <a href="/branch-admin/orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              View All →
            </a>
          </div>
          <div className="space-y-3">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              data.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${order.isExpress ? 'bg-orange-100' : 'bg-blue-100'}`}>
                      {order.isExpress ? (
                        <Zap className="w-4 h-4 text-orange-600" />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{order.pricing?.total || 0}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Branch Admin Access</p>
            <p className="text-sm text-amber-700 mt-1">
              You are viewing data only for your assigned branch. For tenancy-level changes (new branches, pricing, branding), please contact your Tenancy Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
