'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UpgradeRequest {
  _id: string
  fromPlan: {
    name: string
    displayName: string
    price: { monthly: number }
  }
  toPlan: {
    name: string
    displayName: string
    price: { monthly: number }
  }
  pricing: {
    originalPrice: number
    customPrice: number
    discount: number
  }
  paymentTerms: {
    dueDate: string
    gracePeriod: number
  }
  payment: {
    totalPaid: number
    remainingAmount: number
  }
  status: string
  requestedAt: string
}

export default function UpgradeStatusPage() {
  const { tenancy } = useAuthStore()
  
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tenancy?.slug) {
      setError('Unable to identify your business. Please contact support.')
      setLoading(false)
      return
    }
    
    fetchUpgradeStatus()
  }, [tenancy])

  const fetchUpgradeStatus = async () => {
    try {
      setRefreshing(true)
      const response = await api.get(`/public/upgrade-status/${tenancy?.slug}`)
      
      if (response.data?.success) {
        setUpgradeRequests(response.data.data.upgradeRequests || [])
      }
    } catch (error: any) {
      console.error('Error fetching upgrade status:', error)
      setError('Failed to load upgrade status')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        label: 'Pending Review',
        description: 'Your request is being reviewed by our sales team'
      },
      partially_paid: {
        icon: CreditCard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        label: 'Partially Paid',
        description: 'Partial payment received, remaining amount due'
      },
      overdue: {
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        label: 'Payment Overdue',
        description: 'Payment is past due date'
      },
      paid: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Payment Complete',
        description: 'Payment received, upgrade will be activated soon'
      },
      completed: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        label: 'Upgrade Complete',
        description: 'Your plan has been successfully upgraded'
      }
    }
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    )
    return days
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading upgrade status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4 text-4xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/customer/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/customer/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Upgrade Status</h1>
            <p className="text-gray-600 mt-1">Track your plan upgrade requests</p>
          </div>
        </div>
        <Button
          onClick={fetchUpgradeStatus}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Upgrade Requests */}
      {upgradeRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Upgrade Requests</h3>
          <p className="text-gray-600 mb-6">
            You haven't submitted any upgrade requests yet.
          </p>
          <Link href="/customer/upgrade">
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
              Request Upgrade
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {upgradeRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status)
            const StatusIcon = statusInfo.icon
            const daysUntilDue = getDaysUntilDue(request.paymentTerms.dueDate)
            
            return (
              <div
                key={request._id}
                className={`bg-white rounded-2xl shadow-xl p-6 border-2 ${statusInfo.borderColor}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${statusInfo.bgColor}`}>
                      <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{statusInfo.label}</h3>
                      <p className="text-sm text-gray-600">{statusInfo.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Requested</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Plan Change Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                    <p className="font-bold text-gray-900">{request.fromPlan.displayName}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(request.fromPlan.price.monthly)}/month</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4">
                    <p className="text-sm text-teal-600 mb-1">Upgrading To</p>
                    <p className="font-bold text-teal-900">{request.toPlan.displayName}</p>
                    <p className="text-sm text-teal-600">{formatCurrency(request.toPlan.price.monthly)}/month</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Total Amount</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(request.pricing.customPrice)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Paid</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(request.payment.totalPaid)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">Remaining</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(request.payment.remainingAmount)}
                    </p>
                  </div>
                </div>

                {/* Due Date Info */}
                {request.payment.remainingAmount > 0 && (
                  <div className={`rounded-xl p-4 ${
                    daysUntilDue < 0 
                      ? 'bg-red-50 border border-red-200' 
                      : daysUntilDue <= 3 
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-5 h-5 ${
                          daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                        <span className="font-semibold text-gray-900">
                          Payment Due: {new Date(request.paymentTerms.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        daysUntilDue < 0 
                          ? 'bg-red-100 text-red-700' 
                          : daysUntilDue <= 3 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {daysUntilDue < 0 
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0
                            ? 'Due today'
                            : `${daysUntilDue} days remaining`
                        }
                      </span>
                    </div>
                  </div>
                )}

                {/* Discount Info */}
                {request.pricing.discount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">%</span>
                      </div>
                      <span className="font-semibold text-green-900">
                        You saved {formatCurrency(request.pricing.discount)}!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link href="/customer/upgrade" className="flex-1">
          <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500">
            Request New Upgrade
          </Button>
        </Link>
        <Link href="/customer/support" className="flex-1">
          <Button variant="outline" className="w-full">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  )
}