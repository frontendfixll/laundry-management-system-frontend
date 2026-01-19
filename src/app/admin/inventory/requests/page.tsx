'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withRouteGuard } from '@/components/withRouteGuard'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    const data = localStorage.getItem('laundry-auth')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch {}
  return localStorage.getItem('token')
}

interface InventoryRequest {
  _id: string
  itemName: string
  category: string
  description: string
  estimatedQuantity: string
  unit: string
  urgency: 'low' | 'normal' | 'high'
  justification: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestDate: string
  approvedDate?: string
  rejectionReason?: string
  adminNotes?: string
  requestedBy: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
}

function InventoryRequestsPage() {
  const [requests, setRequests] = useState<InventoryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/admin/inventory/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setRequests(data.data.requests || [])
      }
    } catch (error: any) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Requests</h1>
          <p className="text-gray-600">Track your inventory item requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRequests}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs">
                ({tab.key === 'all' ? requests.length : requests.filter(r => r.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't made any inventory requests yet."
              : `No ${filter} requests found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.itemName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>
                  
                  {request.category && (
                    <p className="text-sm text-gray-500 mb-2">Category: {request.category}</p>
                  )}
                  
                  <p className="text-gray-700 mb-3">{request.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Quantity:</span>
                      <span className="ml-2">{request.estimatedQuantity} {request.unit}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Requested:</span>
                      <span className="ml-2">{new Date(request.requestDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Requested by:</span>
                      <span className="ml-2">{request.requestedBy.name}</span>
                    </div>
                  </div>

                  {request.justification && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-600 text-sm">Justification:</span>
                      <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                    </div>
                  )}

                  {request.status === 'approved' && request.approvedBy && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800 text-sm">Approved</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Approved by {request.approvedBy.name} on {new Date(request.approvedDate!).toLocaleDateString()}
                      </p>
                      {request.adminNotes && (
                        <p className="text-sm text-green-700 mt-1">
                          <span className="font-medium">Notes:</span> {request.adminNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800 text-sm">Rejected</span>
                      </div>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-700">
                          <span className="font-medium">Reason:</span> {request.rejectionReason}
                        </p>
                      )}
                      {request.adminNotes && (
                        <p className="text-sm text-red-700 mt-1">
                          <span className="font-medium">Notes:</span> {request.adminNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800 text-sm">Completed</span>
                      </div>
                      <p className="text-sm text-blue-700">This request has been fulfilled.</p>
                      {request.adminNotes && (
                        <p className="text-sm text-blue-700 mt-1">
                          <span className="font-medium">Notes:</span> {request.adminNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default withRouteGuard(InventoryRequestsPage, {
  module: 'inventory',
  action: 'view',
  feature: 'inventory'
})