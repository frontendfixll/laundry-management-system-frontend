'use client'

import { useAuthStore } from '@/store/authStore'
import { useCallback } from 'react'

export const usePermissionTester = () => {
  const { user, updateUser } = useAuthStore()

  // Simulate removing orders permission
  const removeOrdersPermission = useCallback(() => {
    if (!user?.permissions) return

    const newPermissions = { ...user.permissions }
    if (newPermissions.orders) {
      newPermissions.orders = { ...newPermissions.orders, view: false }
    }

    updateUser({ permissions: newPermissions })
    console.log('🔄 Removed orders.view permission - Orders should disappear from sidebar')
  }, [user, updateUser])

  // Simulate adding orders permission
  const addOrdersPermission = useCallback(() => {
    if (!user?.permissions) return

    const newPermissions = { ...user.permissions }
    if (!newPermissions.orders) {
      newPermissions.orders = {}
    }
    newPermissions.orders.view = true

    updateUser({ permissions: newPermissions })
    console.log('✅ Added orders.view permission - Orders should appear in sidebar')
  }, [user, updateUser])

  // Simulate removing inventory permission
  const removeInventoryPermission = useCallback(() => {
    if (!user?.permissions) return

    const newPermissions = { ...user.permissions }
    if (newPermissions.inventory) {
      newPermissions.inventory = { ...newPermissions.inventory, view: false }
    }

    updateUser({ permissions: newPermissions })
    console.log('🔄 Removed inventory.view permission - Inventory should disappear from sidebar')
  }, [user, updateUser])

  // Simulate adding inventory permission
  const addInventoryPermission = useCallback(() => {
    if (!user?.permissions) return

    const newPermissions = { ...user.permissions }
    if (!newPermissions.inventory) {
      newPermissions.inventory = {}
    }
    newPermissions.inventory.view = true

    updateUser({ permissions: newPermissions })
    console.log('✅ Added inventory.view permission - Inventory should appear in sidebar')
  }, [user, updateUser])

  // Reset all permissions (for testing)
  const resetPermissions = useCallback(async () => {
    try {
      // Refresh from server to get original permissions
      const response = await fetch('/api/auth/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.permissions) {
          updateUser({ 
            permissions: data.data.permissions,
            features: data.data.features 
          })
          console.log('🔄 Reset permissions from server')
        }
      }
    } catch (error) {
      console.error('Failed to reset permissions:', error)
    }
  }, [updateUser])

  return {
    removeOrdersPermission,
    addOrdersPermission,
    removeInventoryPermission,
    addInventoryPermission,
    resetPermissions,
    currentPermissions: user?.permissions
  }
}