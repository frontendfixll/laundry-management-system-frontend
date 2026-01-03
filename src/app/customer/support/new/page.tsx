'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  Send,
  AlertCircle,
  Package,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
}

export default function NewTicketPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  const categoryParam = searchParams.get('category')
  
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categoryParam || '',
    relatedOrderId: orderIdParam || '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoadingData(true)
    try {
      const [categoriesRes, ordersRes] = await Promise.all([
        api.get('/customer/tickets/categories'),
        api.get('/customer/orders?limit=20'),
      ])
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data.categories || [])
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/customer/tickets', formData)
      if (response.data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/customer/support/${response.data.data.ticket._id}`)
        }, 1500)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ticket Created!</h2>
          <p className="text-gray-600">Redirecting to your ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer/support">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create Support Ticket</h1>
          <p className="text-gray-500">Tell us about your issue</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {loadingData ? (
              <div className="col-span-full text-center py-4 text-gray-500">Loading categories...</div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    formData.category === cat.id
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Related Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Order (Optional)
          </label>
          <select
            value={formData.relatedOrderId}
            onChange={(e) => setFormData({ ...formData, relatedOrderId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          >
            <option value="">Select an order (optional)</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                {order.orderNumber} - ₹{order.totalAmount} ({formatDate(order.createdAt)})
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief description of your issue"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Please provide details about your issue. Include any relevant information like order numbers, dates, or specific items."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Link href="/customer/support" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || !formData.title || !formData.description || !formData.category}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
