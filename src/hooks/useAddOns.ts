import { useState, useEffect, useCallback, useMemo } from 'react'
import { tenantApi } from '@/lib/tenantApi'

interface AddOn {
  _id: string
  name: string
  slug: string
  displayName: string
  description: string
  shortDescription?: string
  category: 'capacity' | 'feature' | 'usage' | 'branding' | 'integration' | 'support'
  subcategory?: string
  tags: string[]
  pricing: {
    monthly?: number
    yearly?: number
    oneTime?: number
    formattedPricing?: {
      monthly?: string
      yearly?: string
      oneTime?: string
      savings?: number
    }
  }
  billingCycle: 'monthly' | 'yearly' | 'one-time' | 'usage-based'
  config: any
  eligibility: {
    eligible: boolean
    reason?: string
  }
  icon: string
  color: string
  images?: any[]
  benefits: string[]
  features: string[]
  useCases: string[]
  status: 'draft' | 'active' | 'hidden' | 'deprecated'
  isPopular: boolean
  isRecommended: boolean
  isFeatured: boolean
  trialDays: number
  maxQuantity: number
  isPurchased?: boolean
  tenantAddOn?: {
    status: string
    activatedAt: string
    nextBillingDate?: string
    usageTracking?: any
  }
}

interface TenantAddOn {
  id: string
  addOn: AddOn
  status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired'
  quantity: number
  activatedAt: string
  nextBillingDate?: string
  billingCycle: string
  isActive: boolean
  daysRemaining?: number
  effectivePricing: any
  usageTracking?: {
    totalUsed: number
    remainingCredits: number
    dailyUsage: any[]
    lowBalanceAlerted: boolean
    autoRenew: boolean
    renewalThreshold: number
  }
}

interface MarketplaceFilters {
  category?: string
  search?: string
  sortBy?: string
  limit?: number
  page?: number
  priceRange?: string
  features?: string
}

interface UsageStats {
  period: string
  dateRange: {
    startDate: string
    endDate: string
  }
  usageStats: any[]
  recentTransactions: any[]
}

