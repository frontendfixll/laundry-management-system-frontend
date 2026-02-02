'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function TenantNotFound() {
  const params = useParams()
  const tenant = params.tenant as string

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist on <strong>{tenant}</strong> laundry.
        </p>
        <div className="space-y-3">
          <Link
            href={`/${tenant}`}
            className="block w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go to {tenant} Homepage
          </Link>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Main Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}