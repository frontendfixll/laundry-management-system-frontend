'use client'

import { useParams } from 'next/navigation'
import BaseLoginForm from '@/components/auth/BaseLoginForm'
import MinimalLoginForm from '@/components/auth/templates/MinimalLoginForm'
import FreshSpinLoginForm from '@/components/auth/templates/FreshSpinLoginForm'
import LaundryMasterLoginForm from '@/components/auth/templates/LaundryMasterLoginForm'
import { getTemplateTheme, getTemplateContent, LandingPageTemplate } from '@/utils/templateUtils'
import { useTenant } from '@/contexts/TenantContext'
import { Sparkles, Truck, Clock, Shield, CheckCircle } from 'lucide-react'

export default function TenantLoginPage() {
  const params = useParams()
  const tenantSlug = params?.tenant as string
  const { tenant: tenantBranding } = useTenant()

  // Tenant comes from path - required for customer login
  const template = (tenantBranding?.landingPageTemplate || 'original')
    .toLowerCase()
    .replace(/\s+/g, '') as LandingPageTemplate
  const theme = getTemplateTheme(template)
  const content = getTemplateContent(template)

  // Use template-specific login forms
  if (template === 'minimal') {
    return <MinimalLoginForm tenantSlug={tenantSlug} />
  }
  if (template === 'freshspin') {
    return <FreshSpinLoginForm tenantSlug={tenantSlug} />
  }
  if (template === 'starter') {
    return <LaundryMasterLoginForm tenantSlug={tenantSlug} />
  }

  // Original template - BaseLoginForm with left content
  const originalLeftContent = (
    <>
      <div className="mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-14 h-14 bg-gradient-to-r ${theme.cardGradient} rounded-xl flex items-center justify-center shadow-lg`}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {content.brandName}
          </span>
        </div>
        <h1 className="text-4xl xl:text-5xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {content.loginTitle}
        </h1>
        <p className="text-xl text-gray-600" style={{ fontSize: '15px' }}>
          {content.tagline}
        </p>
      </div>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.primary}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Truck className={`w-6 h-6 text-${theme.primary}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Free Pickup & Delivery</h3>
            <p className="text-gray-600 text-sm">We pick up and deliver your clothes right at your doorstep</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.secondary}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Clock className={`w-6 h-6 text-${theme.secondary}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>24-48 Hour Turnaround</h3>
            <p className="text-gray-600 text-sm">Quick service with express options available</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 bg-${theme.accent}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Shield className={`w-6 h-6 text-${theme.accent}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Quality Guaranteed</h3>
            <p className="text-gray-600 text-sm">Professional care for all types of fabrics</p>
          </div>
        </div>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">Track your order status from pickup to delivery</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <BaseLoginForm
      template={template}
      tenantSlug={tenantSlug}
      leftSideContent={originalLeftContent}
    />
  )
}
