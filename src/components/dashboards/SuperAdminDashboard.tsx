'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useSuperAdminDashboard } from '@/hooks/useDashboardData'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Package,
  CreditCard,
  FileText,
  ArrowRight,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/hooks/usePermissions'

export function SuperAdminDashboard() {
  const { hasPermission } = usePermissions()
  const { metrics, recentActivities, systemAlerts, loading, error, refetch } = useSuperAdminDashboard('30d')

  if (loading) {
    return (
      <DashboardWrapper title="Platform Overview" subtitle="Super Admin Dashboard" roleColor="red">
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

  if (error) {
    return (
      <DashboardWrapper title="Platform Overview" subtitle="Super Admin Dashboard" roleColor="red">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardWrapper>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tenant_created':
        return <Building2 className="w-4 h-4 text-green-600" />
      case 'subscription_updated':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'payment_processed':
        return <CreditCard className="w-4 h-4 text-green-600" />
      case 'alert_triggered':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <DashboardWrapper title="Platform Overview" subtitle="Super Admin Dashboard" roleColor="red">
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGate permissions={[{ module: 'tenant_crud', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.totalTenants?.toLocaleString() || 0}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {metrics?.activeTenants || 0} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${metrics?.totalRevenue?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +${metrics?.monthlyRevenue?.toLocaleString() || 0} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'subscription_plans', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.activeSubscriptions || 0}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    {metrics?.totalOrders?.toLocaleString() || 0} total orders
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'audit_logs', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.platformUptime || 99.9}%</p>
                  <p className="text-sm text-red-600 mt-1">
                    {metrics?.systemAlerts || 0} active alerts
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'subscription_plans', action: 'view' }]}>
              <Link href="/superadmin/plans">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Plans
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
              <Link href="/superadmin/revenue">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Revenue Reports
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'platform_settings', action: 'view' }]}>
              <Link href="/superadmin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <PermissionGate permissions={[{ module: 'audit_logs', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <Button variant="ghost" size="sm" onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          {activity.severity && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full border ${getSeverityColor(activity.severity)}`}>
                              {activity.severity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/superadmin/audit" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  View all activity
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </PermissionGate>

          {/* System Alerts */}
          <PermissionGate permissions={[{ module: 'audit_logs', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {systemAlerts?.length || 0} active
                </span>
              </div>
              <div className="space-y-4">
                {systemAlerts && systemAlerts.length > 0 ? (
                  systemAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertLevelColor(alert.level)}`}>
                      <AlertTriangle className="w-5 h-5 text-current mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs mt-1">{alert.action}</p>
                        <p className="text-xs mt-1 opacity-75">{alert.timestamp}</p>
                      </div>
                      {alert.actionUrl && (
                        <Link href={alert.actionUrl}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No active alerts</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/superadmin/alerts" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  View all alerts
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </PermissionGate>
        </div>
      </div>
    </DashboardWrapper>
  )
}