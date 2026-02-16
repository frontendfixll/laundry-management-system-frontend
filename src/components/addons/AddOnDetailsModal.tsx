'use client'

import { useState, useEffect } from 'react'
import { Star, Check, Clock, Users, TrendingUp, Shield, AlertCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SlidePanel } from '@/components/ui/slide-panel'
import { formatCurrency, capitalize } from '@/lib/utils'

interface AddOnDetailsModalProps {
  open: boolean
  addOn: any
  onClose: () => void
  onPurchase: () => void
}

export function AddOnDetailsModal({ open, addOn, onClose, onPurchase }: AddOnDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!open || !addOn) return null

  return (
    <SlidePanel open={open} onClose={onClose} title={addOn.displayName} width="2xl" accentBar="bg-purple-500">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline">{capitalize(addOn.category)}</Badge>
          {addOn.isPopular && <Badge variant="secondary">Popular</Badge>}
          {addOn.isRecommended && <Badge variant="secondary">Recommended</Badge>}
          {addOn.isFeatured && <Badge className="bg-purple-600 text-white">Featured</Badge>}
        </div>
        <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">About this Add-on</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {addOn.description || 'No description available for this add-on.'}
                  </p>
                  {addOn.shortDescription && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm font-medium text-purple-800">{addOn.shortDescription}</p>
                    </div>
                  )}
                </div>

                {/* Key Benefits */}
                {addOn.benefits && addOn.benefits.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Key Benefits</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {addOn.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Use Cases */}
                {addOn.useCases && addOn.useCases.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Perfect For</h3>
                    <div className="space-y-2">
                      {addOn.useCases.map((useCase: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {addOn.tags && addOn.tags.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {addOn.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-6 mt-6">
                {/* Feature List */}
                {addOn.features && addOn.features.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What's Included</h3>
                    <div className="space-y-3">
                      {addOn.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configuration Details */}
                {addOn.config && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuration</h3>
                    
                    {addOn.category === 'capacity' && addOn.config.capacity && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Capacity Enhancement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {addOn.config.capacity.feature && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Feature:</span>
                              <span className="text-sm font-medium">{addOn.config.capacity.feature}</span>
                            </div>
                          )}
                          {addOn.config.capacity.increment && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Increase by:</span>
                              <span className="text-sm font-medium">
                                +{addOn.config.capacity.increment} {addOn.config.capacity.unit || 'units'}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {addOn.category === 'usage' && addOn.config.usage && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Usage Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {addOn.config.usage.type && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Type:</span>
                              <span className="text-sm font-medium">{capitalize(addOn.config.usage.type)}</span>
                            </div>
                          )}
                          {addOn.config.usage.amount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Amount:</span>
                              <span className="text-sm font-medium">
                                {addOn.config.usage.amount} {addOn.config.usage.unit || 'credits'}
                              </span>
                            </div>
                          )}
                          {addOn.config.usage.autoRenew !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Auto-renew:</span>
                              <span className="text-sm font-medium">
                                {addOn.config.usage.autoRenew ? 'Yes' : 'No'}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {addOn.config.features && addOn.config.features.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Feature Unlocks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {addOn.config.features.map((feature: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{feature.key}:</span>
                                <span className="text-sm font-medium">
                                  {typeof feature.value === 'boolean' 
                                    ? (feature.value ? 'Enabled' : 'Disabled')
                                    : feature.value
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Pricing Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Pricing Options</h3>
                    
                    {addOn.pricing?.monthly && addOn.pricing.monthly > 0 && (
                      <Card className="border-2 border-purple-200">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            Monthly Plan
                            <Badge variant="outline">Most Popular</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2 text-gray-900">
                            ₹{addOn.pricing.monthly.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/month</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Billed monthly. Cancel anytime.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {addOn.pricing?.yearly && addOn.pricing.yearly > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            Yearly Plan
                            {addOn.pricing.formattedPricing?.savings && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Save {addOn.pricing.formattedPricing.savings}%
                              </Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2 text-gray-900">
                            ₹{addOn.pricing.yearly.toLocaleString()}
                            <span className="text-sm font-normal text-gray-500">/year</span>
                          </div>
                          {addOn.pricing.monthly && (
                            <p className="text-sm text-gray-600">
                              Equivalent to ₹{Math.round(addOn.pricing.yearly / 12).toLocaleString()}/month
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {addOn.pricing?.oneTime && addOn.pricing.oneTime > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">One-time Purchase</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2 text-gray-900">
                            ₹{addOn.pricing.oneTime.toLocaleString()}
                          </div>
                          <p className="text-sm text-gray-600">
                            Pay once, use forever.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {(!addOn.pricing?.monthly || addOn.pricing.monthly === 0) && 
                     (!addOn.pricing?.yearly || addOn.pricing.yearly === 0) && 
                     (!addOn.pricing?.oneTime || addOn.pricing.oneTime === 0) && (
                      <Card className="border-2 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center justify-between">
                            Free Plan
                            <Badge className="bg-green-100 text-green-800">Free</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold mb-2 text-green-600">
                            Free
                          </div>
                          <p className="text-sm text-gray-600">
                            No cost. Start using immediately.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Billing Information</h3>
                    
                    <div className="space-y-3">
                      {addOn.trialDays > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-blue-900">Free Trial Available</div>
                            <div className="text-sm text-blue-700">
                              Try free for {addOn.trialDays} days
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">Secure Payment</div>
                          <div className="text-sm text-green-700">
                            Powered by Stripe. Your data is safe.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Cancel Anytime</div>
                          <div className="text-sm text-gray-700">
                            No long-term commitments required.
                          </div>
                        </div>
                      </div>

                      {addOn.maxQuantity > 1 && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-yellow-600" />
                          <div>
                            <div className="font-medium text-yellow-900">Scalable</div>
                            <div className="text-sm text-yellow-700">
                              Purchase up to {addOn.maxQuantity} instances
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Eligibility & Requirements</h3>
                  
                  {!addOn.eligibility?.eligible ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <div className="font-medium mb-1 text-red-800">Not Eligible</div>
                        <p className="text-red-700">{addOn.eligibility?.reason || 'This add-on is not available for your current plan.'}</p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-green-200 bg-green-50">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <div className="font-medium mb-1 text-green-800">Eligible</div>
                        <p className="text-green-700">Your account meets all requirements for this add-on.</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* System Requirements */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">System Requirements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Billing Cycle:</span>
                        <span className="text-sm font-medium text-gray-900">{capitalize(addOn.billingCycle || 'monthly')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium text-gray-900">{capitalize(addOn.category)}</span>
                      </div>
                      {addOn.subcategory && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Subcategory:</span>
                          <span className="text-sm font-medium text-gray-900">{capitalize(addOn.subcategory)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Max Quantity:</span>
                        <span className="text-sm font-medium text-gray-900">{addOn.maxQuantity || 1}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Version Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Version Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Current Version:</span>
                        <span className="text-sm font-medium text-gray-900">{addOn.version || '1.0.0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge variant={addOn.status === 'active' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                          {capitalize(addOn.status || 'active')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              {addOn.pricing?.monthly && (
                <div className="font-semibold text-gray-900">
                  ₹{addOn.pricing.monthly.toLocaleString()}/month
                </div>
              )}
              {addOn.pricing?.yearly && (
                <div className="text-sm text-gray-600">
                  or ₹{addOn.pricing.yearly.toLocaleString()}/year
                  {addOn.pricing.formattedPricing?.savings && (
                    <span className="text-green-600 ml-1">
                      (Save {addOn.pricing.formattedPricing.savings}%)
                    </span>
                  )}
                </div>
              )}
              {addOn.pricing?.oneTime && (
                <div className="font-semibold text-gray-900">
                  ₹{addOn.pricing.oneTime.toLocaleString()} once
                </div>
              )}
              {addOn.trialDays > 0 && (
                <div className="text-xs text-blue-600">
                  {addOn.trialDays}-day free trial
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={onPurchase}
              disabled={addOn.isPurchased || !addOn.eligibility?.eligible}
              className="min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white"
            >
              {addOn.isPurchased ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Purchased
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Purchase Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </SlidePanel>
  )
}