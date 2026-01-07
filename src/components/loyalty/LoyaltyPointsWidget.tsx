'use client';

import { useEffect, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { useLoyaltyBalance } from '@/hooks/useLoyalty';

export default function LoyaltyPointsWidget() {
  const { getBalance, loading } = useLoyaltyBalance();
  const [balance, setBalance] = useState<any>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const result = await getBalance();
      setBalance(result.data);
    } catch (error) {
      console.error('Failed to load loyalty balance:', error);
    }
  };

  if (loading || !balance) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-24 mb-2"></div>
        <div className="h-8 bg-white/20 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} fill="white" />
            <p className="text-sm font-medium opacity-90">Loyalty Points</p>
          </div>
          <p className="text-3xl font-bold">{balance.points?.toLocaleString() || 0}</p>
          {balance.tier && (
            <p className="text-xs opacity-80 mt-1">
              {balance.tier.name} Tier
            </p>
          )}
        </div>
        <div className="text-right">
          <TrendingUp size={32} className="opacity-80" />
        </div>
      </div>
    </div>
  );
}
