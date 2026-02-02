'use client'

import { useState, useEffect } from 'react'
import { usePermissions, PermissionGate } from '@/hooks/usePermissions'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  RefreshCw,
  Eye,
  UserCheck,
  Calendar,
  ArrowRight,
  Bell,
  MapPin,
  Truck,
  Timer
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface OpsMetrics {
  assignedOrders: number
  completedToday: number
  pendingOrders: number
  delayedOrders: number
  activeStaff: number
  avgProcessingTime: number
  onTimeDelivery: number
  customerSatisfaction: number
}

interface AssignedOrder {
  id: string
  customerName: string
  items: number
  status: 'assigned' | 'in_progress' | 'ready' | 'delayed'
  priority: 'normal' | 'high' | 'urgent'
  assignedTo: string
  dueTime: string
  estimatedCompletion: string
}

interface StaffActivity {
  id: string
  name: string
  currentTask: string
  status: 'working' | 'break' | 'available'
  assignedOrders: number
  completedToday: number
  efficiency: number
}

export function TenantOpsManagerDashboard() {
  const { hasPermission } = usePermissions()
  const [metrics, setMetrics] = useState<OpsMetrics | null>(null)
  const [assignedOrders, setAssignedOrders] = useState<AssignedOrder[]>([])
  const [staffActivity, setStaffActivity] = useState<StaffActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        // Mock data - replace with actual API calls
        setMetrics({
          assignedOrders: 23,
          completedToday: 15,
          pendingOrders: 8,
          delayedOrders: 2,
          activeStaff: 6,
          avgProcessingTime: 2.4,
          onTimeDelivery: 94.2,
          customerSatisfaction: 4.7
        })

        setAssignedOrders([
          {
            id: 'ORD-001',
            customerName: 'John Smith',
            items: 5,
            status: 'in_progress',
            priority: 'high',
            assignedTo: 'Mike Wilson',
            dueTime: '2:30 PM',
            estimatedCompletion: '2:15 PM'
          },
          {
            id: 'ORD-002',
            customerName: 'Sarah Johnson',
            items: 3,
            status: 'assigned',
            priority: 'normal',
            assignedTo: 'Lisa Chen',
            dueTime: '3:00 PM',
            estimatedCompletion: '2:45 PM'
          },
          {
            id: 'ORD-003',
            customerName: 'Mike Davis',
            items: 8,
            status: 'delayed',
            priority: 'urgent',
            assignedTo: 'Tom Brown',
            dueTime: '1:00 PM',
            estimatedCompletion: '3:30 PM'
          },
          {
            id: 'ORD-004',
            customerName: 'Emily Wilson',
            items: 4,
            status: 'ready',
            priority: 'normal',
            assignedTo: 'Sarah Davis',
            dueTime: '4:00 PM',
            estimatedCompletion: 'Completed'
          }
        ])

        setStaffActivity([
          {
            id: '1',
            name: 'Mike Wilson',
            currentTask: 'Processing ORD-001',
            status: 'working',
            assignedOrders: 3,
            completedToday: 5,
            efficiency: 98.5
          },
          {
            id: '2',
            name: 'Lisa Chen',
            currentTask: 'Quality check',
            status: 'working',
            assignedOrders: 2,
            completedToday: 4,
            efficiency: 95.2
          },
          {
            id: '3',
            name: 'Tom Brown',
            currentTask: 'Handling delay',
            status: 'working',
            assignedOrders: 4,
            completedToday: 3,
            efficiency: 87.3
          },
          {
            id: '4',
            name: 'Sarah Davis',
            currentTask: 'Available for assignment',
            status: 'available',
            assignedOrders: 1,
            completedToday: 3,
            efficiency: 92.1
          }
        ])
      } catch (error) {
        console.error('Error fetching ops data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpsData()
  }, [])

  if (loading) {
    return (
      <DashboardWrapper title="Daily Operations" subtitle="Operations Manager Dashboard" roleColor="orange">
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

  const getOrderStatusColor = (status: AssignedOrder['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: AssignedOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStaffStatusColor = (status: StaffActivity['status']) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800'
      case 'break':
        return 'bg-yellow-100 text-yellow-800'
      case 'available':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusIcon = (status: AssignedOrder['status']) => {
    switch (status) {
      case 'assigned':
        return <UserCheck className="w-4 h-4" />
      case 'in_progress':
        return <Package className="w-4 h-4" />
      case 'ready':
        return <CheckCircle className="w-4 h-4" />
      case 'delayed':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <DashboardWrapper title="Daily Operations" subtitle="Operations Manager Dashboard" roleColor="orange">
      <div className="space-y-8">
        {/* Key Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGate permissions={[{ module: 'orders_update_status', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assigned Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.assignedOrders}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {metrics?.completedToday} completed today
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'orders_update_status', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.pendingOrders}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {metrics?.delayedOrders} delayed
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'assign_staff', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.activeStaff}</p>
                  <p className="text-sm text-purple-600 mt-1">
                    {metrics?.avgProcessingTime}h avg time
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.onTimeDelivery}%</p>
                <p className="text-sm text-green-600 mt-1">
                  {metrics?.customerSatisfaction}/5.0 satisfaction
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operations Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'assign_staff', action: 'create' }]}>
              <Link href="/admin/operations/assign">
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assign Orders
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'orders_update_status', action: 'edit' }]}>
              <Link href="/admin/operations/status">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </Link>
            </PermissionGate>

            <Link href="/admin/operations/delays">
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Handle Delays
              </Button>
            </Link>

            <Link href="/admin/operations/schedule">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View Schedule
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Orders */}
          <PermissionGate permissions={[{ module: 'orders_update_status', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assigned Orders</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Link href="/admin/orders/assigned">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {assignedOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{order.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getOrderStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(order.priority)}`}>
                            {order.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{order.customerName}</p>
                        <p className="text-xs text-gray-600">
                          {order.items} items • Assigned to {order.assignedTo}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Due: {order.dueTime}
                          </span>
                          <span className="flex items-center">
                            <Timer className="w-3 h-3 mr-1" />
                            ETA: {order.estimatedCompletion}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getOrderStatusIcon(order.status)}
                      </div>
                    </div>
                    {order.status === 'delayed' && (
                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                        <p className="text-xs text-red-700">Order is delayed. Immediate attention required.</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            Reassign
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Contact Customer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>

          {/* Staff Activity */}
          <PermissionGate permissions={[{ module: 'assign_staff', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Staff Activity</h3>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {staffActivity.map((staff) => (
                  <div key={staff.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{staff.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStaffStatusColor(staff.status)}`}>
                            {staff.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{staff.currentTask}</p>
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="block font-medium">Assigned</span>
                            <span>{staff.assignedOrders}</span>
                          </div>
                          <div>
                            <span className="block font-medium">Completed</span>
                            <span>{staff.completedToday}</span>
                          </div>
                          <div>
                            <span className="block font-medium">Efficiency</span>
                            <span className={staff.efficiency >= 95 ? 'text-green-600' : staff.efficiency >= 90 ? 'text-yellow-600' : 'text-red-600'}>
                              {staff.efficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {staff.status === 'available' && (
                      <div className="mt-3">
                        <Button size="sm" className="w-full">
                          Assign New Order
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/admin/staff/performance" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  View performance details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Operations Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Operations Alerts</h3>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Order ORD-003 is delayed</p>
                <p className="text-xs text-red-700 mt-1">Expected completion time exceeded by 2.5 hours</p>
                <p className="text-xs text-red-600 mt-1">5 minutes ago</p>
              </div>
              <Button size="sm" variant="outline">
                Handle
              </Button>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">High priority order due in 30 minutes</p>
                <p className="text-xs text-yellow-700 mt-1">ORD-001 needs immediate attention</p>
                <p className="text-xs text-yellow-600 mt-1">15 minutes ago</p>
              </div>
              <Button size="sm" variant="outline">
                Check
              </Button>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Staff member available for assignment</p>
                <p className="text-xs text-blue-700 mt-1">Sarah Davis is ready for new orders</p>
                <p className="text-xs text-blue-600 mt-1">30 minutes ago</p>
              </div>
              <Button size="sm" variant="outline">
                Assign
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}