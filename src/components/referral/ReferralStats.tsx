'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface ReferralStatsProps {
  stats: any;
}

export default function ReferralStats({ stats }: ReferralStatsProps) {
  if (!stats || !stats.referrals || stats.referrals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No referrals yet. Start sharing your code!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Your Referrals</h3>
      
      <div className="space-y-3">
        {stats.referrals.map((referral: any) => (
          <div key={referral._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                referral.status === 'COMPLETED' ? 'bg-green-100' :
                referral.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {referral.status === 'COMPLETED' ? (
                  <CheckCircle size={20} className="text-green-600" />
                ) : referral.status === 'PENDING' ? (
                  <Clock size={20} className="text-yellow-600" />
                ) : (
                  <XCircle size={20} className="text-red-600" />
                )}
              </div>
              
              <div>
                <p className="font-medium text-gray-900">{referral.referredUser?.name || 'User'}</p>
                <p className="text-sm text-gray-500">
                  {new Date(referral.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-bold ${
                referral.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {referral.status === 'COMPLETED' ? `+₹${referral.reward}` : 'Pending'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{referral.status.toLowerCase()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
