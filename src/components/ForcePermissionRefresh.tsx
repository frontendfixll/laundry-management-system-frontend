'use client'

import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export const ForcePermissionRefresh: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const forceRefreshFromServer = async () => {
    setIsLoading(true)
    setMessage('Refreshing...')
    
    try {
      // Method 1: Try with current token
      const token = localStorage.getItem('token')
      console.log('🔄 Attempting refresh with token:', token ? 'Found' : 'Not found')
      
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('🔄 Profile API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile API success:', data)
        
        if (data.success && data.data) {
          // Update the user with fresh data from server
          updateUser({
            permissions: data.data.permissions || {},
            features: data.data.features || {},
            tenancy: data.data.tenancy,
            role: data.data.role,
            name: data.data.name,
            phone: data.data.phone
          })
          
          setMessage('✅ Successfully refreshed from server!')
          
          // Log the updated permissions
          console.log('📋 Updated permissions:', data.data.permissions)
          console.log('🎯 Updated features:', data.data.features)
          
          setTimeout(() => setMessage(''), 3000)
        } else {
          setMessage('❌ Server returned no data')
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Profile API error:', response.status, errorText)
        
        if (response.status === 401) {
          setMessage('❌ Token expired - please login again')
        } else {
          setMessage(`❌ Server error: ${response.status}`)
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error)
      setMessage('❌ Network error - check connection')
    } finally {
      setIsLoading(false)
    }
  }

  const clearCacheAndRefresh = () => {
    // Clear all auth-related localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('laundry-auth')
    
    // Clear the auth store
    logout()
    
    setMessage('🔄 Cache cleared - please login again')
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = '/auth/login'
    }, 2000)
  }

  const testPermissionDirectly = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Test the orders API directly
      const response = await fetch('/api/orders?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('🧪 Orders API test response:', response.status)
      
      if (response.ok) {
        setMessage('✅ Orders API accessible - permission should work')
      } else if (response.status === 403) {
        setMessage('❌ Orders API forbidden - permission missing on server')
      } else if (response.status === 401) {
        setMessage('❌ Orders API unauthorized - token issue')
      } else {
        setMessage(`❌ Orders API error: ${response.status}`)
      }
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('❌ Orders API test failed:', error)
      setMessage('❌ Orders API test failed')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="font-bold text-sm mb-3 text-red-600">Force Permission Refresh</h3>
      
      <div className="space-y-2">
        <button
          onClick={forceRefreshFromServer}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Force Refresh from Server'}
        </button>
        
        <button
          onClick={testPermissionDirectly}
          className="w-full px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Test Orders API Direct
        </button>
        
        <button
          onClick={clearCacheAndRefresh}
          className="w-full px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Clear Cache & Re-login
        </button>
      </div>
      
      {message && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          {message}
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        User: {user?.email}<br/>
        Role: {user?.role}
      </p>
    </div>
  )
}