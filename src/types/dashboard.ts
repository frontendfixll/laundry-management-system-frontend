// Dashboard Data Types

// Common Types
export interface BaseMetrics {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  activeStaff?: number
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface StatusDistribution {
  name: string
  value: number
  color: string
  percentage?: number
}

// SuperAdmin Dashboard Types
export interface PlatformMetrics {
  totalTenants: number
  activeTenants: number
  totalRevenue: number
  monthlyRevenue: number
  totalOrders: number
  activeSubscriptions: number
  systemAlerts: number
  platformUptime: number
}

export interface TenancyStats {
  total: number
  active: number
  new: number
  platformRevenue: number
  byPlan: Record<string, number>
}

export interface SystemAlert {
  id: string
  type: 'security' | 'business' | 'system'
  level: 'low' | 'medium' | 'high' | 'critical'
  message: string
  action: string
  actionUrl?: string
  timestamp: string
}

export interface RecentActivity {
  id: string
  type: 'tenant_created' | 'subscription_updated' | 'payment_processed' | 'alert_triggered'
  description: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
  userEmail?: string
  category?: string
}

// Platform Support Dashboard Types
export interface SupportMetrics {
  totalTickets: number
  openTickets: number
  resolvedToday: number
  avgResponseTime: number
  activeTenants: number
  totalUsers: number
  criticalIssues: number
  satisfactionScore: number
}

export interface SupportTicket {
  id: string
  tenantName: string
  subject: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  createdAt: string
  lastUpdate: string
  description?: string
}

export interface TenantStatus {
  id: string
  name: string
  status: 'active' | 'suspended' | 'maintenance'
  plan: string
  lastActivity: string
  issues: number
  contactEmail?: string
}

// Platform Finance Dashboard Types
export interface FinanceMetrics {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayouts: number
  processedRefunds: number
  activeSubscriptions: number
  churnRate: number
  averageRevenuePer: number
  outstandingInvoices: number
}

export interface RevenueData {
  month: string
  revenue: number
  growth: number
}

export interface PayoutRequest {
  id: string
  tenantName: string
  amount: number
  requestDate: string
  status: 'pending' | 'approved' | 'processed' | 'rejected'
  dueDate: string
  description?: string
}

export interface Transaction {
  id: string
  type: 'payment' | 'refund' | 'payout'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  customerName?: string
  tenantName?: string
  description: string
  timestamp: string
}

// Platform Auditor Dashboard Types
export interface AuditMetrics {
  totalAuditLogs: number
  todayActivities: number
  securityAlerts: number
  complianceScore: number
  failedLogins: number
  dataAccesses: number
  systemChanges: number
  userActivities: number
}

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ipAddress: string
  userAgent: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
}

export interface ComplianceItem {
  id: string
  category: string
  requirement: string
  status: 'compliant' | 'non_compliant' | 'pending_review'
  lastChecked: string
  nextReview: string
  description?: string
}

// Tenant Dashboard Types
export interface BusinessMetrics extends BaseMetrics {
  todayOrders: number
  pendingOrders: number
  completedOrders: number
  averageOrderValue: number
  customerSatisfaction: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  items: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled'
  assignedTo?: string
  timestamp: string
  priority?: 'normal' | 'high' | 'urgent'
  dueTime?: string
  estimatedCompletion?: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  status: 'active' | 'busy' | 'offline' | 'available'
  assignedOrders: number
  completedToday: number
  efficiency: number
  lastActivity: string
  currentTask?: string
}

// Operations Manager Dashboard Types
export interface OpsMetrics {
  assignedOrders: number
  completedToday: number
  pendingOrders: number
  delayedOrders: number
  activeStaff: number
  avgProcessingTime: number
  onTimeDelivery: number
  customerSatisfaction: number
}

export interface AssignedTask {
  id: string
  orderNumber: string
  customerName: string
  taskType: string
  priority: 'normal' | 'high' | 'urgent'
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold' | 'delayed'
  assignedTo: string
  dueTime: string
  estimatedDuration: string
  notes?: string
}

// Finance Manager Dashboard Types
export interface TenantFinanceMetrics {
  totalEarnings: number
  monthlyEarnings: number
  pendingPayouts: number
  completedTransactions: number
  refundRequests: number
  outstandingInvoices: number
  averageOrderValue: number
  paymentSuccessRate: number
}

export interface RefundRequest {
  id: string
  orderNumber: string
  customerName: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  requestDate: string
  description?: string
}

// Staff Dashboard Types
export interface StaffMetrics {
  assignedOrders: number
  completedToday: number
  pendingTasks: number
  completionRate: number
  averageTime: number
  customerRating: number
  totalCompleted: number
  weeklyTarget: number
}

export interface StaffTask {
  id: string
  orderNumber: string
  customerName: string
  taskType: string
  priority: 'normal' | 'high' | 'urgent'
  status: 'assigned' | 'in_progress' | 'completed' | 'on_hold'
  dueTime: string
  estimatedDuration: string
  notes?: string
}

export interface Notification {
  id: string
  type: 'task_assigned' | 'deadline_reminder' | 'status_update' | 'message' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority?: 'low' | 'medium' | 'high'
  actionUrl?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface DashboardOverview {
  metrics: any
  recentOrders?: Order[]
  recentActivities?: RecentActivity[]
  alerts?: SystemAlert[]
  timeframe?: string
  generatedAt: string
}

// Chart Data Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

export interface PieChartData {
  name: string
  value: number
  color: string
}

// Performance Metrics
export interface PerformanceMetrics {
  efficiency: number
  qualityScore: number
  onTimeRate: number
  customerSatisfaction: number
  completionRate: number
}

// Error Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}