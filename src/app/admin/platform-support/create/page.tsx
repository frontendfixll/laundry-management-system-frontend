'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertTriangle, Package, CreditCard, Calendar, DollarSign, Upload, X } from 'lucide-react'
import { tenantTicketApi, CreateTicketData } from '@/services/tenantTicketApi'
import { useUnifiedNotifications } from '@/hooks/useUnifiedNotifications'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const categories = [
  {
    value: 'order_operations',
    label: 'Order & Operations',
    description: 'Issues with order workflow, status updates, or staff processes',
    icon: Package,
    subcategories: [
      'Order not updating status',
      'Staff unable to process orders',
      'Order workflow stuck',
      'Delivery tracking issues',
      'Order cancellation problems',
      'Bulk order processing issues'
    ]
  },
  {
    value: 'payment_settlement',
    label: 'Payment & Settlement',
    description: 'Payment processing, payout delays, commission issues',
    icon: CreditCard,
    subcategories: [
      'Payment gateway not working',
      'Payout delays',
      'Commission calculation errors',
      'Settlement report issues',
      'Refund processing delays',
      'Payment reconciliation problems'
    ]
  },
  {
    value: 'refunds',
    label: 'Refunds',
    description: 'Refund approvals, processing failures, amount disputes',
    icon: DollarSign,
    subcategories: [
      'Refund approval pending',
      'Refund amount incorrect',
      'Customer not receiving refund',
      'Partial refund issues',
      'Refund policy clarification',
      'Bulk refund processing'
    ]
  },
  {
    value: 'account_subscription',
    label: 'Account & Subscription',
    description: 'Plan changes, billing issues, invoice requests',
    icon: Calendar,
    subcategories: [
      'Plan upgrade/downgrade',
      'Billing cycle issues',
      'Invoice generation problems',
      'Subscription renewal issues',
      'Feature access problems',
      'Account suspension concerns'
    ]
  },
  {
    value: 'technical_bug',
    label: 'Technical / Bug',
    description: 'Dashboard issues, feature problems, API errors',
    icon: AlertTriangle,
    subcategories: [
      'Dashboard not loading',
      'Feature not working',
      'API integration errors',
      'Mobile app issues',
      'Data sync problems',
      'Performance issues'
    ]
  },
  {
    value: 'how_to_configuration',
    label: 'How-To / Configuration',
    description: 'Setup help, pricing configuration, feature guidance',
    icon: Package,
    subcategories: [
      'Initial setup help',
      'Pricing configuration',
      'Staff training needed',
      'Feature configuration',
      'Integration setup',
      'Best practices guidance'
    ]
  },
  {
    value: 'security_compliance',
    label: 'Security / Compliance',
    description: 'Access issues, data concerns, suspicious activity',
    icon: AlertTriangle,
    subcategories: [
      'Login access issues',
      'Data security concerns',
      'Suspicious activity detected',
      'Compliance requirements',
      'Permission management',
      'Account security'
    ]
  }
]

