'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Calendar, Link as LinkIcon, Tag } from 'lucide-react';
import { SlidePanel } from '@/components/ui/slide-panel';
import { useCreateBanner, useUploadBannerImage } from '@/hooks/useBanners';

interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBannerModal({ isOpen, onClose, onSuccess }: CreateBannerModalProps) {
  const { createBanner, loading: creating } = useCreateBanner();
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
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        description: '',
        type: 'PROMOTIONAL',
        imageUrl: '',
        targetPages: [],
        actionType: 'NONE',
        actionUrl: '',
        linkedPromotion: { promotionType: '', promotionId: '' },
        priority: 1,
        startDate: '',
        endDate: ''
      });
      setImageFile(null);
      setImagePreview('');
      setErrors({});
    }
  }, [isOpen]);

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
    if (!imageFile && !formData.imageUrl) newErrors.image = 'Image is required';
    if (formData.targetPages.length === 0) newErrors.targetPages = 'Select at least one target page';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.actionType === 'LINK' && !formData.actionUrl) {
      newErrors.actionUrl = 'Action URL is required';
    }
    if (formData.actionType === 'PROMOTION' && !formData.linkedPromotion.promotionType) {
      newErrors.linkedPromotion = 'Promotion type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      let imageUrl = formData.imageUrl;

      // Upload image if file is selected
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult.data.url;
      }

      // Prepare banner data
      const bannerData = {
        ...formData,
        imageUrl,
        linkedPromotion: formData.actionType === 'PROMOTION' && formData.linkedPromotion.promotionType
          ? formData.linkedPromotion
          : undefined
      };

      await createBanner(bannerData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create banner:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <SlidePanel open={isOpen} onClose={onClose} title="Create New Banner" width="2xl" accentBar="bg-blue-500">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner description"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROMOTIONAL">Promotional</option>
              <option value="INFORMATIONAL">Informational</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="ANNOUNCEMENT">Announcement</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image * (Max 5MB, 1200x400 recommended)
            </label>
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
                  <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 text-center">{progress}% uploaded</p>
                </div>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Target Pages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Pages * (Select where to display)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['HOME', 'SERVICES', 'CHECKOUT', 'DASHBOARD', 'ORDERS', 'PROFILE'].map((page) => (
                <label
                  key={page}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                    formData.targetPages.includes(page)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
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

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={formData.actionType}
              onChange={(e) => setFormData({ ...formData, actionType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="NONE">No Action</option>
              <option value="LINK">External Link</option>
              <option value="PROMOTION">Link to Promotion</option>
            </select>
          </div>

          {/* Action URL (if LINK) */}
          {formData.actionType === 'LINK' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action URL *
              </label>
              <input
                type="url"
                value={formData.actionUrl}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
              {errors.actionUrl && <p className="text-red-500 text-sm mt-1">{errors.actionUrl}</p>}
            </div>
          )}

          {/* Linked Promotion (if PROMOTION) */}
          {formData.actionType === 'PROMOTION' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Type *
                </label>
                <select
                  value={formData.linkedPromotion.promotionType}
                  onChange={(e) => setFormData({
                    ...formData,
                    linkedPromotion: { ...formData.linkedPromotion, promotionType: e.target.value as any }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Coupon">Coupon</option>
                  <option value="Discount">Discount</option>
                  <option value="Referral">Referral</option>
                  <option value="LoyaltyProgram">Loyalty Program</option>
                </select>
                {errors.linkedPromotion && <p className="text-red-500 text-sm mt-1">{errors.linkedPromotion}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion ID
                </label>
                <input
                  type="text"
                  value={formData.linkedPromotion.promotionId}
                  onChange={(e) => setFormData({
                    ...formData,
                    linkedPromotion: { ...formData.linkedPromotion, promotionId: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter promotion ID"
                />
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (1-10, higher = more prominent)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Banner'}
            </button>
          </div>
        </form>
    </SlidePanel>
  );
}
