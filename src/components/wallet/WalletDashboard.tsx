'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { useWalletBalance, useWalletTransactions } from '@/hooks/useWallet';
import WalletTransactions from './WalletTransactions';
import AddMoneyModal from './AddMoneyModal';

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const { getBalance } = useWalletBalance();
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const result = await getBalance();
      setBalance(result.data.balance || 0);
      setStats(result.data.stats);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wallet</h1>
        <p className="text-gray-600">Manage your wallet balance and transactions</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-lg opacity-90 mb-2">Available Balance</p>
            <p className="text-5xl font-bold">₹{balance.toLocaleString()}</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet size={40} />
          </div>
        </div>

        <button
          onClick={() => setShowAddMoney(true)}
          className="flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          <Plus size={20} />
          Add Money
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowUpCircle size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Added</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats?.totalAdded?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowDownCircle size={20} className="text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats?.totalSpent?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{stats?.thisMonth?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'transactions'
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Transactions
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Using Wallet</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Faster Checkout</p>
                      <p className="text-sm text-gray-600">Pay instantly without entering card details</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Exclusive Offers</p>
                      <p className="text-sm text-gray-600">Get special discounts on wallet payments</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Secure & Safe</p>
                      <p className="text-sm text-gray-600">Your money is safe and secure</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <WalletTransactions />
          )}
        </div>
      </div>

      <AddMoneyModal
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onSuccess={loadBalance}
      />
    </div>
  );
}
