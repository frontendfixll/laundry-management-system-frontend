'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWallet';

export default function WalletWidget() {
  const { getBalance, loading } = useWalletBalance();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const result = await getBalance();
      setBalance(result.data.balance || 0);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-20 mb-2"></div>
        <div className="h-8 bg-white/20 rounded w-16"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <p className="text-sm font-medium opacity-90">Wallet Balance</p>
          </div>
          <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
        </div>
        <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
