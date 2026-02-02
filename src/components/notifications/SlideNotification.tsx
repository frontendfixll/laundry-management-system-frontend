'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideNotificationProps {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration?: number
  category?: 'system' | 'action' | 'realtime'
  onClose: (id: string) => void
}

const typeConfig: Record<'success' | 'warning' | 'error' | 'info', {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  borderColor: string
  iconColor: string
  titleColor: string
  messageColor: string
  progressColor: string
}> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    progressColor: 'bg-green-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    progressColor: 'bg-yellow-500'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    progressColor: 'bg-red-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    progressColor: 'bg-blue-500'
  }
}

export function SlideNotification({
  id,
  type,
  title,
  message,
  duration = 15000, // Changed from 5000 to 15000 (15 seconds)
  category = 'system',
  onClose
}: SlideNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Ensure type is valid, fallback to 'info' if invalid
  const validType = type && typeConfig[type] ? type : 'info'
  const config = typeConfig[validType]
  const Icon = config.icon

  // Adjust size based on category
  const getNotificationSize = () => {
    switch (category) {
      case 'action':
        return 'w-64' // Smaller for action feedback
      case 'realtime':
        return 'w-72' // Medium for real-time updates
      case 'system':
      default:
        return 'w-80' // Larger for system notifications
    }
  }

  useEffect(() => {
    // Slide in animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300) // Match animation duration
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out mb-3',
        getNotificationSize(),
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      )}
    >
      <div className={cn(
        'rounded-lg border shadow-lg backdrop-blur-sm',
        config.bgColor,
        config.borderColor
      )}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <h3 className={cn('text-sm font-medium', config.titleColor)}>
                {title}
              </h3>
              <p className={cn('mt-1 text-sm leading-relaxed', config.messageColor)}>
                {message}
              </p>
            </div>
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={handleClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 transition-colors',
                  'hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.iconColor.replace('text-', 'focus:ring-').replace('-500', '-400')
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all ease-linear',
              config.progressColor
            )}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Default export for easier importing
export default SlideNotification