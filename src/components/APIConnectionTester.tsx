'use client'

import React, { useState, useEffect } from 'react'

export const APIConnectionTester: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | 'idle'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Get the API URL from environment
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    setApiUrl(url)
  }, [])

  const testConnection = async () => {
    setConnectionStatus('testing')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      console.log('🔗 Testing API connection to:', apiUrl)
      console.log('🔑 Using token:', token ? 'Present' : 'Missing')
      
      // Test basic API health
      const healthResponse = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🏥 Health check response:', healthResponse.status)
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`)
      }
      
      // Test authenticated profile endpoint
      const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log('👤 Profile check response:', profileResponse.status)
      
      if (profileResponse.ok) {
        const data = await profileResponse.json()
        console.log('✅ Profile data received:', data)
        setConnectionStatus('success')
      } else {
        const errorText = await profileResponse.text()
        throw new Error(`Profile check failed: ${profileResponse.status} - ${errorText}`)
      }
      
    } catch (error) {
      console.error('❌ API connection test failed:', error)
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'success': return 'bg-green-100 border-green-300 text-green-800'
      case 'error': return 'bg-red-100 border-red-300 text-red-800'
      default: return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '🔗'
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-3 text-blue-600">API Connection Tester</h3>
      
      <div className="space-y-2 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <strong>API URL:</strong>
          <div className="font-mono text-xs break-all">{apiUrl}</div>
        </div>
        
        <div className={`p-2 rounded border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            <span>{getStatusIcon()}</span>
            <strong>Status:</strong>
            <span className="capitalize">{connectionStatus}</span>
          </div>
          {errorMessage && (
            <div className="mt-1 text-xs">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}
        </div>
        
        <button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="w-full px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {connectionStatus === 'testing' ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <div className="bg-gray-50 p-2 rounded">
          <strong>Environment:</strong>
          <div>NODE_ENV: {process.env.NODE_ENV}</div>
          <div>Has Token: {localStorage.getItem('token') ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  )
}