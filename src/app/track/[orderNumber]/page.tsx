'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  service: string
  category: string
  quantity: number
  price: number
  subtotal: number
}

interface TimelineStep {
  status: string
  label: string
  icon: string
  completed: boolean
  date: string | null
}

interface TrackingData {
  orderNumber: string
  barcode: string
  status: string
  statusLabel: string
  customer: {
    name: string
  }
  items: OrderItem[]
  pricing: {
    subtotal: number
    discount: number
    tax: number
    total: number
  }
  pickupDate: string
  estimatedDeliveryDate: string
  actualDeliveryDate: string | null
  createdAt: string
  branch: {
    name: string
    code: string
    city: string
  } | null
  isExpress: boolean
  serviceType: string
  timeline: TimelineStep[]
  currentStep: number
}

export default function PublicOrderTracking() {
  const params = useParams()
  const orderNumber = params.orderNumber as string

  const [order, setOrder] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/track/${orderNumber}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details')
      }

      setOrder(data.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'cancelled') return 'text-red-600 bg-red-50'
    if (status === 'delivered') return 'text-green-600 bg-green-50'
    return 'text-blue-600 bg-blue-50'
  }

  const getIconForStep = (icon: string) => {
    switch (icon) {
      case 'check':
        return <CheckCircle className="w-5 h-5" />
      case 'truck':
        return <Truck className="w-5 h-5" />
      case 'loader':
        return <Loader2 className="w-5 h-5" />
      case 'package':
        return <Package className="w-5 h-5" />
      case 'check-circle':
        return <CheckCircle className="w-5 h-5" />
      case 'x-circle':
        return <XCircle className="w-5 h-5" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Order Details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Please check your order number and try again.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order Tracking</h1>
              <p className="text-gray-600 text-sm mt-1">Track your laundry order status</p>
            </div>
            {order.isExpress && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                Express
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-xl font-bold text-gray-800">{order.orderNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
              <p className="text-sm font-semibold">{order.statusLabel}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Timeline</h2>
          <div className="space-y-4">
            {order.timeline.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {getIconForStep(step.icon)}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(step.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
                {step.completed && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer & Branch Info */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Package className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium text-gray-800">{order.customer.name}</p>
                </div>
              </div>
              {order.branch && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Branch</p>
                    <p className="font-medium text-gray-800">{order.branch.name}</p>
                    <p className="text-sm text-gray-600">{order.branch.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Important Dates</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Pickup Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(order.pickupDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">
                    {order.actualDeliveryDate ? 'Delivered On' : 'Estimated Delivery'}
                  </p>
                  <p className="font-medium text-gray-800">
                    {new Date(order.actualDeliveryDate || order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items & Pricing */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.service}</p>
                  {item.category && (
                    <p className="text-sm text-gray-500">{item.category}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="font-semibold text-gray-800">₹{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.pricing.subtotal}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.pricing.discount}</span>
              </div>
            )}
            {order.pricing.tax > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>₹{order.pricing.tax}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>₹{order.pricing.total}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Need help? Contact your laundry service provider</p>
        </div>
      </div>
    </div>
  )
}
