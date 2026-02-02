'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, CreditCard, Clock, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useTenantAddOns } from '@/hooks/useAddOns'
import { formatCurrency, capitalize } from '@/lib/utils'

const purchaseSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  quantity: z.number().min(1).max(100),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms')
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

interface CompactAddOnPurchaseModalProps {
  open: boolean
  addOn: any
  onClose: () => void
  onSuccess: () => void
}

export function CompactAddOnPurchaseModal({ open, addOn, onClose, onSuccess }: CompactAddOnPurchaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')
  const [paymentMethods] = useState([
    { id: 'pm_card_visa', type: 'card', last4: '4242', brand: 'visa' },
    { id: 'pm_card_mastercard', type: 'card', last4: '5555', brand: 'mastercard' }
  ])

  const { purchaseAddOn } = useTenantAddOns()

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Disable body scroll
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      // Re-enable body scroll
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [open])

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      billingCycle: addOn?.pricing?.monthly ? 'monthly' : addOn?.pricing?.yearly ? 'yearly' : 'one-time',
      quantity: 1,
      paymentMethodId: '',
      acceptTerms: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  const watchedBillingCycle = watch('billingCycle')
  const watchedQuantity = watch('quantity')

  // Calculate pricing
  const getPrice = () => {
    if (!addOn?.pricing) return 0
    
    switch (watchedBillingCycle) {
      case 'monthly':
        return addOn.pricing.monthly || 0
      case 'yearly':
        return addOn.pricing.yearly || 0
      case 'one-time':
        return addOn.pricing.oneTime || 0
      default:
        return 0
    }
  }

  const subtotal = getPrice() * watchedQuantity
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + tax

  const handlePurchase = async (data: PurchaseFormData) => {
    try {
      setLoading(true)
      setStep('processing')

      const purchaseData = {
        billingCycle: data.billingCycle,
        quantity: data.quantity,
        paymentMethodId: data.paymentMethodId,
        metadata: {
          source: 'marketplace',
          userAgent: navigator.userAgent
        }
      }

      await purchaseAddOn(addOn._id, purchaseData)
      
      setStep('success')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      console.error('Purchase failed:', error)
      setStep('details')
      // TODO: Show error message
    } finally {
      setLoading(false)
    }
  }

  if (!open || !addOn) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold">Purchase Add-on</h2>
            <p className="text-sm text-muted-foreground">{addOn.displayName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 'details' && (
            <form onSubmit={handleSubmit(handlePurchase)} className="p-4 space-y-4">
              {/* Add-on Summary */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg bg-${addOn.color?.replace('#', '')}/10 border flex-shrink-0`}>
                  <div className="w-4 h-4 bg-current rounded" style={{ color: addOn.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{addOn.displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{capitalize(addOn.category)}</Badge>
                    {addOn.trialDays > 0 && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        {addOn.trialDays}d trial
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Billing Options */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Billing Cycle</Label>
                <div className="space-y-2">
                  {addOn.pricing.monthly && (
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedBillingCycle === 'monthly' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('billingCycle')}
                          value="monthly"
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-sm">Monthly</div>
                          <div className="text-xs text-muted-foreground">Billed monthly</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(addOn.pricing.monthly)}</div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </label>
                  )}

                  {addOn.pricing.yearly && (
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedBillingCycle === 'yearly' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('billingCycle')}
                          value="yearly"
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            Yearly
                            {addOn.pricing.formattedPricing?.savings && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                Save {addOn.pricing.formattedPricing.savings}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Billed annually</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(addOn.pricing.yearly)}</div>
                        <div className="text-xs text-muted-foreground">per year</div>
                      </div>
                    </label>
                  )}

                  {addOn.pricing.oneTime && (
                    <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedBillingCycle === 'one-time' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('billingCycle')}
                          value="one-time"
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium text-sm">One-time</div>
                          <div className="text-xs text-muted-foreground">Pay once, use forever</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(addOn.pricing.oneTime)}</div>
                        <div className="text-xs text-muted-foreground">one-time</div>
                      </div>
                    </label>
                  )}
                </div>
                {errors.billingCycle && (
                  <p className="text-xs text-red-600">{errors.billingCycle.message}</p>
                )}
              </div>

              {/* Quantity */}
              {addOn.maxQuantity > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                  <Select 
                    value={watchedQuantity.toString()} 
                    onValueChange={(value) => setValue('quantity', parseInt(value))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.min(addOn.maxQuantity, 5) }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'instance' : 'instances'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="space-y-2">
                  {paymentMethods.slice(0, 2).map((method) => (
                    <label 
                      key={method.id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        watch('paymentMethodId') === method.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('paymentMethodId')}
                        value={method.id}
                        className="w-4 h-4"
                      />
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">
                          {method.brand.toUpperCase()} •••• {method.last4}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.paymentMethodId && (
                  <p className="text-xs text-red-600">{errors.paymentMethodId.message}</p>
                )}
              </div>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({watchedQuantity}x)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax (GST 18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>

                  {addOn.trialDays > 0 && (
                    <Alert className="mt-2">
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {addOn.trialDays}-day free trial. No charge until trial ends.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Terms */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div className="text-xs">
                    <span>I agree to the </span>
                    <a href="/terms" className="text-primary hover:underline">Terms</a>
                    <span> and </span>
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
                )}
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="p-8 text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Processing Payment</h3>
                <p className="text-muted-foreground text-sm">Please wait...</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Purchase Successful!</h3>
                <p className="text-muted-foreground text-sm">
                  {addOn.displayName} has been added to your account.
                </p>
              </div>
              <Button onClick={onSuccess} className="mt-4">
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* Fixed Footer - Only show for details step */}
        {step === 'details' && (
          <div className="border-t p-4 flex gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1"
              onClick={handleSubmit(handlePurchase)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Now
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}