'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useUpdateBanner, useUploadBannerImage } from '@/hooks/useBanners';

interface EditBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner: any;
}

export default function EditBannerModal({ isOpen, onClose, onSuccess, banner }: EditBannerModalProps) {
  const { updateBanner, loading: updating } = useUpdateBanner();
  const { uploadImage, loading: uploading, progress } = useUploadBannerImage();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PROMOTIONAL' as 'PROMOTIONAL' | 'INFORMATIONAL' | 'SEASONAL' | 'ANNOUNCEMENT',
    imageUrl: '',
    targetPages: [] as string[],
    actionType: 'NONE' as 'LINK' | 'PROMOTION' | 'NONE',
    actionUrl: '',
    linkedPromotion: {
      promotionType: '' as 'Campaign' | 'Coupon' | 'Discount' | 'Referral' | 'LoyaltyProgram' | '',
      promotionId: ''
    },
    priority: 1,
    startDate: '',
    endDate: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && banner) {
      setFormData({
        title: banner.title || '',
        description: banner.description || '',
        type: banner.type || 'PROMOTIONAL',
        imageUrl: banner.imageUrl || '',
        targetPages: banner.targetPages || [],
        actionType: banner.actionType || 'NONE',
        actionUrl: banner.actionUrl || '',
        linkedPromotion: banner.linkedPromotion || { promotionType: '', promotionId: '' },
        priority: banner.priority || 1,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''
      });
      setImagePreview(banner.imageUrl || '');
    }
  }, [isOpen, banner]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTargetPageToggle = (page: string) => {
    setFormData(prev => ({
      ...prev,
      targetPages: prev.targetPages.includes(page)
        ? prev.targetPages.filter(p => p !== page)
        : [...prev.targetPages, page]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!imagePreview && !imageFile) newErrors.image = 'Image is required';
    if (formData.targetPages.length === 0) newErrors.targetPages = 'Select at least one target page';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if file is selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.data.url;
      }

      const bannerData = {
        ...formData,
        imageUrl,
        linkedPromotion: formData.actionType === 'PROMOTION' && formData.linkedPromotion.promotionType
          ? formData.linkedPromotion
          : undefined
      };

      await updateBanner(banner._id, bannerData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update banner:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Banner</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="PROMOTIONAL">Promotional</option>
              <option value="INFORMATIONAL">Informational</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image *</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload new image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">{progress}% uploaded</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Pages *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['HOME', 'SERVICES', 'CHECKOUT', 'DASHBOARD', 'ORDERS', 'PROFILE'].map((page) => (
                <label
                  key={page}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${
                    formData.targetPages.includes(page) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.targetPages.includes(page)}
                    onChange={() => handleTargetPageToggle(page)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">{page}</span>
                </label>
              ))}
            </div>
            {errors.targetPages && <p className="text-red-500 text-sm mt-1">{errors.targetPages}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
