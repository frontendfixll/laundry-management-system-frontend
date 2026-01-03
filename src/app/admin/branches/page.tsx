'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { 
  Building2, 
  Search, 
  MapPin,
  Phone,
  Mail,
  Users,
  Package,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { adminApi } from '@/lib/adminApi'

const ITEMS_PER_PAGE = 8

interface Branch {
  _id: string
  name: string
  code: string
  address: {
    addressLine1?: string
    street?: string
    city: string
    state: string
    pincode: string
  }
  contact: {
    phone: string
    email: string
  }
  manager?: {
    _id: string
    name: string
    phone: string
    email: string
  }
  isActive: boolean
  status: string
  capacity: {
    maxOrdersPerDay: number
    currentLoad?: number
  }
  metrics?: {
    totalOrders: number
    efficiency: number
  }
  staff?: any[]
  staffCount?: number
  utilizationRate?: number
  createdAt: string
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: ITEMS_PER_PAGE
  })
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchBranches()
  }, [search, statusFilter, pagination.current])

  const handlePageChange = (page: number) => {
    setPagination(p => ({ ...p, current: page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.getBranchesWithStats({
        page: pagination.current,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        status: statusFilter || undefined
      })

      if (response.success) {
        setBranches(response.data.branches || [])
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch branches')
      console.error('Fetch branches error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (branch: Branch) => {
    setSelectedBranch(branch)
    setShowDetailModal(true)
  }

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600 bg-red-50'
    if (utilization >= 70) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats
  const totalBranches = branches.length
  const activeBranches = branches.filter(b => b.isActive && b.status === 'active').length
  const totalCapacity = branches.reduce((sum, b) => sum + (b.capacity?.maxOrdersPerDay || 0), 0)
  const totalStaff = branches.reduce((sum, b) => sum + (b.staffCount || b.staff?.length || 0), 0)

  if (loading && branches.length === 0) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Branch Management</h1>
          <p className="text-gray-600">Monitor and manage all branch operations</p>
        </div>
        <Button onClick={fetchBranches} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Branches</p>
            <p className="text-3xl font-bold">{pagination.total || totalBranches}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Active Branches</p>
            <p className="text-3xl font-bold">{activeBranches}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">Total Capacity</p>
            <p className="text-3xl font-bold">{totalCapacity}/day</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">Total Staff</p>
            <p className="text-3xl font-bold">{totalStaff}</p>
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
              placeholder="Search by name, code, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Branches List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Branches ({pagination.total || branches.length})</h2>
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
          {branches.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Found</h3>
              <p className="text-gray-600">No branches match your search criteria.</p>
            </div>
          ) : (
            branches.map((branch) => (
              <div key={branch._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      branch.isActive && branch.status === 'active' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                        : 'bg-gray-400'
                    }`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{branch.code}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(branch.status, branch.isActive)}`}>
                          {branch.status === 'active' && branch.isActive ? 'Active' : branch.status || 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{branch.address?.city}, {branch.address?.pincode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{branch.contact?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{branch.contact?.email || 'N/A'}</span>
                        </div>
                        {branch.manager && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{branch.manager.name}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className={`px-3 py-1 rounded-full ${getCapacityColor(branch.utilizationRate || 0)}`}>
                          Capacity: {branch.capacity?.maxOrdersPerDay || 0}/day
                        </div>
                        <div className="text-gray-600">
                          <Package className="w-4 h-4 inline mr-1" />
                          {branch.metrics?.totalOrders || 0} total orders
                        </div>
                        <div className="text-blue-600">
                          <Users className="w-4 h-4 inline mr-1" />
                          {branch.staffCount || branch.staff?.length || 0} staff
                        </div>
                        {branch.metrics?.efficiency !== undefined && (
                          <div className="text-green-600">
                            Efficiency: {branch.metrics.efficiency}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(branch)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
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
            itemName="branches"
          />
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Branch Details</h3>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{selectedBranch.name}</h4>
                  <p className="text-gray-500">Code: {selectedBranch.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-semibold ${selectedBranch.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedBranch.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-semibold">{selectedBranch.capacity?.maxOrdersPerDay || 0} orders/day</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="font-semibold">{selectedBranch.metrics?.totalOrders || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Staff Count</p>
                  <p className="font-semibold">{selectedBranch.staffCount || selectedBranch.staff?.length || 0}</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Address</h5>
                <p className="text-gray-600">
                  {selectedBranch.address?.addressLine1 || selectedBranch.address?.street}<br />
                  {selectedBranch.address?.city}, {selectedBranch.address?.state} - {selectedBranch.address?.pincode}
                </p>
              </div>

              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Contact</h5>
                <p className="text-gray-600">
                  <Phone className="w-4 h-4 inline mr-2" />{selectedBranch.contact?.phone || 'N/A'}<br />
                  <Mail className="w-4 h-4 inline mr-2" />{selectedBranch.contact?.email || 'N/A'}
                </p>
              </div>

              {selectedBranch.manager && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Manager</h5>
                  <p className="text-gray-600">
                    {selectedBranch.manager.name}<br />
                    <span className="text-sm">{selectedBranch.manager.email}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <Button 
                onClick={() => setShowDetailModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