// Hook for marketplace add-ons
export function useMarketplaceAddOns(filters: MarketplaceFilters = {}) {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [filterOptions, setFilterOptions] = useState<any>(null)

  // Memoize filters to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.category,
    filters.search,
    filters.sortBy,
    filters.limit,
    filters.page,
    filters.priceRange,
    filters.features
  ])

  const fetchAddOns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      
      if (memoizedFilters.category) params.append('category', memoizedFilters.category)
      if (memoizedFilters.search) params.append('search', memoizedFilters.search)
      if (memoizedFilters.sortBy) params.append('sortBy', memoizedFilters.sortBy)
      if (memoizedFilters.limit) params.append('limit', memoizedFilters.limit.toString())
      if (memoizedFilters.page) params.append('page', memoizedFilters.page.toString())
      if (memoizedFilters.priceRange) params.append('priceRange', memoizedFilters.priceRange)
      if (memoizedFilters.features) params.append('features', memoizedFilters.features)

      const response = await tenantApi.get(`/addons/marketplace?${params.toString()}`)
      
      if (response.data.success) {
        setAddOns(response.data.data.addOns)
        setPagination(response.data.data.pagination)
        setFilterOptions(response.data.data.filters)
      } else {
        throw new Error(response.data.message || 'Failed to fetch add-ons')
      }
    } catch (err) {
      console.error('Error fetching marketplace add-ons:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

  useEffect(() => {
    fetchAddOns()
  }, [fetchAddOns])

  return {
    addOns,
    loading,
    error,
    pagination,
    filterOptions,
    refetch: fetchAddOns
  }
}

// Hook for single add-on details
export function useAddOnDetails(addOnId: string) {
  const [addOn, setAddOn] = useState<AddOn | null>(null)
  const [similarAddOns, setSimilarAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAddOnDetails = useCallback(async () => {
    if (!addOnId) return

    try {
      setLoading(true)
      setError(null)

      const response = await tenantApi.get(`/addons/${addOnId}`)
      
      if (response.data.success) {
        setAddOn(response.data.data.addOn)
        setSimilarAddOns(response.data.data.similarAddOns || [])
      } else {
        throw new Error(response.data.message || 'Failed to fetch add-on details')
      }
    } catch (err) {
      console.error('Error fetching add-on details:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [addOnId])

  useEffect(() => {
    fetchAddOnDetails()
  }, [fetchAddOnDetails])

  return {
    addOn,
    similarAddOns,
    loading,
    error,
    refetch: fetchAddOnDetails
  }
}

// Hook for tenant's add-ons
export function useTenantAddOns(filters: { 
  status?: string; 
  category?: string; 
  includeUsage?: boolean;
} = {}) {
  const [addOns, setAddOns] = useState<TenantAddOn[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTenantAddOns = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check for authentication token in multiple places
      let token = null
      
      if (typeof window !== 'undefined') {
        // First try localStorage
        token = localStorage.getItem('token')
        
        // If no token in localStorage, try to get from auth store
        if (!token) {
          try {
            const authData = localStorage.getItem('laundry-auth')
            if (authData) {
              const parsed = JSON.parse(authData)
              token = parsed.state?.token
            }
          } catch (e) {
            console.log('⚠️ Could not parse auth data from localStorage')
          }
        }
      }
      
      if (!token) {
        console.log('⚠️ No authentication token found for tenant add-ons')
        setError(new Error('Authentication required. Please login again.'))
        setLoading(false)
        return
      }

      console.log('🔍 useTenantAddOns: Fetching with token available')

      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.includeUsage !== undefined) params.append('includeUsage', filters.includeUsage.toString())

      console.log('🔍 API call params:', params.toString())

      const response = await tenantApi.get(`/addons/tenant/my-addons?${params.toString()}`)
      
      console.log('🔍 API response status:', response.status)
      console.log('🔍 API response data:', response.data)
      
      if (response.data.success) {
        setAddOns(response.data.data.addOns)
        setSummary(response.data.data.summary)
        console.log('✅ Successfully loaded tenant add-ons:', response.data.data.addOns?.length || 0)
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenant add-ons')
      }
    } catch (err) {
      console.error('❌ Error fetching tenant add-ons:', err)
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        console.log('🔐 Authentication error - user may need to login')
        setError(new Error('Authentication required. Please login again.'))
        return
      }
      
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.category, filters.includeUsage])

  const refetch = useCallback(() => {
    fetchTenantAddOns()
  }, [fetchTenantAddOns])

  useEffect(() => {
    console.log('🔍 useTenantAddOns: Starting fetch process')
    fetchTenantAddOns()
  }, [fetchTenantAddOns])

  const purchaseAddOn = async (addOnId: string, purchaseData: any) => {
    try {
      const response = await tenantApi.post(`/addons/${addOnId}/purchase`, purchaseData)
      
      if (response.data.success) {
        await fetchTenantAddOns() // Refresh the list
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to purchase add-on')
      }
    } catch (err) {
      console.error('Error purchasing add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  const cancelAddOn = async (tenantAddOnId: string, reason?: string, effectiveDate?: string) => {
    try {
      const response = await tenantApi.post(`/addons/tenant/${tenantAddOnId}/cancel`, {
        reason,
        effectiveDate
      })
      
      if (response.data.success) {
        await fetchTenantAddOns() // Refresh the list
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Failed to cancel add-on')
      }
    } catch (err) {
      console.error('Error cancelling add-on:', err)
      throw err instanceof Error ? err : new Error('Unknown error')
    }
  }

  return {
    addOns,
    summary,
    loading,
    error,
    purchaseAddOn,
    cancelAddOn,
    refetch
  }
}

// Hook for usage statistics
export function useAddOnUsageStats(period: string = '30d', addOnId?: string) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsageStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append('period', period)
      if (addOnId) params.append('addOnId', addOnId)

      const response = await tenantApi.get(`/addons/tenant/usage-stats?${params.toString()}`)
      
      if (response.data.success) {
        setStats(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch usage statistics')
      }
    } catch (err) {
      console.error('Error fetching usage statistics:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [period, addOnId])

  useEffect(() => {
    fetchUsageStats()
  }, [fetchUsageStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchUsageStats
  }
}

// Hook for tenant limits (including add-ons)
export function useTenantLimits() {
  const [limits, setLimits] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await tenantApi.get('/addons/tenant/limits')
      
      if (response.data.success) {
        setLimits(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch tenant limits')
      }
    } catch (err) {
      console.error('Error fetching tenant limits:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLimits()
  }, [fetchLimits])

  return {
    limits,
    loading,
    error,
    refetch: fetchLimits
  }
}