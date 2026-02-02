import apiClient from './api'
import { useAuthStore } from '@/store/authStore'

export interface TenantTicket {
  _id: string
  ticketNumber: string
  tenantId: string
  tenantName: string
  tenantPlan: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  category: string
  subcategory: string
  subject: string
  description: string
  perceivedPriority: 'low' | 'medium' | 'high'
  systemPriority: 'low' | 'medium' | 'high' | 'critical'
  status: 'new' | 'acknowledged' | 'in_progress' | 'waiting_for_tenant' | 'escalated' | 'resolved' | 'closed'
  businessImpact: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  assignedTeam?: 'support' | 'finance' | 'engineering' | 'security'
  slaDeadline: string
  responseDeadline: string
  slaBreached: boolean
  linkedOrderId?: string
  linkedPaymentId?: string
  linkedSettlementPeriod?: string
  refundAmount?: number
  messages: Array<{
    _id: string
    sender: {
      _id: string
      name: string
      email: string
    }
    senderRole: string
    message: string
    attachments: Array<{
      filename: string
      url: string
      size: number
      mimeType: string
    }>
    isInternal: boolean
    createdAt: string
  }>
  attachments: Array<{
    filename: string
    url: string
    size: number
    mimeType: string
    uploadedBy: {
      _id: string
      name: string
    }
    uploadedAt: string
  }>
  resolution?: {
    explanation: string
    actionTaken: string
    evidence: string[]
    nextSteps: string
    resolvedBy: {
      _id: string
      name: string
      email: string
    }
    resolvedAt: string
    tenantAccepted: boolean
    tenantAcceptedAt?: string
  }
  statusHistory: Array<{
    status: string
    changedBy: {
      _id: string
      name: string
    }
    changedAt: string
    reason: string
  }>
  createdAt: string
  updatedAt: string
  lastActivityAt: string
}

export interface CreateTicketData {
  category: string
  subcategory: string
  subject: string
  description: string
  perceivedPriority?: 'low' | 'medium' | 'high'
  linkedOrderId?: string
  linkedPaymentId?: string
  linkedSettlementPeriod?: string
  refundAmount?: number
  attachments?: Array<{
    filename: string
    url: string
    size: number
    mimeType: string
  }>
}

export interface TicketMessage {
  message: string
  attachments?: Array<{
    filename: string
    url: string
    size: number
    mimeType: string
  }>
}

export interface TicketStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  closedTickets: number
  slaBreaches: number
  recentTickets: Array<{
    _id: string
    ticketNumber: string
    subject: string
    status: string
    systemPriority: string
    createdAt: string
  }>
}

export interface TicketFilters {
  status?: string
  priority?: string
  category?: string
  search?: string
  limit?: number
  page?: number
}

class TenantTicketApi {
  // Get ticket statistics
  async getStats(): Promise<TicketStats> {
    const response = await apiClient.get('/tenant/tickets/stats')
    return response.data
  }

  // Get subcategories for a category
  async getSubcategories(category: string): Promise<string[]> {
    const response = await apiClient.get(`/tenant/tickets/categories/${category}/subcategories`)
    return response.data
  }

  // Create new ticket
  async createTicket(data: CreateTicketData): Promise<TenantTicket> {
    const response = await apiClient.post('/tenant/tickets', data)
    return response // apiClient.post already returns data.data, not the full response
  }

  // Get tickets with filters
  async getTickets(filters: TicketFilters = {}): Promise<{
    data: TenantTicket[]
    pagination: {
      total: number
      limit: number
      page: number
      pages: number
    }
  }> {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.page) params.append('page', filters.page.toString())

    // For this endpoint, we need the full response including pagination
    // So we'll make the request manually instead of using apiClient
    const { token } = useAuthStore.getState()
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const authToken = token || localStorageToken
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const url = `${apiUrl}/tenant/tickets?${params.toString()}`
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch tickets')
    }
    
    return {
      data: data.data || [],
      pagination: data.pagination || { total: 0, limit: 20, page: 1, pages: 0 }
    }
  }

  // Get single ticket
  async getTicket(id: string): Promise<TenantTicket> {
    const response = await apiClient.get(`/tenant/tickets/${id}`)
    return response // apiClient already returns data.data, not the full response
  }

  // Add message to ticket
  async addMessage(id: string, data: TicketMessage): Promise<TenantTicket> {
    const response = await apiClient.post(`/tenant/tickets/${id}/messages`, data)
    return response.data
  }

  // Reopen resolved ticket
  async reopenTicket(id: string, reason?: string): Promise<TenantTicket> {
    const response = await apiClient.post(`/tenant/tickets/${id}/reopen`, { reason })
    return response.data
  }

  // Accept ticket resolution
  async acceptResolution(id: string): Promise<TenantTicket> {
    const response = await apiClient.post(`/tenant/tickets/${id}/accept-resolution`)
    return response.data
  }
}

export const tenantTicketApi = new TenantTicketApi()