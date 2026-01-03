'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  HelpCircle, 
  Book,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react'

interface FAQ {
  question: string
  answer: string
}

export default function AdminSupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqs: FAQ[] = [
    {
      question: 'How do I assign an order to a branch?',
      answer: 'Go to Orders page, find the order with "Pending Assignment" status, click "Assign Branch" button, select the branch from dropdown, and confirm. The order will be automatically assigned and status updated.'
    },
    {
      question: 'How do I process a refund request?',
      answer: 'Navigate to Refunds page, find the pending refund request. If amount is within your limit (₹500), you can approve directly. For amounts above ₹500, escalate to Center Admin. Click Approve/Reject/Escalate as needed.'
    },
    {
      question: 'How do I mark a customer as VIP?',
      answer: 'Go to Customers page, find the customer, click "Make VIP" button. VIP customers get priority handling and special offers. You can remove VIP status anytime by clicking "Remove VIP".'
    },
    {
      question: 'How do I assign a complaint to a support agent?',
      answer: 'Open Complaints page, find the complaint, click "Assign" button, select a support agent from the list, and confirm. The agent will be notified and complaint status will change to "In Progress".'
    },
    {
      question: 'What is the difference between Admin and Center Admin?',
      answer: 'Admin handles day-to-day operations like order management, customer support, and basic refunds (up to ₹500). Center Admin has full control including pricing, branch management, financial oversight, and unlimited refund approval.'
    },
    {
      question: 'How do I view order history for a customer?',
      answer: 'Go to Customers page, find the customer, click "View Profile". You\'ll see their complete order history, total spent, and other statistics.'
    },
    {
      question: 'How do I block a customer account?',
      answer: 'Navigate to Customers page, find the customer, click "Deactivate" button. The customer will not be able to place new orders. You can reactivate anytime by clicking "Activate".'
    },
    {
      question: 'How do I track logistics partner performance?',
      answer: 'Go to Logistics page to see all partners with their ratings, on-time delivery rates, and active orders. This helps in making assignment decisions.'
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
        <p className="text-gray-600">Get help with using the admin panel</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Book className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Documentation</h3>
          <p className="text-sm text-gray-600 mb-4">Read the complete admin guide and documentation</p>
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Docs
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">Chat with our support team for immediate help</p>
          <Button variant="outline" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Start Chat
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Phone Support</h3>
          <p className="text-sm text-gray-600 mb-4">Call us for urgent issues and escalations</p>
          <Button variant="outline" className="w-full">
            <Phone className="w-4 h-4 mr-2" />
            1800-123-4567
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Need More Help?</h3>
            <p className="text-blue-100">Our support team is available 24/7 to assist you</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>support@laundry.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>1800-123-4567</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
              <p className="text-sm text-gray-500">Find answers to common questions</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600">Try a different search term</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="p-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="mt-3 text-gray-600 text-sm pl-0 pr-8">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🚀 Keyboard Shortcuts</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>Press <kbd className="px-1 bg-blue-100 rounded">Ctrl+K</kbd> for quick search</li>
              <li>Press <kbd className="px-1 bg-blue-100 rounded">Esc</kbd> to close modals</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>Use filters to quickly find orders</li>
              <li>Check analytics daily for insights</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">⚡ Performance</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>Assign orders promptly for better SLA</li>
              <li>Resolve complaints within 24 hours</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">🔒 Security</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>Never share your login credentials</li>
              <li>Log out when leaving your desk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
