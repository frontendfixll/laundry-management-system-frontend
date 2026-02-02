'use client'

import React, { useState } from 'react'
import { usePermissionTester } from '@/hooks/usePermissionTester'
import { PermissionDebugger } from './PermissionDebugger'

export const PermissionTestPanel: React.FC = () => {
  const [showDebugger, setShowDebugger] = useState(false)
  const {
    removeOrdersPermission,
    addOrdersPermission,
    removeInventoryPermission,
    addInventoryPermission,
    resetPermissions
  } = usePermissionTester()

  return (
    <>
      <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
        <h3 className="font-bold text-sm mb-3">Permission Tester</h3>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={removeOrdersPermission}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Remove Orders
            </button>
            <button
              onClick={addOrdersPermission}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Add Orders
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={removeInventoryPermission}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              Remove Inventory
            </button>
            <button
              onClick={addInventoryPermission}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
            >
              Add Inventory
            </button>
          </div>
          
          <button
            onClick={resetPermissions}
            className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Reset to Server Permissions
          </button>
          
          <button
            onClick={() => setShowDebugger(!showDebugger)}
            className="w-full px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            {showDebugger ? 'Hide' : 'Show'} Permission Debugger
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Watch the sidebar update in real-time!
        </p>
      </div>
      
      {showDebugger && <PermissionDebugger />}
    </>
  )
}