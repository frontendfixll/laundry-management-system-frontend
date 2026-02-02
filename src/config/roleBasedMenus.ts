/**
 * Role-Based Menu Configuration
 * Based on droles.md specification - UI-Ready Menu Trees
 */

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  requiredPermission?: string;
  requiredRole?: string[];
  requiredFeature?: string;
  badge?: string;
  description?: string;
}

export interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  requiredRole?: string[];
  order: number;
}

// Platform-Level Menus (SuperAdmin Interface)
export const PLATFORM_MENUS: Record<string, MenuSection[]> = {
  // Super Admin Menu Tree
  super_admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'platform-overview',
          label: 'Platform Overview',
          icon: 'LayoutDashboard',
          path: '/superadmin/dashboard',
          requiredPermission: 'platform_settings.view'
        },
        {
          id: 'revenue-snapshot',
          label: 'Revenue Snapshot',
          icon: 'TrendingUp',
          path: '/superadmin/revenue',
          requiredPermission: 'payments_revenue.view'
        },
        {
          id: 'active-tenants',
          label: 'Active Tenants',
          icon: 'Building2',
          path: '/superadmin/tenants/active',
          requiredPermission: 'tenant_crud.view'
        },
        {
          id: 'system-alerts',
          label: 'System Alerts',
          icon: 'AlertTriangle',
          path: '/superadmin/alerts',
          requiredPermission: 'audit_logs.view'
        }
      ]
    },
    {
      id: 'tenants',
      label: 'Tenants',
      order: 2,
      items: [
        {
          id: 'all-tenants',
          label: 'All Tenants',
          icon: 'Building',
          path: '/superadmin/tenants',
          requiredPermission: 'tenant_crud.view',
          children: [
            {
              id: 'view-tenant',
              label: 'View Tenant',
              path: '/superadmin/tenants/:id',
              requiredPermission: 'tenant_crud.view'
            },
            {
              id: 'assign-plan',
              label: 'Assign Plan',
              path: '/superadmin/tenants/:id/plan',
              requiredPermission: 'subscription_plans.update'
            },
            {
              id: 'suspend-activate',
              label: 'Suspend / Activate',
              path: '/superadmin/tenants/:id/status',
              requiredPermission: 'tenant_suspend.update'
            },
            {
              id: 'domain-mapping',
              label: 'Domain Mapping',
              path: '/superadmin/tenants/:id/domains',
              requiredPermission: 'platform_settings.update'
            }
          ]
        },
        {
          id: 'create-tenant',
          label: 'Create Tenant',
          icon: 'Plus',
          path: '/superadmin/tenants/create',
          requiredPermission: 'tenant_crud.create'
        }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions & Plans',
      order: 3,
      items: [
        {
          id: 'plans',
          label: 'Plans',
          icon: 'Package',
          path: '/superadmin/plans',
          requiredPermission: 'subscription_plans.view',
          children: [
            {
              id: 'create-plan',
              label: 'Create Plan',
              path: '/superadmin/plans/create',
              requiredPermission: 'subscription_plans.create'
            },
            {
              id: 'edit-plan',
              label: 'Edit Plan',
              path: '/superadmin/plans/:id/edit',
              requiredPermission: 'subscription_plans.update'
            }
          ]
        },
        {
          id: 'active-subscriptions',
          label: 'Active Subscriptions',
          icon: 'CreditCard',
          path: '/superadmin/subscriptions',
          requiredPermission: 'subscription_plans.view'
        }
      ]
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      order: 4,
      items: [
        {
          id: 'laundry-listings',
          label: 'Laundry Listings',
          icon: 'Store',
          path: '/superadmin/marketplace/listings',
          requiredPermission: 'marketplace_control.view'
        },
        {
          id: 'commission-settings',
          label: 'Commission Settings',
          icon: 'Percent',
          path: '/superadmin/marketplace/commission',
          requiredPermission: 'marketplace_control.update'
        },
        {
          id: 'featured-laundries',
          label: 'Featured Laundries',
          icon: 'Star',
          path: '/superadmin/marketplace/featured',
          requiredPermission: 'marketplace_control.update'
        }
      ]
    },
    {
      id: 'finance',
      label: 'Payments & Revenue',
      order: 5,
      items: [
        {
          id: 'platform-revenue',
          label: 'Platform Revenue',
          icon: 'DollarSign',
          path: '/superadmin/revenue',
          requiredPermission: 'payments_revenue.view'
        },
        {
          id: 'transactions',
          label: 'Transactions',
          icon: 'Receipt',
          path: '/superadmin/transactions',
          requiredPermission: 'payments_revenue.view'
        },
        {
          id: 'refunds',
          label: 'Refunds',
          icon: 'RotateCcw',
          path: '/superadmin/refunds',
          requiredPermission: 'refunds.view'
        },
        {
          id: 'payment-logs',
          label: 'Payment Logs',
          icon: 'FileText',
          path: '/superadmin/payments/logs',
          requiredPermission: 'audit_logs.view'
        }
      ]
    },
    {
      id: 'automation',
      label: 'Rules & Automation',
      order: 6,
      items: [
        {
          id: 'global-rules',
          label: 'Global Rules',
          icon: 'Settings',
          path: '/superadmin/rules',
          requiredPermission: 'rule_engine_global.view'
        },
        {
          id: 'rule-templates',
          label: 'Rule Templates',
          icon: 'Template',
          path: '/superadmin/rules/templates',
          requiredPermission: 'rule_engine_global.create'
        },
        {
          id: 'execution-logs',
          label: 'Execution Logs',
          icon: 'Activity',
          path: '/superadmin/rules/logs',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'emergency-disable',
          label: 'Emergency Disable',
          icon: 'AlertOctagon',
          path: '/superadmin/rules/emergency',
          requiredPermission: 'rule_engine_global.delete'
        }
      ]
    },
    {
      id: 'security',
      label: 'Security & Audit',
      order: 7,
      items: [
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: 'Shield',
          path: '/superadmin/audit',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'access-logs',
          label: 'Access Logs',
          icon: 'Key',
          path: '/superadmin/access-logs',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'incident-reports',
          label: 'Incident Reports',
          icon: 'AlertTriangle',
          path: '/superadmin/incidents',
          requiredPermission: 'audit_logs.view'
        }
      ]
    }
  ],

  // Platform Support Menu Tree
  platform_support: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'support-overview',
          label: 'Support Overview',
          icon: 'LifeBuoy',
          path: '/superadmin/support/dashboard',
          requiredPermission: 'tenant_crud.view'
        }
      ]
    },
    {
      id: 'tenants',
      label: 'Tenants',
      order: 2,
      items: [
        {
          id: 'view-tenants',
          label: 'View Tenants',
          icon: 'Building',
          path: '/superadmin/tenants',
          requiredPermission: 'tenant_crud.view'
        },
        {
          id: 'tenant-status',
          label: 'Tenant Status',
          icon: 'Activity',
          path: '/superadmin/tenants/status',
          requiredPermission: 'tenant_crud.view'
        }
      ]
    },
    {
      id: 'support',
      label: 'Support Tools',
      order: 3,
      items: [
        {
          id: 'impersonate',
          label: 'Impersonate (Read-Only)',
          icon: 'UserCheck',
          path: '/superadmin/impersonate',
          requiredPermission: 'user_impersonation.view',
          description: 'Read-only, time-limited, logged'
        },
        {
          id: 'issue-reports',
          label: 'Issue Reports',
          icon: 'Bug',
          path: '/superadmin/issues',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'support-tickets',
          label: 'Support Tickets',
          icon: 'MessageSquare',
          path: '/superadmin/tickets',
          requiredPermission: 'audit_logs.view'
        }
      ]
    }
  ],

  // Platform Finance Menu Tree
  platform_finance: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'financial-overview',
          label: 'Financial Overview',
          icon: 'DollarSign',
          path: '/superadmin/finance/dashboard',
          requiredPermission: 'payments_revenue.view'
        }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      order: 2,
      items: [
        {
          id: 'transactions',
          label: 'Transactions',
          icon: 'Receipt',
          path: '/superadmin/finance/transactions',
          requiredPermission: 'payments_revenue.view'
        },
        {
          id: 'refund-processing',
          label: 'Refund Processing',
          icon: 'RotateCcw',
          path: '/superadmin/finance/refunds',
          requiredPermission: 'refunds.create'
        },
        {
          id: 'settlement-reports',
          label: 'Settlement Reports',
          icon: 'FileBarChart',
          path: '/superadmin/finance/settlements',
          requiredPermission: 'payments_revenue.export'
        }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      order: 3,
      items: [
        {
          id: 'billing-status',
          label: 'Billing Status',
          icon: 'CreditCard',
          path: '/superadmin/finance/billing',
          requiredPermission: 'subscription_plans.view'
        },
        {
          id: 'payment-failures',
          label: 'Payment Failures',
          icon: 'AlertCircle',
          path: '/superadmin/finance/failures',
          requiredPermission: 'payments_revenue.view'
        }
      ]
    }
  ],

  // Platform Auditor Menu Tree
  platform_auditor: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'audit-summary',
          label: 'Audit Summary',
          icon: 'Shield',
          path: '/superadmin/audit/dashboard',
          requiredPermission: 'audit_logs.view'
        }
      ]
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      order: 2,
      items: [
        {
          id: 'access-logs',
          label: 'Access Logs',
          icon: 'Key',
          path: '/superadmin/audit/access',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'change-logs',
          label: 'Change Logs',
          icon: 'GitCommit',
          path: '/superadmin/audit/changes',
          requiredPermission: 'audit_logs.view'
        },
        {
          id: 'rule-executions',
          label: 'Rule Executions',
          icon: 'Activity',
          path: '/superadmin/audit/rules',
          requiredPermission: 'audit_logs.view'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      order: 3,
      items: [
        {
          id: 'compliance-reports',
          label: 'Compliance Reports',
          icon: 'FileCheck',
          path: '/superadmin/audit/compliance',
          requiredPermission: 'audit_logs.export'
        }
      ]
    }
  ]
};

