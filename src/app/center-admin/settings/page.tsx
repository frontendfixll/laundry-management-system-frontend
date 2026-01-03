'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { branchApi } from '@/lib/centerAdminApi'
import { 
  Settings, 
  Clock,
  RefreshCw,
  Loader2,
  Save,
  User,
  Bell,
  Building,
  Shield,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const settingsTabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'operating', label: 'Operating Hours', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'profile', label: 'Profile', icon: User }
]

interface BranchSettings {
  branch: {
    _id: string
    name: string
    code: string
    address?: {
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      pincode?: string
      landmark?: string
    } | string
    phone: string
    email: string
    status: string
  }
  operatingHours: {
    monday: { open: string; close: string; isOpen: boolean }
    tuesday: { open: string; close: string; isOpen: boolean }
    wednesday: { open: string; close: string; isOpen: boolean }
    thursday: { open: string; close: string; isOpen: boolean }
    friday: { open: string; close: string; isOpen: boolean }
    saturday: { open: string; close: string; isOpen: boolean }
    sunday: { open: string; close: string; isOpen: boolean }
  }
  settings: {
    autoAssignOrders: boolean
    maxOrdersPerStaff: number
    expressOrderPriority: boolean
    notifyOnNewOrder: boolean
    notifyOnStatusChange: boolean
    notifyOnLowStaff: boolean
  }
}

const defaultOperatingHours = {
  monday: { open: '08:00', close: '20:00', isOpen: true },
  tuesday: { open: '08:00', close: '20:00', isOpen: true },
  wednesday: { open: '08:00', close: '20:00', isOpen: true },
  thursday: { open: '08:00', close: '20:00', isOpen: true },
  friday: { open: '08:00', close: '20:00', isOpen: true },
  saturday: { open: '09:00', close: '18:00', isOpen: true },
  sunday: { open: '10:00', close: '16:00', isOpen: false }
}

const defaultSettings = {
  autoAssignOrders: true,
  maxOrdersPerStaff: 10,
  expressOrderPriority: true,
  notifyOnNewOrder: true,
  notifyOnStatusChange: true,
  notifyOnLowStaff: true
}

