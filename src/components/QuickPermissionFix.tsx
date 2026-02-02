'use client'

import React from 'react'
import { useAuthStore } from '@/store/authStore'

export const QuickPermissionFix: React.FC = () => {
  const { user, updateUser } = useAuthStore()

  const grantOrdersAccess = () => {
    if (!user) return

    const newPermissions = { ...user.permissions }
    if (!newPermissions.orders) {
      newPermissions.orders = {}
    }
    newPermissions.orders.view = true

    const newFeatures = { ...user.features }
    newFeatures.orders = true

    updateUser({ 
      permissions: newPermissions,
      features: newFeatures
    })

    console.log('✅ Granted orders access - try refreshing the orders page')
  }

  const refreshFromServer = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          updateUser({
            permissions: data.data.permissions,
            features: data.data.features,
            tenancy: data.data.tenancy
          })
          console.log('🔄 Refreshed user data from server')
        }
      }
    } catch (error) {
      console.error('Failed to refresh from server:', error)
    }
  }

  return (
    <div className="fixed top-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-bold text-sm mb-2 text-yellow-800">Quick Permission Fix</h3>
      
      <div className="space-y-2">
        <button
          onClick={grantOrdersAccess}
          className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Grant Orders Access (Local)
        </button>
        
        <button
          onClick={refreshFromServer}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Refresh from Server
        </button>
      </div>
      
      <p className="text-xs text-yellow-700 mt-2">
        Use these buttons to test permission changes
      </p>
    </div>
  )
}