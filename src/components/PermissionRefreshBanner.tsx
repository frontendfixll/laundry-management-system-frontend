'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, X, CheckCircle } from 'lucide-react'
import { usePermissionSync } from '@/hooks/usePermissionSync'

interface PermissionRefreshBannerProps {
  show: boolean
  onDismiss: () => void
  autoRefresh?: boolean
  autoRefreshDelay?: number
}

export const PermissionRefreshBanner: React.FC<PermissionRefreshBannerProps> = ({
  show,
  onDismiss,
  autoRefresh = false,
  autoRefreshDelay = 10000
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(autoRefreshDelay / 1000)
  const { refreshPermissions } = usePermissionSync()

  // Auto-refresh countdown
  useEffect(() => {
    if (!show || !autoRefresh) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [show, autoRefresh])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const success = await refreshPermissions()
      if (success) {
        onDismiss()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-100" />
            <div>
              <p className="font-medium">Your permissions have been updated</p>
              <p className="text-sm text-blue-100">
                {autoRefresh 
                  ? `Auto-refreshing in ${countdown} seconds...`
                  : 'Click refresh to apply changes'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
            
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to manage the banner state
export const usePermissionRefreshBanner = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Listen for permission update events
    const handlePermissionUpdate = () => {
      setShowBanner(true)
    }

    window.addEventListener('permissionsUpdated', handlePermissionUpdate)
    
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate)
    }
  }, [])

  const dismissBanner = () => setShowBanner(false)

  return {
    showBanner,
    dismissBanner,
    setShowBanner
  }
}