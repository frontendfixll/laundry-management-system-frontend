'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useActiveBanners, useRecordImpression, useRecordClick } from '@/hooks/useCustomerBanners';

interface BannerCarouselProps {
  page: string;
  autoPlay?: boolean;
  interval?: number;
}

export default function BannerCarousel({ page, autoPlay = true, interval = 5000 }: BannerCarouselProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getActiveBanners, loading } = useActiveBanners();
  const { recordImpression } = useRecordImpression();
  const { recordClick } = useRecordClick();
  const impressionRecorded = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadBanners();
  }, [page]);

  useEffect(() => {
    if (banners.length > 0 && autoPlay) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [banners.length, autoPlay, interval]);

  useEffect(() => {
    // Record impression when banner is displayed
    if (banners[currentIndex] && !impressionRecorded.current.has(banners[currentIndex]._id)) {
      recordImpression(banners[currentIndex]._id);
      impressionRecorded.current.add(banners[currentIndex]._id);
    }
  }, [currentIndex, banners]);

  const loadBanners = async () => {
    try {
      const result = await getActiveBanners(page);
      setBanners(result.data || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = async (banner: any) => {
    try {
      const result = await recordClick(banner._id);
      
      // Handle action based on banner type
      if (result.data.actionType === 'LINK' && result.data.actionUrl) {
        window.open(result.data.actionUrl, '_blank');
      } else if (result.data.actionType === 'PROMOTION' && result.data.linkedPromotion) {
        // Navigate to promotion page
        const { type, id } = result.data.linkedPromotion;
        window.location.href = `/promotions/${type.toLowerCase()}/${id}`;
      }
    } catch (error) {
      console.error('Failed to handle banner click:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading banners...</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full group">
      {/* Banner Image */}
      <div
        onClick={() => handleBannerClick(currentBanner)}
        className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden cursor-pointer"
      >
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay with title */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h3 className="text-white text-2xl font-bold mb-2">{currentBanner.title}</h3>
          {currentBanner.description && (
            <p className="text-white/90 text-sm">{currentBanner.description}</p>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={24} className="text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
