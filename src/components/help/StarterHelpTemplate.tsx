'use client'

import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageCircle, HelpCircle, ChevronDown, Clock, MapPin } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'
import { useState } from 'react'

interface StarterHelpTemplateProps {
  theme: ThemeColors
  t: (key: string) => string
  tenantTagline?: string
}

const faqs = [
  { q: 'How do I place an order?', a: 'Simply book a pickup through our website or app, and our team will collect your laundry from your doorstep.' },
  { q: 'What are your delivery times?', a: 'Standard delivery is 24-48 hours. Express service available for same-day delivery.' },
  { q: 'Do you offer dry cleaning?', a: 'Yes! We offer professional dry cleaning services for all types of garments.' },
  { q: 'How do I track my order?', a: 'You can track your order in real-time through your dashboard or mobile app.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and digital wallets.' },
]

export default function StarterHelpTemplate({ theme, t, tenantTagline }: StarterHelpTemplateProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero */}
      <section className="relative h-[350px] overflow-hidden">
        <div className="max-w-screen-2xl mx-auto h-full relative">
          <div className="absolute inset-0 mx-0 lg:mx-8 rounded-none lg:rounded-2xl overflow-hidden" style={{ backgroundColor: theme.accent }} />
          <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl lg:ml-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle className="w-10 h-10" />
                <h1 className="text-5xl font-bold">Help & Support</h1>
              </div>
              <p className="text-xl">
                {tenantTagline || 'Get answers to your questions and reach out to our support team'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.textPrimary }}>
            Get in Touch
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: 'Phone Support', desc: '+91 98765 43210', sub: 'Mon-Sat, 9AM-8PM' },
              { icon: Mail, title: 'Email Support', desc: 'support@laundry.com', sub: 'Response within 24hrs' },
              { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with us', sub: 'Available now' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl text-center transition-all hover:shadow-lg"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${theme.accent}20` }}
                >
                  <item.icon className="w-7 h-7" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {item.title}
                </h3>
                <p className="font-medium mb-1" style={{ color: theme.textPrimary }}>{item.desc}</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.textPrimary }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-lg overflow-hidden border"
                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:opacity-80"
                >
                  <h4 className="font-semibold" style={{ color: theme.textPrimary }}>{faq.q}</h4>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFAQ === idx ? 'rotate-180' : ''}`} style={{ color: theme.accent }} />
                </button>
                {openFAQ === idx && (
                  <div className="px-6 pb-4 border-t" style={{ borderColor: theme.border }}>
                    <p className="pt-4" style={{ color: theme.textSecondary }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: theme.accent }} />
          <h3 className="text-2xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            Business Hours
          </h3>
          <p className="text-lg" style={{ color: theme.textSecondary }}>
            Monday - Saturday: 9:00 AM - 8:00 PM<br />
            Sunday: 10:00 AM - 6:00 PM
          </p>
        </div>
      </section>
    </div>
  )
}
