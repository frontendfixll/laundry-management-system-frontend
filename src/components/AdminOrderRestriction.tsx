'use client'

import { useAuthStore } from '@/store/authStore'
import { usePreviewStore } from '@/store/previewStore'
import { AlertTriangle, User, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminOrderRestrictionProps {
  children: React.ReactNode
  action?: string // e.g., "place order", "add to cart", etc.
}

/**
 * Component that prevents admins from placing orders in preview mode
 * Shows a flash message asking them to login as customer
 */
export function AdminOrderRestriction({ children, action = "place order" }: AdminOrderRestrictionProps) {
  const { user } = useAuthStore()
  const { isAdminPreviewMode } = usePreviewStore()

  // Check if user is admin in preview mode
  const isAdminInPreview = user && 
    ['admin', 'center_admin', 'branch_admin', 'branch_manager'].includes(user.role) &&
    isAdminPreviewMode

  const handleRestrictedAction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Show flash message
    toast.error(
      `Please login as Customer to ${action}`,
      {
        duration: 4000,
        icon: <LogIn className="w-5 h-5" />,
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        }
      }
    )
  }

  // If admin in preview mode, wrap with restriction
  if (isAdminInPreview) {
    return (
      <div onClick={handleRestrictedAction} className="cursor-not-allowed">
        <div className="pointer-events-none opacity-75">
          {children}
        </div>
      </div>
    )
  }

  // Normal behavior for customers or non-preview mode
  return <>{children}</>
}