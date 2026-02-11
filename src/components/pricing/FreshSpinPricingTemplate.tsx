'use client'

import { Button } from '@/components/ui/button'
import { Truck, Phone, Sparkles, Star, Shield, Zap, CheckCircle } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface FreshSpinPricingTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
  pricingTable: React.ReactNode
}

const features = [
  { icon: Shield, title: 'Quality Guarantee', desc: 'Best care for your garments' },
  { icon: Zap, title: 'Express Service', desc: 'Same day delivery available' },
  { icon: Star, title: 'Premium Products', desc: 'Eco-friendly detergents' },
  { icon: CheckCircle, title: 'Satisfaction', desc: '100% money back guarantee' },
]

export default function FreshSpinPricingTemplate({ theme, t, onBookNow, tenantTagline, pricingTable }: FreshSpinPricingTemplateProps) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/images/pricing.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-pink-900/60 to-orange-900/70" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-[400px] flex items-center">
            <div className="max-w-2xl text-white">
              {tenantTagline && (
                <p className="text-xl font-bold mb-4 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-5 h-5" />
                  {tenantTagline}
                </p>
              )}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Simple,<br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Transparent Pricing
                </span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                No hidden fees. Pay only for what you use.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={onBookNow}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-bold shadow-xl"
                >
                  <Truck className="w-6 h-6 mr-2" />
                  Book Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-full font-bold"
                >
                  <Phone className="w-6 h-6 mr-2" />
                  Call Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl text-center transition-all hover:scale-105"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {feature.desc}
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
              Our Pricing
            </h2>
            <p className="text-xl" style={{ color: theme.textSecondary }}>
              Choose the service that fits your needs
            </p>
          </div>
          {pricingTable}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: theme.textPrimary }}>
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8" style={{ color: theme.textSecondary }}>
            Book your first pickup today and experience the difference
          </p>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="px-12 py-6 text-lg rounded-full font-bold shadow-xl"
            style={{ backgroundColor: theme.accent, color: 'white' }}
          >
            <Truck className="w-6 h-6 mr-2" />
            Schedule Pickup
          </Button>
        </div>
      </section>
    </div>
  )
}
