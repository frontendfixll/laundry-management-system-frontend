'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Tag,
  ArrowUpRight
} from 'lucide-react'
import { tenantTicketApi, TenantTicket, TicketFilters } from '@/services/tenantTicketApi'
import { ThemedSpinner } from '@/components/ui/ThemedSpinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

export default function TicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TenantTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [viewingTicket, setViewingTicket] = useState<string | null>(null)
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 20
  })

  // Load tickets
  const loadTickets = async (isFilterChange = false) => {
    try {
      if (isFilterChange) {
        setFilterLoading(true)
      } else {
        setLoading(true)
      }
      
      const response = await tenantTicketApi.getTickets(filters)
      setTickets(response.data || []) // Ensure it's always an array
      setPagination(response.pagination || { total: 0, pages: 0, page: 1, limit: 20 })
    } catch (error) {
      console.error('❌ Error loading tickets:', error)
      setTickets([]) // Set empty array on error
      setPagination({ total: 0, pages: 0, page: 1, limit: 20 })
    } finally {
      setLoading(false)
      setFilterLoading(false)
    }
  }

  useEffect(() => {
    const isInitialLoad = loading && !filterLoading
    loadTickets(!isInitialLoad)
  }, [filters])

  const handleFilterChange = (key: keyof TicketFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
    }))
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const search = formData.get('search') as string
    handleFilterChange('search', search)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Support Tickets</h1>
          <p className="text-gray-600 mt-1">
            Track your support requests and communicate with our platform team
          </p>
        </div>
        
        <button
          onClick={() => {
            setNavigating(true)
            router.push('/admin/platform-support/create')
          }}
          disabled={navigating}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {navigating ? (
            <ThemedSpinner size="sm" variant="white" className="mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {navigating ? 'Loading...' : 'Create Ticket'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                name="search"
                type="text"
                placeholder="Search tickets..."
                defaultValue={filters.search || ''}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Filter Dropdowns */}
          <div className="flex space-x-3">
            <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_for_tenant">Waiting for You</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority || ''} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="order_operations">Order & Operations</SelectItem>
                <SelectItem value="payment_settlement">Payment & Settlement</SelectItem>
                <SelectItem value="refunds">Refunds</SelectItem>
                <SelectItem value="account_subscription">Account & Subscription</SelectItem>
                <SelectItem value="technical_bug">Technical / Bug</SelectItem>
                <SelectItem value="how_to_configuration">How-To / Configuration</SelectItem>
                <SelectItem value="security_compliance">Security / Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg border border-gray-200 relative">
        {/* Filter Loading Overlay */}
        {filterLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <ThemedSpinner 
              size="md" 
              variant="primary" 
              showText={true} 
              text="Applying filters..."
            />
          </div>
        )}
        
        {loading ? (
          <div className="p-12 text-center">
            <ThemedSpinner 
              size="lg" 
              variant="primary" 
              showText={true} 
              text="Loading your support tickets..."
              className="py-8"
            />
          </div>
        ) : (tickets || []).length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.priority || filters.category
                ? 'No tickets match your current filters.'
                : 'You haven\'t created any support tickets yet.'
              }
            </p>
            <Link
              href="/admin/platform-support/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <>
            {/* Tickets Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SLA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(tickets || []).map((ticket) => {
                    const StatusIcon = statusIcons[ticket.status]
                    const slaStatus = getSLAStatus(ticket)
                    
                    return (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-blue-600">
                                {ticket.ticketNumber}
                              </span>
                              {ticket.messages.length > 0 && (
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 mt-1">
                              {ticket.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.subcategory}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4 text-gray-400" />
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[ticket.status]}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityColors[ticket.systemPriority]}`}>
                            {ticket.systemPriority}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {ticket.category.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Clock className={`w-4 h-4 ${slaStatus.color}`} />
                            <span className={`text-sm ${slaStatus.color}`}>
                              {slaStatus.text}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getTimeAgo(ticket.lastActivityAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(ticket.lastActivityAt)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setViewingTicket(ticket._id)
                              router.push(`/admin/platform-support/tickets/${ticket._id}`)
                            }}
                            disabled={viewingTicket === ticket._id}
                            className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] justify-center"
                          >
                            {viewingTicket === ticket._id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent mr-1"></div>
                                <span className="text-xs">Loading</span>
                              </div>
                            ) : (
                              <>
                                View
                                <ArrowUpRight className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} tickets
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFilterChange('page', pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            page === pagination.page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handleFilterChange('page', pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}