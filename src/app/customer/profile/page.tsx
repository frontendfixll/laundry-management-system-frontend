'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  Phone, 
  Edit2,
  Save,
  ArrowLeft,
  Loader2,
  Shield,
  Bell,
  CreditCard
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await api.put('/auth/profile', formData)
      updateUser(response.data.data.user)
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-600">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link href="/customer/addresses" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Manage Addresses</p>
                <p className="text-sm text-gray-500">Add or edit your saved addresses</p>
              </div>
            </Link>
            <Link href="/customer/orders" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Order History</p>
                <p className="text-sm text-gray-500">View all your past orders</p>
              </div>
            </Link>
            <Link href="/help" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Help & Support</p>
                <p className="text-sm text-gray-500">Get help with your orders</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
