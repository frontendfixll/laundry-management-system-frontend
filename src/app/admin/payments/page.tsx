'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  CreditCard, 
  Search, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Package,
  ArrowDownRight,
  Download,
  RefreshCw,
  X,
  Phone,
  Mail,
  ArrowUpRight
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

const ITEMS_PER_PAGE = 8

interface Payment {
  _id: string
  transactionId: string
  orderId: string
  orderNumber: string
  customer: {
    name: string
    email: string
    phone: string
  }
  amount: number
  method: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  createdAt: string
}

interface PaymentStats {
  completed: { amount: number; count: number }
  pending: { amount: number; count: number }
  todayRevenue: number
  monthlyRevenue: number
}

export default function AdminPaymentsPage() {
  const { hasPermission } = usePermissions('financial')
  const canExport = hasPermission('reports', 'export')
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: ITEMS_PER_PAGE })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [statusFilter, methodFilter])

  const handlePageChange = (page: number) => {
    setPagination(p => ({ ...p, current: page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Trigger fetch when page changes
  useEffect(() => {
    if (pagination.current > 1 || payments.length > 0) {
      fetchPayments()
    }
  }, [pagination.current])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        page: pagination.current,
        limit: ITEMS_PER_PAGE
      }
      if (statusFilter) params.status = statusFilter
      if (methodFilter) params.paymentMethod = methodFilter
      if (search) params.search = search

      const response = await adminApi.getPayments(params)
      
      if (response.success) {
        setPayments(response.data.data || [])
        setPagination(response.data.pagination || { current: 1, pages: 1, total: 0, limit: ITEMS_PER_PAGE })
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminApi.getPaymentStats()
      if (response.success) {
        setStats(response.data.stats)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchPayments()
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'failed': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'refunded': { color: 'bg-purple-100 text-purple-800', icon: ArrowDownRight }
    }
    const { color, icon: Icon } = config[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'upi': return '📱'
      case 'card': return '💳'
      case 'cash': return '💵'
      case 'cod': return '💵'
      case 'net banking': return '🏦'
      case 'online': return '📱'
      default: return '💰'
    }
  }

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-600">Track and manage all payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchPayments(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canExport && (
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Transactions</p>
            <p className="text-3xl font-bold">{((stats?.completed?.count || 0) + (stats?.pending?.count || 0)).toLocaleString()}</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Completed</p>
            <p className="text-3xl font-bold">₹{(stats?.completed?.amount || 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-1">{stats?.completed?.count || 0} transactions</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">Pending</p>
            <p className="text-3xl font-bold">₹{(stats?.pending?.amount || 0).toLocaleString()}</p>
            <p className="text-xs text-amber-200 mt-1">{stats?.pending?.count || 0} transactions</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">Today's Revenue</p>
            <p className="text-3xl font-bold">₹{(stats?.todayRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-purple-200 mt-1">Monthly: ₹{(stats?.monthlyRevenue || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID, order number, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Methods</option>
            <option value="online">Online/UPI</option>
            <option value="cod">Cash on Delivery</option>
          </select>
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
            Search
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Transactions ({pagination.total})</h2>
        </div>

        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-600">No payments match your search criteria.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div 
                key={payment._id} 
                className="group p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white cursor-pointer transition-all duration-300"
                onClick={() => { setSelectedPayment(payment); setShowDetailModal(true); }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg ${
                      payment.status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30' :
                      payment.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30' :
                      payment.status === 'failed' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30' :
                      'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30'
                    }`}>
                      {getMethodIcon(payment.method)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{payment.transactionId}</h3>
                        {getStatusBadge(payment.status)}
                        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">{payment.method}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{payment.orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{payment.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{new Date(payment.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        payment.status === 'refunded' ? 'text-purple-600' : 
                        payment.status === 'completed' ? 'text-emerald-600' : 
                        payment.status === 'failed' ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {payment.status === 'refunded' ? '-' : ''}₹{payment.amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Pagination
            current={pagination.current}
            pages={pagination.pages}
            total={pagination.total}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="payments"
          />
        )}
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`p-4 text-white ${
              selectedPayment.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
              selectedPayment.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
              selectedPayment.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
              'bg-gradient-to-r from-purple-500 to-pink-600'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80">Transaction ID</p>
                  <h3 className="text-lg font-bold">{selectedPayment.transactionId}</h3>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-2xl font-bold">
                  {selectedPayment.status === 'refunded' ? '-' : ''}₹{selectedPayment.amount?.toLocaleString() || '0'}
                </p>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              {/* Order & Payment Info */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Order Number</p>
                    <p className="font-semibold text-gray-800">{selectedPayment.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Payment Method</p>
                    <p className="font-semibold text-gray-800">{getMethodIcon(selectedPayment.method)} {selectedPayment.method}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-800">{selectedPayment.customer?.name || 'N/A'}</span>
                  {selectedPayment.customer?.phone && (
                    <span className="text-gray-500 ml-auto">{selectedPayment.customer.phone}</span>
                  )}
                </div>
                {selectedPayment.customer?.email && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">{selectedPayment.customer.email}</p>
                )}
              </div>

              {/* Date & Time */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedPayment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedPayment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                onClick={() => window.location.href = `/admin/orders`}
              >
                View Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
