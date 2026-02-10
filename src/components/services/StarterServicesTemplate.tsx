'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Truck, Phone, CheckCircle, Shirt, Sparkles, Package, Award, Clock, Star, Shield, Users, Building2, BadgeCheck, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface StarterServicesTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
}

const services = [
  { 
    id: 'wash-fold', 
    name: 'Wash & Fold', 
    icon: Shirt, 
    desc: 'Regular washing and folding service for everyday clothes',
    price: '₹25',
    features: ['Same day pickup', 'Eco-friendly detergents', 'Neatly folded']
  },
  { 
    id: 'dry-cleaning', 
    name: 'Dry Cleaning', 
    icon: Sparkles, 
    desc: 'Professional dry cleaning for delicate and formal wear',
    price: '₹60',
    features: ['Expert care', 'Stain removal', 'Premium finish']
  },
  { 
    id: 'laundry', 
    name: 'Laundry Service', 
    icon: Package, 
    desc: 'Complete laundry service with wash, dry and iron',
    price: '₹30',
    features: ['Full service', 'Quick turnaround', 'Quality assured']
  },
  { 
    id: 'shoe-cleaning', 
    name: 'Shoe Cleaning', 
    icon: Award, 
    desc: 'Professional shoe care and cleaning services',
    price: '₹80',
    features: ['Deep cleaning', 'Polish & shine', 'Odor removal']
  },
  { 
    id: 'express', 
    name: 'Express Service', 
    icon: Clock, 
    desc: 'Same-day delivery for urgent laundry needs',
    price: '₹45',
    features: ['4-6 hour delivery', 'Priority handling', 'Premium care']
  },
  { 
    id: 'premium', 
    name: 'Premium Care', 
    icon: Star, 
    desc: 'Specialized care for delicate and luxury fabrics',
    price: '₹100',
    features: ['Delicate handling', 'Luxury fabrics', 'Expert treatment']
  }
]

const trustBadges = [
  { icon: BadgeCheck, title: '100% Satisfaction', desc: 'Guaranteed quality' },
  { icon: Shield, title: 'Insured Service', desc: 'Your clothes are protected' },
  { icon: Users, title: '50,000+ Customers', desc: 'Trusted by thousands' },
  { icon: Building2, title: '20+ Cities', desc: 'Pan-India presence' },
]

const processSteps = [
  { step: '01', title: 'Schedule Pickup', desc: 'Book online or call us' },
  { step: '02', title: 'We Collect', desc: 'Free doorstep pickup' },
  { step: '03', title: 'Expert Care', desc: 'Professional cleaning' },
  { step: '04', title: 'Delivery', desc: 'Fresh clothes delivered' },
]

export default function StarterServicesTemplate({ theme, t, onBookNow, tenantTagline }: StarterServicesTemplateProps) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section - Professional */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/images/pricing.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-[60vh] min-h-[500px] flex items-center">
            <div className="max-w-2xl text-white">
              {tenantTagline && (
                <p className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: theme.accent }}>
                  <Sparkles className="w-5 h-5" />
                  {tenantTagline}
                </p>
              )}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Professional<br />
                Laundry Services
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                Trusted by businesses and families across India for quality laundry care
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg"
                  onClick={onBookNow}
                  className="text-white px-8 py-4 text-lg rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Schedule Pickup
                </Button>
                <Link href="tel:+919876543210">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg rounded-lg font-semibold"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <badge.icon className="w-8 h-8" style={{ color: theme.accent }} />
                </div>
                <h3 className="font-bold mb-1" style={{ color: theme.textPrimary }}>
                  {badge.title}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section - Professional Cards */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: theme.accent }}>
              Our Services
            </p>
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              Comprehensive Laundry Solutions
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
              From everyday laundry to specialized care, we handle it all with expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className="rounded-xl p-8 hover:shadow-xl transition-all cursor-pointer group"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                onClick={onBookNow}
              >
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <service.icon className="w-8 h-8" style={{ color: theme.accent }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {service.name}
                </h3>
                <p className="mb-4 text-sm" style={{ color: theme.textSecondary }}>
                  {service.desc}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm" style={{ color: theme.textSecondary }}>
                      <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: theme.accent }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                  <div>
                    <span className="text-sm" style={{ color: theme.textMuted }}>Starting from</span>
                    <p className="text-2xl font-bold" style={{ color: theme.accent }}>
                      {service.price}
                      <span className="text-sm">/item</span>
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" style={{ color: theme.accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.textPrimary }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: theme.textSecondary }}>
              Simple, efficient, and hassle-free
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                {/* Connector Line */}
                {idx < processSteps.length - 1 && (
                  <div 
                    className="hidden md:block absolute top-12 left-1/2 w-full h-0.5"
                    style={{ backgroundColor: theme.border }}
                  />
                )}
                
                {/* Step Number */}
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 text-3xl font-bold text-white"
                  style={{ backgroundColor: theme.accent }}
                >
                  {step.step}
                </div>

                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {step.title}
                </h3>
                <p style={{ color: theme.textSecondary }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Professional */}
      <section 
        className="py-20 transition-colors duration-300"
        style={{ backgroundColor: theme.accent }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Experience Professional Laundry Care
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Join thousands of satisfied customers who trust us with their laundry needs
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg"
              onClick={onBookNow}
              className="bg-white hover:bg-gray-100 px-8 py-4 text-lg rounded-lg font-semibold"
              style={{ color: theme.accent }}
            >
              <Truck className="w-5 h-5 mr-2" />
              Book Service Now
            </Button>
            <Link href="/pricing">
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white px-8 py-4 text-lg rounded-lg font-semibold"
                style={{ '--hover-color': theme.accent } as any}
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