// Tenant-Level Menus (Admin Interface)
export const TENANT_MENUS: Record<string, MenuSection[]> = {
  // Tenant Owner Menu Tree
  tenant_owner: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'business-overview',
          label: 'Business Overview',
          icon: 'LayoutDashboard',
          path: '/admin/dashboard',
          requiredPermission: 'business_profile.view'
        },
        {
          id: 'orders-summary',
          label: 'Orders Summary',
          icon: 'Package',
          path: '/admin/orders/summary',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'revenue-snapshot',
          label: 'Revenue Snapshot',
          icon: 'TrendingUp',
          path: '/admin/revenue',
          requiredPermission: 'payments_earnings.view'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      order: 2,
      items: [
        {
          id: 'all-orders',
          label: 'All Orders',
          icon: 'ShoppingBag',
          path: '/admin/orders',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'order-details',
          label: 'Order Details',
          icon: 'FileText',
          path: '/admin/orders/:id',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'manual-overrides',
          label: 'Manual Overrides',
          icon: 'Settings',
          path: '/admin/orders/overrides',
          requiredPermission: 'orders_update_status.update',
          description: 'Limited override capabilities'
        }
      ]
    },
    {
      id: 'services',
      label: 'Services & Pricing',
      order: 3,
      items: [
        {
          id: 'services',
          label: 'Services',
          icon: 'Wrench',
          path: '/admin/services',
          requiredPermission: 'services_pricing.view'
        },
        {
          id: 'categories',
          label: 'Categories',
          icon: 'Grid3x3',
          path: '/admin/services/categories',
          requiredPermission: 'services_pricing.create'
        },
        {
          id: 'pricing-rules',
          label: 'Pricing Rules',
          icon: 'Calculator',
          path: '/admin/services/pricing',
          requiredPermission: 'services_pricing.update'
        }
      ]
    },
    {
      id: 'staff',
      label: 'Staff',
      order: 4,
      items: [
        {
          id: 'staff-list',
          label: 'Staff List',
          icon: 'Users',
          path: '/admin/staff',
          requiredPermission: 'staff_management.view'
        },
        {
          id: 'roles-permissions',
          label: 'Roles & Permissions',
          icon: 'Shield',
          path: '/admin/staff/roles',
          requiredPermission: 'staff_management.create'
        },
        {
          id: 'shift-assignment',
          label: 'Shift Assignment',
          icon: 'Calendar',
          path: '/admin/staff/shifts',
          requiredPermission: 'assign_staff.create'
        }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      order: 5,
      items: [
        {
          id: 'customer-list',
          label: 'Customer List',
          icon: 'UserCheck',
          path: '/admin/customers',
          requiredPermission: 'customer_management.view'
        },
        {
          id: 'customer-profiles',
          label: 'Customer Profiles',
          icon: 'User',
          path: '/admin/customers/:id',
          requiredPermission: 'customer_management.view'
        }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      order: 6,
      items: [
        {
          id: 'tenant-coupons',
          label: 'Coupons',
          icon: 'Tag',
          path: '/admin/coupons',
          requiredPermission: 'tenant_coupons.view'
        },
        {
          id: 'usage-analytics',
          label: 'Usage Analytics',
          icon: 'BarChart3',
          path: '/admin/coupons/analytics',
          requiredPermission: 'tenant_coupons.view'
        }
      ]
    },
    {
      id: 'finance',
      label: 'Payments & Earnings',
      order: 7,
      items: [
        {
          id: 'earnings-dashboard',
          label: 'Earnings Dashboard',
          icon: 'DollarSign',
          path: '/admin/earnings',
          requiredPermission: 'payments_earnings.view'
        },
        {
          id: 'payouts',
          label: 'Payouts',
          icon: 'Banknote',
          path: '/admin/payouts',
          requiredPermission: 'payments_earnings.view'
        },
        {
          id: 'invoices',
          label: 'Invoices',
          icon: 'Receipt',
          path: '/admin/invoices',
          requiredPermission: 'payments_earnings.view'
        }
      ]
    },
    {
      id: 'automation',
      label: 'Rules & Automation',
      order: 8,
      items: [
        {
          id: 'tenant-rules',
          label: 'Tenant Rules',
          icon: 'Settings',
          path: '/admin/rules',
          requiredPermission: 'rule_engine_tenant.view'
        },
        {
          id: 'rule-logs',
          label: 'Rule Logs',
          icon: 'Activity',
          path: '/admin/rules/logs',
          requiredPermission: 'rule_engine_tenant.view'
        },
        {
          id: 'test-rules',
          label: 'Test Rules',
          icon: 'TestTube',
          path: '/admin/rules/test',
          requiredPermission: 'rule_engine_tenant.create'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      order: 9,
      items: [
        {
          id: 'sales-reports',
          label: 'Sales Reports',
          icon: 'TrendingUp',
          path: '/admin/reports/sales',
          requiredPermission: 'reports_analytics.view'
        },
        {
          id: 'service-performance',
          label: 'Service Performance',
          icon: 'BarChart',
          path: '/admin/reports/services',
          requiredPermission: 'reports_analytics.view'
        },
        {
          id: 'staff-performance',
          label: 'Staff Performance',
          icon: 'Users',
          path: '/admin/reports/staff',
          requiredPermission: 'reports_analytics.view'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      order: 10,
      items: [
        {
          id: 'business-profile',
          label: 'Business Profile',
          icon: 'Building',
          path: '/admin/settings/profile',
          requiredPermission: 'tenant_settings.view'
        },
        {
          id: 'delivery-rules',
          label: 'Delivery Rules',
          icon: 'Truck',
          path: '/admin/settings/delivery',
          requiredPermission: 'tenant_settings.update'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: 'Bell',
          path: '/admin/settings/notifications',
          requiredPermission: 'tenant_settings.update'
        },
        {
          id: 'theme-branding',
          label: 'Theme / Branding',
          icon: 'Palette',
          path: '/admin/settings/branding',
          requiredPermission: 'tenant_settings.update'
        }
      ]
    }
  ],

  // Tenant Admin Menu Tree (Limited)
  tenant_admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'operations-overview',
          label: 'Operations Overview',
          icon: 'LayoutDashboard',
          path: '/admin/dashboard',
          requiredPermission: 'orders_view.view'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      order: 2,
      items: [
        {
          id: 'view-orders',
          label: 'View Orders',
          icon: 'ShoppingBag',
          path: '/admin/orders',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'update-status',
          label: 'Update Status',
          icon: 'RefreshCw',
          path: '/admin/orders/status',
          requiredPermission: 'orders_update_status.edit'
        },
        {
          id: 'assign-staff',
          label: 'Assign Staff',
          icon: 'UserPlus',
          path: '/admin/orders/assign',
          requiredPermission: 'assign_staff.edit'
        }
      ]
    },
    {
      id: 'services',
      label: 'Services',
      order: 3,
      items: [
        {
          id: 'view-services',
          label: 'View Services',
          icon: 'Wrench',
          path: '/admin/services',
          requiredPermission: 'services_pricing.view'
        },
        {
          id: 'limited-edit',
          label: 'Limited Edit',
          icon: 'Edit',
          path: '/admin/services/edit',
          requiredPermission: 'services_pricing.edit'
        }
      ]
    },
    {
      id: 'staff',
      label: 'Staff',
      order: 4,
      items: [
        {
          id: 'view-staff',
          label: 'View Staff',
          icon: 'Users',
          path: '/admin/staff',
          requiredPermission: 'staff_management.view'
        },
        {
          id: 'assign-tasks',
          label: 'Assign Tasks',
          icon: 'CheckSquare',
          path: '/admin/staff/tasks',
          requiredPermission: 'staff_management.edit'
        }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      order: 5,
      items: [
        {
          id: 'view-customers',
          label: 'View Customers',
          icon: 'Users',
          path: '/admin/customers',
          requiredPermission: 'customer_management.view'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      order: 6,
      items: [
        {
          id: 'operational-reports',
          label: 'Operational Reports',
          icon: 'BarChart',
          path: '/admin/reports/operations',
          requiredPermission: 'reports_analytics.view'
        }
      ]
    }
  ],

  // Operations Manager Menu Tree
  tenant_ops_manager: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'daily-operations',
          label: 'Daily Operations',
          icon: 'LayoutDashboard',
          path: '/admin/ops/dashboard',
          requiredPermission: 'orders_view.view'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      order: 2,
      items: [
        {
          id: 'assigned-orders',
          label: 'Assigned Orders',
          icon: 'ShoppingBag',
          path: '/admin/ops/orders/assigned',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'status-updates',
          label: 'Status Updates',
          icon: 'RefreshCw',
          path: '/admin/ops/orders/status',
          requiredPermission: 'orders_update_status.create'
        },
        {
          id: 'delay-handling',
          label: 'Delay Handling',
          icon: 'Clock',
          path: '/admin/ops/orders/delays',
          requiredPermission: 'orders_update_status.edit'
        }
      ]
    },
    {
      id: 'staff',
      label: 'Staff',
      order: 3,
      items: [
        {
          id: 'staff-assignment',
          label: 'Staff Assignment',
          icon: 'UserPlus',
          path: '/admin/ops/staff/assign',
          requiredPermission: 'assign_staff.create'
        },
        {
          id: 'performance-view',
          label: 'Performance View',
          icon: 'BarChart3',
          path: '/admin/ops/staff/performance',
          requiredPermission: 'staff_management.view'
        }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      order: 4,
      items: [
        {
          id: 'order-alerts',
          label: 'Order Alerts',
          icon: 'Bell',
          path: '/admin/ops/alerts',
          requiredPermission: 'orders_view.view'
        }
      ]
    }
  ],

  // Finance Manager Menu Tree
  tenant_finance_manager: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'finance-overview',
          label: 'Finance Overview',
          icon: 'DollarSign',
          path: '/admin/finance/dashboard',
          requiredPermission: 'payments_earnings.view'
        }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      order: 2,
      items: [
        {
          id: 'earnings',
          label: 'Earnings',
          icon: 'TrendingUp',
          path: '/admin/finance/earnings',
          requiredPermission: 'payments_earnings.view'
        },
        {
          id: 'refund-requests',
          label: 'Refund Requests',
          icon: 'RotateCcw',
          path: '/admin/finance/refunds',
          requiredPermission: 'refund_requests.view'
        },
        {
          id: 'transaction-history',
          label: 'Transaction History',
          icon: 'Receipt',
          path: '/admin/finance/transactions',
          requiredPermission: 'payments_earnings.view'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      order: 3,
      items: [
        {
          id: 'revenue-reports',
          label: 'Revenue Reports',
          icon: 'BarChart',
          path: '/admin/finance/reports/revenue',
          requiredPermission: 'reports_analytics.view'
        },
        {
          id: 'tax-reports',
          label: 'Tax Reports',
          icon: 'FileText',
          path: '/admin/finance/reports/tax',
          requiredPermission: 'reports_analytics.view'
        }
      ]
    },
    {
      id: 'invoices',
      label: 'Invoices',
      order: 4,
      items: [
        {
          id: 'download-invoices',
          label: 'Download Invoices',
          icon: 'Download',
          path: '/admin/finance/invoices',
          requiredPermission: 'payments_earnings.view'
        }
      ]
    }
  ],

  // Staff Menu Tree
  tenant_staff: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      order: 1,
      items: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          icon: 'CheckSquare',
          path: '/staff/dashboard',
          requiredPermission: 'orders_view.view'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      order: 2,
      items: [
        {
          id: 'assigned-orders',
          label: 'Assigned Orders',
          icon: 'ShoppingBag',
          path: '/staff/orders',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'update-status',
          label: 'Update Status',
          icon: 'RefreshCw',
          path: '/staff/orders/status',
          requiredPermission: 'orders_update_status.edit'
        },
        {
          id: 'add-notes',
          label: 'Add Notes',
          icon: 'MessageSquare',
          path: '/staff/orders/notes',
          requiredPermission: 'orders_update_status.edit'
        }
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      order: 3,
      items: [
        {
          id: 'view-profile',
          label: 'View Profile',
          icon: 'User',
          path: '/staff/profile',
          requiredPermission: 'orders_view.view'
        },
        {
          id: 'change-password',
          label: 'Change Password',
          icon: 'Lock',
          path: '/staff/profile/password',
          requiredPermission: 'orders_view.view'
        }
      ]
    }
  ]
};

// Customer & Guest Menus
export const CUSTOMER_MENUS: MenuSection[] = [
  {
    id: 'home',
    label: 'Home',
    order: 1,
    items: [
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: 'Store',
        path: '/marketplace',
        requiredPermission: 'browse_marketplace.view'
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: 'Tag',
        path: '/offers',
        requiredPermission: 'browse_marketplace.view'
      }
    ]
  },
  {
    id: 'orders',
    label: 'My Orders',
    order: 2,
    requiredRole: ['customer'],
    items: [
      {
        id: 'active-orders',
        label: 'Active Orders',
        icon: 'ShoppingBag',
        path: '/customer/orders/active',
        requiredPermission: 'order_tracking.view'
      },
      {
        id: 'order-tracking',
        label: 'Order Tracking',
        icon: 'MapPin',
        path: '/customer/orders/track',
        requiredPermission: 'order_tracking.view'
      },
      {
        id: 'order-history',
        label: 'Order History',
        icon: 'History',
        path: '/customer/orders/history',
        requiredPermission: 'order_tracking.view'
      }
    ]
  },
  {
    id: 'place-order',
    label: 'Place Order',
    order: 3,
    requiredRole: ['customer'],
    items: [
      {
        id: 'select-services',
        label: 'Select Services',
        icon: 'Wrench',
        path: '/customer/order/services',
        requiredPermission: 'place_order.create'
      },
      {
        id: 'pickup-schedule',
        label: 'Pickup Schedule',
        icon: 'Calendar',
        path: '/customer/order/schedule',
        requiredPermission: 'place_order.create'
      },
      {
        id: 'apply-coupon',
        label: 'Apply Coupon',
        icon: 'Tag',
        path: '/customer/order/coupon',
        requiredPermission: 'apply_coupon.create'
      },
      {
        id: 'checkout',
        label: 'Checkout',
        icon: 'CreditCard',
        path: '/customer/order/checkout',
        requiredPermission: 'payments.create'
      }
    ]
  }
];

export const GUEST_MENUS: MenuSection[] = [
  {
    id: 'home',
    label: 'Home',
    order: 1,
    items: [
      {
        id: 'browse-laundries',
        label: 'Browse Laundries',
        icon: 'Store',
        path: '/browse',
        requiredPermission: 'browse_marketplace.view'
      },
      {
        id: 'search',
        label: 'Search',
        icon: 'Search',
        path: '/search',
        requiredPermission: 'browse_marketplace.view'
      },
      {
        id: 'offers',
        label: 'Offers',
        icon: 'Tag',
        path: '/offers',
        requiredPermission: 'browse_marketplace.view'
      }
    ]
  },
  {
    id: 'laundry',
    label: 'Laundry Page',
    order: 2,
    items: [
      {
        id: 'services',
        label: 'Services',
        icon: 'Wrench',
        path: '/laundry/:id/services',
        requiredPermission: 'view_laundry_store.view'
      },
      {
        id: 'pricing',
        label: 'Pricing',
        icon: 'DollarSign',
        path: '/laundry/:id/pricing',
        requiredPermission: 'view_laundry_store.view'
      }
    ]
  },
  {
    id: 'auth',
    label: 'Authentication',
    order: 3,
    items: [
      {
        id: 'login',
        label: 'Login',
        icon: 'LogIn',
        path: '/auth/login'
      },
      {
        id: 'register',
        label: 'Register',
        icon: 'UserPlus',
        path: '/auth/register'
      }
    ]
  }
];

/**
 * Get menu sections for a specific role
 * @param userRole - User's role slug
 * @param userType - 'platform' | 'tenant' | 'customer' | 'guest'
 * @returns MenuSection[] - Array of menu sections for the role
 */
export function getMenusForRole(userRole: string, userType: 'platform' | 'tenant' | 'customer' | 'guest'): MenuSection[] {
  switch (userType) {
    case 'platform':
      return PLATFORM_MENUS[userRole] || [];
    case 'tenant':
      return TENANT_MENUS[userRole] || [];
    case 'customer':
      return CUSTOMER_MENUS;
    case 'guest':
      return GUEST_MENUS;
    default:
      return [];
  }
}

/**
 * Check if user has permission to access a menu item
 * @param item - Menu item to check
 * @param userPermissions - Array of user's permissions
 * @param userRole - User's role
 * @param userFeatures - User's enabled features (for feature flags)
 * @returns boolean - Whether user can access the menu item
 */
export function hasMenuAccess(
  item: MenuItem, 
  userPermissions: string[], 
  userRole: string,
  userFeatures?: Record<string, boolean | number>
): boolean {
  // Check role requirement
  if (item.requiredRole && !item.requiredRole.includes(userRole)) {
    return false;
  }
  
  // Check permission requirement
  if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
    return false;
  }
  
  // Check feature requirement (for subscription-based features)
  if (item.requiredFeature && userFeatures) {
    const featureValue = userFeatures[item.requiredFeature];
    if (!featureValue || featureValue === false || featureValue === 0) {
      return false;
    }
  }
  
  return true;
}

