'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authAPI } from '@/lib/api'

export default function DebugLoginPage() {
  const [email, setEmail] = useState('testcustomer@demo.com')
  const [password, setPassword] = useState('password123')
  const { user, token, isAuthenticated, setAuth } = useAuthStore()

  const handleLogin = async () => {
    try {
      console.log('🔥 Step 1: Starting login...')
      
      const response = await authAPI.login({ email, password })
      console.log('🔥 Step 2: API Response:', response.data)
      
      const { user: userData, token: userToken } = response.data.data
      console.log('🔥 Step 3: Extracted data:', { userData, userToken })
      
      console.log('🔥 Step 4: Calling setAuth...')
      setAuth(userData, userToken)
      
      console.log('🔥 Step 5: setAuth called, checking state...')
      
      // Check state immediately
      const currentState = useAuthStore.getState()
      console.log('🔥 Step 6: Current state:', currentState)
      
    } catch (error) {
      console.error('🔥 Login error:', error)
    }
  }

  const checkState = () => {
    const state = useAuthStore.getState()
    console.log('🔥 Current store state:', state)
    console.log('🔥 localStorage:', localStorage.getItem('laundry-auth'))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Debug Login</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Test Login
          </button>
          
          <button
            onClick={checkState}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Check State
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-medium mb-2">Current State:</h3>
          <div className="text-sm space-y-1">
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>User: {user ? user.name : 'None'}</div>
            <div>Token: {token ? 'Present' : 'None'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
