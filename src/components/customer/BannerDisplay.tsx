'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useActiveBanners, useRecordImpression, useRecordClick } from '@/hooks/useCustomerBanners';

interface BannerDisplayProps {
  page: string;
  position?: 'top' | 'bottom' | 'sidebar';
  dismissible?: boolean;
}

export default function BannerDisplay({ page, position = 'top', dismissible = true }: BannerDisplayProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());
  const { getActiveBanners, loading } = useActiveBanners();
  const { recordImpression } = useRecordImpression();
  const { recordClick } = useRecordClick();
  const impressionRecorded = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadBanners();
  }, [page]);

  useEffect(() => {
    // Record impressions for visible banners
    banners.forEach(banner => {
      if (!impressionRecorded.current.has(banner._id) && !dismissedBanners.has(banner._id)) {
        recordImpression(banner._id);
        impressionRecorded.current.add(banner._id);
      }
    });
  }, [banners, dismissedBanners]);

  const loadBanners = async () => {
    try {
      const result = await getActiveBanners(page, 3);
      setBanners(result.data || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const handleBannerClick = async (banner: any) => {
    try {
      const result = await recordClick(banner._id);
      
      if (result.data.actionType === 'LINK' && result.data.actionUrl) {
        window.open(result.data.actionUrl, '_blank');
      } else if (result.data.actionType === 'PROMOTION' && result.data.linkedPromotion) {
        const { type, id } = result.data.linkedPromotion;
        window.location.href = `/promotions/${type.toLowerCase()}/${id}`;
      }
    } catch (error) {
      console.error('Failed to handle banner click:', error);
    }
  };

  const handleDismiss = (bannerId: string) => {
    setDismissedBanners(prev => new Set([...prev, bannerId]));
  };

  const visibleBanners = banners.filter(b => !dismissedBanners.has(b._id));

  if (loading || visibleBanners.length === 0) {
    return null;
  }

  const positionClasses = {
    top: 'mb-6',
    bottom: 'mt-6',
    sidebar: 'space-y-4'
  };

  return (
    <div className={positionClasses[position]}>
      {visibleBanners.map((banner) => (
        <div
          key={banner._id}
          className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
        >
          <div
            onClick={() => handleBannerClick(banner)}
            className="cursor-pointer"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {dismissible && (
            <button
              onClick={() => handleDismiss(banner._id)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
