'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Building2, 
  Users, 
  Globe, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tenancyApi, type Tenancy, type CreateTenancyRequest } from '@/services/tenancyApi'

interface CreateTenancyForm {
  tenancyName: string
  businessName: string
  description: string
  tagline: string
  plan: string
  adminName: string
  adminEmail: string
  adminPhone: string
  adminPassword: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export function TenancyManagement() {
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    totalTenancies: 0,
    activeTenancies: 0,
    trialTenancies: 0,
    totalRevenue: 0
  })
  const [createForm, setCreateForm] = useState<CreateTenancyForm>({
    tenancyName: '',
    businessName: '',
    description: '',
    tagline: '',
    plan: 'trial',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  })

  // Fetch tenancies and stats
  const fetchData = async () => {
    try {
      setLoading(true)
      const [tenanciesData, statsData] = await Promise.all([
        tenancyApi.getTenancies({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          plan: planFilter !== 'all' ? planFilter : undefined,
          search: searchTerm || undefined
        }),
        tenancyApi.getTenancyStats()
      ])
      
      setTenancies(tenanciesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter, planFilter, searchTerm])

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTenancies = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockTenancies: Tenancy[] = [
          {
            id: '1',
            name: 'CleanCo Laundry',
            businessName: 'CleanCo Laundry Services',
            subdomain: 'cleanco',
            status: 'active',
            plan: 'professional',
            owner: {
              name: 'Rajesh Kumar',
              email: 'admin@cleancolaundry.com'
            },
            subscription: {
              startDate: '2024-01-15',
              nextBillingDate: '2024-02-15'
            },
            stats: {
              totalOrders: 1250,
              activeUsers: 45,
              monthlyRevenue: 125000
            },
            createdAt: '2024-01-15',
            lastActivity: '2024-01-23'
          },
          {
            id: '2',
            name: 'LaundryMax Pro',
            businessName: 'LaundryMax Professional Services',
            subdomain: 'laundrymaxpro',
            status: 'active',
            plan: 'enterprise',
            owner: {
              name: 'Priya Sharma',
              email: 'admin@laundrymaxpro.com'
            },
            subscription: {
              startDate: '2024-01-10',
              nextBillingDate: '2024-02-10'
            },
            stats: {
              totalOrders: 2100,
              activeUsers: 78,
              monthlyRevenue: 285000
            },
            createdAt: '2024-01-10',
            lastActivity: '2024-01-23'
          },
          {
            id: '3',
            name: 'Fresh & Clean',
            businessName: 'Fresh & Clean Eco Laundry',
            subdomain: 'freshclean',
            status: 'trial',
            plan: 'basic',
            owner: {
              name: 'Amit Patel',
              email: 'admin@freshclean.com'
            },
            subscription: {
              startDate: '2024-01-20',
              trialEndsAt: '2024-02-03'
            },
            stats: {
              totalOrders: 85,
              activeUsers: 12,
              monthlyRevenue: 0
            },
            createdAt: '2024-01-20',
            lastActivity: '2024-01-22'
          }
        ]
        
        setTenancies(mockTenancies)
      } catch (error) {
        console.error('Error fetching tenancies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTenancies()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-blue-100 text-blue-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'trial':
        return <Clock className="w-4 h-4" />
      case 'suspended':
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'bg-gray-100 text-gray-800'
      case 'professional':
        return 'bg-blue-100 text-blue-800'
      case 'enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTenancies = tenancies

  const handleCreateTenancy = async () => {
    try {
      setCreating(true)
      
      // Validate form
      if (!createForm.tenancyName || !createForm.adminName || !createForm.adminEmail || !createForm.adminPassword) {
        alert('Please fill in all required fields')
        return
      }

      const createRequest: CreateTenancyRequest = {
        tenancyName: createForm.tenancyName,
        businessName: createForm.businessName || createForm.tenancyName,
        description: createForm.description,
        tagline: createForm.tagline,
        plan: createForm.plan,
        adminName: createForm.adminName,
        adminEmail: createForm.adminEmail,
        adminPhone: createForm.adminPhone,
        adminPassword: createForm.adminPassword,
        address: createForm.address
      }

      const result = await tenancyApi.createTenancy(createRequest)
      
      console.log('Tenancy created successfully:', result)
      
      // Show success message
      alert(`Tenancy created successfully!\n\nLogin URL: ${result.loginCredentials.loginUrl}\nEmail: ${result.loginCredentials.email}\nPassword: ${result.loginCredentials.password}`)
      
      // Reset form and close modal
      setCreateForm({
        tenancyName: '',
        businessName: '',
        description: '',
        tagline: '',
        plan: 'trial',
        adminName: '',
        adminEmail: '',
        adminPhone: '',
        adminPassword: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      })
      setShowCreateModal(false)
      
      // Refresh tenancies list
      await fetchData()
      
    } catch (error) {
      console.error('Error creating tenancy:', error)
      alert('Failed to create tenancy. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setCreateForm(prev => ({ ...prev, adminPassword: password }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenancy Management</h1>
          <p className="text-gray-600">Manage all tenant organizations and their admin users</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Tenancy</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tenancies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalTenancies}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tenancies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTenancies}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial Tenancies</p>
              <p className="text-3xl font-bold text-gray-900">{stats.trialTenancies}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenancies, business names, or admin emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <Button variant="outline" className="flex items-center space-x-2" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Tenancies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenancies.map((tenancy) => (
          <div key={tenancy.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{tenancy.name}</h3>
                <p className="text-sm text-gray-600">{tenancy.businessName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenancy.status)}`}>
                  {getStatusIcon(tenancy.status)}
                  <span className="ml-1 capitalize">{tenancy.status}</span>
                </span>
              </div>
            </div>

            {/* Plan & Subdomain */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(tenancy.plan)}`}>
                {tenancy.plan.charAt(0).toUpperCase() + tenancy.plan.slice(1)}
              </span>
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-1" />
                {tenancy.subdomain}.laundrylobby.com
              </div>
            </div>

            {/* Admin Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
              <p className="text-sm text-gray-900">{tenancy.owner.name}</p>
              <p className="text-xs text-gray-600">{tenancy.owner.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{tenancy.stats.totalOrders}</p>
                <p className="text-xs text-gray-600">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{tenancy.stats.activeUsers}</p>
                <p className="text-xs text-gray-600">Users</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">₹{(tenancy.stats.monthlyRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </Button>
                <Button size="sm" variant="outline" className="flex items-center space-x-1">
                  <Settings className="w-3 h-3" />
                  <span>Manage</span>
                </Button>
              </div>
              <Button size="sm" variant="outline" className="flex items-center space-x-1">
                <ExternalLink className="w-3 h-3" />
                <span>Visit</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Tenancy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Tenancy</h2>
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>×</Button>
              </div>

              <div className="space-y-6">
                {/* Tenancy Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tenancy Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tenancy Name *</label>
                      <Input
                        value={createForm.tenancyName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, tenancyName: e.target.value }))}
                        placeholder="e.g., CleanCo Laundry"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <Input
                        value={createForm.businessName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, businessName: e.target.value }))}
                        placeholder="e.g., CleanCo Laundry Services"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Input
                        value={createForm.description}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the business"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <Input
                        value={createForm.tagline}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="e.g., Clean clothes, happy customers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                      <select
                        value={createForm.plan}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, plan: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="trial">Trial (14 days)</option>
                        <option value="basic">Basic</option>
                        <option value="professional">Professional</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admin Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin User Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name *</label>
                      <Input
                        value={createForm.adminName}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, adminName: e.target.value }))}
                        placeholder="e.g., Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email *</label>
                      <Input
                        type="email"
                        value={createForm.adminEmail}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input
                        value={createForm.adminPhone}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, adminPhone: e.target.value }))}
                        placeholder="+91-9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="flex space-x-2">
                        <Input
                          type="password"
                          value={createForm.adminPassword}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                          placeholder="Minimum 6 characters"
                        />
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTenancy} className="flex items-center space-x-2" disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Create Tenancy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}