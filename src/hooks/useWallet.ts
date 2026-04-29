// Customer wallet hooks — React Query.
// Switched from raw fetch + manual token reading to the canonical `customerAPI`
// in `lib/api.ts` (auth interceptor handles the Bearer header). The three
// hooks remain separate because each is consumed independently in the UI.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const WALLET_BALANCE_KEY = ['customer', 'wallet', 'balance'] as const
const WALLET_TRANSACTIONS_KEY = ['customer', 'wallet', 'transactions'] as const

const queryDefaults = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: (count: number, err: any) => {
    const status = err?.response?.status
    if (status >= 400 && status < 500) return false
    return count < 2
  },
} as const

export function useWalletBalance() {
  const { token } = useAuthStore()

  const query = useQuery({
    queryKey: WALLET_BALANCE_KEY,
    queryFn: async (): Promise<number> => {
      const response = await api.get('/customer/wallet/balance')
      return response.data?.data?.balance ?? 0
    },
    enabled: !!token,
    ...queryDefaults,
  })

  return {
    balance: query.data ?? 0,
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: async () => { await query.refetch() },
  }
}

export function useWalletTransactions(page: number = 1, limit: number = 20) {
  const { token } = useAuthStore()

  const query = useQuery({
    queryKey: [...WALLET_TRANSACTIONS_KEY, { page, limit }],
    queryFn: async () => {
      const response = await api.get('/customer/wallet/transactions', {
        params: { page, limit },
      })
      return {
        transactions: response.data?.data?.transactions ?? [],
        pagination: response.data?.data?.pagination ?? { current: 1, pages: 0, total: 0 },
      }
    },
    enabled: !!token,
    ...queryDefaults,
  })

  return {
    transactions: query.data?.transactions ?? [],
    pagination: query.data?.pagination ?? { current: 1, pages: 0, total: 0 },
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: async () => { await query.refetch() },
  }
}

export function useAddMoneyToWallet() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      amount,
      paymentMethod,
      transactionId,
    }: {
      amount: number
      paymentMethod: string
      transactionId: string
    }) => api.post('/customer/wallet/add', { amount, paymentMethod, transactionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_BALANCE_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_TRANSACTIONS_KEY })
      toast.success('Money added to wallet successfully!')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to add money')
    },
  })

  return {
    addMoney: async (amount: number, paymentMethod: string, transactionId: string) => {
      if (!token) {
        toast.error('Please login to add money')
        return { success: false }
      }
      try {
        const response = await mutation.mutateAsync({ amount, paymentMethod, transactionId })
        return { success: true, data: response.data?.data }
      } catch (err: any) {
        return { success: false, message: err?.response?.data?.message ?? err?.message }
      }
    },
    adding: mutation.isPending,
  }
}
