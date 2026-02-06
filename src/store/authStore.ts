import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole =
  | 'customer'
  | 'admin'
  | 'branch_admin'
  | 'staff'
  | 'superadmin'
  | 'super_admin'
  | 'platform_support'
  | 'platform_finance'
  | 'platform_auditor'
  | 'tenant_owner'
  | 'tenant_admin'
  | 'tenant_ops_manager'
  | 'tenant_finance_manager'
  | 'tenant_staff'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  isActive: boolean
  isVIP?: boolean
  assignedBranch?: string
  permissions?: Record<string, Record<string, boolean>>
  features?: Record<string, boolean | number> // Features from tenancy subscription
  tenancy?: {
    _id?: string
    subscription?: {
      plan?: string
      status?: string
      features?: Record<string, boolean | number>
      trialEndsAt?: string
    }
  }
  subscription?: {
    plan?: string
    status?: string
    features?: Record<string, boolean | number>
    trialEndsAt?: string
  }
}

interface AuthState {
  user: User | null
  token: string | null  // Keep for backward compatibility, but cookie is primary
  isAuthenticated: boolean
  _hasHydrated: boolean
  sidebarCollapsed: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setHasHydrated: (state: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  refreshUserData: () => Promise<void>
  handlePermissionUpdate: (updates: { permissions?: any, features?: any, role?: UserRole }) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      sidebarCollapsed: false,
      setAuth: (user, token) => {
        console.log('🔥 Setting auth in store with user:', {
          name: user.name,
          email: user.email,
          supportPermissions: user.permissions?.support
        })

        console.log('🔥 Full user permissions being set:', JSON.stringify(user.permissions, null, 2))

        // Store token in localStorage for API calls
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          console.log('🔥 Token saved to localStorage')
        }

        // Token is now stored in HTTP-only cookie by backend
        // We keep token in state for backward compatibility but cookie is primary
        set({ user, token, isAuthenticated: true })

        console.log('🔥 Auth set complete, checking store state...')
        const currentState = get()
        console.log('🔥 Current store support permissions:', currentState.user?.permissions?.support)
      },
      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          console.log('🔥 Token removed from localStorage')
        }
        // Cookie will be cleared by backend on logout API call
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },
      refreshUserData: async () => {
        try {
          console.log('🔄 Refreshing user data...');

          // Get the backend API URL
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

          // Get token from current state
          const currentState = get();
          const token = currentState.token;

          console.log('🔄 Using token for refresh:', token ? 'Found' : 'Not found');

          // Call profile API to get latest user data (includes tenancy features)
          const response = await fetch(`${apiUrl}/auth/profile`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              // Add Authorization header if token exists
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });

          console.log('🔄 Profile API response status:', response.status);

          if (!response.ok) {
            if (response.status === 401) {
              console.log('🔐 Authentication expired during refresh');
              // Don't throw error, just log it
              return;
            }

            const errorText = await response.text();
            console.log('❌ Profile API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }

          const data = await response.json();
          console.log('🔄 Profile API response data:', {
            success: data.success,
            hasData: !!data.data,
            dataKeys: data.data ? Object.keys(data.data) : []
          });

          if (data.success && data.data) {
            const updatedUserData = data.data;
            console.log('✅ User data refreshed:', {
              id: updatedUserData.id,
              email: updatedUserData.email,
              permissionModules: Object.keys(updatedUserData.permissions || {}).length,
              featureCount: Object.keys(updatedUserData.features || {}).length,
              tenancyId: updatedUserData.tenancy?._id,
              tenancyName: updatedUserData.tenancy?.name
            });

            // Update user in store with the complete data structure
            set((state) => ({
              user: state.user ? {
                ...state.user,
                permissions: updatedUserData.permissions || {},
                features: updatedUserData.features || {},
                tenancy: updatedUserData.tenancy,
                // Update other fields that might have changed
                name: updatedUserData.name,
                phone: updatedUserData.phone,
                isEmailVerified: updatedUserData.isEmailVerified,
                phoneVerified: updatedUserData.phoneVerified,
                role: updatedUserData.role // Update role as well
              } : null
            }));

            console.log('🔄 User data updated in store');

            // Trigger custom event for components to react to permission changes
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('userDataRefreshed', {
                detail: {
                  permissions: updatedUserData.permissions,
                  features: updatedUserData.features,
                  role: updatedUserData.role
                }
              }));
            }
          } else {
            throw new Error(data.message || 'Failed to refresh user data');
          }
        } catch (error) {
          console.error('❌ Failed to refresh user data:', error);

          // Don't throw error if it's a network issue or auth issue
          if (error instanceof TypeError && error.message.includes('fetch')) {
            console.log('🌐 Network error during refresh, will retry later');
            return;
          }

          // If it's a 401, don't throw - let the auth guard handle it
          if (error.message && error.message.includes('401')) {
            console.log('🔐 Authentication error during refresh, auth guard will handle');
            return;
          }

          throw error;
        }
      },

      // New method to handle real-time permission updates WITHOUT causing re-renders
      handlePermissionUpdate: (updates: { permissions?: any, features?: any, role?: UserRole }) => {
        console.log('🔄 Handling real-time permission update:', updates);

        const currentState = get();
        if (!currentState.user) {
          console.log('⚠️ No user in store, skipping permission update');
          return;
        }

        // Check if permissions actually changed to prevent unnecessary updates
        const oldPermissions = JSON.stringify(currentState.user.permissions || {});
        const oldFeatures = JSON.stringify(currentState.user.features || {});
        const oldRole = currentState.user.role;

        const newPermissions = JSON.stringify(updates.permissions || currentState.user.permissions || {});
        const newFeatures = JSON.stringify(updates.features || currentState.user.features || {});
        const newRole = updates.role || currentState.user.role;

        // Only update if something actually changed
        const permissionsChanged = oldPermissions !== newPermissions;
        const featuresChanged = oldFeatures !== newFeatures;
        const roleChanged = oldRole !== newRole;

        if (!permissionsChanged && !featuresChanged && !roleChanged) {
          console.log('⚠️ No actual changes detected, skipping store update to prevent re-render');
          return;
        }

        console.log('✅ Changes detected:', { permissionsChanged, featuresChanged, roleChanged });

        // Use a batched update to minimize re-renders
        set((state) => {
          if (!state.user) return state;

          const updatedUser = {
            ...state.user,
            ...(updates.permissions && { permissions: updates.permissions }),
            ...(updates.features && { features: updates.features }),
            ...(updates.role && { role: updates.role })
          };

          // Also update localStorage token if needed (for API calls)
          if (typeof window !== 'undefined' && state.token) {
            try {
              // Create a new token with updated permissions (if we had token creation logic)
              // For now, we'll rely on the backend to handle token refresh
              console.log('🔄 Token in localStorage may need refresh for API calls');
            } catch (error) {
              console.warn('Failed to update token in localStorage:', error);
            }
          }

          return {
            ...state,
            user: updatedUser
          };
        });

        console.log('✅ Real-time permission update applied with minimal re-renders');

        // Trigger custom event for components that need to react (like sidebar)
        // Use setTimeout to ensure the event fires after the store update
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('permissionsUpdated', {
              detail: {
                permissions: updates.permissions,
                features: updates.features,
                role: updates.role,
                changed: { permissionsChanged, featuresChanged, roleChanged },
                source: 'realtime_sync'
              }
            }));
          }
        }, 0);
      }
    }),
    {
      name: 'laundry-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // console.log('🔥 Auth store rehydrated with state:', {
        //   hasUser: !!state?.user,
        //   userEmail: state?.user?.email,
        //   supportPermissions: state?.user?.permissions?.support
        // })
        state?.setHasHydrated(true)

        // Expose updateUser function globally for WebSocket access
        if (typeof window !== 'undefined') {
          (window as any).__updateAuthStore = (userData: Partial<User>) => {
            // console.log('🔥 Global auth store update called with:', userData);
            state?.updateUser(userData);
          };
          // console.log('🌐 Exposed __updateAuthStore globally');
        }
      }
    }
  )
)
