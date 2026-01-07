'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Phone, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthToken = () => {
  const authData = localStorage.getItem('laundry-auth')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.state?.token
    } catch (e) {}
  }
  // Also check for direct token storage
  return localStorage.getItem('token')
}

interface CreateBranchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface BranchFormData {
  name: string
  code: string
  address: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    landmark: string
  }
  contact: {
    phone: string
    email: string
    whatsapp: string
  }
  capacity: {
    maxOrdersPerDay: number
    maxWeightPerDay: number
    maxCustomersPerDay: number
    staffCount: number
  }
  operatingHours: {
    openTime: string
    closeTime: string
    workingDays: string[]
  }
  serviceableRadius: number
}

const WORKING_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export function CreateBranchModal({ isOpen, onClose, onSuccess }: CreateBranchModalProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  const initialFormData: BranchFormData = {
    name: '',
    code: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    contact: {
      phone: '',
      email: '',
      whatsapp: ''
    },
    capacity: {
      maxOrdersPerDay: 100,
      maxWeightPerDay: 500,
      maxCustomersPerDay: 200,
      staffCount: 5
    },
    operatingHours: {
      openTime: '09:00',
      closeTime: '21:00',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    serviceableRadius: 20
  }
  
  const [formData, setFormData] = useState<BranchFormData>(initialFormData)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData)
      setCurrentStep(1)
    }
  }, [isOpen])

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === '') {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      // Handle nested fields
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof BranchFormData],
          [field]: value
        }
      }))
    }
  }

  const handleWorkingDaysChange = (day: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        workingDays: checked
          ? [...prev.operatingHours.workingDays, day]
          : prev.operatingHours.workingDays.filter(d => d !== day)
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only allow submission on step 4 and when explicitly clicked
    if (currentStep !== 4) {
      console.log('⚠️ Form submission blocked - not on final step')
      return
    }
    
    setLoading(true)

    // Debug: Log the exact form data being submitted
    console.log('🔍 Form Data being submitted:')
    console.log('Name:', formData.name)
    console.log('Code:', formData.code)
    console.log('Address:', formData.address)
    console.log('Contact:', formData.contact)
    console.log('Full formData:', JSON.stringify(formData, null, 2))

    try {
      const token = getAuthToken()
      console.log('Using token:', token ? 'Token present' : 'No token')
      
      const response = await fetch(`${API_URL}/admin/branches-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Success result:', result)
        toast.success('Branch created successfully!', {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        })
        onSuccess()
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error('❌ Error response:', error)
        console.error('❌ Response status:', response.status)
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (error.errors && Array.isArray(error.errors)) {
          // Show validation errors
          const errorMessages = error.errors.map((err: any) => err.msg).join(', ')
          toast.error(`Validation Error: ${errorMessages}`, {
            duration: 6000,
            position: 'top-right',
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #f87171',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#fef2f2',
            },
          })
        } else {
          toast.error(`Failed to create branch: ${error.message || 'Unknown error'}`, {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #f87171',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            iconTheme: {
              primary: '#f87171',
              secondary: '#fef2f2',
            },
          })
        }
      }
    } catch (error) {
      console.error('❌ Error creating branch:', error)
      toast.error('Failed to create branch. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #f87171',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#f87171',
          secondary: '#fef2f2',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = () => {
    console.log('🔘 Manual submit button clicked')
    if (currentStep === 4) {
      const form = document.querySelector('form')
      if (form) {
        form.requestSubmit()
      }
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Create New Branch</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 4</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Basic Info</span>
            <span className="text-sm font-medium">Address</span>
            <span className="text-sm font-medium">Operations</span>
            <span className="text-sm font-medium">Review</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Branch Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('', 'name', e.target.value)}
                      placeholder="Downtown Branch"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">2-100 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="code">Branch Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange('', 'code', e.target.value.toUpperCase())}
                      placeholder="DT001"
                      maxLength={10}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">3-10 alphanumeric characters</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.contact.phone}
                      onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                      placeholder="branch@laundry.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    value={formData.contact.whatsapp}
                    onChange={(e) => handleInputChange('contact', 'whatsapp', e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - 10 digits</p>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.address.addressLine1}
                    onChange={(e) => handleInputChange('address', 'addressLine1', e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 5 characters required</p>
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.address.addressLine2}
                    onChange={(e) => handleInputChange('address', 'addressLine2', e.target.value)}
                    placeholder="Near City Mall"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                      placeholder="Mumbai"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">2-50 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                      placeholder="Maharashtra"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">2-50 characters</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={formData.address.pincode}
                      onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Exactly 6 digits required</p>
                  </div>
                  <div>
                    <Label htmlFor="landmark">Landmark</Label>
                    <Input
                      id="landmark"
                      value={formData.address.landmark}
                      onChange={(e) => handleInputChange('address', 'landmark', e.target.value)}
                      placeholder="Near Metro Station"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceableRadius">Serviceable Radius (km)</Label>
                  <Input
                    id="serviceableRadius"
                    type="number"
                    value={formData.serviceableRadius}
                    onChange={(e) => handleInputChange('', 'serviceableRadius', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Operations */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operations & Capacity
                </h3>
                
                {/* Operating Hours */}
                <div>
                  <Label className="text-base font-medium">Operating Hours</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="openTime">Opening Time</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={formData.operatingHours.openTime}
                        onChange={(e) => handleInputChange('operatingHours', 'openTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime">Closing Time</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={formData.operatingHours.closeTime}
                        onChange={(e) => handleInputChange('operatingHours', 'closeTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <Label className="text-base font-medium">Working Days</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {WORKING_DAYS.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.operatingHours.workingDays.includes(day.value)}
                          onChange={(e) => handleWorkingDaysChange(day.value, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Capacity Settings
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="maxOrdersPerDay">Max Orders/Day</Label>
                      <Input
                        id="maxOrdersPerDay"
                        type="number"
                        value={formData.capacity.maxOrdersPerDay}
                        onChange={(e) => handleInputChange('capacity', 'maxOrdersPerDay', parseInt(e.target.value))}
                        min="1"
                        max="1000"
                      />
                      <p className="text-xs text-gray-500 mt-1">1-1000 orders</p>
                    </div>
                    <div>
                      <Label htmlFor="maxWeightPerDay">Max Weight/Day (kg)</Label>
                      <Input
                        id="maxWeightPerDay"
                        type="number"
                        value={formData.capacity.maxWeightPerDay}
                        onChange={(e) => handleInputChange('capacity', 'maxWeightPerDay', parseInt(e.target.value))}
                        min="50"
                        max="5000"
                      />
                      <p className="text-xs text-gray-500 mt-1">50-5000 kg</p>
                    </div>
                    <div>
                      <Label htmlFor="maxCustomersPerDay">Max Customers/Day</Label>
                      <Input
                        id="maxCustomersPerDay"
                        type="number"
                        value={formData.capacity.maxCustomersPerDay}
                        onChange={(e) => handleInputChange('capacity', 'maxCustomersPerDay', parseInt(e.target.value))}
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 1</p>
                    </div>
                    <div>
                      <Label htmlFor="staffCount">Staff Count</Label>
                      <Input
                        id="staffCount"
                        type="number"
                        value={formData.capacity.staffCount}
                        onChange={(e) => handleInputChange('capacity', 'staffCount', parseInt(e.target.value))}
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 1</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium mb-4">Review & Confirm</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium">Basic Information</h4>
                    <p className="text-sm text-gray-600">
                      {formData.name} ({formData.code})
                    </p>
                    <p className="text-sm text-gray-600">{formData.contact.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm text-gray-600">
                      {formData.address.addressLine1}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Operations</h4>
                    <p className="text-sm text-gray-600">
                      {formData.operatingHours.openTime} - {formData.operatingHours.closeTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Max: {formData.capacity.maxOrdersPerDay} orders/day, {formData.capacity.maxWeightPerDay}kg/day
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onClose : prevStep}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleManualSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Branch'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}