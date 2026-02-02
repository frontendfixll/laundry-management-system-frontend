'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { DashboardWrapper } from './RoleBasedDashboard'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowRight,
  Eye,
  Receipt,
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/hooks/usePermissions'

interface FinanceMetrics {
  totalEarnings: number
  monthlyEarnings: number
  pendingPayouts: number
  completedTransactions: number
  refundRequests: number
  outstandingInvoices: number
  averageOrderValue: number
  paymentSuccessRate: number
}

interface RecentTransaction {
  id: string
  type: 'payment' | 'refund' | 'payout'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  customerName?: string
  description: string
  timestamp: string
}

interface RefundRequest {
  id: string
  orderNumber: string
  customerName: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  requestDate: string
}

export function TenantFinanceManagerDashboard() {
  const { hasPermission } = usePermissions()
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        // Mock data - replace with actual API calls
        setMetrics({
          totalEarnings: 284739,
          monthlyEarnings: 28473,
          pendingPayouts: 12450,
          completedTransactions: 1247,
          refundRequests: 8,
          outstandingInvoices: 3,
          averageOrderValue: 45.67,
          paymentSuccessRate: 98.7
        })

        setRecentTransactions([
          {
            id: 'TXN-001',
            type: 'payment',
            amount: 67.50,
            status: 'completed',
            customerName: 'John Smith',
            description: 'Order payment - ORD-001',
            timestamp: '5 minutes ago'
          },
          {
            id: 'TXN-002',
            type: 'refund',
            amount: -42.00,
            status: 'pending',
            customerName: 'Sarah Johnson',
            description: 'Refund request - ORD-002',
            timestamp: '15 minutes ago'
          },
          {
            id: 'TXN-003',
            type: 'payout',
            amount: 1250.00,
            status: 'completed',
            description: 'Weekly payout to business account',
            timestamp: '1 hour ago'
          },
          {
            id: 'TXN-004',
            type: 'payment',
            amount: 89.25,
            status: 'failed',
            customerName: 'Mike Davis',
            description: 'Payment failed - ORD-003',
            timestamp: '2 hours ago'
          }
        ])

        setRefundRequests([
          {
            id: 'REF-001',
            orderNumber: 'ORD-002',
            customerName: 'Sarah Johnson',
            amount: 42.00,
            reason: 'Service not satisfactory',
            status: 'pending',
            requestDate: '2024-01-23'
          },
          {
            id: 'REF-002',
            orderNumber: 'ORD-005',
            customerName: 'Mike Wilson',
            amount: 35.50,
            reason: 'Damaged items',
            status: 'approved',
            requestDate: '2024-01-22'
          },
          {
            id: 'REF-003',
            orderNumber: 'ORD-008',
            customerName: 'Lisa Chen',
            amount: 28.75,
            reason: 'Late delivery',
            status: 'processed',
            requestDate: '2024-01-21'
          }
        ])
      } catch (error) {
        console.error('Error fetching finance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFinanceData()
  }, [])

  if (loading) {
    return (
      <DashboardWrapper title="Finance Overview" subtitle="Finance Manager Dashboard" roleColor="green">
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

  const getTransactionTypeColor = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'refund':
        return 'bg-red-100 text-red-800'
      case 'payout':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionStatusColor = (status: RecentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRefundStatusColor = (status: RefundRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'processed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTransactionIcon = (type: RecentTransaction['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4" />
      case 'refund':
        return <RefreshCw className="w-4 h-4" />
      case 'payout':
        return <Wallet className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  return (
    <DashboardWrapper title="Finance Overview" subtitle="Finance Manager Dashboard" roleColor="green">
      <div className="space-y-8">
        {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <PermissionGate permissions={[{ module: 'payments_earnings', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${metrics?.totalEarnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +${metrics?.monthlyEarnings.toLocaleString()} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'payments_earnings', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${metrics?.pendingPayouts.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {metrics?.completedTransactions} transactions
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'refund_requests', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Refund Requests</p>
                  <p className="text-3xl font-bold text-gray-900">{metrics?.refundRequests}</p>
                  <p className="text-sm text-orange-600 mt-1">
                    {metrics?.outstandingInvoices} outstanding invoices
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </PermissionGate>

          <PermissionGate permissions={[{ module: 'payments_earnings', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ${metrics?.averageOrderValue}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    {metrics?.paymentSuccessRate}% success rate
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </PermissionGate>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PermissionGate permissions={[{ module: 'refund_requests', action: 'create' }]}>
              <Link href="/admin/finance/refunds">
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Process Refunds
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
              <Link href="/admin/finance/reports">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Financial Reports
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'invoices', action: 'view' }]}>
              <Link href="/admin/finance/invoices">
                <Button className="w-full justify-start" variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  View Invoices
                </Button>
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[{ module: 'reports_analytics', action: 'export' }]}>
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <PermissionGate permissions={[{ module: 'payments_earnings', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Link href="/admin/finance/transactions">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        {transaction.customerName && (
                          <p className="text-xs text-gray-600">{transaction.customerName}</p>
                        )}
                        <p className="text-xs text-gray-500">{transaction.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTransactionStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PermissionGate>

          {/* Refund Requests */}
          <PermissionGate permissions={[{ module: 'refund_requests', action: 'view' }]}>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Refund Requests</h3>
                <Link href="/admin/finance/refunds">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {refundRequests.map((refund) => (
                  <div key={refund.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{refund.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getRefundStatusColor(refund.status)}`}>
                            {refund.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">{refund.customerName}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          Order: {refund.orderNumber} • {refund.requestDate}
                        </p>
                        <p className="text-xs text-gray-500">{refund.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          ${refund.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {refund.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm" className="flex-1">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Reject
                        </Button>
                      </div>
                    )}
                    {refund.status === 'approved' && (
                      <div className="mt-3">
                        <Button size="sm" className="w-full">
                          Process Refund
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
        <PermissionGate permissions={[{ module: 'reports_analytics', action: 'view' }]}>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  This Month
                </Button>
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-900">Revenue Growth</p>
                    <p className="text-2xl font-bold text-green-600">+15.2%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Payment Success</p>
                    <p className="text-2xl font-bold text-blue-600">98.7%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Refund Rate</p>
                    <p className="text-2xl font-bold text-purple-600">2.1%</p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-900">Outstanding</p>
                    <p className="text-2xl font-bold text-orange-600">$2.4K</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </PermissionGate>
      </div>
    </DashboardWrapper>
  )
}