'use client';

import { useEffect, useState } from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { useReferralCode } from '@/hooks/useReferral';

export default function ReferralWidget() {
  const { getReferralCode, loading } = useReferralCode();
  const [referralData, setReferralData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      const result = await getReferralCode();
      setReferralData(result.data);
    } catch (error) {
      console.error('Failed to load referral code:', error);
    }
  };

  const handleCopy = () => {
    if (referralData?.code) {
      navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !referralData) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-32 mb-2"></div>
        <div className="h-8 bg-white/20 rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <p className="text-sm font-medium">Refer & Earn</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white/20 rounded-lg px-3 py-2">
          <p className="text-xs opacity-80 mb-1">Your Code</p>
          <p className="font-bold text-lg">{referralData.code}</p>
        </div>
        
        <button
          onClick={handleCopy}
          className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
      </div>
    </div>
  );
}
