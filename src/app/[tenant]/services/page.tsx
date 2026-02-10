'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTenant } from '@/contexts/TenantContext'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { useAuthStore } from '@/store/authStore'
import BookingModal from '@/components/BookingModal'
import { translations } from '@/lib/translations'
import BannerCarousel from '@/components/customer/BannerCarousel'

// Dynamic imports for template-specific services pages
const MinimalServicesTemplate = dynamic(() => import('@/components/services/MinimalServicesTemplate'), { ssr: false })
const FreshSpinServicesTemplate = dynamic(() => import('@/components/services/FreshSpinServicesTemplate'), { ssr: false })
const StarterServicesTemplate = dynamic(() => import('@/components/services/StarterServicesTemplate'), { ssr: false })

// Original template imports (inline - current design)
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shirt, Sparkles, Award, Package, Clock, Truck, Phone, CheckCircle } from 'lucide-react'

const services = [
  { id: 'wash-fold', name: 'Wash & Fold', icon: Shirt, description: 'Regular washing and folding', price: '₹25/item', features: ['Same day pickup', 'Eco-friendly'] },
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: Sparkles, description: 'Professional dry cleaning', price: '₹60/item', features: ['Expert care', 'Stain removal'] },
  { id: 'laundry', name: 'Laundry Service', icon: Package, description: 'Complete laundry service', price: '₹30/item', features: ['Full service', 'Quick turnaround'] },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', icon: Award, description: 'Professional shoe care', price: '₹80/pair', features: ['Deep cleaning', 'Polish'] },
  { id: 'express', name: 'Express Service', icon: Clock, description: 'Same-day delivery', price: '₹45/item', features: ['4-6 hour delivery', 'Priority'] }
]

type LandingPageTemplate = 'original' | 'minimal' | 'freshspin' | 'starter'

interface TenantBranding {
  name: string
  slug: string
  landingPageTemplate: LandingPageTemplate
  branding: {
    logo?: { url?: string }
    landingPageTemplate?: LandingPageTemplate
    theme?: {
      primaryColor?: string
      secondaryColor?: string
      accentColor?: string
    }
    tagline?: string
  }
}

// Map hex colors to theme color names
function mapHexToThemeColor(hex?: string): ThemeColor {
  if (!hex) return 'teal'
  const lowerHex = hex.toLowerCase()
  if (lowerHex.includes('14b8a6') || lowerHex.includes('0d9488') || lowerHex.includes('2dd4bf')) return 'teal'
  if (lowerHex.includes('3b82f6') || lowerHex.includes('2563eb') || lowerHex.includes('60a5fa')) return 'blue'
  if (lowerHex.includes('8b5cf6') || lowerHex.includes('7c3aed') || lowerHex.includes('a78bfa')) return 'purple'
  if (lowerHex.includes('f97316') || lowerHex.includes('ea580c') || lowerHex.includes('fb923c')) return 'orange'
  return 'teal'
}

export default function TenantServicesPage() {
  const params = useParams()
  const router = useRouter()
  const tenantSlug = params?.tenant as string
  const { isAuthenticated } = useAuthStore()
  const { tenant: tenantData } = useTenant()

  const [showBookingModal, setShowBookingModal] = useState(false)
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const [language, setLanguage] = useState<Language>('en')

  const theme = getThemeColors(themeColor, scheme)
  const t = (key: string) => translations[language]?.[key] || translations['en'][key] || key

  // Update theme color when tenant data changes
  useEffect(() => {
    if (tenantData?.primaryColor) {
      setThemeColor(mapHexToThemeColor(tenantData.primaryColor))
    }
  }, [tenantData])

  // Load user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const s = localStorage.getItem('landing_scheme') as SchemeMode
      const l = localStorage.getItem('landing_language') as Language
      if (s) setScheme(s)
      if (l) setLanguage(l)
    }
  }, [])

  // Listen for scheme changes
  useEffect(() => {
    const h = (e: CustomEvent<{ scheme: string }>) => setScheme(e.detail.scheme as SchemeMode)
    window.addEventListener('schemeChange', h as EventListener)
    return () => window.removeEventListener('schemeChange', h as EventListener)
  }, [])

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push(`/${tenantSlug}?openBooking=true`)
      return
    }
    setShowBookingModal(true)
  }

  // Loading state
  if (!tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.pageBg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: theme.accent }}></div>
          <p style={{ color: theme.textSecondary }}>Loading services...</p>
        </div>
      </div>
    )
  }

  // Get template type - prioritize branding.landingPageTemplate
  const rawTemplate = tenantData.landingPageTemplate || 'original'
  const template = rawTemplate.toLowerCase().replace(/\s+/g, '') as LandingPageTemplate

  // Common props for all templates
  const templateProps = {
    theme,
    t,
    onBookNow: handleBookNow,
    tenantTagline: tenantData.tagline,
  }

  // Render template-specific services page
  const renderServicesTemplate = () => {
    switch (template) {
      case 'minimal':
        return <div className="pt-20"><MinimalServicesTemplate {...templateProps} /></div>

      case 'freshspin':
        return <div className="pt-20"><FreshSpinServicesTemplate {...templateProps} /></div>

      case 'starter':
        return <div className="pt-20"><StarterServicesTemplate {...templateProps} /></div>

      case 'original':
      default:
        // Original template - inline (current design)
        return (
          <div className="min-h-screen pt-20" style={{ backgroundColor: theme.pageBg }}>
            <BannerCarousel page="SERVICES" />

            <section className="relative h-[400px] overflow-hidden pt-8">
              <div className="max-w-screen-2xl mx-auto h-full relative">
                <div className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/images/pricing.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
                </div>
                <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                  <div className="max-w-xl lg:ml-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('services.hero.title')}</h1>
                    <p className="text-lg text-gray-200 mb-8">{t('services.hero.subtitle')}</p>
                    <Button size="lg" className="bg-gray-800 hover:bg-gray-900 text-white" onClick={handleBookNow}>
                      <Truck className="w-5 h-5 mr-2" />
                      {t('services.hero.schedulePickup')}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
                    {t('services.ourServices.title')}
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-xl p-4 hover:shadow-lg transition-all"
                      style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                    >
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: theme.accent }}>
                        <service.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold mb-1" style={{ color: theme.textPrimary }}>
                        {service.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
                        {service.description}
                      </p>
                      <p className="text-sm font-bold mb-3" style={{ color: theme.accent }}>
                        {service.price}
                      </p>
                      <ul className="space-y-1 mb-3">
                        {service.features.map((f, j) => (
                          <li key={j} className="flex items-center text-xs" style={{ color: theme.textSecondary }}>
                            <CheckCircle className="w-3 h-3 mr-1" style={{ color: theme.accent }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        className="w-full text-white"
                        style={{ backgroundColor: theme.accent }}
                        onClick={handleBookNow}
                      >
                        {t('nav.bookNow')}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-16" style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accentSecondary})` }}>
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">{t('services.cta.title')}</h2>
                <p className="text-white/80 mb-8">{t('services.cta.subtitle')}</p>
                <Button
                  size="lg"
                  className="bg-white hover:bg-gray-100"
                  style={{ color: theme.accent }}
                  onClick={handleBookNow}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  {t('services.cta.bookNow')}
                </Button>
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <>
      {renderServicesTemplate()}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onLoginRequired={() => router.push(`/${tenantSlug}`)}
      />
    </>
  )
}
