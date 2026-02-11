'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { 
  Package2, 
  Plus, 
  Search, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Save,
  Package,
  ChevronDown,
  Check,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withRouteGuard } from '@/components/withRouteGuard'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  try {
    // Check laundry-auth (main auth store)
    const data = localStorage.getItem('laundry-auth')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.state?.token || parsed.token
    }
  } catch {}
  return localStorage.getItem('token')
}

interface InventoryItem {
  _id: string
  itemName: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  unit: string
  unitCost?: number
  costPerUnit?: number
  supplier?: { name?: string } | string
  isLowStock: boolean
  isExpired: boolean
}

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  expiredItems: number
  totalValue: number
}

const INVENTORY_ITEMS = [
  // Cleaning Chemicals
  { 
    category: 'Cleaning Chemicals',
    items: [
      { value: 'detergent', label: 'Detergent', icon: '🧴', description: 'Laundry detergent powder/liquid' },
      { value: 'softener', label: 'Fabric Softener', icon: '💧', description: 'Fabric conditioner' },
      { value: 'bleach', label: 'Bleach', icon: '⚗️', description: 'Whitening agent' },
      { value: 'starch', label: 'Starch', icon: '✨', description: 'Fabric stiffener' },
      { value: 'stain_remover', label: 'Stain Remover', icon: '🎯', description: 'Pre-treatment solution' },
      { value: 'disinfectant', label: 'Disinfectant', icon: '🦠', description: 'Sanitizing solution' },
      { value: 'spot_cleaner', label: 'Spot Cleaner', icon: '🔍', description: 'Targeted stain treatment' },
    ]
  },
  // Dry Cleaning Chemicals
  {
    category: 'Dry Cleaning Chemicals',
    items: [
      { value: 'perchloroethylene', label: 'Perchloroethylene (PERC)', icon: '🧪', description: 'Dry cleaning solvent' },
      { value: 'hydrocarbon', label: 'Hydrocarbon Solvent', icon: '⚡', description: 'Alternative solvent' },
      { value: 'sizing', label: 'Sizing Agent', icon: '📏', description: 'Fabric finishing' },
    ]
  },
  // Packaging Materials
  {
    category: 'Packaging Materials',
    items: [
      { value: 'poly_bags', label: 'Poly Bags', icon: '🛍️', description: 'Plastic garment bags' },
      { value: 'hangers', label: 'Hangers', icon: '👔', description: 'Plastic/wire hangers' },
      { value: 'tags', label: 'Tags', icon: '🏷️', description: 'Identification tags' },
      { value: 'tissue_paper', label: 'Tissue Paper', icon: '📄', description: 'Wrapping paper' },
      { value: 'cardboard_boxes', label: 'Cardboard Boxes', icon: '📦', description: 'Shipping boxes' },
      { value: 'garment_covers', label: 'Garment Covers', icon: '🧥', description: 'Protective covers' },
    ]
  },
  // Equipment Supplies
  {
    category: 'Equipment Supplies',
    items: [
      { value: 'machine_oil', label: 'Machine Oil', icon: '🛢️', description: 'Equipment lubricant' },
      { value: 'filters', label: 'Filters', icon: '🔧', description: 'Water/lint filters' },
      { value: 'belts', label: 'Machine Belts', icon: '⚙️', description: 'Replacement belts' },
      { value: 'steam_iron_parts', label: 'Steam Iron Parts', icon: '🔨', description: 'Iron components' },
    ]
  },
  // Miscellaneous
  {
    category: 'Miscellaneous',
    items: [
      { value: 'buttons', label: 'Buttons', icon: '🔘', description: 'Replacement buttons' },
      { value: 'thread', label: 'Thread', icon: '🧵', description: 'Sewing thread' },
      { value: 'zippers', label: 'Zippers', icon: '🤐', description: 'Replacement zippers' },
      { value: 'safety_pins', label: 'Safety Pins', icon: '📌', description: 'Fastening pins' },
      { value: 'measuring_tape', label: 'Measuring Tape', icon: '📐', description: 'Measurement tool' },
    ]
  }
]

