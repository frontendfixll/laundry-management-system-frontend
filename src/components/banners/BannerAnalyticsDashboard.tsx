'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, MousePointer, Eye, DollarSign, Calendar } from 'lucide-react';
import { useBannerAnalytics } from '@/hooks/useBanners';

interface BannerAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  bannerId: string;
  bannerTitle: string;
}

export default function BannerAnalyticsDashboard({ isOpen, onClose, bannerId, bannerTitle }: BannerAnalyticsDashboardProps) {
  const { getAnalytics, loading } = useBannerAnalytics();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (isOpen && bannerId) {
      loadAnalytics();
    }
  }, [isOpen, bannerId]);

  const loadAnalytics = async () => {
    try {
      const result = await getAnalytics(bannerId);
      setAnalytics(result.data.analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Banner Analytics</h2>
            <p className="text-gray-600 mt-1">{bannerTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="text-blue-600" size={24} />
                    <span className="text-xs font-medium text-blue-600">IMPRESSIONS</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{analytics.impressions?.toLocaleString() || 0}</p>
                  <p className="text-sm text-blue-700 mt-1">Total views</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="text-green-600" size={24} />
                    <span className="text-xs font-medium text-green-600">CLICKS</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{analytics.clicks?.toLocaleString() || 0}</p>
                  <p className="text-sm text-green-700 mt-1">User interactions</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-purple-600" size={24} />
                    <span className="text-xs font-medium text-purple-600">CTR</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{analytics.ctr?.toFixed(2) || 0}%</p>
                  <p className="text-sm text-purple-700 mt-1">Click-through rate</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="text-orange-600" size={24} />
                    <span className="text-xs font-medium text-orange-600">CONVERSIONS</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">{analytics.conversions || 0}</p>
                  <p className="text-sm text-orange-700 mt-1">Total conversions</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate?.toFixed(2) || 0}%</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Avg Revenue/Conversion</p>
                  <p className="text-2xl font-bold text-gray-900">₹{analytics.avgRevenuePerConversion || 0}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{analytics.revenue?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Campaign Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Days Active</p>
                    <p className="text-xl font-bold text-gray-900">{analytics.daysActive || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
                    <p className="text-xl font-bold text-gray-900">{analytics.daysRemaining || 0} days</p>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Performance Insights</h3>
                <ul className="space-y-2">
                  {analytics.ctr > 5 && (
                    <li className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-green-600">✓</span>
                      <span>Excellent CTR! Your banner is performing above average.</span>
                    </li>
                  )}
                  {analytics.ctr < 2 && (
                    <li className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-yellow-600">⚠</span>
                      <span>Low CTR. Consider updating the banner design or messaging.</span>
                    </li>
                  )}
                  {analytics.conversions > 0 && (
                    <li className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-green-600">✓</span>
                      <span>Banner is driving conversions successfully!</span>
                    </li>
                  )}
                  {analytics.daysRemaining < 7 && analytics.daysRemaining > 0 && (
                    <li className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="text-orange-600">!</span>
                      <span>Banner expires soon. Consider extending or creating a new one.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No analytics data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
