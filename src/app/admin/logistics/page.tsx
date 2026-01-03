'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { 
  Truck, 
  Search, 
  MapPin,
  Phone,
  User,
  Package,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Star,
  Clock,
  TrendingUp,
  Mail,
  Calendar,
  X
} from 'lucide-react'

const ITEMS_PER_PAGE = 8

interface CoverageArea {
  pincode: string
  area?: string
  isActive?: boolean
  _id?: string
}

interface LogisticsPartner {
  _id: string
  companyName: string
  contactPerson: {
    name: string
    phone: string
    email?: string
  }
  coverageAreas: CoverageArea[]
  isActive: boolean
  sla: {
    pickupTime: number
    deliveryTime: number
  }
  performance: {
    rating: number
    totalDeliveries: number
    onTimeRate: number
    activeOrders: number
  }
  rateCard?: {
    perOrder: number
    perKm: number
    flatRate: number
  }
  createdAt: string
}

export default function AdminLogisticsPage() {
  const [partners, setPartners] = useState<LogisticsPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPartner, setSelectedPartner] = useState<LogisticsPartner | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const authData = localStorage.getItem('laundry-auth')
      let token = null
      if (authData) {
        const parsed = JSON.parse(authData)
        // Zustand persist wraps data in 'state' object
        token = parsed.state?.token || parsed.token
      }

      const response = await fetch(`${API_URL}/admin/logistics-partners`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      })

      if (response.ok) {
        const data = await response.json()
        const partnersData = data.data?.partners || data.partners || []
        setPartners(partnersData)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch logistics partners')
        setPartners([])
      }
    } catch (err) {
      setError('Failed to connect to server. Please check if backend is running.')
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.companyName.toLowerCase().includes(search.toLowerCase()) ||
                         partner.contactPerson.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && partner.isActive) ||
                         (statusFilter === 'inactive' && !partner.isActive)
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE)
  const paginatedPartners = filteredPartners.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewDetails = (partner: LogisticsPartner) => {
    setSelectedPartner(partner)
    setShowModal(true)
  }

  // Helper function to get pincode from coverage area
  const getPincode = (area: CoverageArea): string => {
    return area.pincode || 'N/A'
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-yellow-600'
    return 'text-orange-600'
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
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
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Logistics Partners</h1>
          <p className="text-gray-600">Manage delivery and pickup partners</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Partners</p>
            <p className="text-3xl font-bold">{partners.length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Active Partners</p>
            <p className="text-3xl font-bold">{partners.filter(p => p.isActive).length}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">Active Orders</p>
            <p className="text-3xl font-bold">{partners.reduce((sum, p) => sum + (p.performance?.activeOrders || 0), 0)}</p>
          </div>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">Avg Rating</p>
            <p className="text-3xl font-bold">{(partners.reduce((sum, p) => sum + (p.performance?.rating || 0), 0) / partners.length || 0).toFixed(1)}</p>
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
              placeholder="Search by company name or contact..."
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
          </select>
        </div>
      </div>

      {/* Partners List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Partners ({filteredPartners.length})</h2>
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
          {filteredPartners.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Partners Found</h3>
              <p className="text-gray-600">No logistics partners match your search criteria.</p>
            </div>
          ) : (
            paginatedPartners.map((partner) => (
              <div key={partner._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      partner.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'
                    }`}>
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{partner.companyName}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          partner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {partner.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`flex items-center ${getRatingColor(partner.performance.rating)}`}>
                          <Star className="w-4 h-4 mr-1 fill-current" />
                          {partner.performance.rating}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {partner.contactPerson.name}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {partner.contactPerson.phone}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          SLA: {partner.sla.pickupTime}h / {partner.sla.deliveryTime}h
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {partner.coverageAreas.length} areas
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="text-blue-600">
                          <Package className="w-4 h-4 inline mr-1" />
                          {partner.performance.totalDeliveries} deliveries
                        </div>
                        <div className="text-green-600">
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          {partner.performance.onTimeRate}% on-time
                        </div>
                        <div className="text-purple-600">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {partner.performance.activeOrders} active
                        </div>
                        <div className="text-gray-500">
                          Rate: ₹{partner.rateCard?.flatRate || 50}/order
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(partner)}
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
        {filteredPartners.length > ITEMS_PER_PAGE && (
          <Pagination
            current={currentPage}
            pages={totalPages}
            total={filteredPartners.length}
            limit={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            itemName="partners"
          />
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedPartner.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'
                }`}>
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedPartner.companyName}</h2>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPartner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPartner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{selectedPartner.contactPerson.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedPartner.contactPerson.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedPartner.contactPerson.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{selectedPartner.performance.rating}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{selectedPartner.performance.totalDeliveries}</p>
                    <p className="text-xs text-gray-500">Total Deliveries</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{selectedPartner.performance.onTimeRate}%</p>
                    <p className="text-xs text-gray-500">On-Time Rate</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{selectedPartner.performance.activeOrders}</p>
                    <p className="text-xs text-gray-500">Active Orders</p>
                  </div>
                </div>
              </div>

              {/* SLA & Rate Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">SLA Commitments</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pickup Time</span>
                      <span className="font-medium">{selectedPartner.sla.pickupTime} hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Delivery Time</span>
                      <span className="font-medium">{selectedPartner.sla.deliveryTime} hours</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Rate Card</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Flat Rate</span>
                      <span className="font-medium">₹{selectedPartner.rateCard?.flatRate || 50}/order</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Per Km Rate</span>
                      <span className="font-medium">₹{selectedPartner.rateCard?.perKm || 0}/km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Partner Since</span>
                      <span className="font-medium">{new Date(selectedPartner.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coverage Areas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Coverage Areas ({selectedPartner.coverageAreas.length} pincodes)</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.coverageAreas.map((area, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {getPincode(area)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
