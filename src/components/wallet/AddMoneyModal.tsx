'use client';

import { useState } from 'react';
import { X, Wallet, CreditCard } from 'lucide-react';
import { useAddMoneyToWallet } from '@/hooks/useWallet';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMoneyModal({ isOpen, onClose, onSuccess }: AddMoneyModalProps) {
  const { addMoney, loading } = useAddMoneyToWallet();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleAddMoney = async () => {
    setError(null);
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 10) {
      setError('Minimum amount is ₹10');
      return;
    }

    if (amountNum > 50000) {
      setError('Maximum amount is ₹50,000');
      return;
    }

    try {
      await addMoney(amountNum);
      onSuccess();
      onClose();
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add money');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add Money to Wallet</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8 pr-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Add</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition font-medium"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet size={20} className="text-green-600" />
              <p className="font-medium text-green-900">Payment Method</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <CreditCard size={24} className="text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Card / UPI / Net Banking</p>
                <p className="text-sm text-gray-600">Secure payment gateway</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddMoney}
            disabled={loading || !amount}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
