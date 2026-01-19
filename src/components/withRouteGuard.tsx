import { RouteGuard } from './RouteGuard'

interface RouteGuardConfig {
  module: string
  action: string
  feature?: string
  fallbackPath?: string
  showAccessDenied?: boolean
}

/**
 * Higher-order component to add route protection to admin pages
 * Usage: export default withRouteGuard(YourComponent, { module: 'customers', action: 'view' })
 */
export function withRouteGuard<T extends object>(
  Component: React.ComponentType<T>,
  config: RouteGuardConfig
) {
  const WrappedComponent = (props: T) => {
    return (
      <RouteGuard
        requiredPermission={{ module: config.module, action: config.action }}
        requiredFeature={config.feature}
        fallbackPath={config.fallbackPath}
        showAccessDenied={config.showAccessDenied}
      >
        <Component {...props} />
      </RouteGuard>
    )
  }

  WrappedComponent.displayName = `withRouteGuard(${Component.displayName || Component.name})`
  
  return WrappedComponent
}