function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Dropdown states
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [newItem, setNewItem] = useState({
    itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: ''
  })
  const [stockUpdate, setStockUpdate] = useState({ quantity: 0, action: 'add' as 'add' | 'consume', reason: '' })
  
  // Request item state
  const [requestItem, setRequestItem] = useState({
    itemName: '',
    category: '',
    description: '',
    estimatedQuantity: '',
    unit: 'units',
    urgency: 'normal' as 'low' | 'normal' | 'high',
    justification: ''
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAddModal || showStockModal) {
      // Get current scroll position
      const scrollY = window.scrollY
      
      // Lock both body and html scroll and hide scrollbar
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      
      // Prevent scroll on mobile and hide scrollbar completely
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.height = '100vh'
      
      // Hide scrollbar on main element if it exists
      const mainElement = document.querySelector('main')
      if (mainElement) {
        (mainElement as HTMLElement).style.overflow = 'hidden'
      }
      
      // Store scroll position
      document.body.dataset.scrollY = scrollY.toString()
    } else {
      // Get stored scroll position
      const scrollY = document.body.dataset.scrollY
      
      // Restore scroll
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.height = ''
      
      // Restore main element scroll
      const mainElement = document.querySelector('main')
      if (mainElement) {
        (mainElement as HTMLElement).style.overflow = ''
      }
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
      }
    }
    
    return () => {
      // Cleanup
      const scrollY = document.body.dataset.scrollY
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.height = ''
      
      const mainElement = document.querySelector('main')
      if (mainElement) {
        (mainElement as HTMLElement).style.overflow = ''
      }
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
      }
    }
  }, [showAddModal, showStockModal])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setInventory(data.data.inventory || [])
        setStats(data.data.stats)
      }
    } catch (error: any) {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInventory() }, [])

  const handleAddItem = async () => {
    if (!newItem.itemName) { toast.error('Select an item'); return }
    try {
      setSaving(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/admin/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(newItem)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Item added')
        setShowAddModal(false)
        setNewItem({ itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: '' })
        fetchInventory()
      } else {
        toast.error(data.message)
      }
    } catch { toast.error('Failed to add item') }
    finally { setSaving(false) }
  }

  const handleUpdateStock = async () => {
    if (!selectedItem || stockUpdate.quantity <= 0) { toast.error('Enter valid quantity'); return }
    try {
      setSaving(true)
      const token = getAuthToken()
      const res = await fetch(`${API_URL}/admin/inventory/${selectedItem._id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify(stockUpdate)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Stock updated')
        setShowStockModal(false)
        setSelectedItem(null)
        fetchInventory()
      } else {
        toast.error(data.message)
      }
    } catch { toast.error('Failed to update stock') }
    finally { setSaving(false) }
  }

  const handleRequestItem = async () => {
    if (!requestItem.itemName || !requestItem.description) {
      toast.error('Please fill in item name and description')
      return
    }
    
    try {
      setSaving(true)
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/inventory/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestItem)
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('Item request sent to SuperAdmin successfully!')
        setShowRequestModal(false)
        setRequestItem({
          itemName: '',
          category: '',
          description: '',
          estimatedQuantity: '',
          unit: 'units',
          urgency: 'normal',
          justification: ''
        })
      } else {
        toast.error(data.message || 'Failed to send request')
      }
    } catch (error) {
      toast.error('Failed to send request')
    } finally {
      setSaving(false)
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || (filter === 'low' && item.isLowStock) || (filter === 'expired' && item.isExpired)
    return matchesSearch && matchesFilter
  })

  const getStockPercentage = (item: InventoryItem) => Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100))
  const getStockColor = (item: InventoryItem) => {
    if (item.isExpired) return 'bg-red-500'
    if (item.isLowStock) return 'bg-orange-500'
    const pct = getStockPercentage(item)
    return pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-orange-500'
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage branch supplies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin/inventory/requests'}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Requests
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-blue-500 hover:bg-blue-600"><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.totalItems || 0}</div>
            <div className="text-sm text-blue-100">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.lowStockItems || 0}</div>
            <div className="text-sm text-orange-100">Low Stock</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.expiredItems || 0}</div>
            <div className="text-sm text-red-100">Expired</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">₹{(stats.totalValue || 0).toLocaleString()}</div>
            <div className="text-sm text-green-100">Total Value</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-80 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Request New Item Button */}
          <Button
            onClick={() => setShowRequestModal(true)}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Item
          </Button>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No inventory items</h3>
          <Button onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => (
            <div key={item._id} className={`bg-white rounded-xl shadow-sm border p-4 ${item.isExpired ? 'border-red-300 bg-red-50' : item.isLowStock ? 'border-orange-300 bg-orange-50' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">{item.itemName.replace('_', ' ')}</h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                </div>
                {item.isLowStock && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Low</span>}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Stock Level</span>
                  <span className="font-medium">{item.currentStock} / {item.maxCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${getStockColor(item)}`} style={{ width: `${getStockPercentage(item)}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-green-600" onClick={() => { setSelectedItem(item); setStockUpdate({ quantity: 0, action: 'add', reason: '' }); setShowStockModal(true) }}>
                  <TrendingUp className="w-3 h-3 mr-1" />Restock
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-orange-600" onClick={() => { setSelectedItem(item); setStockUpdate({ quantity: 0, action: 'consume', reason: '' }); setShowStockModal(true) }}>
                  <TrendingDown className="w-3 h-3 mr-1" />Use
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 999999 }}
        >
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl my-8 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Inventory Item</h3>
                  <p className="text-xs text-gray-500">Add a new item to your inventory</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {/* Item Selection Row - Select Dropdown and Request Button in same line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {/* Custom Searchable Dropdown - Made Smaller */}
                  <div className="relative flex-1" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    >
                      <span className={newItem.itemName ? 'text-gray-900' : 'text-gray-400'}>
                        {newItem.itemName ? (
                          <span className="flex items-center gap-2">
                            <span className="text-lg">
                              {INVENTORY_ITEMS.flatMap(cat => cat.items).find(item => item.value === newItem.itemName)?.icon}
                            </span>
                            <div>
                              <div className="font-medium text-sm">
                                {INVENTORY_ITEMS.flatMap(cat => cat.items).find(item => item.value === newItem.itemName)?.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {INVENTORY_ITEMS.flatMap(cat => cat.items).find(item => item.value === newItem.itemName)?.description}
                              </div>
                            </div>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4" />
                            Select an item...
                          </span>
                        )}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu - Removed Search Field */}
                    {showDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-hidden">
                        {/* Items List - Direct without search */}
                        <div className="overflow-y-auto max-h-60">
                          {INVENTORY_ITEMS.map((category) => (
                            <div key={category.category}>
                              {/* Category Header */}
                              <div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                  {category.category}
                                </h4>
                              </div>

                              {/* Category Items */}
                              {category.items.map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => {
                                    setNewItem({ ...newItem, itemName: item.value });
                                    setShowDropdown(false);
                                  }}
                                  className={`w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-start gap-2 border-l-4 ${
                                    newItem.itemName === item.value 
                                      ? 'bg-blue-50 border-blue-500' 
                                      : 'border-transparent hover:border-blue-200'
                                  }`}
                                >
                                  <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-gray-900 text-sm">{item.label}</span>
                                      {newItem.itemName === item.value && (
                                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Request Item Button - Same line */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowRequestModal(true);
                    }}
                    className="px-4 py-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Request
                  </Button>
                </div>
              </div>

              {/* Stock Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Current Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Stock <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0" 
                      value={newItem.currentStock || ''} 
                      onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                    <Package2 className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">📦 Units</SelectItem>
                        <SelectItem value="liters">💧 Liters</SelectItem>
                        <SelectItem value="kg">⚖️ Kilograms</SelectItem>
                        <SelectItem value="bottles">🍾 Bottles</SelectItem>
                        <SelectItem value="boxes">📦 Boxes</SelectItem>
                        <SelectItem value="pieces">🔢 Pieces</SelectItem>
                        <SelectItem value="rolls">🎞️ Rolls</SelectItem>
                        <SelectItem value="packs">📦 Packs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Min Threshold */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Threshold
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="10" 
                      value={newItem.minThreshold || ''} 
                      onChange={(e) => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) || 10 })} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                    <AlertTriangle className="absolute right-3 top-2.5 h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                </div>

                {/* Max Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Capacity
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="100" 
                      value={newItem.maxCapacity || ''} 
                      onChange={(e) => setNewItem({ ...newItem, maxCapacity: parseInt(e.target.value) || 100 })} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                    <TrendingUp className="absolute right-3 top-2.5 h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximum storage capacity</p>
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm">₹</span>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="0.00" 
                      value={newItem.unitCost || ''} 
                      onChange={(e) => setNewItem({ ...newItem, unitCost: parseFloat(e.target.value) || 0 })} 
                      className="w-full pl-8 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cost per unit</p>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Supplier
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Supplier name" 
                      value={newItem.supplier || ''} 
                      onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Optional supplier information</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ itemName: '', currentStock: 0, minThreshold: 10, maxCapacity: 100, unit: 'units', unitCost: 0, supplier: '' });
                }} 
                className="flex-1 py-2.5 rounded-lg"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddItem} 
                disabled={saving || !newItem.itemName} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2.5 rounded-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showStockModal && selectedItem && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          style={{ zIndex: 999999 }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stockUpdate.action === 'add' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {stockUpdate.action === 'add' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {stockUpdate.action === 'add' ? 'Restock Item' : 'Use Stock'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {stockUpdate.action === 'add' ? 'Add stock to inventory' : 'Consume stock from inventory'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedItem(null);
                  setStockUpdate({ quantity: 0, action: 'add', reason: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Current Item Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">
                    {INVENTORY_ITEMS.flatMap(cat => cat.items).find(item => item.value === selectedItem.itemName)?.icon || '📦'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 capitalize text-lg">
                      {selectedItem.itemName.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {INVENTORY_ITEMS.flatMap(cat => cat.items).find(item => item.value === selectedItem.itemName)?.description}
                    </div>
                  </div>
                </div>
                
                {/* Stock Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Stock</span>
                    <span className="font-bold text-gray-900">
                      {selectedItem.currentStock} / {selectedItem.maxCapacity} {selectedItem.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${getStockColor(selectedItem)}`} 
                      style={{ width: `${getStockPercentage(selectedItem)}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Action Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStockUpdate({ ...stockUpdate, action: 'add' })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    stockUpdate.action === 'add'
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStockUpdate({ ...stockUpdate, action: 'consume' })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    stockUpdate.action === 'consume'
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 inline mr-2" />
                  Use Stock
                </button>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Enter quantity" 
                    value={stockUpdate.quantity || ''} 
                    onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })} 
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg font-medium"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 font-medium">
                    {selectedItem.unit}
                  </span>
                </div>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  placeholder="Add a note about this transaction..."
                  value={stockUpdate.reason || ''}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Preview Result */}
              {stockUpdate.quantity > 0 && (
                <div className={`rounded-xl p-4 border-2 ${
                  stockUpdate.action === 'add'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">New Stock Level</p>
                      <p className={`text-2xl font-bold ${
                        stockUpdate.action === 'add' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {stockUpdate.action === 'add'
                          ? selectedItem.currentStock + stockUpdate.quantity
                          : Math.max(0, selectedItem.currentStock - stockUpdate.quantity)
                        } {selectedItem.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Change</p>
                      <p className={`text-xl font-bold ${
                        stockUpdate.action === 'add' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {stockUpdate.action === 'add' ? '+' : '-'}{stockUpdate.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedItem(null);
                  setStockUpdate({ quantity: 0, action: 'add', reason: '' });
                }} 
                className="flex-1 py-3 rounded-xl"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStock} 
                disabled={saving || stockUpdate.quantity <= 0} 
                className={`flex-1 py-3 rounded-xl ${
                  stockUpdate.action === 'add'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {stockUpdate.action === 'add' ? (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Add Stock
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 mr-2" />
                        Use Stock
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Request Item Modal */}
      {showRequestModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Request New Item</h2>
                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={requestItem.itemName}
                    onChange={(e) => setRequestItem({...requestItem, itemName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium Detergent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <Select value={requestItem.category} onValueChange={(value) => setRequestItem({...requestItem, category: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Select Category</SelectItem>
                      <SelectItem value="Cleaning Chemicals">Cleaning Chemicals</SelectItem>
                      <SelectItem value="Dry Cleaning Chemicals">Dry Cleaning Chemicals</SelectItem>
                      <SelectItem value="Packaging Materials">Packaging Materials</SelectItem>
                      <SelectItem value="Equipment Supplies">Equipment Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={requestItem.description}
                    onChange={(e) => setRequestItem({...requestItem, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the item, its purpose, and specifications..."
                  />
                </div>

                {/* Estimated Quantity & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Est. Quantity</label>
                    <input
                      type="text"
                      value={requestItem.estimatedQuantity}
                      onChange={(e) => setRequestItem({...requestItem, estimatedQuantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <Select value={requestItem.unit} onValueChange={(value) => setRequestItem({...requestItem, unit: value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="units">Units</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="bottles">Bottles</SelectItem>
                        <SelectItem value="pieces">Pieces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <Select value={requestItem.urgency} onValueChange={(value) => setRequestItem({...requestItem, urgency: value as 'low' | 'normal' | 'high'})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait 1-2 weeks</SelectItem>
                      <SelectItem value="normal">Normal - Needed within a week</SelectItem>
                      <SelectItem value="high">High - Urgent, needed ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  </select>
                </div>

                {/* Justification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Justification</label>
                  <textarea
                    value={requestItem.justification}
                    onChange={(e) => setRequestItem({...requestItem, justification: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Why is this item needed? How will it improve operations?"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestItem}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
export default withRouteGuard(AdminInventoryPage, {
  module: 'inventory',
  action: 'view',
  feature: 'inventory'
})