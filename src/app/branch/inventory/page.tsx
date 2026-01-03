'use client'

import { useState, useEffect } from 'react'
import { 
  Package2, 
  Plus, 
  Search, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  Save,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { branchApi, centerAdminApi } from '@/lib/centerAdminApi'
import toast from 'react-hot-toast'

interface InventoryItem {
  _id: string
  itemName: string
  currentStock: number
  minThreshold: number
  maxCapacity: number
  unit: string
  unitCost?: number
  costPerUnit?: number
  supplier?: { name?: string; contact?: string; email?: string } | string
  expiryDate?: string
  isLowStock: boolean
  isExpired: boolean
  lastRestocked?: string
}

interface InventoryStats {
  totalItems: number
  lowStockItems: number
  expiredItems: number
  totalValue: number
}

const INVENTORY_ITEMS = [
  'detergent',
  'softener',
  'bleach',
  'starch',
  'chemicals',
  'hangers',
  'poly_bags',
  'tags'
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form states
  const [newItem, setNewItem] = useState({
    itemName: '',
    currentStock: 0,
    minThreshold: 10,
    maxCapacity: 100,
    unit: 'units',
    unitCost: 0,
    supplier: ''
  })
  const [stockUpdate, setStockUpdate] = useState({
    quantity: 0,
    action: 'add' as 'add' | 'consume',
    reason: ''
  })

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await centerAdminApi.getInventory()
      if (response.success) {
        setInventory(response.data.inventory || [])
        setStats(response.data.stats)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleAddItem = async () => {
    if (!newItem.itemName || newItem.currentStock < 0) {
      toast.error('Please fill required fields')
      return
    }

    try {
      setSaving(true)
      await centerAdminApi.addInventoryItem(newItem)
      toast.success('Item added successfully')
      setShowAddModal(false)
      setNewItem({
        itemName: '',
        currentStock: 0,
        minThreshold: 10,
        maxCapacity: 100,
        unit: 'units',
        unitCost: 0,
        supplier: ''
      })
      fetchInventory()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStock = async () => {
    if (!selectedItem || stockUpdate.quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    try {
      setSaving(true)
      await centerAdminApi.updateInventoryStock(
        selectedItem._id,
        stockUpdate.quantity,
        stockUpdate.action,
        stockUpdate.reason
      )
      toast.success('Stock updated successfully')
      setShowStockModal(false)
      setSelectedItem(null)
      setStockUpdate({ quantity: 0, action: 'add', reason: '' })
      fetchInventory()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      setSaving(true)
      await centerAdminApi.deleteInventoryItem(itemId)
      toast.success('Item deleted')
      setShowDeleteModal(false)
      setDeleteItemId(null)
      fetchInventory()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  const openDeleteModal = (itemId: string) => {
    setDeleteItemId(itemId)
    setShowDeleteModal(true)
  }

  const openStockModal = (item: InventoryItem, action: 'add' | 'consume') => {
    setSelectedItem(item)
    setStockUpdate({ quantity: 0, action, reason: '' })
    setShowStockModal(true)
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'low' && item.isLowStock) ||
      (filter === 'expired' && item.isExpired)
    return matchesSearch && matchesFilter
  })

  const getStockPercentage = (item: InventoryItem) => {
    return Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100))
  }

  const getStockColor = (item: InventoryItem) => {
    if (item.isExpired) return 'bg-red-500'
    if (item.isLowStock) return 'bg-orange-500'
    const percentage = getStockPercentage(item)
    if (percentage > 60) return 'bg-green-500'
    if (percentage > 30) return 'bg-yellow-500'
    return 'bg-orange-500'
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage branch supplies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchInventory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Package2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
                <div className="text-sm text-blue-100">Total Items</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.lowStockItems}</div>
                <div className="text-sm text-orange-100">Low Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.expiredItems}</div>
                <div className="text-sm text-red-100">Expired</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">₹{stats.totalValue.toLocaleString()}</div>
                <div className="text-sm text-green-100">Total Value</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredInventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No inventory items</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Add your first inventory item'}
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.map((item) => (
            <div 
              key={item._id} 
              className={`bg-white rounded-xl shadow-sm border p-4 ${
                item.isExpired ? 'border-red-300 bg-red-50' : 
                item.isLowStock ? 'border-orange-300 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {item.itemName.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">{item.unit}</p>
                </div>
                <div className="flex gap-1">
                  {item.isExpired && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Expired</span>
                  )}
                  {item.isLowStock && !item.isExpired && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Low</span>
                  )}
                </div>
              </div>

              {/* Stock Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Stock Level</span>
                  <span className="font-medium">{item.currentStock} / {item.maxCapacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStockColor(item)}`}
                    style={{ width: `${getStockPercentage(item)}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Min Threshold:</span>
                  <span>{item.minThreshold} {item.unit}</span>
                </div>
                {(item.unitCost || item.costPerUnit) && (item.unitCost || item.costPerUnit || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Unit Cost:</span>
                    <span>₹{item.unitCost || item.costPerUnit}</span>
                  </div>
                )}
                {item.supplier && (
                  <div className="flex justify-between">
                    <span>Supplier:</span>
                    <span>{typeof item.supplier === 'string' ? item.supplier : item.supplier?.name || '-'}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                  onClick={() => openStockModal(item, 'add')}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Restock
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={() => openStockModal(item, 'consume')}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Use
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => openDeleteModal(item._id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <select
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select item</option>
                  {INVENTORY_ITEMS.map(item => (
                    <option key={item} value={item}>{item.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="units">Units</option>
                    <option value="liters">Liters</option>
                    <option value="kg">Kg</option>
                    <option value="ml">ML</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.maxCapacity}
                    onChange={(e) => setNewItem({ ...newItem, maxCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddItem}
                disabled={saving || !newItem.itemName}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {showStockModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {stockUpdate.action === 'add' ? 'Restock Item' : 'Use Stock'}
              </h3>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800 capitalize">{selectedItem.itemName.replace('_', ' ')}</div>
              <div className="text-sm text-gray-500">Current: {selectedItem.currentStock} {selectedItem.unit}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={stockUpdate.reason}
                  onChange={(e) => setStockUpdate({ ...stockUpdate, reason: e.target.value })}
                  placeholder={stockUpdate.action === 'add' ? 'e.g., Monthly restock' : 'e.g., Order processing'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdateStock}
                disabled={saving || stockUpdate.quantity <= 0}
                className={`flex-1 ${stockUpdate.action === 'add' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {stockUpdate.action === 'add' ? 'Add Stock' : 'Use Stock'}
              </Button>
              <Button variant="outline" onClick={() => setShowStockModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItemId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Item</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure you want to delete this inventory item? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleDeleteItem(deleteItemId)}
                disabled={saving}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setShowDeleteModal(false); setDeleteItemId(null); }} 
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
