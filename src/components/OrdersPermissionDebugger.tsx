'use client'

import React from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatures } from '@/hooks/useFeatures'

export const OrdersPermissionDebugger: React.FC = () => {
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const { hasFeature } = useFeatures()

  if (!user) return <div>No user found</div>

  const hasOrdersViewPermission = hasPermission('orders', 'view')
  const hasOrdersFeature = hasFeature('orders')

  return (
    <div className="fixed top-20 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-3 text-red-600">Orders Access Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <strong>User Info:</strong>
          <div>Email: {user.email}</div>
          <div>Role: {user.role}</div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Permission Check:</strong>
          <div className={`flex justify-between ${hasOrdersViewPermission ? 'text-green-600' : 'text-red-600'}`}>
            <span>orders.view:</span>
            <span>{hasOrdersViewPermission ? '✅ YES' : '❌ NO'}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Feature Check:</strong>
          <div className={`flex justify-between ${hasOrdersFeature ? 'text-green-600' : 'text-red-600'}`}>
            <span>orders feature:</span>
            <span>{hasOrdersFeature ? '✅ YES' : '❌ NO'}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Raw Permissions:</strong>
          <pre className="text-xs overflow-auto max-h-20">
            {JSON.stringify(user.permissions?.orders, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Raw Features:</strong>
          <pre className="text-xs overflow-auto max-h-20">
            orders: {JSON.stringify(user.features?.orders)}
          </pre>
        </div>

        <div className="bg-gray-50 p-2 rounded">
          <strong>Tenancy Features:</strong>
          <pre className="text-xs overflow-auto max-h-20">
            orders: {JSON.stringify(user.tenancy?.subscription?.features?.orders)}
          </pre>
        </div>

        <div className={`p-2 rounded ${hasOrdersViewPermission && hasOrdersFeature ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>Final Result:</strong>
          <div>Can Access Orders: {hasOrdersViewPermission && hasOrdersFeature ? '✅ YES' : '❌ NO'}</div>
          {!hasOrdersViewPermission && <div>❌ Missing orders.view permission</div>}
          {!hasOrdersFeature && <div>❌ Missing orders feature</div>}
        </div>
      </div>
    </div>
  )
}