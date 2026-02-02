'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Bell,
  Eye,
  Edit,
  ArrowRight,
  RefreshCw,
  Timer,
  Target,
  Award,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/hooks/usePermissions'

interface StaffMetrics {
  assignedOrders: number
  completedToday: number
  pendingTasks: number
  completionRate: number
  averageTime: number
  customerRating: number
  totalCompleted: number
  weeklyTarget: number
}

interface AssignedTask {
  id: string
  orderNumber: string
  customerName: string
  taskType: string
  priority: 'normal' | 'high' | 'urgent'
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold'
  dueTime: string
  estimatedDuration: string
  notes?: string
}

interface Notification {
  id: string
  type: 'task_assigned' | 'deadline_reminder' | 'status_update' | 'message'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export function TenantStaffDashboard() {
  const { hasPermission } = usePermissions()
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null)
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Mock data - replace with actual API calls
        setMetrics({
          assignedOrders: 8,
          completedToday: 5,
          pendingTasks: 3,
          completionRate: 94.2,
          averageTime: 2.3,
          customerRating: 4.8,
          totalCompleted: 247,
          weeklyTarget: 35
        })

        setAssignedTasks([
          {
            id: 'TASK-001',
            orderNumber: 'ORD-001',
            customerName: 'John Smith',
            taskType: 'Washing & Folding',
            priority: 'high',
            status: 'in_progress',
            dueTime: '2:30 PM',
            estimatedDuration: '45 mins',
            notes: 'Customer requested extra care for delicate items'
          },
          {
            id: 'TASK-002',
            orderNumber: 'ORD-002',
            customerName: 'Sarah Johnson',
            taskType: 'Dry Cleaning',
            priority: 'normal',
            status: 'assigned',
            dueTime: '3:00 PM',
            estimatedDuration: '30 mins'
          },
          {
            id: 'TASK-003',
            orderNumber: 'ORD-003',
            customerName: 'Mike Davis',
            taskType: 'Ironing',
            priority: 'urgent',
            status: 'assigned',
            dueTime: '1:45 PM',
            estimatedDuration: '20 mins',
            notes: 'Rush order - customer picking up early'
          },
          {
            id: 'TASK-004',
            orderNumber: 'ORD-004',
            customerName: 'Emily Wilson',
            taskType: 'Washing & Folding',
            priority: 'normal',
            status: 'completed',
            dueTime: '12:00 PM',
            estimatedDuration: '40 mins'
          }
        ])

        setNotifications([
          {
            id: 'NOT-001',
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: 'You have been assigned order ORD-005 for dry cleaning',
            timestamp: '5 minutes ago',
            read: false
          },
          {
            id: 'NOT-002',
            type: 'deadline_reminder',
            title: 'Deadline Reminder',
            message: 'Order ORD-003 is due in 30 minutes',
            timestamp: '15 minutes ago',
            read: false
          },
          {
            id: 'NOT-003',
            type: 'status_update',
            title: 'Order Completed',
            message: 'Order ORD-004 has been marked as completed',
            timestamp: '1 hour ago',
            read: true
          },
          {
            id: 'NOT-004',
            type: 'message',
            title: 'Message from Manager',
            message: 'Great work on maintaining quality standards!',
            timestamp: '2 hours ago',
            read: true
          }
        ])
      } catch (error) {
        console.error('Error fetching staff data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaffData()
  }, [])

  if (loading) {
    return (
      <DashboardWrapper title="My Tasks" subtitle="Staff Dashboard" roleColor="indigo">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 h-28"></div>
            ))}
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  const getTaskStatusColor = (status: AssignedTask['status']) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'on_hold':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: AssignedTask['priority']) => {
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

  const getTaskStatusIcon = (status: AssignedTask['status']) => {
    switch (status) {
      case 'assigned':
        return <Clock className="w-4 h-4" />
      case 'in_progress':
        return <Package className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'on_hold':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'deadline_reminder':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'status_update':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const progressPercentage = metrics ? (metrics.completedToday / metrics.weeklyTarget) * 100 : 0

  return (
    <DashboardWrapper title="My Tasks" subtitle="Staff Dashboard" roleColor="indigo">
      <div className="space-y-8">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Assigned Orders</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.assignedOrders}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {metrics?.completedToday} completed today
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pending Tasks</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.pendingTasks}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {metrics?.averageTime}h avg time
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rate</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.completionRate}%</p>
                <p className="text-xs text-green-600 mt-1">
                  {metrics?.totalCompleted} total
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rating</p>
                <p className="text-xl font-bold text-gray-900">{metrics?.customerRating}/5</p>
                <p className="text-xs text-purple-600 mt-1">
                  Excellent
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <span className="text-sm text-gray-600">
              {metrics?.completedToday} / {metrics?.weeklyTarget} orders
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Target: {metrics?.weeklyTarget} orders this week</span>
            <span>{progressPercentage.toFixed(1)}% complete</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'orders_update_status', action: 'edit' }]}>
              <Link href="/staff/tasks/update">
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </Link>
            </PermissionGate>

            <Link href="/staff/tasks/assigned">
              <Button className="w-full justify-start" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Tasks
              </Button>
            </Link>

            <Link href="/staff/schedule">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                My Schedule
              </Button>
            </Link>

            <Link href="/staff/profile">
              <Button className="w-full justify-start" variant="outline">
                <User className="w-4 h-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Tasks */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              {assignedTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{task.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getTaskStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{task.customerName}</p>
                      <p className="text-sm text-gray-600 mb-2">{task.taskType}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Due: {task.dueTime}
                        </span>
                        <span className="flex items-center">
                          <Timer className="w-3 h-3 mr-1" />
                          Est: {task.estimatedDuration}
                        </span>
                      </div>
                      {task.notes && (
                        <p className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                          Note: {task.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      {getTaskStatusIcon(task.status)}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    {task.status === 'assigned' && (
                      <Button size="sm" className="flex-1">
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in_progress' && (
                      <>
                        <Button size="sm" className="flex-1">
                          Complete
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Add Note
                        </Button>
                      </>
                    )}
                    {task.status === 'completed' && (
                      <Button size="sm" variant="outline" className="w-full" disabled>
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg border transition-shadow ${notification.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50 hover:shadow-md'
                  }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link href="/staff/notifications" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all notifications
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Summary</h3>
            <Link href="/staff/performance">
              <Button variant="ghost" size="sm">
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Quality Score</p>
                  <p className="text-2xl font-bold text-green-600">4.8/5</p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Efficiency</p>
                  <p className="text-2xl font-bold text-blue-600">94.2%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">On-Time Rate</p>
                  <p className="text-2xl font-bold text-purple-600">96.7%</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">This Week</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics?.completedToday}</p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}