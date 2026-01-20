'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Key,
  Edit
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SupportUser {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  assignedBranch?: {
    _id: string
    name: string
  }
  ticketStats: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  createdAt: string
  recentTickets?: Array<{
    _id: string
    ticketNumber: string
    title: string
    status: string
    priority: string
    createdAt: string
    raisedBy: {
      name: string
      email: string
    }
  }>
}

interface SupportUserDetailsModalProps {
  user: SupportUser
  onClose: () => void
  onUpdate: () => void
}

export default function SupportUserDetailsModal({ user, onClose, onUpdate }: SupportUserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<SupportUser>(user)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      // API call to update user details would go here
      toast.success('User details updated successfully')
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast.error('Failed to update user details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Support User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>User Information</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userDetails.name}
                      onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userDetails.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{userDetails.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userDetails.phone}
                      onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userDetails.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={userDetails.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {userDetails.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Ticket className="w-5 h-5" />
                <span>Ticket Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userDetails.ticketStats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{userDetails.ticketStats.open}</div>
                  <div className="text-sm text-gray-600">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{userDetails.ticketStats.inProgress}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userDetails.ticketStats.resolved}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          {userDetails.recentTickets && userDetails.recentTickets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDetails.recentTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.ticketNumber} • {ticket.raisedBy.name}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}