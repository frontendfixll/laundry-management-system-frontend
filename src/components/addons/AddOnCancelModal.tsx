'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { AlertTriangle, Calendar, X, CheckCircle, Clock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ModalSelect, ModalSelectContent, ModalSelectItem, ModalSelectTrigger, ModalSelectValue } from '@/components/ui/modal-select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ModalPortal } from '@/components/ui/modal-portal'
import { useTenantAddOns } from '@/hooks/useAddOns'
import { formatCurrency, formatDate, capitalize } from '@/lib/utils'

const cancelSchema = z.object({
  reason: z.string().min(1, 'Please select a reason for cancellation'),
  effectiveDate: z.enum(['immediate', 'end_of_cycle', 'custom']),
  customDate: z.string().optional(),
  feedback: z.string().optional()
})

type CancelFormData = z.infer<typeof cancelSchema>

interface AddOnCancelModalProps {
  open: boolean
  tenantAddOn: any
  onClose: () => void
  onSuccess: () => void
}

const cancellationReasons = [
  'No longer needed',
  'Too expensive', 
  'Found better alternative',
  'Technical issues',
  'Poor customer support',
  'Feature not as expected',
  'Business closure',
  'Other'
]

export function AddOnCancelModal({ open, tenantAddOn, onClose, onSuccess }: AddOnCancelModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'reason' | 'confirmation' | 'success'>('reason')
  const [selectedReason, setSelectedReason] = useState('')
  const [showReasonFeedback, setShowReasonFeedback] = useState(false)

  const { cancelAddOn } = useTenantAddOns()

  const form = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: '',
      effectiveDate: 'end_of_cycle',
      customDate: '',
      feedback: ''
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger, reset } = form

  const watchedEffectiveDate = watch('effectiveDate')
  const watchedReason = watch('reason')

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset()
      setSelectedReason('')
      setStep('reason')
      setShowReasonFeedback(false)
      setLoading(false)
    }
  }, [open, reset])

  const handleReasonSelect = (reason: string) => {
    console.log('🎯 Reason selected:', reason)
    setSelectedReason(reason)
    setValue('reason', reason)
    trigger('reason')
    setShowReasonFeedback(true)
    
    // Show selection toast with higher z-index
    toast.success(`Reason selected: ${reason}`, {
      duration: 2000,
      icon: '✅',
      style: {
        background: '#059669',
        color: 'white',
        fontSize: '14px',
        zIndex: 99999, // Higher than modal
      },
    })
    
    // Show feedback for 2 seconds
    setTimeout(() => {
      setShowReasonFeedback(false)
    }, 2000)
  }

  const handleEffectiveDateChange = (value: 'immediate' | 'end_of_cycle' | 'custom') => {
    console.log('📅 Effective date changed:', value)
    setValue('effectiveDate', value)
  }

  const getEffectiveDate = () => {
    switch (watchedEffectiveDate) {
      case 'immediate':
        return new Date()
      case 'end_of_cycle':
        return tenantAddOn.nextBillingDate ? new Date(tenantAddOn.nextBillingDate) : new Date()
      case 'custom':
        return watch('customDate') ? new Date(watch('customDate')) : new Date()
      default:
        return new Date()
    }
  }

  const getRefundAmount = () => {
    if (watchedEffectiveDate === 'immediate' && tenantAddOn.billingCycle === 'monthly') {
      const billingDate = new Date(tenantAddOn.nextBillingDate)
      const now = new Date()
      const daysInMonth = new Date(billingDate.getFullYear(), billingDate.getMonth() + 1, 0).getDate()
      const daysRemaining = Math.ceil((billingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const monthlyAmount = (tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity
      return (monthlyAmount * daysRemaining) / daysInMonth
    }
    return 0
  }

  const handleContinue = async () => {
    console.log('➡️ Continue button clicked')
    const isValid = await trigger(['reason', 'effectiveDate'])
    
    if (isValid && selectedReason) {
      console.log('✅ Form is valid, moving to confirmation')
      setStep('confirmation')
    } else {
      console.log('❌ Form validation failed')
      if (!selectedReason) {
        alert('Please select a reason for cancellation')
      }
    }
  }

  const handleCancel = async (data: CancelFormData) => {
    console.log('🚫 Starting cancellation process...')
    try {
      setLoading(true)
      
      const effectiveDate = getEffectiveDate()
      
      console.log('📡 Calling cancelAddOn API...')
      console.log('📋 Cancellation data:', {
        tenantAddOnId: tenantAddOn.id,
        reason: data.reason,
        effectiveDate: watchedEffectiveDate === 'immediate' ? undefined : effectiveDate.toISOString()
      })
      
      await cancelAddOn(
        tenantAddOn.id,
        data.reason,
        watchedEffectiveDate === 'immediate' ? undefined : effectiveDate.toISOString()
      )
      
      console.log('✅ Cancellation successful')
      
      // Show success toast with higher z-index
      toast.success(`${tenantAddOn.addOn.displayName} cancelled successfully!`, {
        duration: 4000,
        icon: '✅',
        style: {
          background: '#10B981',
          color: 'white',
          zIndex: 99999, // Higher than modal
        },
      })
      
      setStep('success')
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
      
    } catch (error: any) {
      console.error('❌ Failed to cancel add-on:', error)
      
      // Show error toast with higher z-index
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel add-on'
      toast.error(`Cancellation failed: ${errorMessage}`, {
        duration: 5000,
        icon: '❌',
        style: {
          background: '#EF4444',
          color: 'white',
          zIndex: 99999, // Higher than modal
        },
      })
      
      // Log detailed error for debugging
      console.error('📋 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      })
      
      setLoading(false)
    }
  }

  if (!tenantAddOn) return null

  return (
    <ModalPortal isOpen={open}>
      <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b bg-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              {step === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {step === 'success' ? 'Cancellation Successful' : 'Cancel Add-on'}
                </h2>
                <p className="text-sm text-muted-foreground">{tenantAddOn.addOn.displayName}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
          
          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="p-6 space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600">Add-on Cancelled Successfully!</h3>
                <p className="text-muted-foreground">
                  {tenantAddOn.addOn.displayName} has been cancelled and will be effective on{' '}
                  <span className="font-medium">{formatDate(getEffectiveDate())}</span>
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reason:</span>
                    <span className="font-medium">{selectedReason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Date:</span>
                    <span className="font-medium">{formatDate(getEffectiveDate())}</span>
                  </div>
                  {getRefundAmount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Refund Amount:</span>
                      <span className="font-medium">{formatCurrency(getRefundAmount())}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This window will close automatically in a few seconds...
              </p>
            </div>
          )}

          {/* REASON SELECTION STEP */}
          {step === 'reason' && (
            <div className="p-6 space-y-6">
              {/* Add-on Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-on Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{tenantAddOn.addOn.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <Badge variant="outline">{capitalize(tenantAddOn.addOn.category)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary">{capitalize(tenantAddOn.status)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Cost:</span>
                    <span className="font-medium">
                      {formatCurrency((tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity)}
                    </span>
                  </div>
                  {tenantAddOn.nextBillingDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Billing:</span>
                      <span className="font-medium">{formatDate(tenantAddOn.nextBillingDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cancellation Reason */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Why are you cancelling? *</Label>
                <ModalSelect value={selectedReason} onValueChange={handleReasonSelect}>
                  <ModalSelectTrigger className={`${errors.reason ? 'border-red-500' : ''} ${selectedReason ? 'border-green-500 bg-green-50' : ''}`}>
                    <ModalSelectValue placeholder="Click here to select a reason" />
                  </ModalSelectTrigger>
                  <ModalSelectContent>
                    {cancellationReasons.map((reason) => (
                      <ModalSelectItem key={reason} value={reason}>
                        <div className="flex items-center gap-2">
                          {selectedReason === reason && <CheckCircle className="h-4 w-4 text-green-600" />}
                          <span>{reason}</span>
                        </div>
                      </ModalSelectItem>
                    ))}
                  </ModalSelectContent>
                </ModalSelect>
                
                {errors.reason && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.reason.message}
                  </p>
                )}
                
                {showReasonFeedback && selectedReason && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Selected: {selectedReason}</span>
                  </div>
                )}
              </div>

              {/* When to Cancel */}
              <div className="space-y-4">
                <Label className="text-base font-medium">When should the cancellation take effect? *</Label>
                <div className="space-y-3">
                  {/* Immediate Option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm ${
                      watchedEffectiveDate === 'immediate' 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-sm' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleEffectiveDateChange('immediate')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        {...register('effectiveDate')}
                        value="immediate"
                        checked={watchedEffectiveDate === 'immediate'}
                        onChange={() => handleEffectiveDateChange('immediate')}
                        className="w-4 h-4 mt-1 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Cancel Immediately
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Access will be removed right away
                        </div>
                        {getRefundAmount() > 0 && (
                          <div className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            Prorated refund: {formatCurrency(getRefundAmount())}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* End of Cycle Option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm ${
                      watchedEffectiveDate === 'end_of_cycle' 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-sm' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleEffectiveDateChange('end_of_cycle')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        {...register('effectiveDate')}
                        value="end_of_cycle"
                        checked={watchedEffectiveDate === 'end_of_cycle'}
                        onChange={() => handleEffectiveDateChange('end_of_cycle')}
                        className="w-4 h-4 mt-1 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Cancel at End of Billing Cycle
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Continue using until {tenantAddOn.nextBillingDate ? formatDate(tenantAddOn.nextBillingDate) : 'next billing date'}
                        </div>
                        <div className="text-sm text-blue-600 mt-2 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Recommended - No refund needed
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Date Option */}
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm ${
                      watchedEffectiveDate === 'custom' 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-sm' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleEffectiveDateChange('custom')}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        {...register('effectiveDate')}
                        value="custom"
                        checked={watchedEffectiveDate === 'custom'}
                        onChange={() => handleEffectiveDateChange('custom')}
                        className="w-4 h-4 mt-1 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Custom Date
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Choose a specific date
                        </div>
                        {watchedEffectiveDate === 'custom' && (
                          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                            <Input
                              type="date"
                              {...register('customDate')}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full max-w-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  {...register('feedback')}
                  placeholder="Help us improve by sharing more details about your experience..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Warning */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Important:</div>
                  <ul className="text-sm space-y-1">
                    <li>• Cancelling will remove access to all add-on features</li>
                    <li>• Any unused credits or quota will be forfeited</li>
                    <li>• You can re-purchase this add-on later if needed</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Keep Add-on
                </Button>
                <Button 
                  type="button"
                  onClick={handleContinue}
                  variant="destructive" 
                  className="flex-1"
                  disabled={!selectedReason}
                >
                  {selectedReason ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Continue to Confirmation
                    </div>
                  ) : (
                    'Select Reason First'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* CONFIRMATION STEP */}
          {step === 'confirmation' && (
            <div className="p-6 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Confirm Cancellation</h3>
                  <p className="text-muted-foreground">
                    Please review your cancellation details before confirming
                  </p>
                </div>
              </div>

              {/* Cancellation Summary */}
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-base text-red-800">Cancellation Summary</CardTitle>
                  <CardDescription className="text-red-600">
                    {tenantAddOn.addOn.displayName} will be cancelled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground font-medium">Reason:</span>
                      <span className="font-medium text-red-600">{selectedReason || watchedReason}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground font-medium">Effective Date:</span>
                      <span className="font-medium">
                        {formatDate(getEffectiveDate())}
                      </span>
                    </div>
                    {getRefundAmount() > 0 && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-muted-foreground font-medium">Refund Amount:</span>
                        <span className="font-medium text-green-600 flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {formatCurrency(getRefundAmount())}
                        </span>
                      </div>
                    )}
                    {watch('feedback') && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-muted-foreground text-sm font-medium">Your Feedback:</span>
                        <p className="text-sm mt-1 text-blue-800">{watch('feedback')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Final Warning */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">This action cannot be undone!</div>
                  <p className="text-sm">
                    Once confirmed, your add-on will be cancelled and you will lose access to all its features.
                    You can re-purchase it later if needed.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('reason')} 
                  className="flex-1"
                  disabled={loading}
                >
                  ← Back to Edit
                </Button>
                <Button 
                  onClick={handleSubmit(handleCancel)}
                  variant="destructive" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Yes, Cancel Add-on
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}