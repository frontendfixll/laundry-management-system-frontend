'use client'

import { useAuthStore } from '@/store/authStore'

export default function TestAuthPage() {
  const { user, token, isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Store Test</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>User:</strong>
            <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Token:</strong>
            <div className="bg-gray-100 p-2 rounded mt-1 text-sm break-all">
              {token ? token.substring(0, 50) + '...' : 'No token'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
