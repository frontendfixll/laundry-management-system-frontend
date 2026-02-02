'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export const PermissionFixer: React.FC = () => {
  const { user, updateUser } = useAuthStore()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const showCurrentPermissions = () => {
    console.log('📋 Current user permissions:', JSON.stringify(user?.permissions, null, 2))
    console.log('🎯 Current user features:', JSON.stringify(user?.features, null, 2))
    console.log('👤 User email:', user?.email)
    console.log('🔑 User role:', user?.role)
  }

  const grantOrdersViewPermission = () => {
    if (!user) {
      setMessage('❌ No user found')
      return
    }

    const newPermissions = { ...user.permissions }
    
    // Ensure orders object exists
    if (!newPermissions.orders) {
      newPermissions.orders = {}
    }
    
    // Grant the view permission
    newPermissions.orders.view = true
    
    // Update the user
    updateUser({ permissions: newPermissions })
    
    console.log('✅ Granted orders.view permission locally')
    console.log('📋 New permissions:', JSON.stringify(newPermissions, null, 2))
    
    setMessage('✅ Granted orders.view permission! Try accessing orders page now.')
    
    setTimeout(() => setMessage(''), 3000)
  }

  const refreshFromServer = async () => {
    setIsLoading(true)
    setMessage('🔄 Refreshing from server...')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          updateUser({
            permissions: data.data.permissions || {},
            features: data.data.features || {},
            tenancy: data.data.tenancy,
            role: data.data.role
          })
          
          console.log('🔄 Refreshed from server')
          console.log('📋 Server permissions:', JSON.stringify(data.data.permissions, null, 2))
          console.log('🎯 Server features:', JSON.stringify(data.data.features, null, 2))
          
          // Check if orders.view is now available
          const hasOrdersView = data.data.permissions?.orders?.view === true
          
          if (hasOrdersView) {
            setMessage('✅ Server has orders.view permission!')
          } else {
            setMessage('❌ Server still missing orders.view permission')
          }
        }
      } else {
        setMessage(`❌ Server error: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Refresh failed:', error)
      setMessage('❌ Refresh failed')
    } finally {
      setIsLoading(false)
    }
  }

  const checkBackendPermission = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Try to access orders API directly
      const response = await fetch('/api/orders?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('🧪 Orders API test:', response.status)
      
      if (response.ok) {
        setMessage('✅ Backend allows orders access - frontend sync issue')
      } else if (response.status === 403) {
        setMessage('❌ Backend denies orders access - permission not granted on server')
      } else if (response.status === 401) {
        setMessage('❌ Backend authentication failed - token issue')
      } else {
        setMessage(`❌ Backend error: ${response.status}`)
      }
      
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('❌ Backend test failed:', error)
      setMessage('❌ Backend test failed')
    }
  }

  if (!user) return null

  const hasOrdersView = user.permissions?.orders?.view === true
  const hasOrdersFeature = user.features?.orders === true

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white border-2 border-red-300 rounded-lg shadow-lg p-4 z-50 max-w-md">
      <h3 className="font-bold text-sm mb-3 text-red-600">🚨 Permission Fixer</h3>
      
      <div className="space-y-2 text-xs mb-3">
        <div className="bg-gray-50 p-2 rounded">
          <strong>Current Status:</strong>
          <div className={hasOrdersView ? 'text-green-600' : 'text-red-600'}>
            orders.view permission: {hasOrdersView ? '✅ YES' : '❌ NO'}
          </div>
          <div className={hasOrdersFeature ? 'text-green-600' : 'text-red-600'}>
            orders feature: {hasOrdersFeature ? '✅ YES' : '❌ NO'}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
          <strong>Issue:</strong> You have the orders feature but missing orders.view permission
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={showCurrentPermissions}
          className="w-full px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Show Permissions in Console
        </button>
        
        <button
          onClick={grantOrdersViewPermission}
          className="w-full px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Grant orders.view Permission (Local Fix)
        </button>
        
        <button
          onClick={refreshFromServer}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh from Server'}
        </button>
        
        <button
          onClick={checkBackendPermission}
          className="w-full px-3 py-2 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
        >
          Test Backend Permission
        </button>
      </div>
      
      {message && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
          {message}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600">
        User: {user.email} | Role: {user.role}
      </div>
    </div>
  )
}