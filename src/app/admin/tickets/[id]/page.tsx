'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAdminTicketDetail } from '@/hooks/useAdminTickets'
import { useAuthStore } from '@/store/authStore'
import { 
  ArrowLeft,
  Ticket,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Package,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const { user } = useAuthStore()
  
  const { ticket, loading, error, addMessage, resolve, refetch } = useAdminTicketDetail(ticketId)
  
  const [newMessage, setNewMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [resolution, setResolution] = useState('')
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    try {
      await addMessage(newMessage, isInternal)
      setNewMessage('')
      alert('Message sent!')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    } finally {
      setSending(false)
    }
  }

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter resolution')
      return
    }
    
    try {
      await resolve(resolution)
      setShowResolveForm(false)
      setResolution('')
      alert('Ticket resolved!')
    } catch (err: any) {
      alert(`Failed: ${err.message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 border-red-200'
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200'
      case 'escalated': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mt-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6 mt-16">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Ticket</h3>
              <p className="text-red-600">{error || 'Ticket not found'}</p>
            </div>
          </div>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{ticket.ticketNumber}</h1>
            <p className="text-gray-600">{ticket.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {ticket.status === 'in_progress' && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setShowResolveForm(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
              </span>
              {ticket.sla?.isOverdue && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Overdue
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
            
            {ticket.resolution && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Resolution</h4>
                <p className="text-green-700">{ticket.resolution}</p>
                {ticket.resolvedBy && (
                  <p className="text-sm text-green-600 mt-2">
                    Resolved by {ticket.resolvedBy.name} on {new Date(ticket.resolvedAt!).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Conversation ({ticket.messages?.length || 0})
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {ticket.messages?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                ticket.messages?.map((msg, index) => (
                  <div 
                    key={msg._id || index} 
                    className={`p-4 rounded-lg ${
                      msg.isInternal 
                        ? 'bg-yellow-50 border border-yellow-200' 
                        : msg.sender?.role === 'customer'
                          ? 'bg-gray-50'
                          : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {msg.sender?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          ({msg.sender?.role || 'user'})
                        </span>
                        {msg.isInternal && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-gray-700">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Internal note (customer won't see)
                    </label>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sending ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Customer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{ticket.raisedBy?.name}</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {ticket.raisedBy?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {ticket.raisedBy?.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Related Order */}
          {ticket.relatedOrder && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Related Order
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-800">{ticket.relatedOrder.orderNumber}</p>
                <p className="text-sm text-gray-600">Status: {ticket.relatedOrder.status}</p>
                <Link href={`/admin/orders?search=${ticket.relatedOrder.orderNumber}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Order
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Ticket className="w-5 h-5 mr-2" />
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-800 capitalize">
                  {ticket.category?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-800">
                  {new Date(ticket.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              {ticket.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium text-gray-800">{ticket.assignedTo.name}</span>
                </div>
              )}
              {ticket.escalatedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Escalated To</span>
                  <span className="font-medium text-orange-600">{ticket.escalatedTo.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Resolve Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution *
                </label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleResolve}
                  disabled={!resolution.trim()}
                >
                  Resolve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowResolveForm(false)
                    setResolution('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
