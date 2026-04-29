// Customer addresses hook — React Query (auto-fetch + mutations).
// Each mutation invalidates the addresses cache instead of patching local
// state by hand, so any other component reading the same query stays in sync.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Address {
  _id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  pincode: string
  isDefault: boolean
  addressType?: 'home' | 'office'
}

const ADDRESSES_KEY = ['customer', 'addresses'] as const

export function useAddresses() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: async (): Promise<Address[]> => {
      const response = await customerAPI.getAddresses()
      return response.data?.data?.addresses ?? []
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (count, err: any) => {
      const status = err?.response?.status
      if (status >= 400 && status < 500) return false
      return count < 2
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY })

  const addMutation = useMutation({
    mutationFn: (data: Omit<Address, '_id'>) => customerAPI.addAddress(data),
    onSuccess: () => {
      invalidate()
      toast.success('Address added successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add address')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: Partial<Address> }) =>
      customerAPI.updateAddress(addressId, data),
    onSuccess: () => {
      invalidate()
      toast.success('Address updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update address')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (addressId: string) => customerAPI.deleteAddress(addressId),
    onSuccess: () => {
      invalidate()
      toast.success('Address deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to delete address')
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (addressId: string) => customerAPI.setDefaultAddress(addressId),
    onSuccess: () => {
      invalidate()
      toast.success('Default address updated')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to set default address')
    },
  })

  return {
    addresses: query.data ?? [],
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    addAddress: async (data: Omit<Address, '_id'>): Promise<Address> => {
      const response = await addMutation.mutateAsync(data)
      return response.data?.data?.address
    },
    updateAddress: async (addressId: string, data: Partial<Address>): Promise<Address> => {
      const response = await updateMutation.mutateAsync({ addressId, data })
      return response.data?.data?.address
    },
    deleteAddress: async (addressId: string): Promise<void> => {
      await deleteMutation.mutateAsync(addressId)
    },
    setDefaultAddress: async (addressId: string): Promise<Address> => {
      const response = await setDefaultMutation.mutateAsync(addressId)
      return response.data?.data?.address
    },
    refetch: async () => { await query.refetch() },
  }
}
