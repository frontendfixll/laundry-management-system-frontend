'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Search, 
  RefreshCw,
  Loader2,
  UserCheck,
  UserX,
  TrendingUp,
  Package,
  Plus,
  X,
  Save,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import { branchApi, centerAdminApi } from '@/lib/centerAdminApi'
import toast from 'react-hot-toast'

interface StaffMember {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  workerType?: string
  isActive: boolean
  createdAt: string
  stats: {
    ordersToday: number
    totalOrders: number
    efficiency: number
  }
}

interface WorkerType {
  key: string
  value: string
  label: string
}

const WORKER_TYPE_COLORS: Record<string, string> = {
  washer: 'bg-blue-100 text-blue-800',
  dry_cleaner: 'bg-purple-100 text-purple-800',
  ironer: 'bg-orange-100 text-orange-800',
  packer: 'bg-green-100 text-green-800',
  quality_checker: 'bg-pink-100 text-pink-800',
  general: 'bg-gray-100 text-gray-800'
}

export default function BranchStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [workerTypes, setWorkerTypes] = useState<WorkerType[]>([])
  const [branchInfo, setBranchInfo] = useState<{ name: string; code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<StaffMember | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    workerType: 'general'
  })

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const response = await centerAdminApi.getStaff()
      if (response.success) {
        setStaff(response.data.staff || [])
        setBranchInfo(response.data.branch)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const fetchWorkerTypes = async () => {
    try {
      const response = await centerAdminApi.getWorkerTypes()
      if (response.success) {
        setWorkerTypes(response.data.workerTypes || [])
      }
    } catch (err: any) {
      console.error('Failed to load worker types:', err)
    }
  }

  useEffect(() => {
    fetchStaff()
    fetchWorkerTypes()
  }, [])

  const handleToggleAvailability = async (staffId: string) => {
    try {
      setActionLoading(staffId)
      const response = await centerAdminApi.toggleStaffAvailability(staffId)
      if (response.success) {
        toast.success(`Worker ${response.data.staff.isActive ? 'activated' : 'deactivated'} successfully`)
        fetchStaff()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddWorker = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setSaving(true)
      const response = await centerAdminApi.addWorker({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || undefined,
        workerType: formData.workerType
      })
      if (response.success) {
        toast.success('Worker added successfully')
        setShowAddModal(false)
        setFormData({ name: '', email: '', phone: '', password: '', workerType: 'general' })
        fetchStaff()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add worker')
    } finally {
      setSaving(false)
    }
  }

  const handleEditWorker = async () => {
    if (!selectedWorker) return

    try {
      setSaving(true)
      const response = await centerAdminApi.updateWorker(selectedWorker._id, {
        name: formData.name,
        phone: formData.phone,
        workerType: formData.workerType
      })
      if (response.success) {
        toast.success('Worker updated successfully')
        setShowEditModal(false)
        setSelectedWorker(null)
        fetchStaff()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update worker')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWorker = async () => {
    if (!selectedWorker) return

    try {
      setSaving(true)
      const response = await centerAdminApi.deleteWorker(selectedWorker._id)
      if (response.success) {
        toast.success('Worker deleted successfully')
        setShowDeleteModal(false)
        setSelectedWorker(null)
        fetchStaff()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete worker')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (worker: StaffMember) => {
    setSelectedWorker(worker)
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone || '',
      password: '',
      workerType: worker.workerType || 'general'
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (worker: StaffMember) => {
    setSelectedWorker(worker)
    setShowDeleteModal(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Type', 'Status', 'Orders Today', 'Total Orders', 'Efficiency'].join(','),
      ...staff.map(member => [
        member.name,
        member.email,
        member.phone || 'N/A',
        member.workerType || 'general',
        member.isActive ? 'Active' : 'Inactive',
        member.stats.ordersToday,
        member.stats.totalOrders,
        `${member.stats.efficiency}%`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `branch-workers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Data exported successfully')
  }

  const getWorkerTypeLabel = (type: string) => {
    return type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'
  }

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.isActive) ||
                         (statusFilter === 'inactive' && !member.isActive)
    const matchesType = typeFilter === 'all' || member.workerType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const activeCount = staff.filter(s => s.isActive).length
  const totalOrdersToday = staff.reduce((sum, s) => sum + s.stats.ordersToday, 0)
  const avgEfficiency = staff.length > 0 
    ? Math.round(staff.reduce((sum, s) => sum + s.stats.efficiency, 0) / staff.length) 
    : 0

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-800">Worker Management</h1>
          <p className="text-gray-600">{branchInfo?.name || 'Your Branch'} - Manage your team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchStaff}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              setFormData({ name: '', email: '', phone: '', password: '', workerType: 'general' })
              setShowAddModal(true)
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Workers</p>
              <p className="text-2xl font-bold text-white">{staff.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Active</p>
              <p className="text-2xl font-bold text-white">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">Orders Today</p>
              <p className="text-2xl font-bold text-white">{totalOrdersToday}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Avg Efficiency</p>
              <p className="text-2xl font-bold text-white">{avgEfficiency}%</p>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
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
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            {workerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Workers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Workers ({filteredStaff.length})
          </h2>
        </div>
        
        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No workers found</p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add First Worker
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStaff.map((member) => (
              <div key={member._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-400'}`}>
                      <span className="text-white font-semibold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${WORKER_TYPE_COLORS[member.workerType || 'general']}`}>
                          {getWorkerTypeLabel(member.workerType || 'general')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && <p className="text-sm text-gray-500">{member.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex gap-3 text-center">
                      <div className="bg-blue-50 px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{member.stats.ordersToday}</p>
                        <p className="text-xs text-gray-600">Today</p>
                      </div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-700">{member.stats.totalOrders}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="bg-purple-50 px-3 py-2 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">{member.stats.efficiency}%</p>
                        <p className="text-xs text-gray-600">Efficiency</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(member)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={member.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleAvailability(member._id)}
                        disabled={actionLoading === member._id}
                        className={member.isActive ? '' : 'bg-green-500 hover:bg-green-600 text-white'}
                      >
                        {actionLoading === member._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : member.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => openDeleteModal(member)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Worker</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Worker name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="worker@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker Type *</label>
                <select
                  value={formData.workerType}
                  onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {workerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Default: Worker@123"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddWorker} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Add Worker
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Worker</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker Type</label>
                <select
                  value={formData.workerType}
                  onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {workerTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleEditWorker} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Worker</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedWorker.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDeleteWorker} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1" disabled={saving}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
