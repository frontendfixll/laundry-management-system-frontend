'use client'

import { Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react'
import { ThemeColors } from '@/components/layout/SettingsPanel'
import { useState } from 'react'

interface MinimalHelpTemplateProps {
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

export default function MinimalHelpTemplate({ theme, t, tenantTagline }: MinimalHelpTemplateProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.pageBg }}>
      {/* Hero */}
      <section className="py-20" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6" style={{ color: theme.textPrimary }}>
            Help
          </h1>
          <p className="text-xl" style={{ color: theme.textSecondary }}>
            {tenantTagline || 'Find answers to common questions or contact our support team'}
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.textPrimary }}>
            Contact Us
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: Mail, label: 'Email', value: 'support@laundry.com' },
              { icon: MessageCircle, label: 'Chat', value: 'Live chat available' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-lg text-center"
                style={{ backgroundColor: theme.cardBg }}
              >
                <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: theme.accent }} />
                <h3 className="font-semibold mb-1" style={{ color: theme.textPrimary }}>
                  {item.label}
                </h3>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: theme.textPrimary }}>
            FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: theme.cardBg }}
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <h4 className="font-medium" style={{ color: theme.textPrimary }}>{faq.q}</h4>
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
