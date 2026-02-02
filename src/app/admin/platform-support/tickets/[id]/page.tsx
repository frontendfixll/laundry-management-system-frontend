'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Tag,
  Send,
  Paperclip
} from 'lucide-react'
import { tenantTicketApi, TenantTicket } from '@/services/tenantTicketApi'
import { ThemedSpinner } from '@/components/ui/ThemedSpinner'

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-orange-100 text-orange-800',
  waiting_for_tenant: 'bg-purple-100 text-purple-800',
  escalated: 'bg-red-100 text-red-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
}

const statusIcons = {
  new: Clock,
  acknowledged: MessageSquare,
  in_progress: Clock,
  waiting_for_tenant: User,
  escalated: AlertTriangle,
  resolved: CheckCircle,
  closed: XCircle
}

export default function TicketDetailPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<TenantTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load ticket details
  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true)
        setError(null)
        const ticketData = await tenantTicketApi.getTicket(ticketId)
        setTicket(ticketData)
      } catch (err: any) {
        console.error('Error loading ticket:', err)
        setError(err.message || 'Failed to load ticket details')
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      loadTicket()
    }
  }, [ticketId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSLAStatus = (ticket: TenantTicket) => {
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return { status: 'completed', color: 'text-green-600', text: 'Completed' }
    }
    
    const now = new Date()
    const deadline = new Date(ticket.slaDeadline)
    const hoursLeft = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursLeft < 0) {
      return { status: 'breached', color: 'text-red-600', text: 'SLA Breached' }
    } else if (hoursLeft < 4) {
      return { status: 'urgent', color: 'text-orange-600', text: `${hoursLeft}h left` }
    } else if (hoursLeft < 24) {
      return { status: 'warning', color: 'text-yellow-600', text: `${hoursLeft}h left` }
    } else {
      const daysLeft = Math.floor(hoursLeft / 24)
      return { status: 'ok', color: 'text-green-600', text: `${daysLeft}d left` }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Loading Ticket...</h1>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <ThemedSpinner 
            size="lg" 
            variant="primary" 
            showText={true} 
            text="Loading ticket details..."
            className="py-8"
          />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Ticket Not Found</h1>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Ticket</h3>
          <p className="text-gray-500 mb-4">
            {error || 'The ticket you\'re looking for could not be found.'}
          </p>
          <button
            onClick={() => router.push('/admin/platform-support/tickets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[ticket.status]
  const slaStatus = getSLAStatus(ticket)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Ticket {ticket.ticketNumber}
            </h1>
            <p className="text-gray-600 mt-1">{ticket.subject}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusColors[ticket.status]}`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {ticket.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${priorityColors[ticket.systemPriority]}`}>
            {ticket.systemPriority} priority
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Category</h4>
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{ticket.category.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Subcategory</h4>
                  <span className="text-gray-900">{ticket.subcategory}</span>
                </div>
                
                {ticket.linkedOrderId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Linked Order</h4>
                    <span className="text-blue-600 font-mono">{ticket.linkedOrderId}</span>
                  </div>
                )}
                
                {ticket.refundAmount && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Refund Amount</h4>
                    <span className="text-gray-900">₹{ticket.refundAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversation ({ticket.messages.length})
            </h2>
            
            {ticket.messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No messages yet. Our support team will respond soon.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.messages.map((message, index) => (
                  <div key={message._id || index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {message.sender.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({message.senderRole})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Paperclip className="w-4 h-4" />
                          <span>{message.attachments.length} attachment(s)</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & SLA */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & SLA</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">SLA Status</h4>
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${slaStatus.color}`} />
                  <span className={`text-sm ${slaStatus.color}`}>
                    {slaStatus.text}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Response Deadline</h4>
                <p className="text-sm text-gray-900">
                  {formatDate(ticket.responseDeadline)}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Resolution Deadline</h4>
                <p className="text-sm text-gray-900">
                  {formatDate(ticket.slaDeadline)}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Last Activity</h4>
                <p className="text-sm text-gray-900">{formatDate(ticket.lastActivityAt)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created By</h4>
                <p className="text-sm text-gray-900">{ticket.createdBy.name}</p>
                <p className="text-xs text-gray-500">{ticket.createdBy.email}</p>
              </div>
              
              {ticket.assignedTo && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Assigned To</h4>
                  <p className="text-sm text-gray-900">{ticket.assignedTo.name}</p>
                  <p className="text-xs text-gray-500">{ticket.assignedTo.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}