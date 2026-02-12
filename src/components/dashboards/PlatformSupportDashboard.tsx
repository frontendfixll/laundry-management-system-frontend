'use client'

import { usePermissions } from '@/hooks/usePermissions'
import { PermissionGate } from '@/hooks/usePermissions'
import { usePlatformSupportDashboard } from '@/hooks/useDashboardData'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  Users,
  Building2,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  Eye,
  UserCheck,
  Activity,
  ArrowRight,
  RefreshCw,
  Filter,
  HelpCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PlatformSupportDashboard() {
  const { metrics, tickets, tenantStatuses, loading, refetch } = usePlatformSupportDashboard()

  if (loading) {
    return (
      <DashboardWrapper title="Support Overview" subtitle="Platform Support Dashboard" roleColor="blue">
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardWrapper title="Support Overview" subtitle="Platform Support Dashboard" roleColor="blue">
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Open Tickets</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{metrics?.openTickets || 0}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {metrics?.totalTickets || 0} total tickets
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Avg Response</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{metrics?.avgResponseTime || 0}h</p>
                <p className="text-xs text-green-600 mt-0.5">
                  {metrics?.resolvedToday || 0} resolved today
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <PermissionGate permissions={[{ module: 'tenant_crud', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Active Tenants</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{metrics?.activeTenants || 0}</p>
                  <p className="text-xs text-purple-600 mt-0.5">
                    {metrics?.totalUsers?.toLocaleString() || 0} users
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Critical</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{metrics?.criticalIssues || 0}</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  {metrics?.satisfactionScore || 0}/5.0 score
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Support Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/support/tickets/search">
              <Button className="w-full justify-start" variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search Tickets
              </Button>
            </Link>

            <PermissionGate permissions={[{ module: 'user_impersonation', action: 'create' }]}>
              <Link href="/support/impersonate">
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="w-4 h-4 mr-2" />
                  User Impersonation
                </Button>
              </Link>
            </PermissionGate>

            <Link href="/support/knowledge-base">
              <Button className="w-full justify-start" variant="outline">
                <HelpCircle className="w-4 h-4 mr-2" />
                Knowledge Base
              </Button>
            </Link>

            <Link href="/support/escalate">
              <Button className="w-full justify-start" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Escalate Issue
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Support Tickets */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Recent Tickets</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Link href="/support/tickets">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{ticket.subject}</p>
                        <p className="text-xs text-gray-600">
                          {ticket.tenantName} • Created {ticket.createdAt}
                        </p>
                        {ticket.assignedTo && (
                          <p className="text-xs text-blue-600 mt-1">
                            Assigned to {ticket.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Last update: {ticket.lastUpdate}</p>
                      <Link href={`/support/tickets/${ticket.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No recent tickets</p>
                </div>
              )}
            </div>
          </div>

          {/* Tenant Status Monitor */}
          <PermissionGate permissions={[{ module: 'tenant_crud', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Tenant Status</h3>
                <Button variant="ghost" size="sm" onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {tenantStatuses && tenantStatuses.length > 0 ? (
                  tenantStatuses.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tenant.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTenantStatusColor(tenant.status)}`}>
                              {tenant.status}
                            </span>
                            <span className="text-xs text-gray-500">{tenant.plan}</span>
                          </div>
                          <p className="text-xs text-gray-500">Last activity: {tenant.lastActivity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tenant.issues > 0 && (
                          <div className="flex items-center space-x-1 mb-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-600">{tenant.issues} issues</span>
                          </div>
                        )}
                        <Link href={`/support/tenants/${tenant.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No tenant data available</p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/support/tenants" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                  View all tenants
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Support Performance */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Support Performance</h3>
            <Link href="/support/analytics">
              <Button variant="ghost" size="sm">
                View Analytics
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Resolution Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.totalTickets ? `${Math.round(((metrics?.resolvedTickets ?? 0) / metrics.totalTickets) * 100)}%` : 'N/A'}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">First Response</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics?.avgResponseTime != null ? `${metrics.avgResponseTime}h` : 'N/A'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Customer Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {metrics?.satisfactionScore != null ? `${metrics.satisfactionScore}/5` : 'N/A'}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900">Escalation Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {metrics?.totalTickets ? `${Math.round(((metrics?.escalatedTickets ?? 0) / metrics.totalTickets) * 100)}%` : 'N/A'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}