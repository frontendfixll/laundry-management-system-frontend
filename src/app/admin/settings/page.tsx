'use client'


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  User,
  Lock,
  Bell,
  Mail,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Truck,
  MapPin,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface DeliveryPricingConfig {
  baseDistance: number
  perKmRate: number
  maxDistance: number
  minimumCharge: number
  expressMultiplier: number
  fallbackFlatRate: number
}

interface BranchCoordinateStatus {
  _id: string
  name: string
  code: string
  city: string
  hasCoordinates: boolean
  coordinates?: { latitude: number; longitude: number }
  serviceableRadius?: number
}

export default function AdminSettingsPage() {
  const { user, token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Delivery pricing state
  const [deliveryPricing, setDeliveryPricing] = useState<DeliveryPricingConfig>({
    baseDistance: 3,
    perKmRate: 5,
    maxDistance: 20,
    minimumCharge: 0,
    expressMultiplier: 1.5,
    fallbackFlatRate: 30
  })
  const [deliveryPricingLoading, setDeliveryPricingLoading] = useState(false)
  const [branchesStatus, setBranchesStatus] = useState<BranchCoordinateStatus[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@laundry.com',
    phone: '9876543210'
  })

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailComplaints: true,
    emailRefunds: true,
    pushOrders: true,
    pushComplaints: true,
    pushRefunds: false
  })

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Fetch delivery pricing config
  useEffect(() => {
    if (activeTab === 'delivery') {
      fetchDeliveryPricing()
      fetchBranchesStatus()
    }
  }, [activeTab])

  const fetchDeliveryPricing = async () => {
    setDeliveryPricingLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin/delivery-pricing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setDeliveryPricing(data.data.config)
      }
    } catch (error) {
      console.error('Failed to fetch delivery pricing:', error)
      toast.error('Failed to load delivery pricing')
    } finally {
      setDeliveryPricingLoading(false)
    }
  }

  const fetchBranchesStatus = async () => {
    setBranchesLoading(true)
    try {
      const response = await fetch(`${API_URL}/admin/branches/coordinates-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setBranchesStatus(data.data.branches)
      }
    } catch (error) {
      console.error('Failed to fetch branches status:', error)
    } finally {
      setBranchesLoading(false)
    }
  }

  const handleSaveDeliveryPricing = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/admin/delivery-pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deliveryPricing)
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Delivery pricing updated successfully')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error(data.message || 'Failed to update pricing')
      }
    } catch (error) {
      console.error('Failed to save delivery pricing:', error)
      toast.error('Failed to save delivery pricing')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'delivery', label: 'Delivery Pricing', icon: Truck }
  ]

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Profile Information</h2>
                  <p className="text-sm text-gray-500">Update your personal information</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {(profile.name || 'A').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value="Admin"
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Security Settings</h2>
                  <p className="text-sm text-gray-500">Manage your password and security preferences</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Two-Factor Authentication</p>
                      <p className="text-sm text-blue-600">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Enable</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Change Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password.current}
                        onChange={(e) => setPassword({ ...password, current: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({ ...password, new: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-800 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Current Session</p>
                        <p className="text-sm text-gray-500">Windows • Chrome • New Delhi</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailOrders', label: 'New Orders', desc: 'Get notified when new orders are placed' },
                        { key: 'emailComplaints', label: 'Complaints', desc: 'Get notified about new complaints' },
                        { key: 'emailRefunds', label: 'Refund Requests', desc: 'Get notified about refund requests' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'pushOrders', label: 'New Orders', desc: 'Browser notifications for new orders' },
                        { key: 'pushComplaints', label: 'Complaints', desc: 'Browser notifications for complaints' },
                        { key: 'pushRefunds', label: 'Refund Requests', desc: 'Browser notifications for refunds' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Pricing Tab */}
            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Delivery Pricing Configuration</h2>
                  <p className="text-sm text-gray-500">Configure distance-based delivery charges for all branches</p>
                </div>

                {deliveryPricingLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">Loading pricing configuration...</span>
                  </div>
                ) : (
                  <>
                    {/* Pricing Info Card */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">How Delivery Pricing Works</p>
                          <p className="text-sm text-blue-600 mt-1">
                            • Free delivery within <strong>{deliveryPricing.baseDistance} km</strong> (base distance)<br/>
                            • ₹{deliveryPricing.perKmRate}/km charged after base distance<br/>
                            • Maximum serviceable distance: <strong>{deliveryPricing.maxDistance} km</strong><br/>
                            • Express orders: <strong>{deliveryPricing.expressMultiplier}x</strong> delivery charge
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Distance (Free Delivery Zone)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="50"
                            value={deliveryPricing.baseDistance}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, baseDistance: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-4 top-3 text-gray-400">km</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Delivery is free within this distance</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Per Kilometer Rate
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-400">₹</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="100"
                            value={deliveryPricing.perKmRate}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, perKmRate: parseFloat(e.target.value) || 0 })}
                            className="w-full px-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-4 top-3 text-gray-400">/km</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Charged per km after base distance</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Distance
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            max="100"
                            value={deliveryPricing.maxDistance}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, maxDistance: parseFloat(e.target.value) || 20 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-4 top-3 text-gray-400">km</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Orders beyond this distance are not serviceable</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Charge
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-400">₹</span>
                          <input
                            type="number"
                            step="5"
                            min="0"
                            max="500"
                            value={deliveryPricing.minimumCharge}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, minimumCharge: parseFloat(e.target.value) || 0 })}
                            className="w-full px-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimum delivery charge (0 = free within base)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Express Multiplier
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="3"
                            value={deliveryPricing.expressMultiplier}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, expressMultiplier: parseFloat(e.target.value) || 1.5 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="absolute right-4 top-3 text-gray-400">x</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Delivery charge multiplier for express orders</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fallback Flat Rate
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-400">₹</span>
                          <input
                            type="number"
                            step="5"
                            min="0"
                            max="500"
                            value={deliveryPricing.fallbackFlatRate}
                            onChange={(e) => setDeliveryPricing({ ...deliveryPricing, fallbackFlatRate: parseFloat(e.target.value) || 30 })}
                            className="w-full px-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Used when distance calculation fails</p>
                      </div>
                    </div>

                    {/* Branches Coordinates Status */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Branch Coordinates Status
                          </h3>
                          <p className="text-sm text-gray-500">Branches need coordinates for distance-based pricing</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={fetchBranchesStatus}
                          disabled={branchesLoading}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${branchesLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>

                      {branchesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : branchesStatus.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No branches found
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {branchesStatus.map((branch) => (
                            <div 
                              key={branch._id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                branch.hasCoordinates ? 'bg-green-50' : 'bg-amber-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${branch.hasCoordinates ? 'bg-green-500' : 'bg-amber-500'}`} />
                                <div>
                                  <p className="font-medium text-gray-800">{branch.name}</p>
                                  <p className="text-xs text-gray-500">{branch.code} • {branch.city || 'No city'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {branch.hasCoordinates ? (
                                  <div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      ✓ Configured
                                    </span>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {branch.coordinates?.latitude.toFixed(4)}, {branch.coordinates?.longitude.toFixed(4)}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                    ⚠ No Coordinates
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              {saved && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Settings saved successfully!
                </div>
              )}
              <Button 
                onClick={activeTab === 'delivery' ? handleSaveDeliveryPricing : handleSave}
                disabled={saving}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
