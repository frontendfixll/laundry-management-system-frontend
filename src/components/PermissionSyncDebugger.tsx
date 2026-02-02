'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatures } from '@/hooks/useFeatures'

export const PermissionSyncDebugger: React.FC = () => {
  const { user, refreshUserData } = useAuthStore()
  const { hasPermission } = usePermissions()
  const { hasFeature } = useFeatures()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUserData()
      setLastRefresh(new Date().toLocaleTimeString())
      console.log('🔄 Manual refresh completed')
    } catch (error) {
      console.error('❌ Manual refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const checkDirectAPI = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()
      console.log('🔍 Direct API response:', data)
      
      if (data.success) {
        console.log('📋 Server permissions:', data.data.permissions)
        console.log('🎯 Server features:', data.data.features)
        console.log('🏢 Server tenancy:', data.data.tenancy)
      }
    } catch (error) {
      console.error('❌ Direct API call failed:', error)
    }
  }

  if (!user) return <div className="fixed top-4 right-4 bg-red-100 p-4 rounded">No user found</div>

  const hasOrdersViewPermission = hasPermission('orders', 'view')
  const hasOrdersFeature = hasFeature('orders')

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50 max-h-96 overflow-y-auto">
      <h3 className="font-bold text-sm mb-3 text-blue-600">Permission Sync Debugger</h3>
      
      <div className="space-y-3 text-xs">
        {/* Refresh Controls */}
        <div className="bg-blue-50 p-2 rounded">
          <div className="flex gap-2 mb-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh from Server'}
            </button>
            <button
              onClick={checkDirectAPI}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              Check API Direct
            </button>
          </div>
          {lastRefresh && <div className="text-xs text-gray-600">Last refresh: {lastRefresh}</div>}
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>Current Status:</strong>
          <div className={`${hasOrdersViewPermission ? 'text-green-600' : 'text-red-600'}`}>
            orders.view permission: {hasOrdersViewPermission ? '✅' : '❌'}
          </div>
          <div className={`${hasOrdersFeature ? 'text-green-600' : 'text-red-600'}`}>
            orders feature: {hasOrdersFeature ? '✅' : '❌'}
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>User Info:</strong>
          <div>Email: {user.email}</div>
          <div>Role: {user.role}</div>
          <div>ID: {user._id}</div>
        </div>

        {/* Raw Permissions */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>Raw Permissions Object:</strong>
          <pre className="text-xs overflow-auto max-h-20 bg-white p-1 rounded mt-1">
            {JSON.stringify(user.permissions, null, 2)}
          </pre>
        </div>

        {/* Raw Features */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>Raw Features Object:</strong>
          <pre className="text-xs overflow-auto max-h-20 bg-white p-1 rounded mt-1">
            {JSON.stringify(user.features, null, 2)}
          </pre>
        </div>

        {/* Tenancy Info */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>Tenancy Info:</strong>
          <div>Tenancy ID: {user.tenancy?._id || 'None'}</div>
          <div>Subscription Status: {user.tenancy?.subscription?.status || 'None'}</div>
          <pre className="text-xs overflow-auto max-h-20 bg-white p-1 rounded mt-1">
            {JSON.stringify(user.tenancy?.subscription?.features, null, 2)}
          </pre>
        </div>

        {/* Token Info */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>Token Info:</strong>
          <div>Has token in store: {user ? 'Yes' : 'No'}</div>
          <div>Has token in localStorage: {localStorage.getItem('token') ? 'Yes' : 'No'}</div>
        </div>

        {/* WebSocket Status */}
        <div className="bg-gray-50 p-2 rounded">
          <strong>WebSocket Status:</strong>
          <div>Socket available: {typeof window !== 'undefined' && (window as any).__notificationSocket ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  )
}