'use client'

import { useState, useEffect } from 'react'
import { branchApi } from '@/lib/centerAdminApi'
import { useCenterAdminPermissions } from '@/hooks/useCenterAdminPermissions'
import { 
  Sparkles, 
  Search, 
  ToggleLeft, 
  ToggleRight,
  Clock,
  Zap,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Package,
  Edit2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BranchService {
  _id: string
  name: string
  code: string
  displayName: string
  description: string
  icon: string
  category: string
  turnaroundTime: {
    standard: number
    express: number
  }
  isExpressAvailable: boolean
  isActiveForBranch: boolean
  priceMultiplier: number
  customTurnaround?: {
    standard?: number
    express?: number
  }
  source: 'admin' | 'branch'
  canDelete: boolean
}

interface ServiceItem {
  _id: string
  name: string
  itemId: string
  category: string
  basePrice: number
  description: string
  canDelete: boolean
}

interface Stats {
  total: number
  adminAssigned: number
  branchCreated: number
  enabled: number
}

const categoryOptions = [
  { value: 'laundry', label: 'Laundry' },
  { value: 'dry_cleaning', label: 'Dry Cleaning' },
  { value: 'pressing', label: 'Pressing/Ironing' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'other', label: 'Other' }
]

const itemCategoryOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'household', label: 'Household' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'others', label: 'Others' }
]

