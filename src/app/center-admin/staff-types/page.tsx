'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCenterAdminPermissions } from '@/hooks/useCenterAdminPermissions'
import { 
  Tags, 
  RefreshCw,
  Loader2,
  Plus,
  X,
  Save,
  Edit,
  Trash2,
  Users
} from 'lucide-react'
import { branchApi } from '@/lib/centerAdminApi'
import toast from 'react-hot-toast'

interface StaffType {
  _id: string
  name: string
  description?: string
  color: string
  isDefault: boolean
  staffCount: number
}

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#6B7280', label: 'Gray' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#F97316', label: 'Orange' },
  { value: '#06B6D4', label: 'Cyan' }
]

export default function StaffTypesPage() {
  const { canCreate, canUpdate, canDelete } = useCenterAdminPermissions('staff')
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedType, setSelectedType] = useState<StaffType | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B7280'
  })

  const fetchStaffTypes = async () => {
    try {
      setLoading(true)
      const response = await branchApi.getStaffTypes()
      if (response.success) {
        setStaffTypes(response.data.staffTypes || [])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load staff types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffTypes()
  }, [])

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (formData.name.length < 2 || formData.name.length > 50) {
      toast.error('Name must be 2-50 characters')
      return
    }

    try {
      setSaving(true)
      const response = await branchApi.createStaffType({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color
      })
      if (response.success) {
        toast.success('Staff type created')
        setShowAddModal(false)
        setFormData({ name: '', description: '', color: '#6B7280' })
        fetchStaffTypes()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create staff type')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedType || !formData.name.trim()) return

    try {
      setSaving(true)
      const response = await branchApi.updateStaffType(selectedType._id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color
      })
      if (response.success) {
        toast.success('Staff type updated')
        setShowEditModal(false)
        setSelectedType(null)
        fetchStaffTypes()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update staff type')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedType) return

    try {
      setSaving(true)
      const response = await branchApi.deleteStaffType(selectedType._id)
      if (response.success) {
        toast.success('Staff type deleted')
        setShowDeleteModal(false)
        setSelectedType(null)
        fetchStaffTypes()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete staff type')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (type: StaffType) => {
    setSelectedType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      color: type.color
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (type: StaffType) => {
    setSelectedType(type)
    setShowDeleteModal(true)
  }

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
          <h1 className="text-3xl font-bold text-gray-800">Staff Types</h1>
          <p className="text-gray-600">Manage custom staff categories for your branch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStaffTypes}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canCreate && (
            <Button 
              onClick={() => {
                setFormData({ name: '', description: '', color: '#6B7280' })
                setShowAddModal(true)
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Types</p>
              <p className="text-2xl font-bold text-white">{staffTypes.length}</p>
            </div>
            <Tags className="w-8 h-8 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Default Types</p>
              <p className="text-2xl font-bold text-white">{staffTypes.filter(t => t.isDefault).length}</p>
            </div>
            <Tags className="w-8 h-8 text-white/80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Custom Types</p>
              <p className="text-2xl font-bold text-white">{staffTypes.filter(t => !t.isDefault).length}</p>
            </div>
            <Tags className="w-8 h-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Staff Types List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Staff Types</h2>
        </div>
        
        {staffTypes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Tags className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No staff types found</p>
            {canCreate && (
              <Button onClick={() => setShowAddModal(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create First Type
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {staffTypes.map((type) => (
              <div key={type._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: type.color + '20' }}
                    >
                      <Tags className="w-5 h-5" style={{ color: type.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">{type.name}</h3>
                        {type.isDefault && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">Default</span>
                        )}
                      </div>
                      {type.description && (
                        <p className="text-sm text-gray-500">{type.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{type.staffCount} staff</span>
                    </div>
                    
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: type.color }}
                      title={type.color}
                    />

                    <div className="flex gap-2">
                      {canUpdate && (
                        <Button variant="outline" size="sm" onClick={() => openEditModal(type)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => openDeleteModal(type)}
                          disabled={type.staffCount > 0}
                          title={type.staffCount > 0 ? 'Cannot delete: staff assigned' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Staff Type</h3>
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
                  placeholder="e.g., Spotter, Presser"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Brief description"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleAdd} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Staff Type</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
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
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleEdit} disabled={saving} className="flex-1 bg-green-500 hover:bg-green-600">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Staff Type</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedType.name}</span>?
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600">
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
