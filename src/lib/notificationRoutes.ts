/**
 * Central navigation mapping for notification types.
 * Maps notification type + data to the appropriate page URL.
 */

export function getNotificationRoute(
  type: string,
  data: Record<string, any> = {},
  userRole: string = 'admin'
): string | null {
  const orderId = data?.orderId;
  const ticketId = data?.ticketId;
  const tenancyId = data?.tenancyId;
  const branchId = data?.branchId;

  // If a link is explicitly provided, use it
  if (data?.link) return data.link;

  switch (type) {
    // Order notifications
    case 'order_placed':
    case 'order_assigned':
    case 'order_picked':
    case 'order_in_process':
    case 'order_ready':
    case 'order_out_for_delivery':
    case 'order_delivered':
    case 'order_cancelled':
      if (userRole === 'customer') return orderId ? `/customer/orders/${orderId}` : '/customer/orders';
      if (userRole === 'branch_admin') return orderId ? `/branch/orders?id=${orderId}` : '/branch/orders';
      return orderId ? `/admin/orders?id=${orderId}` : '/admin/orders';

    // Payment notifications
    case 'payment_received':
      if (userRole === 'customer') return orderId ? `/customer/orders/${orderId}` : '/customer/orders';
      return '/admin/payments';
    case 'payment_failed':
      if (userRole === 'customer') return orderId ? `/customer/orders/${orderId}` : '/customer/orders';
      return '/admin/billing';
    case 'refund_request':
      return '/admin/refunds';

    // Inventory notifications
    case 'low_inventory':
    case 'inventory_restocked':
    case 'inventory_request_approved':
    case 'inventory_request_rejected':
    case 'inventory_request_completed':
      return '/admin/inventory';
    case 'inventory_request_submitted':
      return '/inventory-requests';

    // Support notifications
    case 'new_complaint':
    case 'ticket_resolved':
      if (userRole === 'customer') return ticketId ? `/customer/tickets/${ticketId}` : '/customer/tickets';
      return ticketId ? `/admin/tickets/${ticketId}` : '/admin/tickets';
    case 'ticket_assigned':
      return ticketId ? `/support/tickets/${ticketId}` : '/support/tickets';

    // Subscription/billing notifications
    case 'subscription_expiring':
    case 'subscription_expired':
    case 'plan_upgraded':
    case 'plan_downgraded':
    case 'usage_limit_reached':
    case 'invoice_generated':
      return '/admin/billing';

    // Tenancy notifications (SuperAdmin)
    case 'new_tenancy_signup':
    case 'tenancy_subscription_expiring':
    case 'tenancy_subscription_expired':
    case 'tenancy_subscription_updated':
      return tenancyId ? `/tenancies/${tenancyId}` : '/tenancies';
    case 'tenancy_payment_received':
      return '/billing';

    // Security notifications
    case 'security_alert':
    case 'account_locked':
    case 'multiple_login_attempts':
      return '/admin/security';
    case 'password_changed':
      return '/profile';

    // Permission/role notifications
    case 'permission_granted':
    case 'permission_revoked':
    case 'tenancy_permissions_updated':
    case 'tenancy_features_updated':
      return null; // Refresh current page
    case 'role_updated':
    case 'admin_created':
      return '/admin/dashboard';
    case 'tenancy_settings_updated':
      return '/admin/settings';

    // Rewards/promo notifications
    case 'reward_points':
    case 'milestone_achieved':
    case 'vip_upgrade':
      return '/customer/rewards';
    case 'wallet_credited':
      return '/customer/wallet';
    case 'new_campaign':
      return '/customer/promotions';
    case 'coupon_expiring':
      return '/customer/coupons';

    // Staff/branch notifications
    case 'new_staff_added':
    case 'staff_removed':
      return '/admin/staff';
    case 'new_branch_created':
    case 'branch_admin_assigned':
      return '/admin/branches';

    // Lead notifications (SuperAdmin)
    case 'new_lead':
    case 'lead_converted':
      return '/leads';

    // System
    case 'system_alert':
    case 'announcement':
      return null;

    default:
      return null;
  }
}

/**
 * Get the category label for a notification type
 */
export function getNotificationCategory(type: string): { label: string; emoji: string } {
  if (type?.startsWith('order_')) return { label: 'Orders', emoji: '📦' };
  if (type?.startsWith('payment_') || type === 'refund_request') return { label: 'Payments', emoji: '💳' };
  if (type?.includes('inventory')) return { label: 'Inventory', emoji: '📊' };
  if (type?.includes('complaint') || type?.includes('ticket')) return { label: 'Support', emoji: '🎫' };
  if (type?.includes('subscription') || type?.includes('plan_') || type === 'usage_limit_reached' || type === 'invoice_generated') return { label: 'Billing', emoji: '📋' };
  if (type?.includes('tenancy')) return { label: 'Tenancy', emoji: '🏢' };
  if (type?.includes('security') || type?.includes('password') || type?.includes('account_locked') || type?.includes('login_attempts')) return { label: 'Security', emoji: '🛡️' };
  if (type?.includes('permission') || type?.includes('role_') || type === 'admin_created') return { label: 'Permissions', emoji: '🔐' };
  if (type?.includes('reward') || type?.includes('milestone') || type?.includes('vip') || type?.includes('wallet') || type?.includes('campaign') || type?.includes('coupon')) return { label: 'Rewards', emoji: '⭐' };
  if (type?.includes('staff') || type?.includes('branch')) return { label: 'Team', emoji: '👥' };
  if (type?.includes('lead')) return { label: 'Leads', emoji: '🎯' };
  return { label: 'General', emoji: '🔔' };
}
