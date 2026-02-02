'use client'

import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFeatures } from '@/hooks/useFeatures'

export const PermissionDebugger: React.FC = () => {
  const { user } = useAuthStore()
  const { hasFeature } = useFeatures()

  if (!user) return null

  const checkPermission = (module: string, action: string) => {
    return user.permissions?.[module]?.[action] === true
  }

  const permissions = [
    { module: 'orders', action: 'view', name: 'Orders View' },
    { module: 'inventory', action: 'view', name: 'Inventory View' },
    { module: 'customers', action: 'view', name: 'Customers View' },
    { module: 'support', action: 'view', name: 'Support View' },
    { module: 'tickets', action: 'view', name: 'Tickets View' },
    { module: 'services', action: 'view', name: 'Services View' },
    { module: 'coupons', action: 'view', name: 'Coupons View' },
    { module: 'logistics', action: 'view', name: 'Logistics View' },
    { module: 'performance', action: 'view', name: 'Performance View' },
    { module: 'settings', action: 'view', name: 'Settings View' },
  ]

  const features = [
    'orders', 'inventory', 'customers', 'services', 'branches', 'branch_admins',
    'campaigns', 'banners', 'coupons', 'discounts', 'referral_program', 
    'loyalty_points', 'wallet', 'logistics', 'tickets', 'reviews', 'refunds',
    'payments', 'advanced_analytics', 'custom_branding'
  ]

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
      <h3 className="font-bold text-sm mb-2">Permission Debugger</h3>
      
      <div className="mb-3">
        <h4 className="font-semibold text-xs text-gray-700 mb-1">User Info:</h4>
        <p className="text-xs text-gray-600">Email: {user.email}</p>
        <p className="text-xs text-gray-600">Role: {user.role}</p>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-xs text-gray-700 mb-1">Permissions:</h4>
        <div className="space-y-1">
          {permissions.map(perm => (
            <div key={`${perm.module}-${perm.action}`} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{perm.name}</span>
              <span className={`px-1 py-0.5 rounded text-xs ${
                checkPermission(perm.module, perm.action) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {checkPermission(perm.module, perm.action) ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-xs text-gray-700 mb-1">Features:</h4>
        <div className="space-y-1">
          {features.map(feature => (
            <div key={feature} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{feature}</span>
              <span className={`px-1 py-0.5 rounded text-xs ${
                hasFeature(feature as any) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hasFeature(feature as any) ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Items with ✗ should be hidden from sidebar
        </p>
      </div>
    </div>
  )
}