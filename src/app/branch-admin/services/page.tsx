'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  Sparkles, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  ToggleLeft,
  ToggleRight,
  MapPin
} from 'lucide-react'

interface Service {
  _id: string
  name: string
  code: string
  displayName: string
  description: string
  category: string
  turnaroundTime: {
    standard: number
    express: number
  }
  isActive: boolean
  isExpressAvailable: boolean
  branchConfig?: {
    isEnabled: boolean
    priceMultiplier: number
  }
}

interface BranchInfo {
  _id: string
  name: string
  code: string
}

export default function BranchAdminServicesPage() {
  const { user } = useAuthStore()
  const [services, setServices] = useState<Service[]>([])
  const [branchInfo, setBranchInfo] = useState<BranchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetchBranchServices()
  }, [])

  const fetchBranchServices = async () => {
    try {
      setLoading(true)
      
      // First get dashboard to get branch info
      const dashboardRes = await api.get('/admin/dashboard')
      if (dashboardRes.data.success && dashboardRes.data.data.branchInfo) {
        setBranchInfo(dashboardRes.data.data.branchInfo)
        
        // Fetch services for this specific branch
        const branchId = dashboardRes.data.data.branchInfo._id
        const servicesRes = await api.get(`/admin/branches/${branchId}/services`)
        
        if (servicesRes.data.success) {
          setServices(servicesRes.data.data.services || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleService = async (service: Service) => {
    if (!branchInfo) return
    
    try {
      setToggling(service._id)
      const response = await api.patch(`/admin/branches/${branchInfo._id}/services/${service._id}/toggle`)
      
      if (response.data.success) {
        // Update local state
        setServices(prev => prev.map(s => 
          s._id === service._id 
            ? { 
                ...s, 
                branchConfig: { 
                  ...s.branchConfig, 
                  isEnabled: !s.branchConfig?.isEnabled,
                  priceMultiplier: s.branchConfig?.priceMultiplier || 1
                } 
              }
            : s
        ))
        toast.success(`Service ${!service.branchConfig?.isEnabled ? 'enabled' : 'disabled'} for your branch`)
      }
    } catch (error) {
      console.error('Failed to toggle service:', error)
      toast.error('Failed to update service')
    } finally {
      setToggling(null)
    }
  }

  const filteredServices = services.filter(service =>
    service.displayName.toLowerCase().includes(search.toLowerCase()) ||
    service.code.toLowerCase().includes(search.toLowerCase())
  )

  const enabledCount = services.filter(s => s.branchConfig?.isEnabled).length

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'laundry': return 'bg-blue-100 text-blue-800'
      case 'dry_cleaning': return 'bg-purple-100 text-purple-800'
      case 'pressing': return 'bg-orange-100 text-orange-800'
      case 'specialty': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Branch Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Branch Services</h1>
          <p className="text-gray-600">Manage services available at your branch</p>
        </div>
        {branchInfo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg border border-teal-200">
            <MapPin className="w-5 h-5 text-teal-600" />
            <div>
              <p className="font-semibold text-teal-800">{branchInfo.name}</p>
              <p className="text-xs text-teal-600">Code: {branchInfo.code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <span className="text-blue-100">Total Services</span>
          </div>
          <p className="text-3xl font-bold">{services.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8" />
            <span className="text-green-100">Enabled at Branch</span>
          </div>
          <p className="text-3xl font-bold">{enabledCount}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" />
            <span className="text-orange-100">Express Available</span>
          </div>
          <p className="text-3xl font-bold">{services.filter(s => s.isExpressAvailable && s.branchConfig?.isEnabled).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Services ({filteredServices.length})
          </h2>
          <p className="text-sm text-gray-500">Toggle services on/off for your branch. Disabled services won&apos;t be available to customers.</p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600">No services match your search.</p>
            </div>
          ) : (
            filteredServices.map((service) => {
              const isEnabled = service.branchConfig?.isEnabled || false
              const isToggling = toggling === service._id
              
              return (
                <div key={service._id} className={`p-4 hover:bg-gray-50 transition-colors ${!isEnabled ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isEnabled ? 'bg-gradient-to-r from-teal-500 to-emerald-600' : 'bg-gray-300'
                      }`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{service.displayName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(service.category)}`}>
                            {service.category.replace('_', ' ')}
                          </span>
                          {service.isExpressAvailable && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Zap className="w-3 h-3 mr-1" />
                              Express
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{service.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                          <span>Code: {service.code}</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {service.turnaroundTime.standard}h / {service.turnaroundTime.express}h express
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => handleToggleService(service)}
                        disabled={isToggling}
                        className={`p-2 rounded-lg transition-colors ${
                          isEnabled 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isToggling ? (
                          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : isEnabled ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Note:</span> You can only enable/disable services for your branch. 
          To add new services or modify pricing, please contact your Tenancy Admin.
        </p>
      </div>
    </div>
  )
}
