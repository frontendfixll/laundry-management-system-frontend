'use client'

import { Button } from '@/components/ui/button'
import { Truck, CheckCircle } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface MinimalPricingTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
  pricingTable: React.ReactNode
}

export default function MinimalPricingTemplate({ theme, t, onBookNow, tenantTagline, pricingTable }: MinimalPricingTemplateProps) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section - Minimal & Clean */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: theme.textPrimary }}>
            Pricing
          </h1>
          <p className="text-xl mb-8" style={{ color: theme.textSecondary }}>
            {tenantTagline || 'Simple, transparent pricing for quality laundry services'}
          </p>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="px-8 py-4 text-lg font-medium rounded-lg"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <Truck className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {pricingTable}
        </div>
      </section>

      {/* Simple Benefits */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.textPrimary }}>
            Why Choose Us
          </h2>
          <div className="space-y-4">
            {['No hidden fees', 'Quality guaranteed', 'Fast turnaround', 'Eco-friendly products'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: theme.accent }} />
                <span className="text-lg" style={{ color: theme.textPrimary }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ color: theme.textPrimary }}>
            Ready to get started?
          </h2>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="px-10 py-4 text-lg font-medium rounded-lg"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            Book Now
          </Button>
        </div>
      </section>
    </div>
  )
}
