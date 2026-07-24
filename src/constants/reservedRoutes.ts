// Path segments that should never be treated as a tenant slug when parsing
// the first segment of pathname. Used by layout components for slug detection.
// Note: middleware.ts maintains its own (longer) list because it must also
// guard backend/static segments — keep them in sync if you add a top-level route.
export const TENANT_RESERVED_SEGMENTS: readonly string[] = [
  'customer',
  'admin',
  'auth',
  'api',
  'login',
  'register',
  '_next',
  'static',
]
