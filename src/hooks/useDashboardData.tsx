// Dashboard Data Hooks.
//
// The 9 named role hooks (useSuperAdminDashboard, useTenantOwnerDashboard, …)
// are migrated to React Query: cache, dedup, retry, background refetch all
// handled by the framework. The legacy `useApiData` generic + `useAnalytics`
// remain for now — they need a deeper refactor (each call site should use
// `useQuery` directly with a stable queryKey, see migration playbook).
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
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

// Shared options for the 9 role-dashboard queries.
// 60s staleTime keeps the dashboard snappy without going stale; retry skips
// 4xx (auth/permission/not-found) and bounds 5xx retries at 2.
const dashboardQueryDefaults = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  retry: (count: number, err: any) => {
    const status = err?.response?.status
    if (status >= 400 && status < 500) return false
    return count < 2
  },
} as const

// SuperAdmin Dashboard Hook
export function useSuperAdminDashboard(timeframe = '30d') {
  const query = useQuery({
    queryKey: ['dashboard', 'super-admin', timeframe],
    queryFn: async (): Promise<{
      metrics: PlatformMetrics | null
      recentActivities: RecentActivity[]
      systemAlerts: SystemAlert[]
    }> => {
      const [overviewData, activitiesData, alertsData]: any = await Promise.all([
        dashboardApi.superAdmin.getOverview(timeframe),
        dashboardApi.superAdmin.getRecentActivities(10),
        dashboardApi.superAdmin.getSystemAlerts(),
      ])
      return {
        metrics: overviewData?.overview ?? overviewData ?? null,
        recentActivities: activitiesData?.recentActivities ?? activitiesData ?? [],
        systemAlerts: alertsData?.alerts ?? alertsData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    recentActivities: query.data?.recentActivities ?? [],
    systemAlerts: query.data?.systemAlerts ?? [],
    loading: query.isPending,
    error: (query.error as Error) ?? null,
    refetch: async () => { await query.refetch() },
  }
}

// Platform Support Dashboard Hook
export function usePlatformSupportDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'platform-support'],
    queryFn: async (): Promise<{
      metrics: SupportMetrics | null
      tickets: SupportTicket[]
      tenantStatuses: TenantStatus[]
    }> => {
      const [metricsData, ticketsData, statusesData]: any = await Promise.all([
        dashboardApi.platformSupport.getSupportMetrics(),
        dashboardApi.platformSupport.getTickets(undefined, 10),
        dashboardApi.platformSupport.getTenantStatuses(),
      ])
      return {
        metrics: metricsData ?? null,
        tickets: ticketsData?.tickets ?? ticketsData ?? [],
        tenantStatuses: statusesData?.tenants ?? statusesData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    tickets: query.data?.tickets ?? [],
    tenantStatuses: query.data?.tenantStatuses ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Platform Finance Dashboard Hook
export function usePlatformFinanceDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'platform-finance'],
    queryFn: async (): Promise<{
      metrics: FinanceMetrics | null
      revenueData: any[]
      payoutRequests: PayoutRequest[]
    }> => {
      const [metricsData, revenueResponse, payoutsData]: any = await Promise.all([
        dashboardApi.platformFinance.getFinanceMetrics(),
        dashboardApi.platformFinance.getRevenueData('6m'),
        dashboardApi.platformFinance.getPayoutRequests(),
      ])
      return {
        metrics: metricsData ?? null,
        revenueData: revenueResponse?.monthly ?? revenueResponse ?? [],
        payoutRequests: payoutsData?.payouts ?? payoutsData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    revenueData: query.data?.revenueData ?? [],
    payoutRequests: query.data?.payoutRequests ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Platform Auditor Dashboard Hook
export function usePlatformAuditorDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'platform-auditor'],
    queryFn: async (): Promise<{
      metrics: AuditMetrics | null
      auditLogs: AuditLog[]
      complianceItems: ComplianceItem[]
    }> => {
      const [metricsData, logsData, complianceData]: any = await Promise.all([
        dashboardApi.platformAuditor.getAuditMetrics(),
        dashboardApi.platformAuditor.getAuditLogs(10),
        dashboardApi.platformAuditor.getComplianceStatus(),
      ])
      return {
        metrics: metricsData ?? null,
        auditLogs: logsData?.logs ?? logsData ?? [],
        complianceItems: complianceData?.items ?? complianceData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    auditLogs: query.data?.auditLogs ?? [],
    complianceItems: query.data?.complianceItems ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Tenant Owner Dashboard Hook
export function useTenantOwnerDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'tenant-owner'],
    queryFn: async (): Promise<{
      metrics: BusinessMetrics | null
      recentOrders: Order[]
    }> => {
      const [metricsData, ordersData]: any = await Promise.all([
        dashboardApi.tenantOwner.getBusinessMetrics(),
        dashboardApi.tenantOwner.getRecentOrders(10),
      ])
      return {
        metrics: metricsData ?? null,
        recentOrders: ordersData?.orders ?? ordersData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    recentOrders: query.data?.recentOrders ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Tenant Admin Dashboard Hook
export function useTenantAdminDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'tenant-admin'],
    queryFn: async (): Promise<{
      metrics: BusinessMetrics | null
      recentOrders: Order[]
      staffMembers: StaffMember[]
    }> => {
      const [metricsData, ordersData, staffData]: any = await Promise.all([
        dashboardApi.tenantAdmin.getOperationsMetrics(),
        dashboardApi.tenantAdmin.getRecentOrders(10),
        dashboardApi.tenantAdmin.getStaffMembers(),
      ])
      return {
        metrics: metricsData ?? null,
        recentOrders: ordersData?.orders ?? ordersData ?? [],
        staffMembers: staffData?.staff ?? staffData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    recentOrders: query.data?.recentOrders ?? [],
    staffMembers: query.data?.staffMembers ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Operations Manager Dashboard Hook
export function useOpsManagerDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'ops-manager'],
    queryFn: async (): Promise<{
      metrics: OpsMetrics | null
      assignedOrders: AssignedTask[]
      staffActivity: StaffMember[]
    }> => {
      const [metricsData, ordersData, staffData]: any = await Promise.all([
        dashboardApi.opsManager.getOpsMetrics(),
        dashboardApi.opsManager.getAssignedOrders(),
        dashboardApi.opsManager.getStaffActivity(),
      ])
      return {
        metrics: metricsData ?? null,
        assignedOrders: ordersData?.orders ?? ordersData ?? [],
        staffActivity: staffData?.staff ?? staffData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    assignedOrders: query.data?.assignedOrders ?? [],
    staffActivity: query.data?.staffActivity ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Finance Manager Dashboard Hook
export function useFinanceManagerDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'finance-manager'],
    queryFn: async (): Promise<{
      metrics: TenantFinanceMetrics | null
      recentTransactions: Transaction[]
      refundRequests: RefundRequest[]
    }> => {
      const [metricsData, transactionsData, refundsData]: any = await Promise.all([
        dashboardApi.financeManager.getFinanceMetrics(),
        dashboardApi.financeManager.getTransactions(10),
        dashboardApi.financeManager.getRefundRequests(),
      ])
      return {
        metrics: metricsData ?? null,
        recentTransactions: transactionsData?.transactions ?? transactionsData ?? [],
        refundRequests: refundsData?.refunds ?? refundsData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    recentTransactions: query.data?.recentTransactions ?? [],
    refundRequests: query.data?.refundRequests ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
}

// Staff Dashboard Hook
export function useStaffDashboard() {
  const query = useQuery({
    queryKey: ['dashboard', 'staff'],
    queryFn: async (): Promise<{
      metrics: StaffMetrics | null
      assignedTasks: AssignedTask[]
      notifications: Notification[]
    }> => {
      const [metricsData, tasksData, notificationsData]: any = await Promise.all([
        dashboardApi.staff.getStaffMetrics(),
        dashboardApi.staff.getAssignedTasks(),
        dashboardApi.staff.getNotifications(),
      ])
      return {
        metrics: metricsData ?? null,
        assignedTasks: tasksData?.tasks ?? tasksData ?? [],
        notifications: notificationsData?.notifications ?? notificationsData ?? [],
      }
    },
    ...dashboardQueryDefaults,
  })

  return {
    metrics: query.data?.metrics ?? null,
    assignedTasks: query.data?.assignedTasks ?? [],
    notifications: query.data?.notifications ?? [],
    loading: query.isPending,
    refetch: async () => { await query.refetch() },
  }
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