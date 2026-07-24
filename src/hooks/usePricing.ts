// Pricing hooks — React Query.
// 5 separate hooks; each owns its own cache slot. Mutations on the main
// usePricing() hook invalidate the list query so consumers see fresh data
// without manual setState patching.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '@/lib/superAdminApi'

interface PricingConfiguration {
  _id: string
  name: string
  version: string
  isActive: boolean
  isDefault: boolean
  approvalStatus: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  serviceItems: any[]
  expressCharges: any[]
  holidayPricing: any[]
  discountPolicies: any[]
  settings: {
    currency: string
    taxRate: number
    deliveryCharges: {
      freeDeliveryThreshold: number
      standardCharge: number
      expressCharge: number
    }
    minimumOrderValue: number
  }
  createdBy: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface PricingFilters {
  search?: string
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

const PRICING_LIST_KEY = ['superadmin', 'pricing', 'configurations'] as const
const PRICING_ACTIVE_KEY = ['superadmin', 'pricing', 'active'] as const
const SERVICE_ITEMS_KEY = ['superadmin', 'service-items'] as const
const DISCOUNT_POLICIES_KEY = ['superadmin', 'discount-policies'] as const

const pricingQueryDefaults = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  retry: (count: number, err: any) => {
    const status = err?.response?.status
    if (status >= 400 && status < 500) return false
    return count < 2
  },
} as const

export function usePricing(filters: PricingFilters = {}) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...PRICING_LIST_KEY, filters],
    queryFn: async (): Promise<{
      pricingConfigs: PricingConfiguration[]
      pagination: { current: number; pages: number; total: number; limit: number }
    }> => {
      const response: any = await superAdminApi.getPricingConfigurations(filters)
      return {
        pricingConfigs: response?.data?.pricingConfigs ?? [],
        pagination: response?.data?.pagination ?? { current: 1, pages: 1, total: 0, limit: 10 },
      }
    },
    ...pricingQueryDefaults,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: PRICING_LIST_KEY })

  const createMutation = useMutation({
    mutationFn: (pricingData: any) => superAdminApi.createPricingConfiguration(pricingData),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ pricingId, pricingData }: { pricingId: string; pricingData: any }) =>
      superAdminApi.updatePricingConfiguration(pricingId, pricingData),
    onSuccess: invalidate,
  })

  const approveMutation = useMutation({
    mutationFn: ({ pricingId, makeActive }: { pricingId: string; makeActive: boolean }) =>
      superAdminApi.approvePricingConfiguration(pricingId, makeActive),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: PRICING_ACTIVE_KEY })
    },
  })

  const activateMutation = useMutation({
    mutationFn: (pricingId: string) => superAdminApi.activatePricingConfiguration(pricingId),
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: PRICING_ACTIVE_KEY })
    },
  })

  const cloneMutation = useMutation({
    mutationFn: ({ pricingId, newVersion, newName }: { pricingId: string; newVersion: string; newName?: string }) =>
      superAdminApi.clonePricingConfiguration(pricingId, newVersion, newName),
    onSuccess: invalidate,
  })

  return {
    pricingConfigs: query.data?.pricingConfigs ?? [],
    pagination: query.data?.pagination ?? { current: 1, pages: 1, total: 0, limit: 10 },
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    fetchPricingConfigurations: async () => { await query.refetch() },
    createPricingConfiguration: async (pricingData: any) => {
      try {
        return await createMutation.mutateAsync(pricingData)
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? err?.message ?? 'Failed to create pricing configuration')
      }
    },
    updatePricingConfiguration: async (pricingId: string, pricingData: any) => {
      try {
        return await updateMutation.mutateAsync({ pricingId, pricingData })
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? err?.message ?? 'Failed to update pricing configuration')
      }
    },
    approvePricingConfiguration: async (pricingId: string, makeActive: boolean = false) => {
      try {
        return await approveMutation.mutateAsync({ pricingId, makeActive })
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? err?.message ?? 'Failed to approve pricing configuration')
      }
    },
    activatePricingConfiguration: async (pricingId: string) => {
      try {
        return await activateMutation.mutateAsync(pricingId)
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? err?.message ?? 'Failed to activate pricing configuration')
      }
    },
    clonePricingConfiguration: async (pricingId: string, newVersion: string, newName?: string) => {
      try {
        return await cloneMutation.mutateAsync({ pricingId, newVersion, newName })
      } catch (err: any) {
        throw new Error(err?.response?.data?.message ?? err?.message ?? 'Failed to clone pricing configuration')
      }
    },
  }
}

export function useActivePricing() {
  const query = useQuery({
    queryKey: PRICING_ACTIVE_KEY,
    queryFn: async (): Promise<PricingConfiguration | null> => {
      const response: any = await superAdminApi.getActivePricing()
      return response?.data?.pricing ?? null
    },
    ...pricingQueryDefaults,
  })

  return {
    activePricing: query.data ?? null,
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    fetchActivePricing: async () => { await query.refetch() },
  }
}

export function usePriceCalculation() {
  const calcMutation = useMutation({
    mutationFn: ({ items, options }: { items: any[]; options: any }) =>
      superAdminApi.calculatePrice(items, options),
  })

  const validateMutation = useMutation({
    mutationFn: ({ code, orderValue, customerInfo }: { code: string; orderValue: number; customerInfo: any }) =>
      superAdminApi.validateDiscountCode(code, orderValue, customerInfo),
  })

  const loading = calcMutation.isPending || validateMutation.isPending
  const error =
    calcMutation.error?.message ??
    validateMutation.error?.message ??
    null

  return {
    loading,
    error,
    calculatePrice: async (items: any[], options: any = {}) => {
      const response: any = await calcMutation.mutateAsync({ items, options })
      return response?.data
    },
    validateDiscountCode: async (code: string, orderValue: number = 0, customerInfo: any = {}) => {
      const response: any = await validateMutation.mutateAsync({ code, orderValue, customerInfo })
      return response?.data
    },
  }
}

export function useServiceItems(category?: string) {
  const query = useQuery({
    queryKey: [...SERVICE_ITEMS_KEY, category ?? null],
    queryFn: async (): Promise<any[]> => {
      const response: any = await superAdminApi.getServiceItems(category)
      return response?.data?.serviceItems ?? []
    },
    ...pricingQueryDefaults,
  })

  return {
    serviceItems: query.data ?? [],
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    fetchServiceItems: async () => { await query.refetch() },
  }
}

export function useDiscountPolicies(active: boolean = true) {
  const query = useQuery({
    queryKey: [...DISCOUNT_POLICIES_KEY, { active }],
    queryFn: async (): Promise<any[]> => {
      const response: any = await superAdminApi.getDiscountPolicies(active)
      return response?.data?.discountPolicies ?? []
    },
    ...pricingQueryDefaults,
  })

  return {
    discountPolicies: query.data ?? [],
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    fetchDiscountPolicies: async () => { await query.refetch() },
  }
}
