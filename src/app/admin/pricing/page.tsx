'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  IndianRupee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface PriceItem {
  _id?: string
  category: string
  garment: string
  dryClean: number
  steamPress: number
  starch: number
  alteration: number
  isActive?: boolean
  sortOrder?: number
}

const categories = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'kids', label: 'Kids' },
  { id: 'household', label: 'Household' },
  { id: 'institutional', label: 'Institutional' },
  { id: 'others', label: 'Others' },
]

export default function AdminPricingPage() {
  const [prices, setPrices] = useState<PriceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('men')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState<PriceItem>({
    category: 'men',
    garment: '',
    dryClean: 0,
    steamPress: 0,
    starch: 0,
    alteration: 0
  })

  const getAuthHeaders = () => {
    const authData = localStorage.getItem('laundry-auth')
    let token = null
    if (authData) {
      try {
        const parsed = JSON.parse(authData)
        token = parsed.state?.token || parsed.token
      } catch (e) {}
    }
    if (!token) token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/service-prices/all`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setPrices(data.data)
      }
    } catch (error) {
      console.error('Error fetching prices:', error)
      toast.error('Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.garment.trim()) {
      toast.error('Garment name is required')
      return
    }

    try {
      setSaving(true)
      const url = editingId 
        ? `${API_URL}/service-prices/${editingId}`
        : `${API_URL}/service-prices`
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast.success(editingId ? 'Price updated!' : 'Price added!')
        fetchPrices()
        resetForm()
      } else {
        toast.error(data.message || 'Failed to save')
      }
    } catch (error) {
      toast.error('Failed to save price')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: PriceItem) => {
    setFormData(item)
    setEditingId(item._id || null)
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price?')) return

    try {
      const response = await fetch(`${API_URL}/service-prices/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Price deleted!')
        fetchPrices()
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete price')
    }
  }

  const resetForm = () => {
    setFormData({
      category: activeCategory,
      garment: '',
      dryClean: 0,
      steamPress: 0,
      starch: 0,
      alteration: 0
    })
    setEditingId(null)
    setShowAddModal(false)
  }

  const filteredPrices = prices.filter(p => p.category === activeCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600">Manage service prices for all categories</p>
        </div>
        <Button 
          onClick={() => {
            setFormData({ ...formData, category: activeCategory })
            setShowAddModal(true)
          }}
          className="bg-teal-500 hover:bg-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Price
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Garment</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">Dry Clean</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">Steam Press</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">Starch</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">Alteration</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.length > 0 ? (
              filteredPrices.map((item, index) => (
                <tr key={item._id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-4 px-6 text-gray-800 font-medium">{item.garment}</td>
                  <td className="py-4 px-4 text-center text-gray-600">₹{item.dryClean}</td>
                  <td className="py-4 px-4 text-center text-gray-600">₹{item.steamPress}</td>
                  <td className="py-4 px-4 text-center text-gray-600">₹{item.starch}</td>
                  <td className="py-4 px-4 text-center text-gray-600">₹{item.alteration}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <IndianRupee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No prices found for this category</p>
                  <Button 
                    onClick={() => {
                      setFormData({ ...formData, category: activeCategory })
                      setShowAddModal(true)
                    }}
                    variant="outline" 
                    className="mt-4"
                  >
                    Add First Price
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Price' : 'Add New Price'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Garment Name *</label>
                <input
                  type="text"
                  value={formData.garment}
                  onChange={(e) => setFormData({ ...formData, garment: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Shirt, Saree, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dry Clean (₹)</label>
                  <input
                    type="number"
                    value={formData.dryClean}
                    onChange={(e) => setFormData({ ...formData, dryClean: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Steam Press (₹)</label>
                  <input
                    type="number"
                    value={formData.steamPress}
                    onChange={(e) => setFormData({ ...formData, steamPress: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starch (₹)</label>
                  <input
                    type="number"
                    value={formData.starch}
                    onChange={(e) => setFormData({ ...formData, starch: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alteration (₹)</label>
                  <input
                    type="number"
                    value={formData.alteration}
                    onChange={(e) => setFormData({ ...formData, alteration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-500 hover:bg-teal-600">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {editingId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
