'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'
import { useFeatures } from '@/hooks/useFeatures'
import { useAuthStore } from '@/store/authStore'
import { AlertTriangle, Shield, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RouteGuardProps {
  children: React.ReactNode
  requiredPermission: {
    module: string
    action: string
  }
  requiredFeature?: string
  fallbackPath?: string
  showAccessDenied?: boolean
}

/**
 * Route Guard Component - Protects routes based on permissions and features
 * Prevents direct URL access to unauthorized pages
 */
export function RouteGuard({ 
  children, 
  requiredPermission, 
  requiredFeature,
  fallbackPath = '/admin/dashboard',
  showAccessDenied = true
}: RouteGuardProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { hasPermission } = usePermissions()
  const { hasFeature } = useFeatures()

  const hasRequiredPermission = hasPermission(requiredPermission.module, requiredPermission.action)
  const hasRequiredFeature = requiredFeature ? hasFeature(requiredFeature) : true

  const canAccess = hasRequiredPermission && hasRequiredFeature

  useEffect(() => {
    if (!canAccess) {
      console.log(`🚫 Route access denied for ${user?.role}:`, {
        permission: requiredPermission,
        feature: requiredFeature,
        hasPermission: hasRequiredPermission,
        hasFeature: hasRequiredFeature
      })
      
      if (!showAccessDenied) {
        // Redirect immediately without showing access denied page
        router.replace(fallbackPath)
      }
    }
  }, [canAccess, hasRequiredPermission, hasRequiredFeature, router, fallbackPath, showAccessDenied, user?.role, requiredPermission, requiredFeature])

  // Show access denied page
  if (!canAccess && showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            
            {/* Message */}
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            
            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">Required Access:</span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Permission:</span> {requiredPermission.module}.{requiredPermission.action}
                </div>
                {requiredFeature && (
                  <div>
                    <span className="font-medium">Feature:</span> {requiredFeature}
                  </div>
                )}
                <div>
                  <span className="font-medium">Your Role:</span> {user?.role || 'Unknown'}
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => router.push(fallbackPath)}
                className="flex-1"
              >
                Dashboard
              </Button>
            </div>
            
            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-4">
              Contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect without showing access denied (silent redirect)
  if (!canAccess && !showAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Allow access
  return <>{children}</>
}