'use client'

import { useState, useEffect } from 'react'
import { tenantBlogApi, BlogCategory } from '@/services/tenantBlogApi'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  FileText,
  Save,
  X,
  AlertCircle,
  Info
} from 'lucide-react'

export default function TenantBlogCategoriesPage() {
  const [categories, setCategories] = useState<{
    platformCategories: BlogCategory[]
    tenantCategories: BlogCategory[]
    allCategories: BlogCategory[]
  }>({
    platformCategories: [],
    tenantCategories: [],
    allCategories: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: 'FileText',
    sortOrder: 0
  })

  const iconOptions = [
    { value: 'FileText', label: 'Document', icon: FileText },
    { value: 'Tag', label: 'Tag', icon: Tag },
  ]

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ]

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await tenantBlogApi.getTenantCategories()
      setCategories(response.data || {
        platformCategories: [],
        tenantCategories: [],
        allCategories: []
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: 'FileText',
      sortOrder: 0
    })
    setEditingCategory(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const handleEdit = (category: BlogCategory) => {
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder
    })
    setEditingCategory(category)
    setShowCreateModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCategory) {
        await tenantBlogApi.updateTenantCategory(editingCategory._id, formData)
      } else {
        await tenantBlogApi.createTenantCategory(formData)
      }
      
      setShowCreateModal(false)
      resetForm()
      fetchCategories()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, postCount: number = 0) => {
    if (postCount > 0) {
      alert(`Cannot delete category with ${postCount} posts. Please move or delete posts first.`)
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await tenantBlogApi.deleteTenantCategory(id)
      fetchCategories()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconOptions.find(opt => opt.value === iconName)?.icon || FileText
    return <IconComponent className="w-5 h-5" />
  }

  if (loading && categories.allCategories.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
          <p className="text-gray-600">Organize your blog posts into categories</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              You can use platform categories (created by LaundryLobby) or create your own custom categories for your business.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Platform Categories */}
        {categories.platformCategories.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Categories</h2>
            <p className="text-sm text-gray-600 mb-4">These categories are provided by LaundryLobby and available to all businesses.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.platformCategories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <div style={{ color: category.color }}>
                        {getIconComponent(category.icon)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.postCount || 0} posts
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Platform
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Custom Categories</h2>
          <p className="text-sm text-gray-600 mb-4">Categories specific to your business that only your customers will see.</p>
          
          {categories.tenantCategories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom categories yet</h3>
              <p className="text-gray-500 mb-4">Create categories specific to your business needs.</p>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.tenantCategories.map((category) => (
                <div key={category._id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div style={{ color: category.color }}>
                          {getIconComponent(category.icon)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id, category.postCount)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {category.postCount || 0} posts
                    </span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Custom
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}