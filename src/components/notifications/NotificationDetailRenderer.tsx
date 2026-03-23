'use client'

/**
 * NotificationDetailRenderer - Type-specific detail content for notifications.
 * Renders rich, contextual detail sections based on notification eventType.
 */

import React from 'react'
import {
  Package,
  CreditCard,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Building2,
  Target,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Hash,
  IndianRupee,
  Zap,
  BarChart3,
  Key,
  Globe,
  Monitor,
  ShieldCheck,
  ShieldX,
  Timer,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NotificationDetailItem } from './NotificationDetailDrawer'

interface DetailRendererProps {
  notification: NotificationDetailItem
}

// Helper: format currency
const formatAmount = (amount: unknown): string => {
  if (!amount && amount !== 0) return '--'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

// Helper: info row
const InfoRow = ({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: unknown; className?: string }) => {
  if (!value && value !== 0 && value !== false) return null
  return (
    <div className={cn('flex items-start gap-3 py-2', className)}>
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{String(value)}</p>
      </div>
    </div>
  )
}

// Helper: status badge
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, string> = {
    placed: 'bg-blue-50 text-blue-700 border-blue-200',
    picked: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    in_process: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    ready: 'bg-green-50 text-green-700 border-green-200',
    out_for_delivery: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-800 border-green-300',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    expired: 'bg-red-50 text-red-700 border-red-200',
  }
  const s = status?.toLowerCase().replace(/\s+/g, '_')
  return (
    <span className={cn('inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', config[s] || 'bg-gray-50 text-gray-700 border-gray-200')}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// Helper: section wrapper
const DetailSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </h4>
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 divide-y divide-gray-100">
      {children}
    </div>
  </div>
)

// ============ ORDER DETAIL ============
const OrderNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Order Details" icon={ShoppingBag}>
    <InfoRow icon={Hash} label="Order Number" value={data.orderNumber} />
    {data.status && (
      <div className="flex items-start gap-3 py-2">
        <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
          <StatusBadge status={String(data.status)} />
        </div>
      </div>
    )}
    <InfoRow icon={IndianRupee} label="Total Amount" value={data.totalAmount ? formatAmount(data.totalAmount) : undefined} />
    <InfoRow icon={Layers} label="Items" value={data.itemCount ? `${data.itemCount} item(s)` : undefined} />
    <InfoRow icon={Package} label="Service Type" value={data.serviceType ? String(data.serviceType).replace(/_/g, ' ') : undefined} />
    {data.isExpress && (
      <div className="flex items-center gap-2 py-2">
        <Zap className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Express Delivery</span>
      </div>
    )}
    <InfoRow icon={Building2} label="Branch" value={data.branchName} />
    <InfoRow icon={Users} label="Customer" value={data.customerName} />
    <InfoRow icon={Phone} label="Phone" value={data.customerPhone} />
  </DetailSection>
)

// ============ PAYMENT DETAIL ============
const PaymentNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Payment Details" icon={CreditCard}>
    <InfoRow icon={IndianRupee} label="Amount" value={data.amount ? formatAmount(data.amount) : undefined} />
    <InfoRow icon={CreditCard} label="Payment Method" value={data.paymentMethod} />
    <InfoRow icon={Hash} label="Transaction ID" value={data.transactionId} />
    <InfoRow icon={Hash} label="Order" value={data.orderNumber} />
    {data.status && (
      <div className="flex items-start gap-3 py-2">
        <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
          <StatusBadge status={String(data.status)} />
        </div>
      </div>
    )}
    <InfoRow icon={Users} label="Customer" value={data.customerName} />
    <InfoRow icon={FileText} label="Reason" value={data.reason} />
  </DetailSection>
)

// ============ INVENTORY DETAIL ============
const InventoryNotificationDetail = ({ data }: { data: Record<string, unknown> }) => {
  const current = Number(data.currentStock) || 0
  const threshold = Number(data.reorderLevel) || 0
  const max = Math.max(current, threshold, 1)
  const percentage = Math.min((current / max) * 100, 100)
  const isLow = current <= threshold

  return (
    <DetailSection title="Inventory Details" icon={BarChart3}>
      <InfoRow icon={Package} label="Item" value={data.itemName} />
      <div className="py-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <BarChart3 className="w-3 h-3" /> Stock Level
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', isLow ? 'bg-red-500' : 'bg-green-500')}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className={cn('text-xs font-bold', isLow ? 'text-red-600' : 'text-green-600')}>
            {current} {data.unit || 'pcs'}
          </span>
          <span className="text-xs text-gray-400">Threshold: {threshold}</span>
        </div>
      </div>
      <InfoRow icon={Building2} label="Branch" value={data.branchName} />
      <InfoRow icon={Package} label="Urgency" value={data.urgency} />
    </DetailSection>
  )
}

