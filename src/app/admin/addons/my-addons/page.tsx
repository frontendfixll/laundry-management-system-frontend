'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, TrendingUp, Users, DollarSign, Clock, AlertCircle, CheckCircle, XCircle, Eye, Crown, Zap, Star, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenantAddOns, useAddOnUsageStats } from '@/hooks/useAddOns'
import { formatCurrency, formatDate, formatNumber, capitalize } from '@/lib/utils'
import { AddOnCancelModal } from '@/components/addons/AddOnCancelModal'
import { AddOnUsageModal } from '@/components/addons/AddOnUsageModal'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  trial: 'bg-blue-100 text-blue-800 border-blue-200',
  suspended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusIcons = {
  active: CheckCircle,
  trial: Clock,
  suspended: AlertCircle,
  cancelled: XCircle,
  expired: XCircle
}

const categoryIcons = {
  capacity: Zap,
  feature: Star,
  usage: TrendingUp,
  branding: Crown,
  integration: Package,
  support: Users
}

export default function MyAddOnsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [cancellingAddOn, setCancellingAddOn] = useState(null)
  const [viewingUsage, setViewingUsage] = useState(null)

  // Always try to fetch data - let the hook handle authentication
  const {
    addOns,
    summary,
    loading,
    error,
    cancelAddOn,
    refetch
  } = useTenantAddOns({
    // Remove status filter to show ALL purchased add-ons (active, trial, suspended, etc.)
    includeUsage: true
  })

  const { stats: usageStats } = useAddOnUsageStats('30d')

  // Log the current state for debugging
  useEffect(() => {
    console.log('🔍 MyAddOns: Current state:', {
      loading,
      error: error?.message,
      addOnsCount: addOns?.length || 0,
      isAuthenticated,
      hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false
    })
  }, [loading, error, addOns, isAuthenticated])

  // Handle authentication redirect only if we have a clear auth error
  useEffect(() => {
    if (error && error.message.includes('Authentication required')) {
      console.log('🔐 Authentication error detected, redirecting to login')
      router.push('/auth/login')
    }
  }, [error, router])

  // Don't render anything if we have an authentication error
  if (error && error.message.includes('Authentication required')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your add-ons.</p>
          <Button onClick={() => router.push('/auth/login')}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // Show error state for authentication errors
  if (error && error.message.includes('Authentication')) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
            <Button 
              variant="link" 
              className="ml-2 p-0 h-auto"
              onClick={() => {
                // Clear tokens and redirect to login
                localStorage.removeItem('token')
                localStorage.removeItem('laundry-auth')
                router.push('/auth/login')
              }}
            >
              Login again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleCancelSuccess = () => {
    setCancellingAddOn(null)
    refetch()
  }

  // Get current billing plan info
  const currentPlan = user?.tenancy?.subscription?.plan || user?.subscription?.plan || 'free'
  const planDisplayName = (() => {
    // Try to get plan display name from various possible locations
    if (user?.tenancy?.subscription?.planId?.displayName) {
      return user.tenancy.subscription.planId.displayName
    }
    if (user?.subscription?.planId?.displayName) {
      return user.subscription.planId.displayName
    }
    // Fallback to plan name with proper formatting
    const planName = user?.tenancy?.subscription?.plan || user?.subscription?.plan
    if (planName && planName !== 'free') {
      return planName.charAt(0).toUpperCase() + planName.slice(1) + ' Plan'
    }
    return 'Free Plan'
  })()

  return (
    <div className="space-y-8">
      {/* Header with Billing Plan Info */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold">My Add-ons</h1>
                <p className="text-blue-100 text-lg">Manage your active subscriptions and usage</p>
              </div>
            </div>
            
            {/* Current Plan Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Crown className="w-4 h-4" />
              <span className="font-medium">Current Plan: {planDisplayName}</span>
            </div>
            
            {/* Plan Benefits Hint */}
            {currentPlan === 'free' && (
              <div className="mt-3 text-sm text-blue-100">
                💡 Upgrade to unlock premium add-ons and advanced features
              </div>
            )}
          </div>
          
          <div className="mt-6 lg:mt-0">
            <Link href="/admin/addons/marketplace">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8">
                <Plus className="mr-2 h-5 w-5" />
                Browse Add-ons
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Add-ons"
          value={addOns?.length || 0}
          subtitle={`${summary?.active || 0} active, ${summary?.trial || 0} trial`}
          icon={Package}
          gradient="from-blue-500 to-indigo-600"
        />
        
        <SummaryCard
          title="Active Add-ons"
          value={summary?.active || 0}
          subtitle="Currently running"
          icon={CheckCircle}
          gradient="from-emerald-500 to-teal-600"
        />
        
        <SummaryCard
          title="Monthly Spend"
          value={formatCurrency(
            addOns?.filter(addon => addon.status === 'active').reduce((sum, addon) => {
              const pricing = addon.effectivePricing
              return sum + (pricing?.monthly || 0) * addon.quantity
            }, 0) || 0
          )}
          subtitle="Active subscriptions only"
          icon={DollarSign}
          gradient="from-purple-500 to-pink-600"
        />
        
        <SummaryCard
          title="Usage Credits"
          value={formatNumber(
            addOns?.reduce((sum, addon) => {
              return sum + (addon.usageTracking?.remainingCredits || 0)
            }, 0) || 0
          )}
          subtitle="Credits remaining"
          icon={TrendingUp}
          gradient="from-orange-500 to-red-600"
        />
      </div>

      {/* Add-ons Grid */}
      {addOns && addOns.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Add-ons</h2>
              <p className="text-gray-600 mt-1">Manage your subscriptions and track usage</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {addOns.length} {addOns.length === 1 ? 'Add-on' : 'Add-ons'}
            </Badge>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {addOns.map((tenantAddOn) => (
              <EnhancedAddOnCard
                key={tenantAddOn.id}
                tenantAddOn={tenantAddOn}
                onViewUsage={() => setViewingUsage(tenantAddOn)}
                onCancel={() => setCancellingAddOn(tenantAddOn)}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState />
      )}

      {/* Modals */}
      {cancellingAddOn && (
        <AddOnCancelModal
          open={!!cancellingAddOn}
          tenantAddOn={cancellingAddOn}
          onClose={() => setCancellingAddOn(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {viewingUsage && (
        <AddOnUsageModal
          open={!!viewingUsage}
          tenantAddOn={viewingUsage}
          onClose={() => setViewingUsage(null)}
        />
      )}
    </div>
  )
}

function SummaryCard({ title, value, subtitle, icon: Icon, gradient }: any) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function EnhancedAddOnCard({ tenantAddOn, onViewUsage, onCancel }: any) {
  const IconComponent = categoryIcons[tenantAddOn.addOn.category as keyof typeof categoryIcons] || Package
  const isActive = tenantAddOn.status === 'active'
  const isTrial = tenantAddOn.status === 'trial'
  const isExpiredOrCancelled = tenantAddOn.status === 'cancelled' || tenantAddOn.status === 'expired'
  
  return (
    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white h-[110px] flex rounded-md">
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isActive ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 
        isTrial ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 
        'bg-gradient-to-r from-gray-400 to-gray-500'
      }`} />
      
      {/* Main Content Section with Icon Integrated */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        {/* Title with Small Icon and Status */}
        <div className="mb-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="p-1 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm flex-shrink-0">
              <IconComponent className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate flex-1">
              {tenantAddOn.addOn.displayName}
            </CardTitle>
            <StatusBadge status={tenantAddOn.status} />
            {tenantAddOn.quantity > 1 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 bg-purple-100 text-purple-700 border-0 flex-shrink-0">
                {tenantAddOn.quantity}x
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0 border-gray-300 bg-gray-50 font-medium">
            {capitalize(tenantAddOn.addOn.category)}
          </Badge>
        </div>
        
        {/* Pricing and Billing */}
        <div className="mb-1">
          <div className="flex items-baseline gap-0.5 mb-0.5">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency((tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity)}
            </span>
            <span className="text-xs font-medium text-gray-500">/mo</span>
          </div>
          {tenantAddOn.nextBillingDate && (
            <div className="text-xs text-gray-500">
              Next: {formatDate(tenantAddOn.nextBillingDate)}
            </div>
          )}
        </div>
        
        {/* Usage or Trial Progress - Very Compact */}
        {tenantAddOn.usageTracking && (
          <div className="mb-1">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <div className="flex-1 bg-gray-200 rounded-full h-0.5">
                <div 
                  className="bg-blue-500 h-0.5 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (tenantAddOn.usageTracking.totalUsed / (tenantAddOn.usageTracking.totalUsed + tenantAddOn.usageTracking.remainingCredits)) * 100)}%` 
                  }}
                ></div>
              </div>
              <span className="font-medium text-xs">{tenantAddOn.usageTracking.totalUsed}</span>
            </div>
          </div>
        )}
        
        {isTrial && (
          <div className="mb-1">
            <div className="text-xs text-blue-600 bg-blue-50 rounded px-1 py-0 inline-block font-medium">
              {Math.ceil((new Date(tenantAddOn.activatedAt).getTime() + (tenantAddOn.addOn.trialDays * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000))}d
            </div>
          </div>
        )}
      </div>
      
      {/* Right Section - Action Buttons */}
      <div className="flex-shrink-0 w-[75px] p-3 flex items-center justify-center">
        {!isExpiredOrCancelled ? (
          <div className="space-y-1 w-full">
            {tenantAddOn.usageTracking && isActive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewUsage} 
                className="w-full rounded-md text-xs font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 h-5 flex items-center justify-center"
              >
                <Eye className="h-3 w-3 mr-0.5" />
                Use
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCancel} 
              className="w-full rounded-md text-xs font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 h-5 flex items-center justify-center"
            >
              <Settings className="h-3 w-3 mr-0.5" />
              Manage
            </Button>
          </div>
        ) : (
          <div className="w-full text-center">
            <div className="bg-gray-100 rounded-md p-1.5 border border-dashed border-gray-300">
              <div className="text-xs text-gray-500 font-medium mb-0.5">
                {tenantAddOn.status === 'cancelled' ? 'Cancelled' : 'Expired'}
              </div>
              <div className="text-xs text-gray-400">
                {tenantAddOn.status === 'cancelled' 
                  ? (tenantAddOn.cancelledAt ? formatDate(tenantAddOn.cancelledAt) : '')
                  : (tenantAddOn.expiredAt ? formatDate(tenantAddOn.expiredAt) : '')
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const IconComponent = statusIcons[status as keyof typeof statusIcons]
  
  return (
    <Badge className={`${statusColors[status as keyof typeof statusColors]} border`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {capitalize(status)}
    </Badge>
  )
}

function UsageIndicator({ usageTracking }: { usageTracking: any }) {
  const totalCredits = usageTracking.totalUsed + usageTracking.remainingCredits
  const usagePercentage = totalCredits > 0 ? (usageTracking.totalUsed / totalCredits) * 100 : 0
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Usage</span>
        <span className="text-sm font-bold text-gray-900">
          {formatNumber(usageTracking.remainingCredits)} credits left
        </span>
      </div>
      <div className="space-y-1">
        <Progress value={usagePercentage} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatNumber(usageTracking.totalUsed)} used</span>
          <span>{formatNumber(totalCredits)} total</span>
        </div>
      </div>
      {usageTracking.lowBalanceAlerted && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
          ⚠️ Low balance alert
        </div>
      )}
    </div>
  )
}

function TrialProgress({ tenantAddOn }: { tenantAddOn: any }) {
  const trialEndsAt = new Date(tenantAddOn.activatedAt)
  trialEndsAt.setDate(trialEndsAt.getDate() + tenantAddOn.addOn.trialDays)
  const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const progress = Math.max(0, (tenantAddOn.addOn.trialDays - daysLeft) / tenantAddOn.addOn.trialDays * 100)
  
  return (
    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-800">Trial Progress</span>
        <span className="text-sm font-bold text-blue-900">
          {Math.max(0, daysLeft)} days left
        </span>
      </div>
      <Progress value={progress} className="h-2 mb-2" />
      <div className="text-xs text-blue-700">
        After trial: {formatCurrency((tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity)}/month
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Add-ons Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven't purchased any add-ons yet. Browse our marketplace to enhance your laundry management system with powerful features.
        </p>
        <Link href="/admin/addons/marketplace">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="mr-2 h-5 w-5" />
            Browse Marketplace
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}