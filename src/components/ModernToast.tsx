'use client'

import { toast, Toaster } from 'react-hot-toast'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Bell
} from 'lucide-react'

// Custom toast styles
const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.1)',
  },
  error: {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25), 0 10px 10px -5px rgba(239, 68, 68, 0.1)',
  },
  warning: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 10px 10px -5px rgba(245, 158, 11, 0.1)',
  },
  info: {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
  }
}

// Enhanced toast functions
export const showToast = {
  success: (message: string, options?: any) => {
    toast.success(message, {
      style: toastStyles.success,
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10B981',
      },
      duration: 4000,
      ...options
    })
  },

  error: (message: string, options?: any) => {
    toast.error(message, {
      style: toastStyles.error,
      iconTheme: {
        primary: '#ffffff',
        secondary: '#EF4444',
      },
      duration: 6000,
      ...options
    })
  },

  warning: (message: string, options?: any) => {
    toast(message, {
      icon: '⚠️',
      style: toastStyles.warning,
      duration: 5000,
      ...options
    })
  },

  info: (message: string, options?: any) => {
    toast(message, {
      icon: 'ℹ️',
      style: toastStyles.info,
      duration: 4000,
      ...options
    })
  },

  // Custom notification toast
  notification: (title: string, message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info', action?: { label: string, onClick: () => void }) => {
    const getIcon = () => {
      switch (severity) {
        case 'success': return <CheckCircle className="w-5 h-5" />
        case 'error': return <XCircle className="w-5 h-5" />
        case 'warning': return <AlertTriangle className="w-5 h-5" />
        default: return <Bell className="w-5 h-5" />
      }
    }

    const getColors = () => {
      switch (severity) {
        case 'success': return 'border-green-200 bg-green-50 text-green-800'
        case 'error': return 'border-red-200 bg-red-50 text-red-800'
        case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
        default: return 'border-blue-200 bg-blue-50 text-blue-800'
      }
    }

    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-80 bg-white shadow-lg rounded-xl pointer-events-auto border-l-4 ${getColors()}`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {title}
              </p>
              <p className="mt-1 text-sm opacity-90 break-words">
                {message}
              </p>
              {action && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      action.onClick()
                      toast.dismiss(t.id)
                    }}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ), {
      duration: severity === 'error' ? 8000 : 6000,
    })
  }
}

// Modern Toaster component
export default function ModernToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
      }}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '380px', // Fixed width to prevent full screen
          width: '380px', // Enforce consistent width
        },
        // Individual toast type styles
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  )
}