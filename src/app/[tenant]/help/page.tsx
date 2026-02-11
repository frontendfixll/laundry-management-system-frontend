'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HelpPageContent from '@/app/help/page'
import { useTenant } from '@/contexts/TenantContext'
import { ThemeColor, SchemeMode, Language, getThemeColors } from '@/components/layout/SettingsPanel'
import { translations } from '@/lib/translations'

// Dynamic imports for template-specific help pages
const MinimalHelpTemplate = dynamic(() => import('@/components/help/MinimalHelpTemplate'), { ssr: false })
const FreshSpinHelpTemplate = dynamic(() => import('@/components/help/FreshSpinHelpTemplate'), { ssr: false })
const StarterHelpTemplate = dynamic(() => import('@/components/help/StarterHelpTemplate'), { ssr: false })

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

export default function TenantHelpPage() {
  const { tenant: tenantData } = useTenant()
  const [themeColor, setThemeColor] = useState<ThemeColor>('teal')
  const [scheme, setScheme] = useState<SchemeMode>('light')
  const [language, setLanguage] = useState<Language>('en')

  const theme = getThemeColors(themeColor, scheme)
  const t = (key: string) => translations[language]?.[key] || translations['en'][key] || key

  // Normalize template name
  const rawTemplate = tenantData?.landingPageTemplate || 'original'
  const template = rawTemplate.toLowerCase().replace(/\s+/g, '')

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

  // Template-specific props
  const templateProps = {
    theme,
    t,
    tenantTagline: tenantData?.tagline,
  }

  // Render template-specific help page
  if (template === 'minimal') {
    return <div className="pt-20"><MinimalHelpTemplate {...templateProps} /></div>
  }

  if (template === 'freshspin') {
    return <div className="pt-20"><FreshSpinHelpTemplate {...templateProps} /></div>
  }

  if (template === 'starter') {
    return <div className="pt-20"><StarterHelpTemplate {...templateProps} /></div>
  }

  // Original template (default)
  return (
    <div className="pt-20">
      <HelpPageContent showHeader={false} />
    </div>
  )
}
