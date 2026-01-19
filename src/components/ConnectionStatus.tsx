'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  className?: string
}

export default function ConnectionStatus({ isConnected, className = '' }: ConnectionStatusProps) {
  const [showStatus, setShowStatus] = useState(false)
  const [wasConnected, setWasConnected] = useState(true)

  useEffect(() => {
    // Show status when connection changes
    if (wasConnected !== isConnected) {
      setShowStatus(true)
      setWasConnected(isConnected)
      
      // Hide status after 3 seconds if connected
      if (isConnected) {
        const timer = setTimeout(() => {
          setShowStatus(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isConnected, wasConnected])

  // Always show if disconnected
  const shouldShow = !isConnected || showStatus

  if (!shouldShow) return null

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Disconnected</span>
            <AlertCircle className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  )
}