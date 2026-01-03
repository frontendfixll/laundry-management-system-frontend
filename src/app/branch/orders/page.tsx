'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  IndianRupee,
  Play,
  Check,
  RefreshCw,
  Loader2,
  X,
  Zap,
  Download
} from 'lucide-react'
import { branchApi, centerAdminApi } from '@/lib/centerAdminApi'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  customer: { name: string; phone: string; email?: string; isVIP?: boolean }
  items: Array<{ serviceType: string; quantity: number; totalPrice: number; name?: string; category?: string }>
  status: string
  pricing: { total: number; subtotal: number }
  isExpress: boolean
  processedBy?: { _id: string; name: string }
  estimatedCompletionTime?: string
  specialInstructions?: string
  createdAt: string
}

interface Staff {
  _id: string
  name: string
  role: string
  isActive: boolean
}

export default function BranchOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [estimatedTime, setEstimatedTime] = useState('2')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState({ pending: 0, processing: 0, ready: 0, completed: 0 })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params: any = { page: pagination.page, limit: 20 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchTerm) params.search = searchTerm
      
      const response = await centerAdminApi.getOrders(params)
      if (response.success) {
        const ordersData = response.data.data || response.data.orders || []
        setOrders(ordersData)
        setPagination({
          page: response.data.page || 1,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || ordersData.length
        })
        
        // Calculate stats from all orders
        const allOrdersRes = await centerAdminApi.getOrders({ limit: 1000 })
        if (allOrdersRes.success) {
          const allOrders = allOrdersRes.data.data || allOrdersRes.data.orders || []
          setStats({
            pending: allOrders.filter((o: Order) => ['assigned_to_branch', 'picked'].includes(o.status)).length,
            processing: allOrders.filter((o: Order) => o.status === 'in_process').length,
            ready: allOrders.filter((o: Order) => o.status === 'ready').length,
            completed: allOrders.filter((o: Order) => o.status === 'delivered').length
          })
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const response = await centerAdminApi.getStaff()
      if (response.success) {
        setStaff(response.data.staff || [])
      }
    } catch (err: any) {
      console.error('Failed to load staff:', err)
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchStaff()
  }, [statusFilter, pagination.page])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchOrders()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned_to_branch':
      case 'picked': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'in_process': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'ready': return 'text-green-600 bg-green-50 border-green-200'
      case 'out_for_delivery': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'delivered': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'assigned_to_branch': 'Pending',
      'picked': 'Picked Up',
      'in_process': 'Processing',
      'ready': 'Ready',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered'
    }
    return statusMap[status] || status
  }

  const handleAssignStaff = (order: Order) => {
    setSelectedOrder(order)
    setSelectedStaffId('')
    setEstimatedTime('2')
    setShowAssignModal(true)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  const confirmAssignStaff = async () => {
    if (!selectedOrder || !selectedStaffId) {
      toast.error('Please select a staff member')
      return
    }
    
    try {
      setActionLoading('assign')
      const response = await centerAdminApi.assignStaffToOrder(selectedOrder._id, selectedStaffId, `${estimatedTime} hours`)
      if (response.success) {
        toast.success('Staff assigned successfully')
        setShowAssignModal(false)
        fetchOrders()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign staff')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(orderId)
      const response = await centerAdminApi.updateOrderStatus(orderId, newStatus)
      if (response.success) {
        toast.success(`Order marked as ${getStatusText(newStatus)}`)
        fetchOrders()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Assigned To', 'Date'].join(','),
      ...orders.map(order => [
        order.orderNumber,
        order.customer?.name || 'N/A',
        order.items?.length || 0,
        order.pricing?.total || 0,
        getStatusText(order.status),
        order.processedBy?.name || 'Unassigned',
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `branch-orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Orders exported successfully')
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Processing</h1>
          <p className="text-gray-600">Manage and process orders at your branch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Processing</p>
              <p className="text-2xl font-bold text-white">{stats.processing}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Ready</p>
              <p className="text-2xl font-bold text-white">{stats.ready}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="assigned_to_branch">Pending</option>
              <option value="in_process">Processing</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <Button onClick={handleSearch} className="bg-green-500 hover:bg-green-600">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Orders ({pagination.total || orders.length})
          </h2>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order._id} className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${order.isExpress ? 'border-l-red-500' : 'border-l-blue-500'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{order.orderNumber}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        {order.isExpress && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Zap className="w-3 h-3 mr-1" />Express
                          </span>
                        )}
                        {order.customer?.isVIP && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            VIP
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {order.customer?.name || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {order.items?.length || 0} items
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {order.pricing?.total?.toLocaleString() || 0}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {order.processedBy && (
                        <div className="text-sm text-gray-500 mb-1">
                          👤 Assigned to: {order.processedBy.name}
                          {order.estimatedCompletionTime && ` • Est: ${order.estimatedCompletionTime}`}
                        </div>
                      )}
                      
                      {order.specialInstructions && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                          📝 {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                    
                    {/* Status Change Dropdown - like admin */}
                    {['placed', 'assigned_to_branch', 'picked', 'in_process', 'ready', 'out_for_delivery'].includes(order.status) && (
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateStatus(order._id, e.target.value)
                          }
                        }}
                        disabled={actionLoading === order._id}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="">Change Status</option>
                        {order.status === 'placed' && (
                          <option value="in_process">Start Processing</option>
                        )}
                        {['assigned_to_branch', 'picked'].includes(order.status) && (
                          <option value="in_process">Start Processing</option>
                        )}
                        {order.status === 'in_process' && (
                          <option value="ready">Mark Ready</option>
                        )}
                        {order.status === 'ready' && (
                          <option value="out_for_delivery">Out for Delivery</option>
                        )}
                        {order.status === 'out_for_delivery' && (
                          <option value="delivered">Mark Delivered</option>
                        )}
                      </select>
                    )}
                    
                    {['assigned_to_branch', 'picked'].includes(order.status) && (
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleAssignStaff(order)}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                        Assign Staff
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assign Staff Member</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Order: {selectedOrder.orderNumber}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff Member
                </label>
                <select 
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose staff member...</option>
                  {staff.filter(s => s.isActive).map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Completion Time
                </label>
                <select 
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="24">24 hours</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={confirmAssignStaff}
                  disabled={actionLoading === 'assign'}
                >
                  {actionLoading === 'assign' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Assign & Start
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">{selectedOrder.orderNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
                {selectedOrder.isExpress && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Express</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Customer</h4>
                  <p className="text-gray-800">{selectedOrder.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.phone || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.email || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Pricing</h4>
                  <p className="text-gray-800">Subtotal: ₹{selectedOrder.pricing?.subtotal?.toLocaleString() || 0}</p>
                  <p className="text-lg font-bold text-green-600">Total: ₹{selectedOrder.pricing?.total?.toLocaleString() || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Items ({selectedOrder.items?.length || 0})</h4>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize">
                          {item.name || item.serviceType || 'Item'} 
                          {item.category && ` (${item.category})`}
                          {item.quantity > 1 && ` x${item.quantity}`}
                        </span>
                        <span>₹{(item.totalPrice || 0).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No item details available</p>
                  )}
                </div>
              </div>

              {selectedOrder.processedBy && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Assignment</h4>
                  <p className="text-gray-800">Assigned to: {selectedOrder.processedBy.name}</p>
                  {selectedOrder.estimatedCompletionTime && (
                    <p className="text-sm text-gray-600">Est. completion: {selectedOrder.estimatedCompletionTime}</p>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-500">
                Created: {new Date(selectedOrder.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
