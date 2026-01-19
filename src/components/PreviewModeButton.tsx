'use client'

import { useAuthStore } from '@/store/authStore'
import { usePreviewStore } from '@/store/previewStore'
import { useRouter } from 'next/navigation'
import { Eye, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface PreviewModeButtonProps {
  targetUrl?: string
  label?: string
  className?: string
}

/**
 * Button to enable admin preview mode and navigate to customer pages
 * Used in branding page and other admin areas
 */
export function PreviewModeButton({ 
  targetUrl = '/', 
  label = "Preview as Customer",
  className = ""
}: PreviewModeButtonProps) {
  const { user } = useAuthStore()
  const { setAdminPreviewMode } = usePreviewStore()
  const router = useRouter()

  // Only show for admin roles
  if (!user || !['admin', 'center_admin', 'branch_admin', 'branch_manager'].includes(user.role)) {
    return null
  }

  const handlePreviewMode = () => {
    // Enable preview mode
    setAdminPreviewMode(true, user.role)
    
    // Show success message
    toast.success('Preview Mode Enabled - Viewing as Customer', {
      duration: 3000,
      icon: <Eye className="w-4 h-4" />
    })
    
    // Navigate to target URL
    router.push(targetUrl)
  }

  return (
    <button
      onClick={handlePreviewMode}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
    >
      <Eye className="w-4 h-4" />
      {label}
      <ExternalLink className="w-3 h-3" />
    </button>
  )
}