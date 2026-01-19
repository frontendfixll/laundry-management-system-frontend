'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { User, Shield, ShoppingBag, LogOut, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Role Switcher Component - Allows admins to temporarily switch to customer mode
 * This enables admins to test customer experience and place orders
 */
export function RoleSwitcher() {
  const router = useRouter()
  const { user, updateUser } = useAuthStore()
  const [isCustomerMode, setIsCustomerMode] = useState(false)

  // Only show for admin roles
  if (!user || !['admin', 'center_admin', 'branch_admin', 'branch_manager'].includes(user.role)) {
    return null
  }

  const switchToCustomerMode = () => {
    // Store original role in user object
    const updatedUser = {
      ...user,
      originalRole: user.role, // Store original role
      role: 'customer' as const, // Temporarily switch to customer
      isInCustomerMode: true // Flag to indicate temporary switch
    }
    
    updateUser(updatedUser)
    setIsCustomerMode(true)
    toast.success('Switched to Customer Mode - You can now place orders!')
    
    // Redirect to customer dashboard
    router.push('/customer/dashboard')
  }

  const switchBackToAdmin = () => {
    if (!user.originalRole) return
    
    // Restore original role
    const updatedUser = {
      ...user,
      role: user.originalRole,
      originalRole: undefined,
      isInCustomerMode: false
    }
    
    updateUser(updatedUser)
    setIsCustomerMode(false)
    toast.success(`Switched back to ${user.originalRole === 'admin' ? 'Admin' : 'Manager'} Mode`)
    
    // Redirect to admin dashboard
    const dashboardRoutes: Record<string, string> = {
      admin: '/admin/dashboard',
      center_admin: '/center-admin/dashboard',
      branch_admin: '/branch-admin/dashboard',
      branch_manager: '/center-admin/dashboard'
    }
    
    router.push(dashboardRoutes[user.originalRole] || '/admin/dashboard')
  }

  // Check if currently in customer mode
  const inCustomerMode = user.isInCustomerMode || user.role === 'customer'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!inCustomerMode ? (
        // Switch to Customer Mode Button
        <button
          onClick={switchToCustomerMode}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Switch to Customer Mode to place orders"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm font-medium">Customer Mode</span>
        </button>
      ) : (
        // Switch back to Admin Mode Button
        <div className="flex flex-col gap-2">
          {/* Customer Mode Indicator */}
          <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-1 rounded-lg text-xs font-medium text-center">
            <User className="w-3 h-3 inline mr-1" />
            Customer Mode Active
          </div>
          
          {/* Switch Back Button */}
          <button
            onClick={switchBackToAdmin}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Switch back to Admin Mode"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Admin</span>
          </button>
        </div>
      )}
    </div>
  )
}