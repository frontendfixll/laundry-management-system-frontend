'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Shield, UserCheck, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface BranchAdmin {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  permissions?: Record<string, Record<string, boolean>>
  assignedBranch?: {
    _id: string
    name: string
    code: string
  }
  createdAt: string
}

interface Branch {
  _id: string
  name: string
  code: string
}

// Default permissions structure for branch admin
const defaultPermissions = {
  orders: { view: true, create: true, update: true, delete: false, assign: true, cancel: false, process: true },
  staff: { view: true, create: true, update: true, delete: false, assignShift: true, manageAttendance: true },
  inventory: { view: true, create: true, update: true, delete: false, restock: true, writeOff: false },
  services: { view: true, create: false, update: true, delete: false, toggle: true, updatePricing: true },
  customers: { view: true, create: false, update: false, delete: false },
  logistics: { view: true, create: false, update: false, delete: false, assign: true, track: true },
  tickets: { view: true, create: false, update: true, delete: false, assign: true, resolve: true, escalate: false },
  analytics: { view: true },
  settings: { view: true, create: false, update: false, delete: false },
}

const permissionLabels: Record<string, string> = {
  orders: 'Orders',
  staff: 'Staff Management',
  inventory: 'Inventory',
  services: 'Services & Pricing',
  customers: 'Customers',
  logistics: 'Logistics',
  tickets: 'Support Tickets',
  analytics: 'Analytics & Reports',
  settings: 'Settings',
}

const actionLabels: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  assign: 'Assign',
  cancel: 'Cancel',
  process: 'Process',
  assignShift: 'Assign Shift',
  manageAttendance: 'Manage Attendance',
  restock: 'Restock',
  writeOff: 'Write Off',
  toggle: 'Toggle Status',
  updatePricing: 'Update Pricing',
  track: 'Track',
  resolve: 'Resolve',
  escalate: 'Escalate',
}

export default function BranchAdminsPage() {
  const [branchAdmins, setBranchAdmins] = useState<BranchAdmin[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<BranchAdmin | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    assignedBranch: '',
    permissions: defaultPermissions as Record<string, Record<string, boolean>>,
  })

  useEffect(() => {
    fetchBranchAdmins()
    fetchBranches()
  }, [])

  const fetchBranchAdmins = async () => {
    try {
      const response = await api.get('/admin/branch-admins')
      if (response.data.success) {
        setBranchAdmins(response.data.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch branch admins:', error)
      toast.error('Failed to load branch admins')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await api.get('/admin/branches')
      if (response.data.success) {
        setBranches(response.data.data.branches || response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAdmin) {
        await api.put(`/admin/branch-admins/${editingAdmin._id}`, {
          name: formData.name,
          phone: formData.phone,
          assignedBranch: formData.assignedBranch,
          permissions: formData.permissions,
        })
        toast.success('Branch admin updated successfully')
      } else {
        await api.post('/admin/branch-admins', formData)
        toast.success('Branch admin created successfully')
      }
      setShowModal(false)
      resetForm()
      fetchBranchAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this branch admin?')) return
    try {
      await api.delete(`/admin/branch-admins/${id}`)
      toast.success('Branch admin deactivated')
      fetchBranchAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate')
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await api.put(`/admin/branch-admins/${id}/reactivate`)
      toast.success('Branch admin reactivated')
      fetchBranchAdmins()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reactivate')
    }
  }

  const resetForm = () => {
    setFormData({ 
      name: '', 
      email: '', 
      phone: '', 
      password: '', 
      assignedBranch: '',
      permissions: defaultPermissions 
    })
    setEditingAdmin(null)
    setExpandedModules([])
  }

  const openEditModal = (admin: BranchAdmin) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: '',
      assignedBranch: admin.assignedBranch?._id || '',
      permissions: admin.permissions || defaultPermissions,
    })
    setShowModal(true)
  }

  const toggleModule = (module: string) => {
    setExpandedModules(prev => 
      prev.includes(module) 
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const togglePermission = (module: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: !prev.permissions[module]?.[action]
        }
      }
    }))
  }

  const toggleAllModulePermissions = (module: string, value: boolean) => {
    const modulePerms = formData.permissions[module] || {}
    const updatedPerms: Record<string, boolean> = {}
    Object.keys(modulePerms).forEach(action => {
      updatedPerms[action] = value
    })
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: updatedPerms
      }
    }))
  }

  const filteredAdmins = branchAdmins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Admins</h1>
          <p className="text-gray-500 mt-1">Manage admins for individual branches with custom permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Branch Admin
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No branch admins found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-teal-600 font-medium text-sm">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.assignedBranch ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {admin.assignedBranch.name} ({admin.assignedBranch.code})
                      </span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {admin.isActive ? (
                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(admin._id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Reactivate"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAdmin ? 'Edit Branch Admin' : 'Add Branch Admin'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingAdmin ? 'Update admin details and permissions' : 'Create a new branch admin with custom permissions'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingAdmin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {!editingAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                  </div>
                )}
                <div className={editingAdmin ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Branch</label>
                  <select
                    value={formData.assignedBranch}
                    onChange={(e) => setFormData({ ...formData, assignedBranch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permissions Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Permissions (RBAC)
                </h3>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {Object.entries(formData.permissions).map(([module, actions]) => (
                    <div key={module} className="bg-white">
                      <button
                        type="button"
                        onClick={() => toggleModule(module)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {permissionLabels[module] || module}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Object.values(actions).filter(Boolean).length}/{Object.keys(actions).length} enabled)
                          </span>
                        </div>
                        {expandedModules.includes(module) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedModules.includes(module) && (
                        <div className="px-4 pb-4 bg-gray-50">
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => toggleAllModulePermissions(module, true)}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Enable All
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAllModulePermissions(module, false)}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Disable All
                            </button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(actions).map(([action, enabled]) => (
                              <label
                                key={action}
                                className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-300"
                              >
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => togglePermission(module, action)}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {actionLabels[action] || action}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
