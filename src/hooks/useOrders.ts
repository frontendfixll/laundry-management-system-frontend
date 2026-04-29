// Customer orders hook — React Query.
// `orders` auto-fetches on mount (was manual via fetchOrders() in the legacy
// version; consumers can drop their useEffect-then-fetch boilerplate).
// `fetchOrders` is preserved as an alias of `refetch` for backwards
// compatibility — existing call sites keep working unchanged.

import { useQuery, useMutation } from '@tanstack/react-query'
import { customerAPI, servicesAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface OrderItem {
  itemType: string
  service: string
  category: string
  quantity: number
  specialInstructions?: string
}

interface CreateOrderData {
  items: OrderItem[]
  pickupAddressId?: string
  deliveryAddressId?: string
  pickupDate: string
  pickupTimeSlot: string
  paymentMethod: 'online' | 'cod'
  isExpress: boolean
  specialInstructions?: string
  branchId?: string
  serviceType?: 'full_service' | 'self_drop_self_pickup' | 'self_drop_home_delivery' | 'home_pickup_self_pickup'
  selectedBranchId?: string
  deliveryDetails?: {
    distance: number | null
    deliveryCharge: number
    isFallbackPricing?: boolean
  }
}

const ORDERS_KEY = ['customer', 'orders'] as const

export function useOrders() {
  const router = useRouter()

  const query = useQuery({
    queryKey: ORDERS_KEY,
    queryFn: async (): Promise<any[]> => {
      const response = await customerAPI.getOrders()
      // Wire format: { success, data: { data: orders[], pagination: {...} } }
      return (
        response.data?.data?.data ??
        response.data?.data?.orders ??
        []
      )
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: (count, err: any) => {
      const status = err?.response?.status
      if (status >= 400 && status < 500) return false
      return count < 2
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: (orderData: CreateOrderData) => customerAPI.createOrder(orderData),
    onSuccess: (response) => {
      const order = response.data?.data?.order
      toast.success('Order placed successfully!')
      if (order?._id) {
        router.push(`/customer/orders/${order._id}?success=true`)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to create order')
    },
  })

  const pricingMutation = useMutation({
    mutationFn: ({ items, isExpress }: { items: OrderItem[]; isExpress: boolean }) =>
      servicesAPI.calculatePricing(items, isExpress),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to calculate pricing')
    },
  })

  // These two are imperative helpers used during checkout — they don't drive
  // any cached state, so plain async functions are simpler than wrapping them.
  const getTimeSlots = async () => {
    try {
      const response = await servicesAPI.getTimeSlots()
      return response.data?.data?.timeSlots ?? []
    } catch {
      return [
        '09:00-11:00',
        '11:00-13:00',
        '13:00-15:00',
        '15:00-17:00',
        '17:00-19:00',
      ]
    }
  }

  const checkServiceAvailability = async (pincode: string) => {
    try {
      const response = await servicesAPI.checkServiceAvailability(pincode)
      return response.data?.data
    } catch {
      return { available: false, message: 'Unable to check service availability' }
    }
  }

  return {
    orders: query.data ?? [],
    loading: query.isPending || createOrderMutation.isPending,
    pricingLoading: pricingMutation.isPending,
    fetchOrders: async () => { await query.refetch() },
    createOrder: async (orderData: CreateOrderData) => {
      const response = await createOrderMutation.mutateAsync(orderData)
      return response.data?.data?.order
    },
    calculatePricing: async (items: OrderItem[], isExpress: boolean = false) => {
      const response = await pricingMutation.mutateAsync({ items, isExpress })
      return response.data?.data
    },
    getTimeSlots,
    checkServiceAvailability,
  }
}
