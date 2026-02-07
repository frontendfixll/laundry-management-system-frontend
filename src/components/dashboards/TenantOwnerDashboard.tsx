'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Settings,
  BarChart3,
  UserPlus,
  Tag,
  Wrench,
  Calendar,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/hooks/usePermissions'

interface BusinessMetrics {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  monthlyRevenue: number
  totalCustomers: number
  activeStaff: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
  customerSatisfaction: number
}

interface RecentOrder {
  id: string
  customerName: string
  items: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'delivered'
  timestamp: string
}

export function TenantOwnerDashboard() {
  const { hasPermission } = usePermissions()
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call for business metrics
    const fetchMetrics = async () => {
      try {
        // Mock data - replace with actual API call
        setMetrics({
          totalOrders: 2847,
          todayOrders: 23,
          totalRevenue: 284739,
          monthlyRevenue: 28473,
          totalCustomers: 1247,
          activeStaff: 12,
          pendingOrders: 8,
          completedOrders: 2839,
          averageOrderValue: 45.67,
          customerSatisfaction: 4.8
        })

        setRecentOrders([
          {
            id: 'ORD-001',
            customerName: 'John Smith',
            items: 5,
            total: 67.50,
            status: 'pending',
            timestamp: '5 minutes ago'
          },
          {
            id: 'ORD-002',
            customerName: 'Sarah Johnson',
            items: 3,
            total: 42.00,
            status: 'processing',
            timestamp: '15 minutes ago'
          },
          {
            id: 'ORD-003',
            customerName: 'Mike Davis',
            items: 8,
            total: 89.25,
            status: 'completed',
            timestamp: '1 hour ago'
          },
          {
            id: 'ORD-004',
            customerName: 'Emily Wilson',
            items: 4,
            total: 55.80,
            status: 'delivered',
            timestamp: '2 hours ago'
          }
        ])
      } catch (error) {
        console.error('Error fetching business metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <DashboardWrapper title="Business Overview" subtitle="Tenant Owner Dashboard" roleColor="red">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32"></div>
            ))}
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: RecentOrder['status']) => {
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
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <DashboardWrapper title="Business Overview" subtitle="Tenant Owner Dashboard" roleColor="red">
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.totalOrders.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    +{metrics?.todayOrders} today
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'payments_earnings', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${metrics?.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +${metrics?.monthlyRevenue.toLocaleString()} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'customer_management', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.totalCustomers}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    {metrics?.customerSatisfaction}/5.0 satisfaction
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'staff_management', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.activeStaff}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    ${metrics?.averageOrderValue} avg order
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'orders_view', action: 'create' }]}>
              <Link href="/admin/orders/create">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'staff_management', action: 'create' }]}>
              <Link href="/admin/staff/create">
                <Button className="w-full justify-start" variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'services_pricing', action: 'view' }]}>
              <Link href="/admin/service">
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Manage Services
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'tenant_settings', action: 'view' }]}>
              <Link href="/admin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Business Settings
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <PermissionGate permissions={[{ module: 'orders_view', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {order.id} • {order.items} items • {order.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${order.total}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>

          {/* Business Performance */}
          <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Business Performance</h3>
                <Link href="/admin/analytics">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Full Report
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Revenue Growth</p>
                      <p className="text-xs text-green-700">Compared to last month</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">+12.5%</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Customer Retention</p>
                      <p className="text-xs text-blue-700">Monthly retention rate</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-blue-600">87.3%</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Avg Processing Time</p>
                      <p className="text-xs text-purple-700">Order completion time</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-purple-600">2.4 hrs</p>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-900">Order Completion</p>
                      <p className="text-xs text-orange-700">Success rate</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-orange-600">98.7%</p>
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Marketing & Programs */}
        <PermissionGate permissions={[{ module: 'tenant_coupons', action: 'view' }]}>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Marketing & Programs</h3>
              <Link href="/admin/programs">
                <Button variant="ghost" size="sm">
                  View All Programs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Active</span>
                </div>
                <h4 className="font-medium text-gray-900">Summer Sale</h4>
                <p className="text-sm text-gray-600">20% off all services</p>
                <p className="text-xs text-gray-500 mt-1">47 uses this month</p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">Active</span>
                </div>
                <h4 className="font-medium text-gray-900">Referral Program</h4>
                <p className="text-sm text-gray-600">$10 for each referral</p>
                <p className="text-xs text-gray-500 mt-1">23 referrals this month</p>
              </div>

              <div className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">Scheduled</span>
                </div>
                <h4 className="font-medium text-gray-900">Back to School</h4>
                <p className="text-sm text-gray-600">15% off uniforms</p>
                <p className="text-xs text-gray-500 mt-1">Starts next week</p>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </DashboardWrapper>
  )
}