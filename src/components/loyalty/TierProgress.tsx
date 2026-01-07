'use client';

import { Award, ChevronRight } from 'lucide-react';

interface TierProgressProps {
  tierInfo: any;
}

export default function TierProgress({ tierInfo }: TierProgressProps) {
  if (!tierInfo) {
    return null;
  }

  const { currentTier, nextTier, pointsToNextTier, progressPercentage } = tierInfo;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Progress</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{currentTier?.name || 'Bronze'}</p>
            <p className="text-sm text-gray-600">Current Tier</p>
          </div>
        </div>

        {nextTier && (
          <>
            <ChevronRight size={24} className="text-gray-400" />
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{nextTier.name}</p>
                <p className="text-sm text-gray-600">Next Tier</p>
              </div>
            </div>
          </>
        )}
      </div>

      {nextTier ? (
        <>
          <div className="relative">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {pointsToNextTier} more points to reach {nextTier.name}
            </p>
          </div>

          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900 mb-2">
              Unlock {nextTier.name} benefits:
            </p>
            <ul className="space-y-1">
              {nextTier.benefits?.slice(0, 3).map((benefit: string, index: number) => (
                <li key={index} className="text-sm text-purple-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <p className="text-amber-900 font-medium">🎉 You've reached the highest tier!</p>
          <p className="text-sm text-amber-700 mt-1">Enjoy all premium benefits</p>
        </div>
      )}
    </div>
  );
}
