'use client'

import { useAuthStore } from '@/store/authStore'

export default function BranchAdminSettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">View your branch admin settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Name</label>
            <p className="text-gray-900 font-medium">{user?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <p className="text-gray-900 font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Role</label>
            <p className="text-gray-900 font-medium">Branch Admin</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          For account changes or additional permissions, please contact your Tenancy Admin.
        </p>
      </div>
    </div>
  )
}
