'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ShoppingBag,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed_amount'
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  perUserLimit: number
  startDate: string
  endDate: string
  isActive: boolean
  applicableServices: string[]
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CouponsPage() {
  const { token } = useAuthStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount',
    value: 10,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    perUserLimit: 1,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    isActive: true,
    applicableServices: ['all'],
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data.coupons || [])
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingCoupon
        ? `${API_BASE}/admin/coupons/${editingCoupon._id}`
        : `${API_BASE}/admin/coupons`
      const method = editingCoupon ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingCoupon ? 'Coupon updated!' : 'Coupon created!')
        setShowModal(false)
        resetForm()
        fetchCoupons()
      } else {
        toast.error(data.message || 'Failed to save coupon')
      }
    } catch (error) {
      toast.error('Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Coupon deleted!')
        fetchCoupons()
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`${API_BASE}/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}!`)
        fetchCoupons()
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const resetForm = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: 10,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      perUserLimit: 1,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      isActive: true,
      applicableServices: ['all'],
    })
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      startDate: format(new Date(coupon.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(coupon.endDate), 'yyyy-MM-dd'),
      isActive: coupon.isActive,
      applicableServices: coupon.applicableServices,
    })
    setShowModal(true)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isExpired = (endDate: string) => new Date(endDate) < new Date()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500 mt-1">Manage promotional codes for your customers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search coupons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Coupons</p>
              <p className="text-xl font-bold">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold">{coupons.filter(c => c.isActive && !isExpired(c.endDate)).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Used</p>
              <p className="text-xl font-bold">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-xl font-bold">{coupons.filter(c => isExpired(c.endDate)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No coupons found</h3>
          <p className="text-gray-500 mt-1">Create your first coupon to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className={`bg-white rounded-xl border p-4 ${
                !coupon.isActive || isExpired(coupon.endDate) ? 'opacity-60' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    coupon.type === 'percentage' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {coupon.type === 'percentage' ? (
                      <Percent className="w-6 h-6 text-purple-600" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg bg-gray-100 px-3 py-1 rounded">
                        {coupon.code}
                      </span>
                      <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-100 rounded">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      {!coupon.isActive && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Inactive</span>
                      )}
                      {isExpired(coupon.endDate) && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Expired</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mt-1">{coupon.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                      </span>
                      {coupon.minOrderValue > 0 && (
                        <span>Min: ₹{coupon.minOrderValue}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {coupon.usedCount}/{coupon.usageLimit || '∞'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(coupon.endDate), 'dd MMM yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(coupon)}
                    className={`p-2 rounded-lg transition-colors ${
                      coupon.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {coupon.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openEditModal(coupon)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button type="button" onClick={generateCode} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Generate
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Sale 20% Off"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed_amount' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    min="0"
                    placeholder="0 = No limit"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    min="0"
                    placeholder="0 = Unlimited"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (customers can use this coupon)
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