/**
 * Filter menu sections based on user permissions and role
 * @param sections - Menu sections to filter
 * @param userPermissions - Array of user's permissions
 * @param userRole - User's role
 * @param userFeatures - User's enabled features
 * @returns MenuSection[] - Filtered menu sections
 */
export function filterMenusByPermissions(
  sections: MenuSection[],
  userPermissions: string[],
  userRole: string,
  userFeatures?: Record<string, boolean | number>
): MenuSection[] {
  return sections
    .filter(section => {
      // Check if section has role requirement
      if (section.requiredRole && !section.requiredRole.includes(userRole)) {
        return false;
      }
      return true;
    })
    .map(section => ({
      ...section,
      items: filterMenuItems(section.items, userPermissions, userRole, userFeatures)
    }))
    .filter(section => section.items.length > 0); // Remove empty sections
}

/**
 * Recursively filter menu items based on permissions
 * @param items - Menu items to filter
 * @param userPermissions - Array of user's permissions
 * @param userRole - User's role
 * @param userFeatures - User's enabled features
 * @returns MenuItem[] - Filtered menu items
 */
function filterMenuItems(
  items: MenuItem[],
  userPermissions: string[],
  userRole: string,
  userFeatures?: Record<string, boolean | number>
): MenuItem[] {
  return items
    .filter(item => hasMenuAccess(item, userPermissions, userRole, userFeatures))
    .map(item => ({
      ...item,
      children: item.children 
        ? filterMenuItems(item.children, userPermissions, userRole, userFeatures)
        : undefined
    }))
    .filter(item => !item.children || item.children.length > 0); // Remove items with empty children
}