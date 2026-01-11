'use client'

import { HelpCircle, Mail, Phone, MessageCircle } from 'lucide-react'

export default function BranchAdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-500 mt-1">Get help with your branch admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <HelpCircle className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Find answers to commonly asked questions about managing your branch.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Email Support</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Contact your tenancy admin for any issues or feature requests.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-teal-500">•</span>
            Use the barcode scanner to quickly update order status
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">•</span>
            Check inventory levels regularly to avoid stockouts
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">•</span>
            Respond to support tickets promptly for better customer satisfaction
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-500">•</span>
            Review daily reports to track branch performance
          </li>
        </ul>
      </div>
    </div>
  )
}
