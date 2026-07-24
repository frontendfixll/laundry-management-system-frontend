'use client'

// SuperAdmin settings hook — React Query.
// Three parallel queries (settings, profile, system info) drive the read state;
// three mutations (update settings / update profile / change password) write
// back. Each mutation invalidates the relevant query so subsequent reads see
// fresh data without manual setState patching.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '@/lib/superAdminApi'

export interface SystemSettings {
  general: {
    systemName: string
    timezone: string
    currency: string
    language: string
    dateFormat: string
    timeFormat: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    lockoutDuration: number
    passwordMinLength: number
    requireMFA: boolean
    allowMultipleSessions: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    orderUpdates: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
  }
  business: {
    operatingHours: {
      start: string
      end: string
    }
    workingDays: string[]
    defaultPickupTime: number
    defaultDeliveryTime: number
    maxOrdersPerDay: number
    autoAssignOrders: boolean
  }
  integrations: {
    paymentGateway: {
      enabled: boolean
      provider: string
      testMode: boolean
    }
    smsGateway: {
      enabled: boolean
      provider: string
    }
    emailService: {
      enabled: boolean
      provider: string
    }
  }
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: string
  permissions: Record<string, boolean>
  mfaEnabled: boolean
  lastLogin?: string
  createdAt: string
}

export interface SystemInfo {
  version: string
  environment: string
  uptime: number
  memory: any
  platform: string
  nodeVersion: string
  database: {
    status: string
    name: string
  }
  features: Record<string, boolean>
}

const SETTINGS_KEY = ['superadmin', 'settings'] as const
const PROFILE_KEY = ['superadmin', 'profile'] as const
const SYSTEM_INFO_KEY = ['superadmin', 'system-info'] as const

const settingsQueryDefaults = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  retry: (count: number, err: any) => {
    const status = err?.response?.status
    if (status >= 400 && status < 500) return false
    return count < 2
  },
} as const

export function useSettings() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async (): Promise<SystemSettings | null> => {
      const response: any = await superAdminApi.getSystemSettings()
      return response?.data?.settings ?? null
    },
    ...settingsQueryDefaults,
  })

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async (): Promise<AdminProfile | null> => {
      const response: any = await superAdminApi.getProfileSettings()
      return response?.data?.profile ?? null
    },
    ...settingsQueryDefaults,
  })

  const systemInfoQuery = useQuery({
    queryKey: SYSTEM_INFO_KEY,
    queryFn: async (): Promise<SystemInfo | null> => {
      const response: any = await superAdminApi.getSystemInfo()
      return response?.data?.systemInfo ?? null
    },
    ...settingsQueryDefaults,
  })

  const updateSettingsMutation = useMutation({
    mutationFn: ({ category, updatedSettings }: { category: string; updatedSettings: any }) =>
      superAdminApi.updateSystemSettings(category, updatedSettings),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<AdminProfile>) =>
      superAdminApi.updateProfile(profileData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  })

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      superAdminApi.changePassword({ currentPassword, newPassword }),
  })

  const updating =
    updateSettingsMutation.isPending ||
    updateProfileMutation.isPending ||
    changePasswordMutation.isPending

  // Surface the most relevant error: prefer mutation error (recent action),
  // fall back to read-query error (initial load failure).
  const error =
    updateSettingsMutation.error?.message ??
    updateProfileMutation.error?.message ??
    changePasswordMutation.error?.message ??
    settingsQuery.error?.message ??
    null

  return {
    settings: settingsQuery.data ?? null,
    profile: profileQuery.data ?? null,
    systemInfo: systemInfoQuery.data ?? null,
    loading: settingsQuery.isPending,
    updating,
    error,
    updateSettings: async (category: string, updatedSettings: any) => {
      const response: any = await updateSettingsMutation.mutateAsync({ category, updatedSettings })
      return response?.data
    },
    updateProfile: async (profileData: Partial<AdminProfile>) => {
      const response: any = await updateProfileMutation.mutateAsync(profileData)
      return response?.data
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      const response: any = await changePasswordMutation.mutateAsync({ currentPassword, newPassword })
      return response?.data
    },
    refetch: async () => {
      await Promise.all([
        settingsQuery.refetch(),
        profileQuery.refetch(),
        systemInfoQuery.refetch(),
      ])
    },
  }
}
