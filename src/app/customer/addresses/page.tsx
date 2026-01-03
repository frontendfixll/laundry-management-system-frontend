'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Plus, 
  Edit2,
  Trash2,
  Star,
  Phone,
  Home,
  Building,
  Loader2,
  ArrowLeft,
  Check
} from 'lucide-react'
import { useAddresses } from '@/hooks/useAddresses'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export default function AddressesPage() {
  const { user } = useAuthStore()
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [formData, setFormData] = useState<{
    name: string
    phone: string
    addressLine1: string
    addressLine2: string
    landmark: string
    city: string
    pincode: string
    addressType: 'home' | 'office'
    isDefault: boolean
  }>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    pincode: '',
    addressType: 'home',
    isDefault: false
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }))
    }
  }, [user])

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      pincode: '',
      addressType: 'home',
      isDefault: false
    })
    setEditingAddress(null)
    setShowForm(false)
  }

  const handleEdit = (address: any) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      pincode: address.pincode,
      addressType: address.addressType || 'home',
      isDefault: address.isDefault
    })
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, formData)
        toast.success('Address updated successfully')
      } else {
        await addAddress(formData)
        toast.success('Address added successfully')
      }
      resetForm()
    } catch (error) {
      console.error('Error saving address:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      await deleteAddress(addressId)
      toast.success('Address deleted successfully')
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId)
      toast.success('Default address updated')
    } catch (error) {
      console.error('Error setting default address:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
            <p className="text-gray-600">Manage your saved addresses</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-teal-500 hover:bg-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
                  placeholder="House/Flat No., Building Name, Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
                  placeholder="Area, Colony"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Near..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, addressType: 'home' }))}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 ${
                      formData.addressType === 'home' 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, addressType: 'office' }))}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 ${
                      formData.addressType === 'office' 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Office
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-600">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1 bg-teal-500 hover:bg-teal-600">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingAddress ? 'Update Address' : 'Add Address'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">Add your first address to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-teal-500 hover:bg-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-800">{address.name}</span>
                      {address.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {address.addressType === 'home' ? (
                          <><Home className="w-3 h-3 mr-1" /> Home</>
                        ) : (
                          <><Building className="w-3 h-3 mr-1" /> Office</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {address.phone}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                      {address.landmark && ` (${address.landmark})`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city} - {address.pincode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address._id)}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  )
}
