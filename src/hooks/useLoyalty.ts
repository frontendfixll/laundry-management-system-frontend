import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const LOYALTY_TRANSACTIONS_KEY = ['customer', 'loyalty', 'transactions'] as const;
const LOYALTY_BALANCE_KEY = ['customer', 'loyalty', 'balance'] as const;

const loyaltyQueryDefaults = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: (count: number, err: any) => {
    const status = err?.response?.status;
    if (status >= 400 && status < 500) return false;
    return count < 2;
  },
} as const;

interface LoyaltyBalance {
  enrolled: boolean;
  pointsBalance?: number;
  lifetimePoints?: number;
  redeemedPoints?: number;
  currentTier?: {
    name: string;
    minPoints: number;
    discountPercentage?: number;
  };
  totalSpent?: number;
  totalOrders?: number;
  program?: {
    _id: string;
    name: string;
    type: string;
    pointsConfig?: any;
    tiers?: any[];
  };
  canEnroll?: boolean;
}

interface LoyaltyTransaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    totalAmount: number;
  };
}

export function useLoyaltyBalance() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBalance = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: null };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Failed to fetch loyalty balance');
        return { success: false, data: null };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch loyalty balance');
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { getBalance, loading, error };
}

export function useLoyaltyTransactions(page: number = 1, limit: number = 20) {
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: [...LOYALTY_TRANSACTIONS_KEY, { page, limit }],
    queryFn: async () => {
      const response = await api.get('/customer/loyalty/transactions', {
        params: { page, limit },
      });
      return {
        transactions: (response.data?.data?.transactions ?? []) as LoyaltyTransaction[],
        pagination: response.data?.data?.pagination ?? { current: 1, pages: 0, total: 0 },
      };
    },
    enabled: !!token,
    ...loyaltyQueryDefaults,
  });

  return {
    transactions: query.data?.transactions ?? [],
    pagination: query.data?.pagination ?? { current: 1, pages: 0, total: 0 },
    loading: query.isPending,
    error: query.error ? (query.error.message ?? null) : null,
    refetch: async () => { await query.refetch(); },
  };
}

export function useEnrollLoyalty() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post('/customer/loyalty/enroll'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOYALTY_BALANCE_KEY });
      toast.success('Successfully enrolled in loyalty program!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to enroll');
    },
  });

  return {
    enroll: async () => {
      if (!token) {
        toast.error('Please login to enroll');
        return { success: false };
      }
      try {
        const response = await mutation.mutateAsync();
        return { success: true, data: response.data?.data };
      } catch (err: any) {
        return { success: false, message: err?.response?.data?.message ?? err?.message };
      }
    },
    enrolling: mutation.isPending,
  };
}

export function useRedeemPoints() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ points, redemptionType, value }: { points: number; redemptionType: string; value: number }) =>
      api.post('/customer/loyalty/redeem', { points, redemptionType, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOYALTY_BALANCE_KEY });
      queryClient.invalidateQueries({ queryKey: LOYALTY_TRANSACTIONS_KEY });
      toast.success('Points redeemed successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to redeem points');
    },
  });

  return {
    redeem: async (points: number, redemptionType: string, value: number) => {
      if (!token) {
        toast.error('Please login to redeem points');
        return { success: false };
      }
      try {
        const response = await mutation.mutateAsync({ points, redemptionType, value });
        return { success: true, data: response.data?.data };
      } catch (err: any) {
        return { success: false, message: err?.response?.data?.message ?? err?.message };
      }
    },
    redeeming: mutation.isPending,
  };
}

export function useAvailableRewards() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRewards = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: [] };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data.rewards || [] };
      } else {
        setError(data.message || 'Failed to fetch rewards');
        return { success: false, data: [] };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rewards');
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  return { getRewards, loading, error };
}

export function useTierInfo() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTierInfo = async () => {
    if (!token) {
      setLoading(false);
      return { success: false, data: null };
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/customer/loyalty/tier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || 'Failed to fetch tier info');
        return { success: false, data: null };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tier info');
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return { getTierInfo, loading, error };
}
