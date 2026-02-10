'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import HelpPageContent from '@/app/help/page'
import { useTenant } from '@/contexts/TenantContext'

export default function TenantHelpPage() {
  const { tenant: tenantData } = useTenant()

  // Normalize template name (for consistency with other pages, though not used here yet)
  const rawTemplate = tenantData?.landingPageTemplate || 'original'
  const template = rawTemplate.toLowerCase().replace(/\s+/g, '')

  return (
    <div className="pt-20">
      <HelpPageContent showHeader={false} />
    </div>
  )
}