// ============ SUPPORT DETAIL ============
const SupportNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Ticket Details" icon={FileText}>
    <InfoRow icon={Hash} label="Ticket Number" value={data.ticketNumber} />
    <InfoRow icon={FileText} label="Subject" value={data.subject} />
    <InfoRow icon={Layers} label="Category" value={data.category} />
    {(data.ticketPriority || data.status) && (
      <div className="flex items-center gap-3 py-2">
        {data.ticketPriority && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</p>
            <StatusBadge status={String(data.ticketPriority)} />
          </div>
        )}
        {data.status && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
            <StatusBadge status={String(data.status)} />
          </div>
        )}
      </div>
    )}
    <InfoRow icon={Users} label="Customer" value={data.customerName} />
    <InfoRow icon={Phone} label="Phone" value={data.customerPhone} />
    <InfoRow icon={Users} label="Assigned To" value={data.assignedTo} />
  </DetailSection>
)

// ============ SECURITY DETAIL ============
const SecurityNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Security Details" icon={Shield}>
    <InfoRow icon={Shield} label="Alert Type" value={data.alertType} />
    <InfoRow icon={Globe} label="IP Address" value={data.ipAddress || data.ip} />
    <InfoRow icon={Monitor} label="Device" value={data.device || data.userAgent} />
    <InfoRow icon={MapPin} label="Location" value={data.location} />
    <InfoRow icon={Hash} label="Attempts" value={data.attemptCount || data.attempts} />
    <InfoRow icon={Shield} label="Action Taken" value={data.actionTaken || data.action} />
    <InfoRow icon={Clock} label="Timestamp" value={data.timestamp ? new Date(String(data.timestamp)).toLocaleString() : undefined} />
  </DetailSection>
)

// ============ SUBSCRIPTION DETAIL ============
const SubscriptionNotificationDetail = ({ data }: { data: Record<string, unknown> }) => {
  const daysLeft = data.daysLeft ? Number(data.daysLeft) : null

  return (
    <DetailSection title="Subscription Details" icon={FileText}>
      <InfoRow icon={Layers} label="Plan" value={data.planName || data.plan} />
      {data.oldPlan && <InfoRow icon={Layers} label="Previous Plan" value={data.oldPlan} />}
      {data.newPlan && <InfoRow icon={Layers} label="New Plan" value={data.newPlan} />}
      <InfoRow icon={Timer} label="Expires" value={data.expiryDate ? new Date(String(data.expiryDate)).toLocaleDateString() : undefined} />
      {daysLeft !== null && (
        <div className="py-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Days Remaining</p>
          <span className={cn(
            'text-lg font-bold',
            daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-green-600'
          )}>
            {daysLeft} days
          </span>
        </div>
      )}
      <InfoRow icon={IndianRupee} label="Amount" value={data.amount ? formatAmount(data.amount) : undefined} />
      <InfoRow icon={BarChart3} label="Usage" value={data.usage} />
      <InfoRow icon={FileText} label="Limit Type" value={data.limitType} />
    </DetailSection>
  )
}

// ============ PERMISSION DETAIL ============
const PermissionNotificationDetail = ({ data }: { data: Record<string, unknown> }) => {
  const modules = data.modules as Array<{ module: string; actions: string[] }> | undefined
  const enabledFeatures = data.enabledFeatures as string[] | undefined
  const disabledFeatures = data.disabledFeatures as string[] | undefined

  return (
    <DetailSection title="Permission Details" icon={Key}>
      {data.oldRole && <InfoRow icon={Users} label="Previous Role" value={data.oldRole} />}
      {data.newRole && <InfoRow icon={Users} label="New Role" value={data.newRole} />}
      <InfoRow icon={FileText} label="Module" value={data.module} />
      <InfoRow icon={Key} label="Action" value={data.action} />

      {modules && modules.length > 0 && (
        <div className="py-2 space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Modules Changed</p>
          <div className="flex flex-wrap gap-1.5">
            {modules.map((m, i) => (
              <span key={i} className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {typeof m === 'string' ? m : `${m.module} (${m.actions?.join(', ')})`}
              </span>
            ))}
          </div>
        </div>
      )}

      {enabledFeatures && enabledFeatures.length > 0 && (
        <div className="py-2 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Enabled</p>
          {enabledFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-green-700">
              <ShieldCheck className="w-3.5 h-3.5" /> {f}
            </div>
          ))}
        </div>
      )}

      {disabledFeatures && disabledFeatures.length > 0 && (
        <div className="py-2 space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Disabled</p>
          {disabledFeatures.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-700">
              <ShieldX className="w-3.5 h-3.5" /> {f}
            </div>
          ))}
        </div>
      )}

      <InfoRow icon={Users} label="Updated By" value={data.updatedBy || data.updatedByName} />
    </DetailSection>
  )
}

// ============ TENANCY DETAIL (SuperAdmin) ============
const TenancyNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Tenancy Details" icon={Building2}>
    <InfoRow icon={Building2} label="Business Name" value={data.tenancyName || data.businessName} />
    <InfoRow icon={Users} label="Owner" value={data.ownerName} />
    <InfoRow icon={Mail} label="Email" value={data.email || data.ownerEmail} />
    <InfoRow icon={Phone} label="Phone" value={data.phone || data.ownerPhone} />
    <InfoRow icon={Layers} label="Plan" value={data.planName || data.plan} />
    <InfoRow icon={MapPin} label="City" value={data.city} />
    <InfoRow icon={IndianRupee} label="Amount" value={data.amount ? formatAmount(data.amount) : undefined} />
    <InfoRow icon={Timer} label="Days Left" value={data.daysLeft ? `${data.daysLeft} days` : undefined} />
  </DetailSection>
)

