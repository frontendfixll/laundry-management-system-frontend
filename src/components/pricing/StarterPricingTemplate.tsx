'use client'

import { Button } from '@/components/ui/button'
import { Truck, Phone, CheckCircle, Shield, Clock, Award } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface StarterPricingTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
  pricingTable: React.ReactNode
}

const benefits = [
  { icon: CheckCircle, title: 'No Hidden Charges', desc: 'What you see is what you pay' },
  { icon: Shield, title: 'Quality Assured', desc: 'Premium care for every garment' },
  { icon: Clock, title: 'Fast Service', desc: '24-48 hours turnaround' },
  { icon: Award, title: 'Best Value', desc: 'Competitive pricing guaranteed' },
]

export default function StarterPricingTemplate({ theme, t, onBookNow, tenantTagline, pricingTable }: StarterPricingTemplateProps) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="max-w-screen-2xl mx-auto h-full relative">
          <div className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/images/pricing.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/50"></div>
          </div>
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl lg:ml-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                {tenantTagline || 'Quality laundry services at affordable prices'}
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={onBookNow}
                  className="px-8 py-6 text-lg font-semibold rounded-lg"
                  style={{ backgroundColor: theme.accent, color: 'white' }}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Schedule Pickup
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl text-center transition-all hover:shadow-lg"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}20` }}
                >
                  <benefit.icon className="w-7 h-7" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {benefit.title}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Our Service Pricing
            </h2>
            <p className="text-lg" style={{ color: theme.textSecondary }}>
              Transparent pricing for all our services
            </p>
          </div>
          {pricingTable}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: theme.textPrimary }}>
            Ready to Experience Premium Laundry Care?
          </h2>
          <p className="text-lg mb-8" style={{ color: theme.textSecondary }}>
            Book your first pickup today and get started with hassle-free laundry service
          </p>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="px-10 py-6 text-lg font-semibold rounded-lg"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <Truck className="w-5 h-5 mr-2" />
            Book Now
          </Button>
        </div>
      </section>
    </div>
  )
}
