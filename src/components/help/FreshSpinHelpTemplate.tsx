'use client'

import { Button } from '@/components/ui/button'
import { Phone, Mail, MessageCircle, Sparkles, HelpCircle, ChevronDown } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'
import { useState } from 'react'

interface FreshSpinHelpTemplateProps {
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

export default function FreshSpinHelpTemplate({ theme, t, tenantTagline }: FreshSpinHelpTemplateProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden">
        <div className="max-w-screen-2xl mx-auto w-full relative">
          <div className="absolute inset-0 z-0 rounded-none lg:rounded-2xl overflow-hidden mx-0 lg:mx-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600" />
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 min-h-[400px] flex items-center">
            <div className="max-w-2xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-8 h-8" />
                <h1 className="text-5xl md:text-6xl font-bold">Help Center</h1>
              </div>
              <p className="text-xl mb-8">
                {tenantTagline || 'We\'re here to help you with any questions'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: 'Call Us', desc: '+91 98765 43210', color: 'from-blue-400 to-cyan-500' },
              { icon: Mail, title: 'Email Us', desc: 'support@laundry.com', color: 'from-purple-400 to-pink-500' },
              { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with us now', color: 'from-green-400 to-emerald-500' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl text-center transition-all hover:scale-105"
                style={{ backgroundColor: theme.cardBg }}
              >
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${item.color}`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {item.title}
                </h3>
                <p style={{ color: theme.textSecondary }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: theme.textPrimary }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: theme.cardBg }}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <h4 className="font-semibold" style={{ color: theme.textPrimary }}>{faq.q}</h4>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFAQ === idx ? 'rotate-180' : ''}`} style={{ color: theme.accent }} />
                </button>
                {openFAQ === idx && (
                  <div className="px-6 pb-4">
                    <p style={{ color: theme.textSecondary }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
