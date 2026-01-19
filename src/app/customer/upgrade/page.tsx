'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { 
  TrendingUp, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Settings,
  Crown,
  ArrowRight,
  Clock,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface BillingPlan {
  _id: string
  name: string
  displayName: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: Record<string, any>
  isPopular: boolean
  badge: string
}

interface CurrentPlan {
  _id: string
  name: string
  displayName: string
  price: { monthly: number }
}

export default function CustomerUpgradePage() {
  const router = useRouter()
  const { user, tenancy } = useAuthStore()
  
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [requestLoading, setRequestLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [upgradeReason, setUpgradeReason] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tenancy?.slug) {
      setError('Unable to identify your business. Please contact support.')
      setLoading(false)
      return
    }
    
    fetchCurrentPlan()
    fetchAvailablePlans()
  }, [tenancy])

  const fetchCurrentPlan = async () => {
    try {
      // Get current subscription info
      const response = await api.get('/customer/subscription')
      
      if (response.data?.success && response.data.data?.subscription?.planId) {
        setCurrentPlan(response.data.data.subscription.planId)
      }
    } catch (error: any) {
      console.error('Error fetching current plan:', error)
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      const response = await api.get('/public/billing/plans')
      
      if (response.data?.success) {
        setAvailablePlans(response.data.data.plans || [])
      }
    } catch (error: any) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestLoading(true)
    setError('')

    try {
      const selectedPlanData = availablePlans.find(p => p._id === selectedPlan)
      
      if (!selectedPlanData || !currentPlan || !tenancy?.slug) {
        throw new Error('Invalid plan selection or business information')
      }

      const upgradeAmount = selectedPlanData.price.monthly - currentPlan.price.monthly

      // Create customer upgrade request
      const response = await api.post('/public/upgrade-request', {
        tenancySlug: tenancy.slug,
        toPlanId: selectedPlan,
        upgradeAmount: upgradeAmount,
        reason: upgradeReason,
        customerInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || ''
        }
      })

      if (response.data?.success) {
        setRequestSubmitted(true)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit upgrade request')
    } finally {
      setRequestLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('basic')) return Users
    if (name.includes('pro')) return BarChart3
    if (name.includes('enterprise')) return Crown
    return Settings
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading upgrade options...</p>
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

  if (requestSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your upgrade request has been sent to our sales team. You'll receive a payment link within 24 hours.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>What's Next:</strong><br />
              1. Our team will review your request<br />
              2. You'll receive a secure payment link<br />
              3. Complete payment to activate upgrade
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/customer/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
            <Link href="/customer/upgrade-status" className="flex-1">
              <Button className="w-full">Check Status</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const upgradablePlans = availablePlans.filter(plan => 
    plan.price.monthly > (currentPlan?.price?.monthly || 0)
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customer/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Upgrade Your Plan</h1>
          <p className="text-gray-600 mt-1">Get more features and grow your business</p>
        </div>
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Current Plan</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{currentPlan.displayName}</h3>
                <p className="text-gray-600">{formatCurrency(currentPlan.price.monthly)}/month</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              Active
            </span>
          </div>
        </div>
      )}

      {/* Upgrade Options */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Upgrade</h2>
        
        {upgradablePlans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Crown className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're on the highest plan!</h3>
            <p className="text-gray-600 mb-6">
              You're already enjoying all our premium features. Contact support for custom enterprise solutions.
            </p>
            <Link href="/customer/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upgradablePlans.map((plan) => {
              const Icon = getPlanIcon(plan.name)
              const upgradeAmount = plan.price.monthly - (currentPlan?.price?.monthly || 0)
              
              return (
                <div
                  key={plan._id}
                  className={`bg-white rounded-2xl shadow-xl p-6 cursor-pointer transition-all hover:shadow-2xl ${
                    selectedPlan === plan._id 
                      ? 'ring-2 ring-teal-500 bg-teal-50' 
                      : 'hover:scale-105'
                  } ${plan.isPopular ? 'relative' : ''}`}
                  onClick={() => setSelectedPlan(plan._id)}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="bg-teal-100 p-3 rounded-full w-fit mx-auto mb-4">
                      <Icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold text-teal-600 mb-1">
                      {formatCurrency(plan.price.monthly)}
                    </div>
                    <p className="text-sm text-gray-600">per month</p>
                    <div className="mt-2 text-green-600 font-semibold">
                      +{formatCurrency(upgradeAmount)} from current plan
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {Object.entries(plan.features || {}).slice(0, 4).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center">
                    <input
                      type="radio"
                      name="selectedPlan"
                      value={plan._id}
                      checked={selectedPlan === plan._id}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-4 h-4 text-teal-600"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-900">
                      Select this plan
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Request Form */}
      {selectedPlan && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Upgrade Request</h2>
          
          <form onSubmit={handleUpgradeRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why do you want to upgrade? (Optional)
              </label>
              <textarea
                value={upgradeReason}
                onChange={(e) => setUpgradeReason(e.target.value)}
                placeholder="e.g., Need more users, require advanced features, business growth..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
              <h4 className="font-semibold text-teal-900 mb-2">📋 What happens next?</h4>
              <div className="text-sm text-teal-700 space-y-1">
                <p>1. Your request will be reviewed by our sales team</p>
                <p>2. You'll receive a secure payment link within 24 hours</p>
                <p>3. Complete payment to activate your upgrade</p>
                <p>4. Enjoy your new features immediately after payment</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={requestLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {requestLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Upgrade Request
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}