// ============ LEAD DETAIL (SuperAdmin) ============
const LeadNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Lead Details" icon={Target}>
    <InfoRow icon={Building2} label="Business Name" value={data.businessName || data.name} />
    <InfoRow icon={Mail} label="Email" value={data.email} />
    <InfoRow icon={Phone} label="Phone" value={data.phone} />
    <InfoRow icon={Target} label="Source" value={data.source} />
    {data.status && (
      <div className="flex items-start gap-3 py-2">
        <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
          <StatusBadge status={String(data.status)} />
        </div>
      </div>
    )}
  </DetailSection>
)

// ============ STAFF/BRANCH DETAIL ============
const TeamNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Team Details" icon={Users}>
    <InfoRow icon={Users} label="Name" value={data.staffName || data.name} />
    <InfoRow icon={Layers} label="Role" value={data.role} />
    <InfoRow icon={Building2} label="Branch" value={data.branchName} />
    <InfoRow icon={Mail} label="Email" value={data.email} />
    <InfoRow icon={Phone} label="Phone" value={data.phone} />
  </DetailSection>
)

// ============ REWARDS DETAIL ============
const RewardsNotificationDetail = ({ data }: { data: Record<string, unknown> }) => (
  <DetailSection title="Rewards Details" icon={Zap}>
    <InfoRow icon={Zap} label="Points Earned" value={data.points} />
    <InfoRow icon={IndianRupee} label="Amount" value={data.amount ? formatAmount(data.amount) : undefined} />
    <InfoRow icon={FileText} label="Reason" value={data.reason} />
    <InfoRow icon={Layers} label="Tier" value={data.tier} />
  </DetailSection>
)

// ============ GENERIC FALLBACK ============
const GenericNotificationDetail = ({ data }: { data: Record<string, unknown> }) => {
  const entries = Object.entries(data).filter(
    ([key, value]) =>
      !['link', 'permissions', 'isRead', 'isActioned', 'isSystem', 'isPersistent', 'icon', 'type', 'severity', 'priority', 'id', '_id', 'createdAt', 'updatedAt', '__v'].includes(key) &&
      typeof value !== 'object'
  )
  if (entries.length === 0) return null

  return (
    <DetailSection title="Details" icon={FileText}>
      {entries.map(([key, value]) => (
        <InfoRow
          key={key}
          icon={FileText}
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
          value={value}
        />
      ))}
    </DetailSection>
  )
}

// ============ MAIN RENDERER ============
export function NotificationDetailRenderer({ notification }: DetailRendererProps) {
  const data = { ...notification.metadata, ...notification.data } as Record<string, unknown>
  const eventType = notification.eventType || notification.type || ''

  // Order notifications
  if (eventType.startsWith('order_')) {
    return <OrderNotificationDetail data={data} />
  }

  // Payment/refund notifications
  if (eventType.startsWith('payment_') || eventType === 'refund_request') {
    return <PaymentNotificationDetail data={data} />
  }

  // Inventory notifications
  if (eventType.includes('inventory')) {
    return <InventoryNotificationDetail data={data} />
  }

  // Support/ticket notifications
  if (eventType.includes('complaint') || eventType.includes('ticket')) {
    return <SupportNotificationDetail data={data} />
  }

  // Security notifications
  if (eventType.includes('security') || eventType === 'password_changed' || eventType === 'account_locked' || eventType === 'multiple_login_attempts') {
    return <SecurityNotificationDetail data={data} />
  }

  // Subscription/billing notifications
  if (eventType.includes('subscription') || eventType.startsWith('plan_') || eventType === 'usage_limit_reached' || eventType === 'invoice_generated') {
    return <SubscriptionNotificationDetail data={data} />
  }

  // Permission/role notifications
  if (eventType.includes('permission') || eventType.includes('role_') || eventType === 'admin_created' || eventType.includes('features_updated')) {
    return <PermissionNotificationDetail data={data} />
  }

  // Tenancy notifications
  if (eventType.includes('tenancy')) {
    return <TenancyNotificationDetail data={data} />
  }

  // Lead notifications
  if (eventType.includes('lead')) {
    return <LeadNotificationDetail data={data} />
  }

  // Staff/branch notifications
  if (eventType.includes('staff') || eventType.includes('branch')) {
    return <TeamNotificationDetail data={data} />
  }

  // Rewards/promo notifications
  if (eventType.includes('reward') || eventType.includes('milestone') || eventType.includes('vip') || eventType.includes('wallet') || eventType.includes('coupon')) {
    return <RewardsNotificationDetail data={data} />
  }

  // Fallback - generic metadata display
  return <GenericNotificationDetail data={data} />
}
