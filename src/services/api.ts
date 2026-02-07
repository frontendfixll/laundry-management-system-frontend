// API Service Layer for Dashboard Data
import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// API Client with authentication
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Try to get token from multiple sources
    const { token } = useAuthStore.getState()
    const localStorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const authToken = token || localStorageToken

    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'API request failed')
      }

      return data.data
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error)
      throw error
    }
  }

  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

// Dashboard API Services
export const dashboardApi = {
  // SuperAdmin Dashboard APIs
  superAdmin: {
    async getOverview(timeframe = '30d') {
      return apiClient.get(`/superadmin/dashboard/overview?timeframe=${timeframe}`)
    },
    async getTenancyStats() {
      return apiClient.get('/superadmin/tenancies/stats')
    },
    async getRecentActivities(limit = 10) {
      return apiClient.get(`/superadmin/audit/recent?limit=${limit}`)
    },
    async getSystemAlerts() {
      return apiClient.get('/superadmin/dashboard/alerts')
    },
    async getPlatformRevenue(timeframe = '30d') {
      return apiClient.get(`/superadmin/analytics/revenue?timeframe=${timeframe}`)
    }
  },

  // Platform Support Dashboard APIs
  platformSupport: {
    async getSupportMetrics() {
      return apiClient.get('/support/dashboard/metrics')
    },
    async getTickets(status?: string, limit = 10) {
      const query = status ? `?status=${status}&limit=${limit}` : `?limit=${limit}`
      return apiClient.get(`/support/tickets${query}`)
    },
    async getTenantStatuses() {
      return apiClient.get('/support/tenants/status')
    },
    async getPerformanceMetrics() {
      return apiClient.get('/support/analytics/performance')
    }
  },

  // Platform Finance Dashboard APIs
  platformFinance: {
    async getFinanceMetrics() {
      return apiClient.get('/superadmin/financial/metrics')
    },
    async getRevenueData(timeframe = '6m') {
      return apiClient.get(`/superadmin/analytics/revenue?timeframe=${timeframe}`)
    },
    async getPayoutRequests(status?: string) {
      const query = status ? `?status=${status}` : ''
      return apiClient.get(`/superadmin/financial/payouts${query}`)
    },
    async getTransactions(limit = 10) {
      return apiClient.get(`/superadmin/financial/transactions?limit=${limit}`)
    }
  },

  // Platform Auditor Dashboard APIs
  platformAuditor: {
    async getAuditMetrics() {
      return apiClient.get('/superadmin/audit/stats')
    },
    async getAuditLogs(limit = 10) {
      return apiClient.get(`/superadmin/audit/logs?limit=${limit}`)
    },
    async getComplianceStatus() {
      return apiClient.get('/superadmin/audit/compliance')
    },
    async getSecurityMetrics() {
      return apiClient.get('/superadmin/audit/security')
    }
  },

  // Tenant Owner Dashboard APIs
  tenantOwner: {
    async getBusinessMetrics() {
      return apiClient.get('/admin/dashboard')
    },
    async getRecentOrders(limit = 10) {
      return apiClient.get(`/admin/orders?limit=${limit}&sort=-createdAt`)
    },
    async getRevenueData() {
      return apiClient.get('/admin/analytics/revenue')
    },
    async getCustomerStats() {
      return apiClient.get('/admin/customers/stats')
    },
    async getStaffPerformance() {
      return apiClient.get('/admin/staff/performance')
    }
  },

  // Tenant Admin Dashboard APIs
  tenantAdmin: {
    async getOperationsMetrics() {
      return apiClient.get('/admin/dashboard')
    },
    async getRecentOrders(limit = 10) {
      return apiClient.get(`/admin/orders?limit=${limit}&sort=-createdAt`)
    },
    async getStaffMembers() {
      return apiClient.get('/admin/staff')
    },
    async getOrderStatusDistribution() {
      return apiClient.get('/admin/analytics/order-status')
    }
  },

  // Operations Manager Dashboard APIs
  opsManager: {
    async getOpsMetrics() {
      return apiClient.get('/admin/dashboard')
    },
    async getAssignedOrders() {
      return apiClient.get('/admin/orders?assigned=true')
    },
    async getStaffActivity() {
      return apiClient.get('/admin/staff/activity')
    },
    async getHourlyOrders() {
      return apiClient.get('/admin/analytics/hourly-orders')
    }
  },

  // Finance Manager Dashboard APIs
  financeManager: {
    async getFinanceMetrics() {
      return apiClient.get('/admin/payments/stats')
    },
    async getTransactions(limit = 10) {
      return apiClient.get(`/admin/payments?limit=${limit}`)
    },
    async getRefundRequests() {
      return apiClient.get('/admin/refunds')
    },
    async getEarningsData() {
      return apiClient.get('/admin/analytics/revenue')
    }
  },

  // Staff Dashboard APIs
  staff: {
    async getStaffMetrics() {
      return apiClient.get('/staff/dashboard/metrics')
    },
    async getAssignedTasks() {
      return apiClient.get('/staff/tasks/assigned')
    },
    async getNotifications() {
      return apiClient.get('/admin/notifications')
    },
    async getPerformanceData() {
      return apiClient.get('/staff/performance')
    }
  }
}

