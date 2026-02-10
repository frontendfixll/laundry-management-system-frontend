'use client'

import { useParams, useRouter } from 'next/navigation'
import { TenantProvider } from '@/contexts/TenantContext'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePreviewStore } from '@/store/previewStore'
import TemplateHeader from '@/components/layout/TemplateHeader'

interface TenantBranding {
  name: string
  slug: string
  subdomain: string
  customDomain?: string
  landingPageTemplate: string
  branding: {
    logo?: { url?: string }
    secondaryLogo?: { url?: string }
    theme?: {
      primaryColor?: string
      secondaryColor?: string
      accentColor?: string
      fontFamily?: string
    }
    landingPageTemplate?: string
    businessName?: string
    tagline?: string
    slogan?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
      linkedin?: string
      youtube?: string
      whatsapp?: string
    }
  }
  contact: {
    email?: string
    phone?: string
    whatsapp?: string
  }
  branches?: Array<any>
  tenancyId?: string
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const router = useRouter()
  const tenant = params?.tenant as string
  const { user } = useAuthStore()
  const { isAdminPreviewMode } = usePreviewStore()
  const [tenantData, setTenantData] = useState<TenantBranding | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchTenantBranding = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        console.log('🏪 [TenantLayout] Fetching tenant branding for:', tenant)
        const response = await fetch(`${apiUrl}/public/tenancy/branding/${tenant}`)

        const data = await response.json()
        console.log('🏪 [TenantLayout] Tenant branding response:', data)

        if (!response.ok || !data.success) {
          setError('not_found')
          return
        }

        setTenantData(data.data)

        // Save tenant slug to sessionStorage for auth pages to use
        console.log('🏪 [TenantLayout] Saving tenant to sessionStorage:', tenant)
        sessionStorage.setItem('lastVisitedTenant', tenant as string)
      } catch (err) {
        console.error('🏪 [TenantLayout] Error fetching tenant branding:', err)
        setError('Failed to load')
      } finally {
        setLoading(false)
      }
    }

    if (tenant) {
      fetchTenantBranding()
    }
  }, [tenant])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {tenant}...</p>
        </div>
      </div>
    )
  }

  // Error state - Not found
  if (error || !tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-2">Laundry not found</p>
          <p className="text-gray-500 mb-8">
            The laundry "<strong>{tenant}</strong>" doesn't exist or is not active.
            <br />
            <span className="text-xs text-red-400">Error: {error || 'None'} | API: {process.env.NEXT_PUBLIC_API_URL || 'Default: 5000'}</span>
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  // Get template - prioritize branding.landingPageTemplate
  const rawTemplate = tenantData.branding?.landingPageTemplate || tenantData.landingPageTemplate || 'original'
  const template = rawTemplate.toLowerCase().replace(/\s+/g, '')

  return (
    <TenantProvider
      tenant={{
        name: tenantData.name,
        slug: tenantData.slug,
        logo: tenantData.branding?.logo?.url,
        secondaryLogo: tenantData.branding?.secondaryLogo?.url,
        businessName: tenantData.branding?.businessName || tenantData.name,
        tagline: tenantData.branding?.tagline,
        slogan: tenantData.branding?.slogan,
        socialMedia: tenantData.branding?.socialMedia,
        primaryColor: tenantData.branding?.theme?.primaryColor,
        secondaryColor: tenantData.branding?.theme?.secondaryColor,
        accentColor: tenantData.branding?.theme?.accentColor,
        landingPageTemplate: template,
        contact: tenantData.contact,
        branches: tenantData.branches,
        tenancyId: tenantData.tenancyId,
      }}
      isTenantPage={true}
    >
      <TemplateHeader />
      {children}
    </TenantProvider>
  )
}
