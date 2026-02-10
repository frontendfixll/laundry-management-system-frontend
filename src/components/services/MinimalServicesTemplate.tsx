'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Truck, Phone, CheckCircle, Shirt, Sparkles, Package, Award, Clock, Star, Shield, Timer, Leaf, Heart, BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { ThemeColors } from '@/components/layout/SettingsPanel'

interface MinimalServicesTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  onBookNow: () => void
  tenantTagline?: string
}

const services = [
  { id: 'wash-fold', name: 'Wash & Fold', icon: Shirt, price: '₹25/item' },
  { id: 'dry-cleaning', name: 'Dry Cleaning', icon: Sparkles, price: '₹60/item' },
  { id: 'laundry', name: 'Laundry Service', icon: Package, price: '₹30/item' },
  { id: 'shoe-cleaning', name: 'Shoe Cleaning', icon: Award, price: '₹80/pair' },
  { id: 'express', name: 'Express Service', icon: Clock, price: '₹45/item' }
]

const whyLoveUs = [
  { icon: Truck, title: 'Free Pickup & Delivery', desc: 'Convenient doorstep service' },
  { icon: Timer, title: '24-48 Hour Turnaround', desc: 'Quick and reliable' },
  { icon: Shield, title: 'Quality Guaranteed', desc: 'Expert care for your clothes' },
  { icon: Leaf, title: 'Eco-Friendly', desc: 'Safe for you and planet' },
]

export default function MinimalServicesTemplate({ theme, t, onBookNow, tenantTagline }: MinimalServicesTemplateProps) {
  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero Section - Clean & Minimal */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8">
            <video autoPlay muted loop playsInline className="w-full h-full object-cover">
              <source src="/images/pricing.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-[50vh] min-h-[400px] flex items-center">
            <div className="max-w-lg">
              {tenantTagline && (
                <p className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: theme.accent }}>
                  <Sparkles className="w-5 h-5" />
                  {tenantTagline}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: theme.textPrimary }}>
                Our Services
              </h1>
              <p className="text-lg mb-6" style={{ color: theme.textSecondary }}>
                Professional laundry care for every need
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={onBookNow}
                  className="text-white px-6 py-3 rounded-full font-medium"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Truck className="w-5 h-5 mr-2" />
                  Schedule Pickup
                </Button>
                <Link href="https://wa.me/919876543210" target="_blank">
                  <Button 
                    variant="outline"
                    className="px-6 py-3 rounded-full font-medium border-2"
                    style={{ borderColor: theme.accent, color: theme.accent }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid - Minimal Cards */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
              What We Offer
            </h2>
            <p className="text-lg" style={{ color: theme.textSecondary }}>
              Simple, transparent pricing
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {services.map((service) => (
              <div 
                key={service.id}
                className="rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer group"
                style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}
                onClick={onBookNow}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <service.icon className="w-8 h-8" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                  {service.name}
                </h3>
                <p className="text-2xl font-bold mb-4" style={{ color: theme.accent }}>
                  {service.price}
                </p>
                <Button 
                  size="sm"
                  className="w-full text-white text-sm"
                  style={{ backgroundColor: theme.accent }}
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Minimal Icons */}
      <section className="py-20 transition-colors duration-300" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: theme.textPrimary }}>
              Why Choose Us
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {whyLoveUs.map((item, idx) => (
              <div key={idx} className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: theme.accentLight }}
                >
                  <item.icon className="w-10 h-10" style={{ color: theme.accent }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: theme.textPrimary }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section 
        className="py-16 transition-colors duration-300"
        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentSecondary})` }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Experience hassle-free laundry service today
          </p>
          <Button 
            size="lg"
            onClick={onBookNow}
            className="bg-white hover:bg-gray-100 px-8 py-4 text-lg rounded-full font-semibold"
            style={{ color: theme.accent }}
          >
            <Truck className="w-5 h-5 mr-2" />
            Book Now
          </Button>
        </div>
      </section>
    </div>
  )
}
