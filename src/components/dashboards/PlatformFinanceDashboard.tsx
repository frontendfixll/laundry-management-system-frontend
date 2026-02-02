'use client'

import { useState, useEffect } from 'react'
import { usePermissions, PermissionGate } from '@/hooks/usePermissions'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  ArrowRight,
  Calendar,
  Building2,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FinanceMetrics {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayouts: number
  processedRefunds: number
  activeSubscriptions: number
  churnRate: number
  averageRevenuePer: number
  outstandingInvoices: number
}

interface RevenueData {
  month: string
  revenue: number
  growth: number
}

interface PayoutRequest {
  id: string
  tenantName: string
  amount: number
  requestDate: string
  status: 'pending' | 'approved' | 'processed' | 'rejected'
  dueDate: string
}

export function PlatformFinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true)

        // Try to fetch real financial data from the API
        const response = await fetch('/api/superadmin/financial/overview?timeframe=30d', {
          headers: {
            'Authorization': `Bearer ${(() => {
              const authStorage = localStorage.getItem('auth-storage');
              return authStorage ? JSON.parse(authStorage).state?.token || '' : '';
            })()}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Transform API data to match component interface
            const overview = data.data.overview
            setMetrics({
              totalRevenue: overview.totalRevenue || 0,
              monthlyRevenue: Math.round(overview.totalRevenue * 0.1), // Estimate monthly from total
              pendingPayouts: overview.settlementStats?.pending?.amount || 0,
              processedRefunds: overview.settlementStats?.completed?.amount || 0,
              activeSubscriptions: overview.totalTransactions || 0,
              churnRate: 3.2, // Mock data
              averageRevenuePer: overview.averageOrderValue || 0,
              outstandingInvoices: overview.pendingApprovals?.transactions || 0
            })

            // Transform revenue trend data
            if (data.data.revenueTrend) {
              const transformedRevenue = data.data.revenueTrend.map((item: any, index: number) => ({
                month: new Date(item._id).toLocaleDateString('en-US', { month: 'short' }),
                revenue: item.revenue,
                growth: index > 0 ? ((item.revenue - data.data.revenueTrend[index - 1].revenue) / data.data.revenueTrend[index - 1].revenue) * 100 : 0
              }))
              setRevenueData(transformedRevenue)
            }

            // Mock payout requests for now - TODO: implement real payout API
            setPayoutRequests([
              {
                id: 'PO-001',
                tenantName: 'CleanCo Laundry',
                amount: 12450.00,
                requestDate: '2024-01-20',
                status: 'pending',
                dueDate: '2024-01-25'
              }
            ])

            setLoading(false)
            return
          }
        }

        // Fallback to mock data if API fails
        throw new Error('API not available')

      } catch (error) {
        console.error('Error fetching finance data, using mock data:', error)
        // Use existing mock data as fallback
        setMetrics({
          totalRevenue: 2847392,
          monthlyRevenue: 284739,
          pendingPayouts: 45672,
          processedRefunds: 12450,
          activeSubscriptions: 1156,
          churnRate: 3.2,
          averageRevenuePer: 246.35,
          outstandingInvoices: 8
        })

        setRevenueData([
          { month: 'Jan', revenue: 245000, growth: 12.5 },
          { month: 'Feb', revenue: 267000, growth: 8.9 },
          { month: 'Mar', revenue: 289000, growth: 8.2 },
          { month: 'Apr', revenue: 312000, growth: 7.9 },
          { month: 'May', revenue: 298000, growth: -4.5 },
          { month: 'Jun', revenue: 334000, growth: 12.1 }
        ])

        setPayoutRequests([
          {
            id: 'PO-001',
            tenantName: 'CleanCo Laundry',
            amount: 12450.00,
            requestDate: '2024-01-20',
            status: 'pending',
            dueDate: '2024-01-25'
          },
          {
            id: 'PO-002',
            tenantName: 'LaundryMax Pro',
            amount: 8750.50,
            requestDate: '2024-01-19',
            status: 'approved',
            dueDate: '2024-01-24'
          },
          {
            id: 'PO-003',
            tenantName: 'Fresh & Clean',
            amount: 5680.25,
            requestDate: '2024-01-18',
            status: 'processed',
            dueDate: '2024-01-23'
          },
          {
            id: 'PO-004',
            tenantName: 'Sparkle Wash',
            amount: 3420.75,
            requestDate: '2024-01-17',
            status: 'pending',
            dueDate: '2024-01-22'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  if (loading) {
    return (
      <DashboardWrapper title="Financial Overview" subtitle="Platform Finance Dashboard" roleColor="green">
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

  const getPayoutStatusColor = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'processed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPayoutStatusIcon = (status: PayoutRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'processed':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <DashboardWrapper title="Financial Overview" subtitle="Platform Finance Dashboard" roleColor="green">
      <div className="space-y-8">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${metrics?.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-green-600 mt-0.5">
                    +${metrics?.monthlyRevenue.toLocaleString()} this month
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'refunds', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Pending Payouts</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${metrics?.pendingPayouts.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    ${metrics?.processedRefunds.toLocaleString()} refunds
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'subscription_plans', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Active Subscriptions</p>
                  <p className="text-xl font-bold text-gray-900">{metrics?.activeSubscriptions}</p>
                  <p className="text-[10px] text-purple-600 mt-0.5">
                    {metrics?.churnRate}% churn rate
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">ARPU</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${metrics?.averageRevenuePer}
                  </p>
                  <p className="text-[10px] text-orange-600 mt-0.5">
                    {metrics?.outstandingInvoices} outstanding
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'refunds', action: 'create' }]}>
              <Link href="/finance/payouts/process">
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Process Payouts
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'payments_revenue', action: 'export' }]}>
              <Link href="/finance/reports/revenue">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Revenue Reports
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'refunds', action: 'view' }]}>
              <Link href="/finance/refunds">
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Manage Refunds
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'payments_revenue', action: 'export' }]}>
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <Link href="/finance/analytics">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Full Analytics
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{data.month} 2024</p>
                        <p className="text-xs text-gray-600">${data.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {data.growth >= 0 ? '+' : ''}{data.growth}%
                      </span>
                      <div className="flex items-center mt-1">
                        <TrendingUp className={`w-4 h-4 ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>

          {/* Payout Requests */}
          <PermissionGate permissions={[{ module: 'refunds', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payout Requests</h3>
                <Link href="/finance/payouts">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {payoutRequests.map((payout) => (
                  <div key={payout.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{payout.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPayoutStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{payout.tenantName}</p>
                        <p className="text-xs text-gray-600">
                          Requested: {payout.requestDate} • Due: {payout.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ${payout.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center mt-1">
                          {getPayoutStatusIcon(payout.status)}
                        </div>
                      </div>
                    </div>
                    {payout.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" className="flex-1">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Financial Summary */}
        <PermissionGate permissions={[{ module: 'payments_revenue', action: 'view' }]}>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
              <Button variant="ghost" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900">Monthly Growth</h4>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-sm text-green-700">Compared to last month</p>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Payment Success Rate</h4>
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">98.7%</p>
                <p className="text-sm text-blue-700">Transaction success rate</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-purple-900">Outstanding Balance</h4>
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">$45.6K</p>
                <p className="text-sm text-purple-700">Pending collections</p>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </DashboardWrapper>
  )
}