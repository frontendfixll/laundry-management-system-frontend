// Tenant branding hook — React Query.
// `loading` reflects the read query; `saving` reflects whether ANY mutation
// is currently in flight (preserves the original two-loading-state contract
// since callers use them differently — e.g. show a skeleton on `loading`,
// disable the Save button on `saving`).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export type LandingPageTemplate = 'original' | 'minimal' | 'freshspin' | 'starter'

export interface BrandingData {
  logo?: string
  logoUrl?: string
  businessName?: string
  tagline?: string
  slogan?: string
  secondaryLogo?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  landingPageTemplate?: LandingPageTemplate
  customCss?: string
}

export interface TenancyBranding {
  branding: {
    businessName?: string
    tagline?: string
    slogan?: string
    logo?: { url?: string; publicId?: string }
    secondaryLogo?: { url?: string; publicId?: string }
    favicon?: { url?: string; publicId?: string }
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
      youtube?: string
      whatsapp?: string
    }
    theme?: {
      primaryColor?: string
      secondaryColor?: string
      accentColor?: string
      fontFamily?: string
      layout?: string
    }
    landingPageTemplate?: LandingPageTemplate
    customCss?: string
  }
  name: string
  slug: string
  subdomain: string
  customDomain?: string
}

const BRANDING_KEY = ['admin', 'branding'] as const

async function fileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useBranding() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: BRANDING_KEY,
    queryFn: async (): Promise<TenancyBranding | null> => {
      const response = await api.get('/admin/tenancy/branding')
      return response.data?.data ?? null
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (count, err: any) => {
      const status = err?.response?.status
      if (status >= 400 && status < 500) return false
      return count < 2
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BRANDING_KEY })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BrandingData>) =>
      api.put('/admin/tenancy/branding', {
        branding: {
          businessName: data.businessName,
          tagline: data.tagline,
          slogan: data.slogan,
          socialMedia: data.socialMedia,
          theme: {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            accentColor: data.accentColor,
            fontFamily: data.fontFamily,
          },
          landingPageTemplate: data.landingPageTemplate || 'original',
          customCss: data.customCss || '',
        },
      }),
    onSuccess: () => {
      invalidate()
      toast.success('Branding updated successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to update branding')
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file)
      await api.patch('/admin/tenancy/branding/logo', {
        url: base64,
        publicId: `logo_${Date.now()}`,
      })
      return base64
    },
    onSuccess: () => {
      invalidate()
      toast.success('Logo uploaded successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to upload logo')
    },
  })

  const uploadSecondaryLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const base64 = await fileToBase64(file)
      await api.put('/admin/tenancy/branding', {
        branding: {
          secondaryLogo: {
            url: base64,
            publicId: `secondary_logo_${Date.now()}`,
          },
        },
      })
      return base64
    },
    onSuccess: () => {
      invalidate()
      toast.success('Secondary logo uploaded successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to upload secondary logo')
    },
  })

  const removeLogoMutation = useMutation({
    mutationFn: () =>
      api.patch('/admin/tenancy/branding/logo', { url: '', publicId: '' }),
    onSuccess: () => {
      invalidate()
      toast.success('Logo removed successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to remove logo')
    },
  })

  const saving =
    updateMutation.isPending ||
    uploadLogoMutation.isPending ||
    uploadSecondaryLogoMutation.isPending ||
    removeLogoMutation.isPending

  return {
    branding: query.data ?? null,
    loading: query.isPending,
    saving,
    error: query.error ? (query.error.message ?? null) : null,
    updateBranding: async (data: Partial<BrandingData>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync(data)
        return true
      } catch {
        return false
      }
    },
    uploadLogo: async (file: File): Promise<string | null> => {
      try {
        return await uploadLogoMutation.mutateAsync(file)
      } catch {
        return null
      }
    },
    uploadSecondaryLogo: async (file: File): Promise<string | null> => {
      try {
        return await uploadSecondaryLogoMutation.mutateAsync(file)
      } catch {
        return null
      }
    },
    removeLogo: async (): Promise<boolean> => {
      try {
        await removeLogoMutation.mutateAsync()
        return true
      } catch {
        return false
      }
    },
    refetch: async () => { await query.refetch() },
  }
}
