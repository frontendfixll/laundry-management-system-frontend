'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'react-hot-toast'

interface NotificationPreferences {
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }
  priorities: {
    P0: boolean
    P1: boolean
    P2: boolean
    P3: boolean
    P4: boolean
  }
  categories: {
    orders: boolean
    payments: boolean
    system: boolean
    marketing: boolean
    security: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  sounds: {
    enabled: boolean
    volume: number
  }
}

const priorityConfig = {
  P0: {
    name: 'Critical',
    description: 'Security alerts, payment fraud, system failures',
    color: 'red',
    icon: AlertTriangle,
    canDisable: false
  },
  P1: {
    name: 'High',
    description: 'Payment failures, order issues, account problems',
    color: 'orange',
    icon: AlertCircle,
    canDisable: false
  },
  P2: {
    name: 'Medium',
    description: 'Order updates, feature notifications, refunds',
    color: 'blue',
    icon: Info,
    canDisable: true
  },
  P3: {
    name: 'Low',
    description: 'Welcome messages, reports, announcements',
    color: 'gray',
    icon: Bell,
    canDisable: true
  },
  P4: {
    name: 'Silent',
    description: 'System logs (not shown to users)',
    color: 'gray',
    icon: Bell,
    canDisable: false
  }
}

interface NotificationManagerProps {
  maxNotifications?: number
}

export function NotificationManager({ maxNotifications = 5 }: NotificationManagerProps = {}) {
  const { user } = useAuthStore()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    channels: {
      inApp: true,
      email: true,
      sms: false,
      push: true
    },
    priorities: {
      P0: true,
      P1: true,
      P2: true,
      P3: true,
      P4: false
    },
    categories: {
      orders: true,
      payments: true,
      system: true,
      marketing: false,
      security: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    sounds: {
      enabled: true,
      volume: 50
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'channels' | 'priorities' | 'categories' | 'settings'>('channels')

  // Load user preferences
  useEffect(() => {
    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    try {
      // Mock API call - replace with actual API
      const savedPrefs = localStorage.getItem(`notification-prefs-${user?.id}`)
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs))
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error)
    }
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      localStorage.setItem(`notification-prefs-${user?.id}`, JSON.stringify(preferences))
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (section: keyof NotificationPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const resetToDefaults = () => {
    setPreferences({
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: true
      },
      priorities: {
        P0: true,
        P1: true,
        P2: true,
        P3: true,
        P4: false
      },
      categories: {
        orders: true,
        payments: true,
        system: true,
        marketing: false,
        security: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      sounds: {
        enabled: true,
        volume: 50
      }
    })
    toast.success('Preferences reset to defaults')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">Customize how and when you receive notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={savePreferences}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'channels', name: 'Delivery Channels', icon: Bell },
            { id: 'priorities', name: 'Priority Levels', icon: AlertTriangle },
            { id: 'categories', name: 'Categories', icon: Settings },
            { id: 'settings', name: 'Advanced Settings', icon: Volume2 }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'channels' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
              <p className="text-gray-600 mb-6">Choose how you want to receive notifications</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">In-App Notifications</h4>
                    <p className="text-sm text-gray-600">Show notifications in the application</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.channels.inApp}
                    onChange={(e) => updatePreference('channels', 'inApp', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.channels.email}
                    onChange={(e) => updatePreference('channels', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.channels.sms}
                    onChange={(e) => updatePreference('channels', 'sms', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <Smartphone className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-600">Browser push notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.channels.push}
                    onChange={(e) => updatePreference('channels', 'push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'priorities' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Levels</h3>
              <p className="text-gray-600 mb-6">Control which priority levels you want to receive</p>
            </div>

            <div className="space-y-4">
              {Object.entries(priorityConfig).map(([priority, config]) => {
                const Icon = config.icon
                const isEnabled = preferences.priorities[priority as keyof typeof preferences.priorities]
                
                return (
                  <div key={priority} className={`p-4 border rounded-lg ${
                    priority === 'P0' ? 'border-red-200 bg-red-50' :
                    priority === 'P1' ? 'border-orange-200 bg-orange-50' :
                    priority === 'P2' ? 'border-blue-200 bg-blue-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-3 ${
                          priority === 'P0' ? 'text-red-600' :
                          priority === 'P1' ? 'text-orange-600' :
                          priority === 'P2' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                        <div>
                          <div className="flex items-center">
                            <h4 className={`font-medium ${
                              priority === 'P0' ? 'text-red-900' :
                              priority === 'P1' ? 'text-orange-900' :
                              priority === 'P2' ? 'text-blue-900' :
                              'text-gray-900'
                            }`}>
                              {priority} - {config.name}
                            </h4>
                            {!config.canDisable && (
                              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            priority === 'P0' ? 'text-red-700' :
                            priority === 'P1' ? 'text-orange-700' :
                            priority === 'P2' ? 'text-blue-700' :
                            'text-gray-700'
                          }`}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                      
                      {config.canDisable ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => updatePreference('priorities', priority, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-sm">Always On</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Categories</h3>
              <p className="text-gray-600 mb-6">Choose which types of notifications you want to receive</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(preferences.categories).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{category}</h4>
                    <p className="text-sm text-gray-600">
                      {category === 'orders' && 'Order updates, delivery notifications'}
                      {category === 'payments' && 'Payment confirmations, billing alerts'}
                      {category === 'system' && 'System maintenance, feature updates'}
                      {category === 'marketing' && 'Promotions, newsletters, offers'}
                      {category === 'security' && 'Security alerts, login notifications'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updatePreference('categories', category, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
              <p className="text-gray-600 mb-6">Configure additional notification preferences</p>
            </div>

            {/* Quiet Hours */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                  <p className="text-sm text-gray-600">Disable non-critical notifications during specified hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => updatePreference('quietHours', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => updatePreference('quietHours', 'start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => updatePreference('quietHours', 'end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sound Settings */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">Notification Sounds</h4>
                  <p className="text-sm text-gray-600">Enable sound alerts for notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sounds.enabled}
                    onChange={(e) => updatePreference('sounds', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {preferences.sounds.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                  <div className="flex items-center space-x-3">
                    <VolumeX className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.sounds.volume}
                      onChange={(e) => updatePreference('sounds', 'volume', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 w-8">{preferences.sounds.volume}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}