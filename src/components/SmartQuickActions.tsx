'use client'

import Link from 'next/link'
import { useSmartQuickActions } from '@/hooks/useSmartQuickActions'
import { TrendingUp, Clock, Zap } from 'lucide-react'

interface SmartQuickActionsProps {
  maxActions?: number
  showAnalytics?: boolean
}

/**
 * Smart Quick Actions Component
 * - Shows permission-based actions
 * - Orders by usage analytics (last 24 hours)
 * - Tracks clicks for future optimization
 */
export function SmartQuickActions({ maxActions = 6, showAnalytics = false }: SmartQuickActionsProps) {
  const { quickActions, trackClick, totalAllowedActions } = useSmartQuickActions(maxActions)

  if (quickActions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No actions available</p>
          <p className="text-sm text-gray-400">Contact your administrator for permissions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Smart Quick Actions</h2>
          {showAnalytics && (
            <p className="text-sm text-gray-500">
              Showing {quickActions.length} of {totalAllowedActions} available actions
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Sorted by usage</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <Link
            key={action.id}
            href={action.href}
            onClick={() => trackClick(action.id)}
            className={`flex items-center p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              index === 0 && action.clickCount > 0
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100'
                : 'bg-gray-50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
            }`}
          >
            {/* Popular action indicator */}
            {index === 0 && action.clickCount > 0 && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  Most Used
                </div>
              </div>
            )}
            
            {/* Recently used indicator */}
            {action.lastClicked && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  Recent
                </div>
              </div>
            )}

            <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg ${action.shadowColor} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{action.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                {action.description}
                {showAnalytics && action.clickCount > 0 && (
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {action.clickCount} clicks
                  </span>
                )}
              </div>
            </div>

            {/* Click count badge for popular actions */}
            {action.clickCount > 0 && (
              <div className="ml-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {action.clickCount}
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Show more actions hint */}
      {totalAllowedActions > maxActions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            {totalAllowedActions - maxActions} more actions available in sidebar
          </p>
        </div>
      )}
    </div>
  )
}