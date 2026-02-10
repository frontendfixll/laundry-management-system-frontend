'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Truck, Phone, CheckCircle, Shirt, Sparkles, Package, Award, Clock, Star, Shield, Zap, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface FreshSpinServicesTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
}

const services = [
  { id: 'wash-fold', name: 'Wash & Fold', icon: Shirt, desc: 'Regular washing and folding', price: '₹25', gradient: 'from-teal-400 to-cyan-500' },
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: Sparkles, desc: 'Professional dry cleaning', price: '₹60', gradient: 'from-purple-400 to-pink-500' },
  { id: 'laundry', name: 'Laundry Service', icon: Package, desc: 'Complete laundry service', price: '₹30', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', icon: Award, desc: 'Professional shoe care', price: '₹80', gradient: 'from-orange-400 to-red-500' },
  { id: 'express', name: 'Express Service', icon: Clock, desc: 'Same-day delivery', price: '₹45', gradient: 'from-green-400 to-emerald-500' },
  { id: 'premium', name: 'Premium Care', icon: Star, desc: 'Delicate fabric care', price: '₹100', gradient: 'from-yellow-400 to-amber-500' }
]

const features = [
  { icon: Clock, title: 'Quick Turnaround', desc: '24-48 hours delivery', color: 'text-blue-500' },
  { icon: Truck, title: 'Free Pickup', desc: 'Doorstep service', color: 'text-green-500' },
  { icon: Shield, title: 'Quality Care', desc: 'Expert handling', color: 'text-purple-500' },
  { icon: Zap, title: 'Express Available', desc: 'Same day option', color: 'text-orange-500' },
]

export default function FreshSpinServicesTemplate({ theme, t, onBookNow, tenantTagline }: FreshSpinServicesTemplateProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null)

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section - Bold & Vibrant */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/images/pricing.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-pink-900/60 to-orange-900/70" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-[500px] flex items-center">
            <div className="max-w-2xl text-white">
              {tenantTagline && (
                <p className="text-2xl font-bold mb-4 flex items-center gap-2 animate-pulse">
                  <Sparkles className="w-6 h-6" />
                  {tenantTagline}
                </p>
              )}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Fresh Services,<br />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Fresh Results
                </span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Experience the future of laundry care with our premium services
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
                <Link href="tel:+919876543210">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-full font-bold"
                  >
                    <Phone className="w-6 h-6 mr-2" />
                    Call Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Vibrant Cards with Gradients */}
      <section className="py-24 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-lg font-semibold mb-2" style={{ color: theme.accent }}>
              WHAT WE DO
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Our Premium Services
            </h2>
            <p className="text-xl" style={{ color: theme.textSecondary }}>
              Choose the perfect service for your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className="group relative rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ backgroundColor: theme.cardBg }}
                onClick={onBookNow}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform`}>
                    <service.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                    {service.name}
                  </h3>
                  <p className="mb-4" style={{ color: theme.textSecondary }}>
                    {service.desc}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm" style={{ color: theme.textMuted }}>Starting from</span>
                      <p className="text-3xl font-bold" style={{ color: theme.accent }}>
                        {service.price}
                        <span className="text-lg">/item</span>
                      </p>
                    </div>
                    <ChevronRight 
                      className={`w-8 h-8 transform transition-transform ${hoveredService === service.id ? 'translate-x-2' : ''}`}
                      style={{ color: theme.accent }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Bold Icons */}
      <section className="py-24 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Why We're Different
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="text-center p-6 rounded-2xl hover:shadow-xl transition-all"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${services[idx]?.gradient || 'from-gray-400 to-gray-600'} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <feature.icon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {feature.title}
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold Gradient */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600" />
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for Fresh, Clean Clothes?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90">
            Join thousands of happy customers who trust us with their laundry
          </p>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 text-xl rounded-full font-bold shadow-2xl transform hover:scale-105 transition-all"
          >
            <Truck className="w-6 h-6 mr-3" />
            Schedule Your Pickup
          </Button>
        </div>
      </section>
    </div>
  )
}
