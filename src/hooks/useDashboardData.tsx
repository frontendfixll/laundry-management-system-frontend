// Dashboard Data Hooks
import { useState, useEffect, useCallback } from 'react'
import { dashboardApi, orderApi, staffApi, analyticsApi, notificationApi, supportApi, refundApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type {
  PlatformMetrics,
  SupportMetrics,
  FinanceMetrics,
  AuditMetrics,
  BusinessMetrics,
  OpsMetrics,
  TenantFinanceMetrics,
  StaffMetrics,
  Order,
  StaffMember,
  SupportTicket,
  Transaction,
  AuditLog,
  RefundRequest,
  AssignedTask,
  Notification,
  RecentActivity,
  SystemAlert,
  TenantStatus,
  PayoutRequest,
  ComplianceItem
} from '@/types/dashboard'

// Generic hook for API data fetching
function useApiData<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: { 
    enabled?: boolean
    refetchInterval?: number
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!options.enabled && options.enabled !== undefined) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
      console.error('API call failed:', error)
    } finally {
      setLoading(false)
    }
  }, [apiCall, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  // Auto-refresh functionality
  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options.refetchInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

// SuperAdmin Dashboard Hook
export function useSuperAdminDashboard(timeframe = '30d') {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewData, activitiesData, alertsData] = await Promise.all([
        dashboardApi.superAdmin.getOverview(timeframe),
        dashboardApi.superAdmin.getRecentActivities(10),
        dashboardApi.superAdmin.getSystemAlerts()
      ])

      setMetrics(overviewData.overview || overviewData)
      setRecentActivities(activitiesData.recentActivities || activitiesData || [])
      setSystemAlerts(alertsData.alerts || alertsData || [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch dashboard data')
      setError(error)
      console.error('SuperAdmin dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    metrics,
    recentActivities,
    systemAlerts,
    loading,
    error,
    refetch: fetchData
  }
}

// Platform Support Dashboard Hook
export function usePlatformSupportDashboard() {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [tenantStatuses, setTenantStatuses] = useState<TenantStatus[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, ticketsData, statusesData] = await Promise.all([
        dashboardApi.platformSupport.getSupportMetrics(),
        dashboardApi.platformSupport.getTickets(undefined, 10),
        dashboardApi.platformSupport.getTenantStatuses()
      ])

      setMetrics(metricsData)
      setTickets(ticketsData.tickets || ticketsData || [])
      setTenantStatuses(statusesData.tenants || statusesData || [])
    } catch (error) {
      console.error('Platform support dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, tickets, tenantStatuses, loading, refetch: fetchData }
}

// Platform Finance Dashboard Hook
export function usePlatformFinanceDashboard() {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, revenueResponse, payoutsData] = await Promise.all([
        dashboardApi.platformFinance.getFinanceMetrics(),
        dashboardApi.platformFinance.getRevenueData('6m'),
        dashboardApi.platformFinance.getPayoutRequests()
      ])

      setMetrics(metricsData)
      setRevenueData(revenueResponse.monthly || revenueResponse || [])
      setPayoutRequests(payoutsData.payouts || payoutsData || [])
    } catch (error) {
      console.error('Platform finance dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, revenueData, payoutRequests, loading, refetch: fetchData }
}

// Platform Auditor Dashboard Hook
export function usePlatformAuditorDashboard() {
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, logsData, complianceData] = await Promise.all([
        dashboardApi.platformAuditor.getAuditMetrics(),
        dashboardApi.platformAuditor.getAuditLogs(10),
        dashboardApi.platformAuditor.getComplianceStatus()
      ])

      setMetrics(metricsData)
      setAuditLogs(logsData.logs || logsData || [])
      setComplianceItems(complianceData.items || complianceData || [])
    } catch (error) {
      console.error('Platform auditor dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, auditLogs, complianceItems, loading, refetch: fetchData }
}

// Tenant Owner Dashboard Hook
export function useTenantOwnerDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, ordersData] = await Promise.all([
        dashboardApi.tenantOwner.getBusinessMetrics(),
        dashboardApi.tenantOwner.getRecentOrders(10)
      ])

      setMetrics(metricsData)
      setRecentOrders(ordersData.orders || ordersData || [])
    } catch (error) {
      console.error('Tenant owner dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, recentOrders, loading, refetch: fetchData }
}

// Tenant Admin Dashboard Hook
export function useTenantAdminDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, ordersData, staffData] = await Promise.all([
        dashboardApi.tenantAdmin.getOperationsMetrics(),
        dashboardApi.tenantAdmin.getRecentOrders(10),
        dashboardApi.tenantAdmin.getStaffMembers()
      ])

      setMetrics(metricsData)
      setRecentOrders(ordersData.orders || ordersData || [])
      setStaffMembers(staffData.staff || staffData || [])
    } catch (error) {
      console.error('Tenant admin dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, recentOrders, staffMembers, loading, refetch: fetchData }
}

// Operations Manager Dashboard Hook
export function useOpsManagerDashboard() {
  const [metrics, setMetrics] = useState<OpsMetrics | null>(null)
  const [assignedOrders, setAssignedOrders] = useState<AssignedTask[]>([])
  const [staffActivity, setStaffActivity] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, ordersData, staffData] = await Promise.all([
        dashboardApi.opsManager.getOpsMetrics(),
        dashboardApi.opsManager.getAssignedOrders(),
        dashboardApi.opsManager.getStaffActivity()
      ])

      setMetrics(metricsData)
      setAssignedOrders(ordersData.orders || ordersData || [])
      setStaffActivity(staffData.staff || staffData || [])
    } catch (error) {
      console.error('Operations manager dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, assignedOrders, staffActivity, loading, refetch: fetchData }
}

// Finance Manager Dashboard Hook
export function useFinanceManagerDashboard() {
  const [metrics, setMetrics] = useState<TenantFinanceMetrics | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, transactionsData, refundsData] = await Promise.all([
        dashboardApi.financeManager.getFinanceMetrics(),
        dashboardApi.financeManager.getTransactions(10),
        dashboardApi.financeManager.getRefundRequests()
      ])

      setMetrics(metricsData)
      setRecentTransactions(transactionsData.transactions || transactionsData || [])
      setRefundRequests(refundsData.refunds || refundsData || [])
    } catch (error) {
      console.error('Finance manager dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, recentTransactions, refundRequests, loading, refetch: fetchData }
}

// Staff Dashboard Hook
export function useStaffDashboard() {
  const [metrics, setMetrics] = useState<StaffMetrics | null>(null)
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [metricsData, tasksData, notificationsData] = await Promise.all([
        dashboardApi.staff.getStaffMetrics(),
        dashboardApi.staff.getAssignedTasks(),
        dashboardApi.staff.getNotifications()
      ])

      setMetrics(metricsData)
      setAssignedTasks(tasksData.tasks || tasksData || [])
      setNotifications(notificationsData.notifications || notificationsData || [])
    } catch (error) {
      console.error('Staff dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { metrics, assignedTasks, notifications, loading, refetch: fetchData }
}

// Analytics Hooks
export function useAnalytics() {
  return {
    weeklyOrders: useApiData(() => analyticsApi.getWeeklyOrders()),
    orderStatus: useApiData(() => analyticsApi.getOrderStatusDistribution()),
    revenue: useApiData(() => analyticsApi.getRevenueData()),
    services: useApiData(() => analyticsApi.getServiceDistribution()),
    hourlyOrders: useApiData(() => analyticsApi.getHourlyOrders())
  }
}

// Real-time data hooks with auto-refresh
export function useRealTimeMetrics(interval = 30000) {
  const { user } = useAuthStore()
  
  const getRoleBasedMetrics = useCallback(async () => {
    switch (user?.role) {
      case 'super_admin':
        return dashboardApi.superAdmin.getOverview()
      case 'platform_support':
        return dashboardApi.platformSupport.getSupportMetrics()
      case 'platform_finance':
        return dashboardApi.platformFinance.getFinanceMetrics()
      case 'platform_auditor':
        return dashboardApi.platformAuditor.getAuditMetrics()
      case 'tenant_owner':
        return dashboardApi.tenantOwner.getBusinessMetrics()
      case 'tenant_admin':
        return dashboardApi.tenantAdmin.getOperationsMetrics()
      case 'tenant_ops_manager':
        return dashboardApi.opsManager.getOpsMetrics()
      case 'tenant_finance_manager':
        return dashboardApi.financeManager.getFinanceMetrics()
      case 'tenant_staff':
        return dashboardApi.staff.getStaffMetrics()
      default:
        return dashboardApi.tenantOwner.getBusinessMetrics() // fallback
    }
  }, [user?.role])

  return useApiData(
    getRoleBasedMetrics,
    [user?.role],
    { 
      enabled: !!user?.role,
      refetchInterval: interval,
      onError: (error) => console.error('Real-time metrics error:', error)
    }
  )
}