// Order Management APIs
export const orderApi = {
  async getOrders(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get(`/admin/orders${query}`)
  },

  async updateOrderStatus(orderId: string, status: string) {
    return apiClient.put(`/admin/orders/${orderId}/status`, { status })
  },

  async assignOrder(orderId: string, assigneeId: string, type: 'branch' | 'staff') {
    const endpoint = type === 'branch' ? 'assign-branch' : 'assign-staff'
    return apiClient.put(`/admin/orders/${orderId}/${endpoint}`, {
      [type === 'branch' ? 'branchId' : 'staffId']: assigneeId
    })
  }
}

// Staff Management APIs
export const staffApi = {
  async getStaff() {
    return apiClient.get('/admin/staff')
  },

  async getStaffById(staffId: string) {
    return apiClient.get(`/admin/staff/${staffId}`)
  },

  async createStaff(staffData: any) {
    return apiClient.post('/admin/staff', staffData)
  },

  async updateStaff(staffId: string, staffData: any) {
    return apiClient.put(`/admin/staff/${staffId}`, staffData)
  },

  async toggleStaffStatus(staffId: string) {
    return apiClient.put(`/admin/staff/${staffId}/toggle-status`)
  }
}

// Customer Management APIs
export const customerApi = {
  async getCustomers(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get(`/admin/customers${query}`)
  },

  async getCustomerDetails(customerId: string) {
    return apiClient.get(`/admin/customers/${customerId}/details`)
  },

  async toggleCustomerStatus(customerId: string) {
    return apiClient.put(`/admin/customers/${customerId}/toggle-status`)
  }
}

// Analytics APIs
export const analyticsApi = {
  async getWeeklyOrders() {
    return apiClient.get('/admin/analytics/weekly-orders')
  },

  async getOrderStatusDistribution() {
    return apiClient.get('/admin/analytics/order-status')
  },

  async getRevenueData() {
    return apiClient.get('/admin/analytics/revenue')
  },

  async getServiceDistribution() {
    return apiClient.get('/admin/analytics/service-distribution')
  },

  async getHourlyOrders() {
    return apiClient.get('/admin/analytics/hourly-orders')
  }
}

// Notification APIs
export const notificationApi = {
  async getNotifications() {
    return apiClient.get('/notifications')
  },

  async getUnreadCount() {
    return apiClient.get('/notifications/unread-count')
  },

  async markAsRead(notificationIds: string[]) {
    return apiClient.put('/notifications/mark-read', { notificationIds })
  },

  async markAllAsRead() {
    return apiClient.put('/notifications/read-all')
  },

  async clearAllNotifications() {
    return apiClient.delete('/notifications/all')
  }
}

// Support APIs
export const supportApi = {
  async getTickets(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get(`/admin/support/tickets${query}`)
  },

  async getTicketById(ticketId: string) {
    return apiClient.get(`/admin/support/tickets/${ticketId}`)
  },

  async updateTicketStatus(ticketId: string, status: string) {
    return apiClient.put(`/admin/support/tickets/${ticketId}/status`, { status })
  },

  async assignTicket(ticketId: string, assigneeId: string) {
    return apiClient.put(`/admin/support/tickets/${ticketId}/assign`, { assigneeId })
  }
}

// Refund APIs
export const refundApi = {
  async getRefunds(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return apiClient.get(`/admin/refunds${query}`)
  },

  async approveRefund(refundId: string) {
    return apiClient.put(`/admin/refunds/${refundId}/approve`)
  },

  async rejectRefund(refundId: string, reason: string) {
    return apiClient.put(`/admin/refunds/${refundId}/reject`, { reason })
  },

  async processRefund(refundId: string) {
    return apiClient.put(`/admin/refunds/${refundId}/process`)
  }
}

export default apiClient