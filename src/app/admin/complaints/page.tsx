'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  MessageSquare, 
  Search, 
  Eye,
  UserPlus,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  User,
  Calendar,
  Package,
  XCircle,
  X
} from 'lucide-react'
import { useAdminComplaints, useSupportAgents } from '@/hooks/useAdmin'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 8

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'closed', label: 'Closed' }
]

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'delay', label: 'Delay' },
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'payment', label: 'Payment' },
  { value: 'other', label: 'Other' }
]

export default function AdminComplaintsPage() {
  const { canUpdate, hasPermission } = usePermissions('customers')
  const canAssign = hasPermission('orders', 'assign')
  const [filters, setFilters] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    status: '',
    priority: '',
    category: '',
    search: '',
    isOverdue: undefined as boolean | undefined
  })
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [resolution, setResolution] = useState('')

  const { complaints, pagination, loading, error, assignComplaint, updateStatus } = useAdminComplaints(filters)
  const { agents } = useSupportAgents()

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewComplaint = (complaint: any) => {
    setSelectedComplaint(complaint)
    setShowViewModal(true)
  }

  const handleAssign = async () => {
    if (!selectedAgent || !selectedComplaint) return
    try {
      await assignComplaint(selectedComplaint._id, selectedAgent)
      setShowAssignModal(false)
      setSelectedAgent('')
      toast.success('Complaint assigned successfully!')
    } catch (error: any) {
      toast.error(`Failed to assign: ${error.message}`)
    }
  }

  const handleResolve = async () => {
    if (!resolution || !selectedComplaint) return
    try {
      await updateStatus(selectedComplaint._id, 'resolved', resolution)
      setShowResolveModal(false)
      setResolution('')
      toast.success('Complaint resolved successfully!')
    } catch (error: any) {
      toast.error(`Failed to resolve: ${error.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'escalated': return 'text-red-600 bg-red-50 border-red-200'
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertCircle
      case 'in_progress': return Clock
      case 'resolved': return CheckCircle
      case 'escalated': return AlertTriangle
      case 'closed': return XCircle
      default: return MessageSquare
    }
  }

  if (loading && complaints.length === 0) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-800">Complaints Management</h1>
          <p className="text-gray-600">Monitor and manage customer complaints and support tickets</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-blue-100">Total Complaints</p>
            <p className="text-3xl font-bold">{pagination.total}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-amber-100">Open</p>
            <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'open').length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-purple-100">In Progress</p>
            <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'in_progress').length}</p>
          </div>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-100">Resolved</p>
            <p className="text-3xl font-bold">{complaints.filter(c => c.status === 'resolved').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket number, title, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Complaints {pagination.total > 0 ? `(${pagination.total})` : ''}
          </h2>
        </div>
        
        {error && (
          <div className="p-6 bg-red-50 border-b border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">Error loading complaints: {error}</span>
            </div>
          </div>
        )}
        
        <div className="divide-y divide-gray-200">
          {complaints.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Found</h3>
              <p className="text-gray-600">No complaints match your current filters.</p>
            </div>
          ) : (
            complaints.map((complaint) => {
              const StatusIcon = getStatusIcon(complaint.status)
              return (
                <div key={complaint._id} className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(complaint.priority)}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800">{complaint.ticketNumber}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(complaint.priority)}`}>
                            {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                          </span>
                          {complaint.sla?.isOverdue && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        <h4 className="text-gray-800 font-medium mb-2">{complaint.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{complaint.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {complaint.raisedBy?.name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          {complaint.relatedOrder && (
                            <div className="flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {complaint.relatedOrder.orderNumber}
                            </div>
                          )}
                          {complaint.assignedTo && (
                            <div className="flex items-center">
                              <UserPlus className="w-4 h-4 mr-1" />
                              {complaint.assignedTo.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewComplaint(complaint)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {(complaint.status === 'open' || !complaint.assignedTo) && canAssign && (
                        <Button 
                          size="sm" 
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setShowAssignModal(true)
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Assign
                        </Button>
                      )}
                      
                      {complaint.status === 'in_progress' && canUpdate && (
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            setSelectedComplaint(complaint)
                            setShowResolveModal(true)
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
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
            itemName="complaints"
          />
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign to Support Agent</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Agent
                </label>
                <select 
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleAssign}
                  disabled={!selectedAgent}
                >
                  Assign
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedAgent('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Resolve Complaint</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleResolve}
                  disabled={!resolution}
                >
                  Resolve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResolveModal(false)
                    setResolution('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Complaint Modal */}
      {showViewModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Complaint Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedComplaint(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ticket Number</p>
                  <p className="font-semibold">{selectedComplaint.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedComplaint.category?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'N/A'}</p>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="font-semibold text-lg">{selectedComplaint.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
              </div>

              {/* Customer Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.raisedBy?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.raisedBy?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              {selectedComplaint.relatedOrder && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Related Order
                  </h4>
                  <div className="text-sm">
                    <span className="text-gray-500">Order Number:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.relatedOrder.orderNumber}</span>
                  </div>
                </div>
              )}

              {/* Assignment Info */}
              {selectedComplaint.assignedTo && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assigned To
                  </h4>
                  <div className="text-sm">
                    <span className="text-gray-500">Agent:</span>
                    <span className="ml-2 font-medium">{selectedComplaint.assignedTo.name}</span>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(selectedComplaint.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedComplaint.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span>{new Date(selectedComplaint.updatedAt).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {selectedComplaint.resolution && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolution
                  </h4>
                  <p className="text-sm">{selectedComplaint.resolution}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {(selectedComplaint.status === 'open' || !selectedComplaint.assignedTo) && canAssign && (
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => {
                    setShowViewModal(false)
                    setShowAssignModal(true)
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Assign
                </Button>
              )}
              {selectedComplaint.status === 'in_progress' && canUpdate && (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    setShowViewModal(false)
                    setShowResolveModal(true)
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false)
                  setSelectedComplaint(null)
                }}
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