export default function BranchServicesPage() {
  const { canCreate, canUpdate, canDelete } = useCenterAdminPermissions('services')
  const [services, setServices] = useState<BranchService[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, adminAssigned: 0, branchCreated: 0, enabled: 0 })
  const [branch, setBranch] = useState<{ _id: string; name: string; code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingService, setTogglingService] = useState<string | null>(null)
  const [deletingService, setDeletingService] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    displayName: '',
    description: '',
    category: 'laundry',
    turnaroundTime: { standard: 48, express: 24 },
    isExpressAvailable: true
  })

  // Items management state
  const [showItemsModal, setShowItemsModal] = useState(false)
  const [selectedService, setSelectedService] = useState<BranchService | null>(null)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'men',
    basePrice: 0,
    description: ''
  })

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
    type: 'danger' | 'warning'
  }>({ show: false, title: '', message: '', onConfirm: () => {}, type: 'danger' })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await branchApi.getServices()
      setServices(response.data.services || [])
      setStats(response.data.stats || { total: 0, adminAssigned: 0, branchCreated: 0, enabled: 0 })
      setBranch(response.data.branch || null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleService = async (serviceId: string) => {
    try {
      setTogglingService(serviceId)
      const response = await branchApi.toggleService(serviceId)
      
      setServices(prev => prev.map(service => 
        service._id === serviceId 
          ? { ...service, isActiveForBranch: response.data.service.isActiveForBranch }
          : service
      ))
      
      toast.success(response.message)
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle service')
    } finally {
      setTogglingService(null)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Service',
      message: 'Are you sure you want to delete this service? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          setDeletingService(serviceId)
          await branchApi.deleteService(serviceId)
          setServices(prev => prev.filter(s => s._id !== serviceId))
          toast.success('Service deleted successfully')
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete service')
        } finally {
          setDeletingService(null)
          setConfirmModal(prev => ({ ...prev, show: false }))
        }
      }
    })
  }

  const handleCreateService = async () => {
    if (!newService.name || !newService.displayName) {
      toast.error('Name and display name are required')
      return
    }

    try {
      setCreating(true)
      const response = await branchApi.createService(newService)
      setServices(prev => [...prev, response.data.service])
      setShowCreateModal(false)
      setNewService({
        name: '',
        displayName: '',
        description: '',
        category: 'laundry',
        turnaroundTime: { standard: 48, express: 24 },
        isExpressAvailable: true
      })
      toast.success('Service created successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create service')
    } finally {
      setCreating(false)
    }
  }

  // Items management functions
  const handleOpenItemsModal = async (service: BranchService) => {
    setSelectedService(service)
    setShowItemsModal(true)
    setItemsLoading(true)
    try {
      const response = await branchApi.getServiceItems(service._id)
      setServiceItems(response.data.items || [])
    } catch (err: any) {
      toast.error(err.message || 'Failed to load items')
    } finally {
      setItemsLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name || newItem.basePrice <= 0) {
      toast.error('Name and price are required')
      return
    }

    try {
      setAddingItem(true)
      const response = await branchApi.addServiceItem(selectedService!._id, newItem)
      setServiceItems(prev => [...prev, response.data.item])
      setShowAddItemForm(false)
      setNewItem({ name: '', category: 'men', basePrice: 0, description: '' })
      toast.success('Item added successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item')
    } finally {
      setAddingItem(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    setConfirmModal({
      show: true,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          setDeletingItem(itemId)
          await branchApi.deleteServiceItem(selectedService!._id, itemId)
          setServiceItems(prev => prev.filter(i => i._id !== itemId))
          toast.success('Item deleted successfully')
        } catch (err: any) {
          toast.error(err.message || 'Failed to delete item')
        } finally {
          setDeletingItem(null)
          setConfirmModal(prev => ({ ...prev, show: false }))
        }
      }
    })
  }

  const filteredServices = services.filter(service =>
    service.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      laundry: 'bg-blue-100 text-blue-700',
      dry_cleaning: 'bg-purple-100 text-purple-700',
      pressing: 'bg-orange-100 text-orange-700',
      specialty: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.other
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-green-500" />
            Services Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage services for {branch?.name || 'your branch'}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Service
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No services found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Create your first service
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredServices.map((service) => (
              <div 
                key={service._id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !service.isActiveForBranch ? 'bg-gray-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      service.isActiveForBranch ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Sparkles className={`w-6 h-6 ${
                        service.isActiveForBranch ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${
                          service.isActiveForBranch ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {service.displayName}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(service.category)}`}>
                          {service.category.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          service.source === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {service.source === 'admin' ? 'Admin' : 'Custom'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mt-0.5">
                        {service.description || 'No description'}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Standard: {service.customTurnaround?.standard || service.turnaroundTime.standard}h
                        </span>
                        {service.isExpressAvailable && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-yellow-500" />
                            Express: {service.customTurnaround?.express || service.turnaroundTime.express}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Manage Items button */}
                    <button
                      onClick={() => handleOpenItemsModal(service)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Manage Items"
                    >
                      <Package className="w-4 h-4" />
                      Items
                    </button>

                    {/* Delete button for branch-created services */}
                    {canDelete && service.canDelete && (
                      <button
                        onClick={() => handleDeleteService(service._id)}
                        disabled={deletingService === service._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete service"
                      >
                        {deletingService === service._id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    
                    {/* Toggle button */}
                    {canUpdate && (
                      <button
                        onClick={() => handleToggleService(service._id)}
                        disabled={togglingService === service._id}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {togglingService === service._id ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : service.isActiveForBranch ? (
                          <ToggleRight className="w-10 h-10 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-gray-300" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Service Types:</p>
            <ul className="mt-1 space-y-1">
              <li><span className="font-medium text-purple-700">Admin</span> - Services assigned by Admin/Center Admin. You can enable/disable them.</li>
              <li><span className="font-medium text-green-700">Custom</span> - Services created by you. You can edit and delete them.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Service</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g., Premium Wash"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={newService.displayName}
                  onChange={(e) => setNewService({ ...newService, displayName: e.target.value })}
                  placeholder="e.g., Premium Wash & Fold"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Time (hrs)
                  </label>
                  <input
                    type="number"
                    value={newService.turnaroundTime.standard}
                    onChange={(e) => setNewService({ 
                      ...newService, 
                      turnaroundTime: { ...newService.turnaroundTime, standard: parseInt(e.target.value) || 48 }
                    })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Express Time (hrs)
                  </label>
                  <input
                    type="number"
                    value={newService.turnaroundTime.express}
                    onChange={(e) => setNewService({ 
                      ...newService, 
                      turnaroundTime: { ...newService.turnaroundTime, express: parseInt(e.target.value) || 24 }
                    })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="expressAvailable"
                  checked={newService.isExpressAvailable}
                  onChange={(e) => setNewService({ ...newService, isExpressAvailable: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="expressAvailable" className="text-sm text-gray-700">
                  Express delivery available
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateService}
                disabled={creating || !newService.name || !newService.displayName}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Service
                  </>
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Items Modal */}
      {showItemsModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Items</h3>
                <p className="text-sm text-gray-500">{selectedService.displayName}</p>
              </div>
              <button
                onClick={() => {
                  setShowItemsModal(false)
                  setSelectedService(null)
                  setServiceItems([])
                  setShowAddItemForm(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {itemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                </div>
              ) : (
                <>
                  {/* Add Item Form */}
                  {showAddItemForm ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3">Add New Item</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Item name (e.g., Shirt, Saree)"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {itemCategoryOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Price (₹)"
                            value={newItem.basePrice || ''}
                            onChange={(e) => setNewItem({ ...newItem, basePrice: parseFloat(e.target.value) || 0 })}
                            min="0"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddItem}
                            disabled={addingItem || !newItem.name || newItem.basePrice <= 0}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            {addingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Item
                          </button>
                          <button
                            onClick={() => {
                              setShowAddItemForm(false)
                              setNewItem({ name: '', category: 'men', basePrice: 0, description: '' })
                            }}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddItemForm(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 mb-4"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Item
                    </button>
                  )}

                  {/* Items List */}
                  {serviceItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>No items added yet</p>
                      <p className="text-sm">Add items that customers can select for this service</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {serviceItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{item.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-sm text-green-600 font-medium">₹{item.basePrice}</span>
                          </div>
                          {item.canDelete && (
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              disabled={deletingItem === item._id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              {deletingItem === item._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500">
                💡 Items you add here will be available for customers when they select this service.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                confirmModal.type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <AlertCircle className={`w-6 h-6 ${
                  confirmModal.type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{confirmModal.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  confirmModal.type === 'danger' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
