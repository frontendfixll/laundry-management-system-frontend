/**
 * Tenancy Management API Service
 * Handles all tenancy-related API calls with fallback to mock data
 */

import apiClient from './api'

export interface Tenancy {
  id: string
  name: string
  businessName: string
  subdomain: string
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  plan: 'basic' | 'professional' | 'enterprise'
  owner: {
    name: string
    email: string
  }
  subscription: {
    startDate: string
    trialEndsAt?: string
    nextBillingDate?: string
  }
  stats: {
    totalOrders: number
    activeUsers: number
    monthlyRevenue: number
  }
  createdAt: string
  lastActivity: string
}

export interface CreateTenancyRequest {
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

export interface TenancyCreationResult {
  tenancy: {
    id: string
    name: string
    slug: string
    subdomain: string
    status: string
    businessName: string
  }
  admin: {
    id: string
    name: string
    email: string
    role: string
  }
  loginCredentials: {
    email: string
    password: string
    loginUrl: string
  }
}

// Mock data for development/testing
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
  },
  {
    id: '4',
    name: 'Sparkle Wash',
    businessName: 'Sparkle Wash Premium',
    subdomain: 'sparklewash',
    status: 'active',
    plan: 'professional',
    owner: {
      name: 'Sunita Reddy',
      email: 'admin@sparklewash.com'
    },
    subscription: {
      startDate: '2024-01-12',
      nextBillingDate: '2024-02-12'
    },
    stats: {
      totalOrders: 890,
      activeUsers: 32,
      monthlyRevenue: 98000
    },
    createdAt: '2024-01-12',
    lastActivity: '2024-01-23'
  },
  {
    id: '5',
    name: 'QuickWash Express',
    businessName: 'QuickWash Express Services',
    subdomain: 'quickwashexpress',
    status: 'trial',
    plan: 'basic',
    owner: {
      name: 'Vikram Singh',
      email: 'admin@quickwashexpress.com'
    },
    subscription: {
      startDate: '2024-01-18',
      trialEndsAt: '2024-02-01'
    },
    stats: {
      totalOrders: 45,
      activeUsers: 8,
      monthlyRevenue: 0
    },
    createdAt: '2024-01-18',
    lastActivity: '2024-01-21'
  }
]

class TenancyApiService {
  private useMockData = true // Set to false when backend is ready

  /**
   * Get all tenancies with optional filtering
   */
  async getTenancies(filters?: {
    status?: string
    plan?: string
    search?: string
  }): Promise<Tenancy[]> {
    if (this.useMockData) {
      let filtered = [...mockTenancies]
      
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(t => t.status === filters.status)
      }
      
      if (filters?.plan && filters.plan !== 'all') {
        filtered = filtered.filter(t => t.plan === filters.plan)
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.businessName.toLowerCase().includes(search) ||
          t.owner.email.toLowerCase().includes(search)
        )
      }
      
      return filtered
    }

    try {
      const response = await apiClient.get('/tenancies', { params: filters })
      return response.data
    } catch (error) {
      console.error('Error fetching tenancies:', error)
      // Fallback to mock data on error
      return mockTenancies
    }
  }

  /**
   * Get tenancy by ID
   */
  async getTenancy(id: string): Promise<Tenancy | null> {
    if (this.useMockData) {
      return mockTenancies.find(t => t.id === id) || null
    }

    try {
      const response = await apiClient.get(`/tenancies/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching tenancy:', error)
      return null
    }
  }

  /**
   * Create new tenancy with admin user
   */
  async createTenancy(data: CreateTenancyRequest): Promise<TenancyCreationResult> {
    if (this.useMockData) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock result
      const subdomain = data.tenancyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const result: TenancyCreationResult = {
        tenancy: {
          id: `mock-${Date.now()}`,
          name: data.tenancyName,
          slug: subdomain,
          subdomain: subdomain,
          status: 'trial',
          businessName: data.businessName || data.tenancyName
        },
        admin: {
          id: `admin-${Date.now()}`,
          name: data.adminName,
          email: data.adminEmail,
          role: 'admin'
        },
        loginCredentials: {
          email: data.adminEmail,
          password: data.adminPassword,
          loginUrl: `https://${subdomain}.laundrylobby.com/auth/login`
        }
      }
      
      // Add to mock data
      const newTenancy: Tenancy = {
        id: result.tenancy.id,
        name: result.tenancy.name,
        businessName: result.tenancy.businessName,
        subdomain: result.tenancy.subdomain,
        status: 'trial',
        plan: data.plan as any,
        owner: {
          name: result.admin.name,
          email: result.admin.email
        },
        subscription: {
          startDate: new Date().toISOString().split('T')[0],
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        stats: {
          totalOrders: 0,
          activeUsers: 1,
          monthlyRevenue: 0
        },
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0]
      }
      
      mockTenancies.push(newTenancy)
      
      return result
    }

    try {
      const response = await apiClient.post('/tenancies', data)
      return response.data
    } catch (error) {
      console.error('Error creating tenancy:', error)
      throw error
    }
  }

  /**
   * Update tenancy
   */
  async updateTenancy(id: string, data: Partial<Tenancy>): Promise<Tenancy> {
    if (this.useMockData) {
      const index = mockTenancies.findIndex(t => t.id === id)
      if (index === -1) {
        throw new Error('Tenancy not found')
      }
      
      mockTenancies[index] = { ...mockTenancies[index], ...data }
      return mockTenancies[index]
    }

    try {
      const response = await apiClient.put(`/tenancies/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating tenancy:', error)
      throw error
    }
  }

  /**
   * Delete tenancy
   */
  async deleteTenancy(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockTenancies.findIndex(t => t.id === id)
      if (index === -1) {
        throw new Error('Tenancy not found')
      }
      
      mockTenancies.splice(index, 1)
      return
    }

    try {
      await apiClient.delete(`/tenancies/${id}`)
    } catch (error) {
      console.error('Error deleting tenancy:', error)
      throw error
    }
  }

  /**
   * Suspend tenancy
   */
  async suspendTenancy(id: string, reason: string): Promise<Tenancy> {
    return this.updateTenancy(id, { status: 'suspended' })
  }

  /**
   * Activate tenancy
   */
  async activateTenancy(id: string): Promise<Tenancy> {
    return this.updateTenancy(id, { status: 'active' })
  }

  /**
   * Get tenancy statistics
   */
  async getTenancyStats(): Promise<{
    totalTenancies: number
    activeTenancies: number
    trialTenancies: number
    totalRevenue: number
  }> {
    const tenancies = await this.getTenancies()
    
    return {
      totalTenancies: tenancies.length,
      activeTenancies: tenancies.filter(t => t.status === 'active').length,
      trialTenancies: tenancies.filter(t => t.status === 'trial').length,
      totalRevenue: tenancies.reduce((sum, t) => sum + t.stats.monthlyRevenue, 0)
    }
  }

  /**
   * Check if tenancy name is available
   */
  async checkTenancyAvailability(name: string): Promise<{
    available: boolean
    suggestedName?: string
  }> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const tenancies = await this.getTenancies()
    const existing = tenancies.find(t => t.subdomain === slug)
    
    return {
      available: !existing,
      suggestedName: existing ? `${slug}-${Date.now()}` : undefined
    }
  }

  /**
   * Switch between mock and real API
   */
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock
  }
}

export const tenancyApi = new TenancyApiService()