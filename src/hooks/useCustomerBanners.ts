import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get active banners for a page
export const useActiveBanners = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActiveBanners = async (page: string, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/customer/banners`, {
        params: { page, limit },
        withCredentials: true
      });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch banners');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getActiveBanners, loading, error };
};

// Record banner impression
export const useRecordImpression = () => {
  const recordImpression = async (bannerId: string) => {
    try {
      await axios.post(`${API_URL}/customer/banners/${bannerId}/impression`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Failed to record impression:', error);
    }
  };

  return { recordImpression };
};

// Record banner click
export const useRecordClick = () => {
  const recordClick = async (bannerId: string) => {
    try {
      const response = await axios.post(`${API_URL}/customer/banners/${bannerId}/click`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to record click:', error);
      throw error;
    }
  };

  return { recordClick };
};
