'use client'

import { useAuthStore } from '@/store/authStore'
import { useFeatures } from '@/hooks/useFeatures'

export function SidebarDebug() {
  const { user } = useAuthStore()
  const { hasFeature } = useFeatures()

  // Test Platform Support item
  const platformSupportItem = {
    name: 'Platform Support',
    icon: 'HelpCircle',
    permission: null,
    feature: null,
    isExpandable: true,
    subItems: [
      { name: 'Create Ticket', href: '/admin/platform-support/create', icon: 'Ticket', permission: null, feature: null },
      { name: 'My Tickets', href: '/admin/platform-support/tickets', icon: 'MessageSquare', permission: null, feature: null },
    ]
  }

  // Helper functions (copied from AdminSidebar)
  const hasPermission = (user: any, permission: { module: string; action: string } | null) => {
    if (!permission) return true
    if (!user) return false
    if (!user.permissions) return false
    return user.permissions[permission.module]?.[permission.action] === true
  }

  const checkFeature = (hasFeatureFn: any, feature: any) => {
    if (!feature) return true
    return hasFeatureFn(feature)
  }

  // Test the filtering logic
  const hasPermissionResult = hasPermission(user, platformSupportItem.permission)
  const hasFeatureResult = checkFeature(hasFeature, platformSupportItem.feature)
  
  const visibleSubItems = platformSupportItem.subItems.filter(subItem => 
    hasPermission(user, subItem.permission) && checkFeature(hasFeature, subItem.feature)
  )
  
  const shouldShow = hasPermissionResult && hasFeatureResult && visibleSubItems.length > 0

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-lg mb-2">🔍 Sidebar Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User:</strong> {user?.email || 'Not logged in'}
        </div>
        <div>
          <strong>User Role:</strong> {user?.role || 'No role'}
        </div>
        <div>
          <strong>Has Permissions Object:</strong> {user?.permissions ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Has Features Function:</strong> {typeof hasFeature === 'function' ? 'Yes' : 'No'}
        </div>
        
        <hr className="my-2" />
        
        <div>
          <strong>Platform Support Tests:</strong>
        </div>
        <div>
          • Permission Check: {hasPermissionResult ? '✅ Pass' : '❌ Fail'}
        </div>
        <div>
          • Feature Check: {hasFeatureResult ? '✅ Pass' : '❌ Fail'}
        </div>
        <div>
          • Visible Sub-items: {visibleSubItems.length}/2
        </div>
        <div>
          • Should Show: {shouldShow ? '✅ Yes' : '❌ No'}
        </div>
        
        <hr className="my-2" />
        
        <div>
          <strong>Sub-item Tests:</strong>
        </div>
        {platformSupportItem.subItems.map((subItem, index) => {
          const subPermission = hasPermission(user, subItem.permission)
          const subFeature = checkFeature(hasFeature, subItem.feature)
          return (
            <div key={index}>
              • {subItem.name}: {subPermission && subFeature ? '✅' : '❌'}
            </div>
          )
        })}
      </div>
      
      <button 
        onClick={() => {
          const debugDiv = document.querySelector('[data-sidebar-debug]')
          if (debugDiv) debugDiv.remove()
        }}
        className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs"
      >
        Close
      </button>
    </div>
  )
}