export default function BranchSettingsPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<BranchSettings | null>(null)
  const [operatingHours, setOperatingHours] = useState(defaultOperatingHours)
  const [settings, setSettings] = useState(defaultSettings)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await branchApi.getSettings()
      if (response.success) {
        setData(response.data)
        if (response.data.operatingHours) {
          setOperatingHours({ ...defaultOperatingHours, ...response.data.operatingHours })
        }
        if (response.data.settings) {
          setSettings({ ...defaultSettings, ...response.data.settings })
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await branchApi.updateSettings({ operatingHours, settings })
      toast.success('Settings saved successfully')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branch Settings</h1>
          <p className="text-gray-600">Manage your branch configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1 bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Branch Status Card */}
          {data?.branch && (
            <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Branch Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    data.branch.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {data.branch.status === 'active' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 mr-1" /> Inactive</>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Code</span>
                  <span className="text-xs font-medium text-gray-800">{data.branch.code}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {activeTab === 'general' && (
              <GeneralSettings branch={data?.branch} settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'operating' && (
              <OperatingHoursSettings operatingHours={operatingHours} setOperatingHours={setOperatingHours} />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings settings={settings} setSettings={setSettings} />
            )}
            {activeTab === 'profile' && (
              <ProfileSettings user={user} branch={data?.branch} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// General Settings Component
function GeneralSettings({ branch, settings, setSettings }: any) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        <p className="text-gray-600 text-sm">Configure branch operations and order handling</p>
      </div>

      {/* Branch Info */}
      {branch && (
        <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
            <Building className="w-4 h-4 mr-2 text-green-600" />
            Branch Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium text-gray-800">{branch.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Code:</span>
              <span className="ml-2 font-medium text-gray-800">{branch.code}</span>
            </div>
            {branch.address && (
              <div className="col-span-2 flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mr-1 mt-0.5" />
                <span className="text-gray-600">
                  {typeof branch.address === 'string' 
                    ? branch.address 
                    : [branch.address.addressLine1, branch.address.city, branch.address.pincode].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Settings */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-800">Order Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-Assign Orders</h4>
              <p className="text-xs text-gray-500">Automatically assign new orders to available staff</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssignOrders}
                onChange={(e) => setSettings({ ...settings, autoAssignOrders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Express Order Priority</h4>
              <p className="text-xs text-gray-500">Prioritize express orders in the queue</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.expressOrderPriority}
                onChange={(e) => setSettings({ ...settings, expressOrderPriority: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Max Orders Per Staff</h4>
                <p className="text-xs text-gray-500">Maximum concurrent orders per staff member</p>
              </div>
            </div>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxOrdersPerStaff}
              onChange={(e) => setSettings({ ...settings, maxOrdersPerStaff: parseInt(e.target.value) || 10 })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


// Operating Hours Settings Component
function OperatingHoursSettings({ operatingHours, setOperatingHours }: any) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  const updateDay = (day: string, field: string, value: any) => {
    setOperatingHours({
      ...operatingHours,
      [day]: { ...operatingHours[day], [field]: value }
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Operating Hours</h2>
        <p className="text-gray-600 text-sm">Set your branch's working hours for each day</p>
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <div 
            key={day} 
            className={`flex items-center justify-between p-4 rounded-lg border ${
              operatingHours[day]?.isOpen 
                ? 'bg-white border-gray-200' 
                : 'bg-gray-50 border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={operatingHours[day]?.isOpen ?? true}
                  onChange={(e) => updateDay(day, 'isOpen', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
              <span className={`text-sm font-medium w-24 ${
                operatingHours[day]?.isOpen ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {dayLabels[day]}
              </span>
            </div>

            {operatingHours[day]?.isOpen ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500">Open</label>
                  <input
                    type="time"
                    value={operatingHours[day]?.open || '08:00'}
                    onChange={(e) => updateDay(day, 'open', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-gray-500">Close</label>
                  <input
                    type="time"
                    value={operatingHours[day]?.close || '20:00'}
                    onChange={(e) => updateDay(day, 'close', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400 italic">Closed</span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const allOpen = { ...operatingHours }
            days.forEach(day => {
              allOpen[day] = { ...allOpen[day], isOpen: true }
            })
            setOperatingHours(allOpen)
          }}
        >
          Open All Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const weekdays = { ...operatingHours }
            days.forEach(day => {
              weekdays[day] = { 
                ...weekdays[day], 
                isOpen: !['saturday', 'sunday'].includes(day) 
              }
            })
            setOperatingHours(weekdays)
          }}
        >
          Weekdays Only
        </Button>
      </div>
    </div>
  )
}

// Notification Settings Component
function NotificationSettings({ settings, setSettings }: any) {
  const notifications = [
    { 
      key: 'notifyOnNewOrder', 
      label: 'New Order Alerts', 
      desc: 'Get notified when a new order is assigned to your branch',
      icon: Bell
    },
    { 
      key: 'notifyOnStatusChange', 
      label: 'Status Change Alerts', 
      desc: 'Get notified when order status changes',
      icon: RefreshCw
    },
    { 
      key: 'notifyOnLowStaff', 
      label: 'Low Staff Alerts', 
      desc: 'Get notified when staff availability is low',
      icon: AlertTriangle
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600 text-sm">Configure how you receive alerts and notifications</p>
      </div>

      <div className="space-y-4">
        {notifications.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{item.label}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key] ?? true}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          )
        })}
      </div>

      {/* Email Preferences */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-800 mb-4">Email Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Daily Summary</h4>
                <p className="text-xs text-gray-500">Receive a daily summary of branch operations</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Weekly Report</h4>
                <p className="text-xs text-gray-500">Receive weekly performance reports</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Profile Settings Component
function ProfileSettings({ user, branch }: any) {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 text-sm">View and update your profile information</p>
      </div>

      {/* Profile Card */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'B'}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{user?.name || 'Center Admin'}</h3>
            <p className="text-green-100">{branch?.name || 'Branch'}</p>
            <div className="flex items-center mt-1">
              <Shield className="w-4 h-4 mr-1" />
              <span className="text-sm text-green-100">Center Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <input
              type="text"
              value="Center Admin"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        {/* Branch Assignment */}
        {branch && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Assigned Branch</h4>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                <p className="text-xs text-gray-500">Code: {branch.code}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Security</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Not Enabled</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
