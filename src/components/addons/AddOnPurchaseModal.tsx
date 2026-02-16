'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, CreditCard, Shield, Clock, AlertCircle, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { SlidePanel } from '@/components/ui/slide-panel'
import { useTenantAddOns } from '@/hooks/useAddOns'
import { formatCurrency, capitalize } from '@/lib/utils'

const purchaseSchema = z.object({
  billingCycle: z.enum(['monthly', 'yearly', 'one-time']),
  quantity: z.number().min(1).max(100),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  couponCode: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

interface AddOnPurchaseModalProps {
  open: boolean
  addOn: any
  onClose: () => void
  onSuccess: () => void
}

export function AddOnPurchaseModal({ open, addOn, onClose, onSuccess }: AddOnPurchaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details')
  const [paymentMethods] = useState([
    { id: 'pm_card_visa', type: 'card', last4: '4242', brand: 'visa' },
    { id: 'pm_card_mastercard', type: 'card', last4: '5555', brand: 'mastercard' }
  ])

  const { purchaseAddOn } = useTenantAddOns()

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      billingCycle: addOn?.pricing?.monthly ? 'monthly' : addOn?.pricing?.yearly ? 'yearly' : 'one-time',
      quantity: 1,
      paymentMethodId: '',
      couponCode: '',
      acceptTerms: false
    }
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  const watchedBillingCycle = watch('billingCycle')
  const watchedQuantity = watch('quantity')
  const watchedCouponCode = watch('couponCode')

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
  const discount = 0 // TODO: Apply coupon discount
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal + tax - discount

  const handlePurchase = async (data: PurchaseFormData) => {
    try {
      setLoading(true)
      setStep('processing')

      const purchaseData = {
        billingCycle: data.billingCycle,
        quantity: data.quantity,
        paymentMethodId: data.paymentMethodId,
        couponCode: data.couponCode || undefined,
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
    <SlidePanel open={open} onClose={onClose} title={addOn?.displayName ? `Purchase: ${addOn.displayName}` : 'Purchase Add-on'} width="2xl" accentBar="bg-purple-500">
        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 'details' && (
            <form onSubmit={handleSubmit(handlePurchase)} className="p-6 space-y-4">
              {/* Add-on Summary - More Compact */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${addOn.color?.replace('#', '')}/10 border flex-shrink-0`}>
                      <div className="w-4 h-4 bg-current rounded" style={{ color: addOn.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base">{addOn.displayName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{addOn.shortDescription || addOn.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{capitalize(addOn.category)}</Badge>
                        {addOn.isPopular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                        {addOn.trialDays > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            {addOn.trialDays}-day trial
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Options - More Compact */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Billing Cycle</Label>
                <div className="grid gap-2">
                  {addOn.pricing.monthly && (
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        watchedBillingCycle === 'monthly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setValue('billingCycle', 'monthly')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
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
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {addOn.pricing.yearly && (
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        watchedBillingCycle === 'yearly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setValue('billingCycle', 'yearly')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
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
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {addOn.pricing.oneTime && (
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        watchedBillingCycle === 'one-time' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setValue('billingCycle', 'one-time')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              {...register('billingCycle')}
                              value="one-time"
                              className="w-4 h-4"
                            />
                            <div>
                              <div className="font-medium text-sm">One-time Purchase</div>
                              <div className="text-xs text-muted-foreground">Pay once, use forever</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">{formatCurrency(addOn.pricing.oneTime)}</div>
                            <div className="text-xs text-muted-foreground">one-time</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                {errors.billingCycle && (
                  <p className="text-xs text-red-600">{errors.billingCycle.message}</p>
                )}
              </div>

              {/* Quantity - More Compact */}
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
                      {Array.from({ length: addOn.maxQuantity }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'instance' : 'instances'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Coupon Code - More Compact */}
              <div className="space-y-2">
                <Label htmlFor="couponCode" className="text-sm">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  {...register('couponCode')}
                  placeholder="Enter coupon code"
                  className="h-9"
                />
              </div>

              {/* Payment Method - More Compact */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Payment Method</Label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-colors ${
                        watch('paymentMethodId') === method.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setValue('paymentMethodId', method.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
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
                            <div className="text-xs text-muted-foreground">
                              {method.type === 'card' ? 'Credit/Debit Card' : method.type}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button variant="outline" size="sm" className="w-full h-9" type="button">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </div>
                {errors.paymentMethodId && (
                  <p className="text-xs text-red-600">{errors.paymentMethodId.message}</p>
                )}
              </div>

              {/* Order Summary - More Compact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({watchedQuantity}x {addOn.displayName})</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({watchedCouponCode})</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  
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
                    <Alert className="mt-3">
                      <Clock className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        You'll get a {addOn.trialDays}-day free trial. You won't be charged until the trial ends.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Terms and Conditions - More Compact */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div className="text-xs">
                    <span>I agree to the </span>
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                    <span> and </span>
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </div>
                </div>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>
                )}
              </div>

              {/* Security Notice - More Compact */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your payment information is secure and encrypted. We use Stripe for payment processing.
                </AlertDescription>
              </Alert>
            </form>
          )}

          {/* Fixed Footer with Buttons */}
          {step === 'details' && (
            <div className="border-t p-4 flex gap-3 flex-shrink-0">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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

          {step === 'processing' && (
            <div className="p-8 text-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Processing Payment</h3>
                <p className="text-sm text-muted-foreground">Please wait while we process your payment...</p>
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
                <p className="text-sm text-muted-foreground">
                  {addOn.displayName} has been added to your account.
                </p>
              </div>
              <Button onClick={onSuccess} className="mt-4">
                Continue
              </Button>
            </div>
          )}
        </div>
    </SlidePanel>
  )
}