export default function CreateTicketPage() {
  const router = useRouter()
  const { showActionFeedback } = useUnifiedNotifications()
  const [loading, setLoading] = useState(false)
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  
  const [formData, setFormData] = useState<CreateTicketData>({
    category: '',
    subcategory: '',
    subject: '',
    description: '',
    perceivedPriority: 'medium',
    linkedOrderId: '',
    linkedPaymentId: '',
    linkedSettlementPeriod: '',
    refundAmount: undefined,
    attachments: []
  })

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      setLoadingSubcategories(true)
      
      // Find the selected category and get its subcategories
      const selectedCategory = categories.find(cat => cat.value === formData.category)
      const categorySubcategories = selectedCategory?.subcategories || []
      
      // Simulate a small delay for better UX
      setTimeout(() => {
        setSubcategories(categorySubcategories)
        setLoadingSubcategories(false)
      }, 300)
    } else {
      setSubcategories([])
    }
  }, [formData.category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up form data - remove empty optional fields
      const cleanData: CreateTicketData = {
        category: formData.category,
        subcategory: formData.subcategory,
        subject: formData.subject,
        description: formData.description,
        perceivedPriority: formData.perceivedPriority
      }

      // Add optional fields only if they have values
      if (formData.linkedOrderId?.trim()) {
        cleanData.linkedOrderId = formData.linkedOrderId.trim()
      }
      if (formData.linkedPaymentId?.trim()) {
        cleanData.linkedPaymentId = formData.linkedPaymentId.trim()
      }
      if (formData.linkedSettlementPeriod?.trim()) {
        cleanData.linkedSettlementPeriod = formData.linkedSettlementPeriod.trim()
      }
      if (formData.refundAmount && formData.refundAmount > 0) {
        cleanData.refundAmount = formData.refundAmount
      }
      if (formData.attachments && formData.attachments.length > 0) {
        cleanData.attachments = formData.attachments
      }

      let ticket;
      try {
        ticket = await tenantTicketApi.createTicket(cleanData)
      } catch (apiError) {
        console.error('API call failed:', apiError);
        throw apiError;
      }
      
      // Check if ticket was created successfully
      if (ticket && ticket.ticketNumber) {
        // Show success notification
        showActionFeedback(
          'success',
          `Support ticket created successfully! Ticket Number: ${ticket.ticketNumber}`,
          { duration: 8000 }
        )
        
        // Redirect to tickets list
        router.push('/admin/platform-support/tickets')
      } else {
        throw new Error('Ticket was created but no ticket number was returned')
      }
      
    } catch (error: any) {
      console.error('Error creating ticket:', error)
      
      // More detailed error handling with toast notification
      let errorMessage = 'Failed to create support ticket'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Show error notification
      showActionFeedback('error', errorMessage, { duration: 8000 })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'refundAmount' ? (value ? parseFloat(value) : undefined) : value
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const selectedCategory = categories.find(cat => cat.value === formData.category)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Platform Support Ticket</h1>
          <p className="text-gray-600 mt-1">
            Report issues or request assistance from the LaundryLobby platform team
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Issue Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon
                const isSelected = formData.category === category.value
                
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      category: category.value,
                      subcategory: '' // Reset subcategory when category changes
                    }))}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <h3 className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {category.label}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Subcategory */}
          {formData.category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Issue *
              </label>
              {loadingSubcategories ? (
                <div className="text-sm text-gray-500">Loading options...</div>
              ) : (
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select specific issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories && subcategories.length > 0 ? (
                      subcategories.map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No options available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              
              {/* Show selected category info */}
              {selectedCategory && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <selectedCategory.icon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedCategory.label}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedCategory.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                placeholder="Brief summary of the issue"
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.subject.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (Your Assessment) *
              </label>
              <Select 
                value={formData.perceivedPriority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, perceivedPriority: value as 'low' | 'medium' | 'high' }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Minor issue, no business impact</SelectItem>
                  <SelectItem value="medium">Medium - Some impact on operations</SelectItem>
                  <SelectItem value="high">High - Significant business impact</SelectItem>
                </SelectContent>
              </Select>
              <div className={`mt-2 px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(formData.perceivedPriority || 'medium')}`}>
                Note: Final priority will be determined by our support team based on business impact
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Please provide detailed information about the issue:
• What happened?
• When did it occur?
• What were you trying to do?
• What was the expected result?
• Any error messages or screenshots?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conditional Fields Based on Category */}
          {(formData.category === 'order_operations' || 
            formData.category === 'payment_settlement' || 
            formData.category === 'refunds') && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(formData.category === 'order_operations' || formData.category === 'refunds') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Order ID
                    </label>
                    <input
                      type="text"
                      name="linkedOrderId"
                      value={formData.linkedOrderId}
                      onChange={handleInputChange}
                      placeholder="Order ObjectId (if applicable)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {formData.category === 'payment_settlement' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment ID
                      </label>
                      <input
                        type="text"
                        name="linkedPaymentId"
                        value={formData.linkedPaymentId}
                        onChange={handleInputChange}
                        placeholder="Payment transaction ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Settlement Period
                      </label>
                      <input
                        type="text"
                        name="linkedSettlementPeriod"
                        value={formData.linkedSettlementPeriod}
                        onChange={handleInputChange}
                        placeholder="e.g., Week of Jan 15-21, 2024"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {formData.category === 'refunds' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="refundAmount"
                      value={formData.refundAmount || ''}
                      onChange={handleInputChange}
                      placeholder="Amount to be refunded"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Support Guidelines</h4>
                <div className="text-sm text-blue-800 mt-1 space-y-1">
                  <p>• <strong>Response Time:</strong> We aim to respond within 24 hours for most issues</p>
                  <p>• <strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM IST</p>
                  <p>• <strong>Critical Issues:</strong> Payment failures and system outages get priority</p>
                  <p>• <strong>Documentation:</strong> Include screenshots or error messages when possible</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.category || !formData.subcategory || !formData.subject || !formData.description}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}