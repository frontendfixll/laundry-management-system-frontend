'use client'

import { useAuthStore } from '@/store/authStore';
import { useMemo, useEffect, ReactNode } from 'react';

/**
 * Permission structure based on backend User model
 */
export interface Permission {
  module: string;
  action: string;
}

export interface PermissionModule {
  view?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  assign?: boolean;
  cancel?: boolean;
  process?: boolean;
  assignShift?: boolean;
  manageAttendance?: boolean;
  restock?: boolean;
  writeOff?: boolean;
  toggle?: boolean;
  updatePricing?: boolean;
  track?: boolean;
  resolve?: boolean;
  escalate?: boolean;
  export?: boolean;
  manage?: boolean;
}

/**
 * Hook to check user permissions for RBAC
 * Permissions control what actions a user can perform within available features
 */
export function usePermissions() {
  const { user, updateUser } = useAuthStore();

  // Permissions are now synced globally by useSocketIONotifications
  // which updates the auth store directly when permission_sync events occur.

  // Get permissions from user
  const permissions = useMemo(() => {
    const userPermissions = user?.permissions;

    console.log('🔍 Permissions debug:', {
      userRole: user?.role,
      hasPermissions: !!userPermissions,
      permissionModules: userPermissions ? Object.keys(userPermissions) : [],
      userPermissions
    });

    // If no permissions found, provide empty object
    if (!userPermissions || Object.keys(userPermissions).length === 0) {
      console.log('🔐 No permissions found, using empty permissions');
      return {};
    }

    return userPermissions;
  }, [user?.permissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (module: string, action: string): boolean => {
    // Enhanced debug logging
    console.log(`🔐 hasPermission called: ${module}.${action}`);
    console.log(`🔐 User role: ${user?.role}`);
    console.log(`🔐 Is SuperAdmin: ${user?.role === 'superadmin'}`);

    // SuperAdmin has all permissions
    if (user?.role === 'superadmin') {
      console.log(`🔐 SuperAdmin bypass: ${module}.${action} = true (BYPASSED - SuperAdmin has all permissions)`);
      return true;
    }

    // Check if user has the specific permission
    const modulePermissions = permissions[module] as PermissionModule;
    if (!modulePermissions) {
      console.log(`🔐 Module '${module}' not found in permissions - available modules:`, Object.keys(permissions));
      return false;
    }

    const hasAccess = modulePermissions[action as keyof PermissionModule] === true;

    console.log(`🔐 Permission check result: ${module}.${action} = ${hasAccess}`);
    console.log(`🔐 Module permissions for ${module}:`, modulePermissions);

    return hasAccess;
  };

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    return permissionList.some(permission =>
      hasPermission(permission.module, permission.action)
    );
  };

  /**
   * Check if user has all of the specified permissions (AND logic)
   */
  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    return permissionList.every(permission =>
      hasPermission(permission.module, permission.action)
    );
  };

  /**
   * Get all permissions for a specific module
   */
  const getModulePermissions = (module: string): PermissionModule => {
    return (permissions[module] as PermissionModule) || {};
  };

  /**
   * Check if user can perform any action in a module
   */
  const canAccessModule = (module: string): boolean => {
    const modulePermissions = getModulePermissions(module);
    return Object.values(modulePermissions).some(permission => permission === true);
  };

  /**
   * Get user role
   */
  const userRole = useMemo(() => {
    return user?.role || 'customer';
  }, [user?.role]);

  /**
   * Check if user is admin or higher
   */
  const isAdmin = useMemo(() => {
    return ['admin', 'superadmin'].includes(userRole);
  }, [userRole]);

  /**
   * Check if user is superadmin
   */
  const isSuperAdmin = useMemo(() => {
    return userRole === 'superadmin';
  }, [userRole]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getModulePermissions,
    canAccessModule,
    userRole,
    isAdmin,
    isSuperAdmin,
  };
}

/**
 * Permission Gate Component for conditional rendering
 */
interface PermissionGateProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, requires ALL permissions (AND logic), otherwise ANY (OR logic)
}

export function PermissionGate({
  permissions,
  children,
  fallback = null,
  requireAll = false
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermissions();

  // SuperAdmin bypasses all permission checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Check permissions based on requireAll flag
  const hasAccess = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[],
  requireAll = false
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate permissions={requiredPermissions} requireAll={requireAll}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Permission constants for common use cases
 */
export const PERMISSIONS = {
  // Orders
  ORDERS_VIEW: { module: 'orders', action: 'view' },
  ORDERS_CREATE: { module: 'orders', action: 'create' },
  ORDERS_UPDATE: { module: 'orders', action: 'update' },
  ORDERS_DELETE: { module: 'orders', action: 'delete' },
  ORDERS_ASSIGN: { module: 'orders', action: 'assign' },
  ORDERS_CANCEL: { module: 'orders', action: 'cancel' },
  ORDERS_PROCESS: { module: 'orders', action: 'process' },

  // Staff
  STAFF_VIEW: { module: 'staff', action: 'view' },
  STAFF_CREATE: { module: 'staff', action: 'create' },
  STAFF_UPDATE: { module: 'staff', action: 'update' },
  STAFF_DELETE: { module: 'staff', action: 'delete' },

  // Inventory
  INVENTORY_VIEW: { module: 'inventory', action: 'view' },
  INVENTORY_CREATE: { module: 'inventory', action: 'create' },
  INVENTORY_UPDATE: { module: 'inventory', action: 'update' },
  INVENTORY_DELETE: { module: 'inventory', action: 'delete' },

  // Services
  SERVICES_VIEW: { module: 'services', action: 'view' },
  SERVICES_CREATE: { module: 'services', action: 'create' },
  SERVICES_UPDATE: { module: 'services', action: 'update' },
  SERVICES_DELETE: { module: 'services', action: 'delete' },

  // Customers
  CUSTOMERS_VIEW: { module: 'customers', action: 'view' },
  CUSTOMERS_CREATE: { module: 'customers', action: 'create' },
  CUSTOMERS_UPDATE: { module: 'customers', action: 'update' },
  CUSTOMERS_DELETE: { module: 'customers', action: 'delete' },

  // Analytics
  ANALYTICS_VIEW: { module: 'analytics', action: 'view' },

  // Settings
  SETTINGS_VIEW: { module: 'settings', action: 'view' },
  SETTINGS_UPDATE: { module: 'settings', action: 'update' },

  // Support
  SUPPORT_VIEW: { module: 'support', action: 'view' },
  SUPPORT_CREATE: { module: 'support', action: 'create' },
  SUPPORT_UPDATE: { module: 'support', action: 'update' },
  SUPPORT_MANAGE: { module: 'support', action: 'manage' },

  // Tickets
  TICKETS_VIEW: { module: 'tickets', action: 'view' },
  TICKETS_CREATE: { module: 'tickets', action: 'create' },
  TICKETS_UPDATE: { module: 'tickets', action: 'update' },
  TICKETS_ASSIGN: { module: 'tickets', action: 'assign' },
  TICKETS_RESOLVE: { module: 'tickets', action: 'resolve' },

  // Financial permissions for finance dashboard
  PAYMENTS_REVENUE_VIEW: { module: 'payments_revenue', action: 'view' },
  PAYMENTS_REVENUE_EXPORT: { module: 'payments_revenue', action: 'export' },
  REFUNDS_VIEW: { module: 'refunds', action: 'view' },
  REFUNDS_CREATE: { module: 'refunds', action: 'create' },
  SUBSCRIPTION_PLANS_VIEW: { module: 'subscription_plans', action: 'view' },
} as const;