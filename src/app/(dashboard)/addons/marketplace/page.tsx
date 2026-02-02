'use client'

import { useState } from 'react'
import { Search, Filter, Star, Zap, Shield, Palette, Plug, HeadphonesIcon, ShoppingCart, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketplaceAddOns } from '@/hooks/useAddOns'
import { formatCurrency, capitalize } from '@/lib/utils'
import { AddOnPurchaseModal } from '@/components/addons/AddOnPurchaseModal'
import { AddOnDetailsModal } from '@/components/addons/AddOnDetailsModal'

const categoryIcons = {
  capacity: Zap,
  feature: Star,
  usage: Shield,
  branding: Palette,
  integration: Plug,
  support: HeadphonesIcon
}

const categoryColors = {
  capacity: 'bg-blue-100 text-blue-800 border-blue-200',
  feature: 'bg-purple-100 text-purple-800 border-purple-200',
  usage: 'bg-orange-100 text-orange-800 border-orange-200',
  branding: 'bg-pink-100 text-pink-800 border-pink-200',
  integration: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  support: 'bg-green-100 text-green-800 border-green-200'
}

export default function AddOnMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [priceRange, setPriceRange] = useState('')
  const [page, setPage] = useState(1)
  const [selectedAddOn, setSelectedAddOn] = useState(null)
  const [purchasingAddOn, setPurchasingAddOn] = useState(null)

  const {
    addOns,
    loading,
    error,
    pagination,
    filterOptions,
    refetch
  } = useMarketplaceAddOns({
    search: searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    sortBy,
    priceRange,
    page,
    limit: 12
  })

  const handlePurchaseSuccess = () => {
    setPurchasingAddOn(null)
    refetch()
  }

  const featuredAddOns = addOns?.filter(addon => addon.isFeatured) || []
  const popularAddOns = addOns?.filter(addon => addon.isPopular) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Add-on Marketplace</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Extend your LaundryPro experience with powerful add-ons. 
          Unlock new features, increase capacity, and enhance your business operations.
        </p>
      </div>

      {/* Featured Add-ons */}
      {featuredAddOns.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Featured Add-ons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredAddOns.slice(0, 3).map((addOn) => (
              <FeaturedAddOnCard
                key={addOn._id}
                addOn={addOn}
                onViewDetails={() => setSelectedAddOn(addOn)}
                onPurchase={() => setPurchasingAddOn(addOn)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Find the Perfect Add-on</CardTitle>
          <CardDescription>
            Filter and search through our collection of add-ons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search add-ons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filterOptions?.categories?.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {capitalize(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions?.sortOptions?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Prices</SelectItem>
                <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                <SelectItem value="1000-2000">₹1,000 - ₹2,000</SelectItem>
                <SelectItem value="2000-5000">₹2,000 - ₹5,000</SelectItem>
                <SelectItem value="5000-999999">₹5,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="feature">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value={categoryFilter} className="mt-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <AddOnCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">Error loading add-ons</div>
              <p className="text-muted-foreground">{error.message}</p>
              <Button onClick={refetch} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : addOns?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No add-ons found</div>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {addOns?.map((addOn) => (
                  <AddOnCard
                    key={addOn._id}
                    addOn={addOn}
                    onViewDetails={() => setSelectedAddOn(addOn)}
                    onPurchase={() => setPurchasingAddOn(addOn)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Popular Add-ons */}
      {popularAddOns.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Popular Add-ons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {popularAddOns.slice(0, 4).map((addOn) => (
              <CompactAddOnCard
                key={addOn._id}
                addOn={addOn}
                onViewDetails={() => setSelectedAddOn(addOn)}
                onPurchase={() => setPurchasingAddOn(addOn)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      {selectedAddOn && (
        <AddOnDetailsModal
          open={!!selectedAddOn}
          addOn={selectedAddOn}
          onClose={() => setSelectedAddOn(null)}
          onPurchase={() => {
            setPurchasingAddOn(selectedAddOn)
            setSelectedAddOn(null)
          }}
        />
      )}

      {purchasingAddOn && (
        <AddOnPurchaseModal
          open={!!purchasingAddOn}
          addOn={purchasingAddOn}
          onClose={() => setPurchasingAddOn(null)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  )
}

function FeaturedAddOnCard({ addOn, onViewDetails, onPurchase }: any) {
  const IconComponent = categoryIcons[addOn.category as keyof typeof categoryIcons]
  
  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="absolute top-4 right-4">
        <Badge className="bg-primary text-primary-foreground">Featured</Badge>
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${categoryColors[addOn.category as keyof typeof categoryColors]}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{addOn.displayName}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {capitalize(addOn.category)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {addOn.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pricing:</span>
            <div className="text-right">
              {addOn.pricing.monthly && (
                <div className="font-semibold">
                  {formatCurrency(addOn.pricing.monthly)}/mo
                </div>
              )}
              {addOn.pricing.yearly && (
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(addOn.pricing.yearly)}/yr
                  {addOn.pricing.formattedPricing?.savings && (
                    <span className="text-green-600 ml-1">
                      ({addOn.pricing.formattedPricing.savings}% off)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button 
            size="sm" 
            onClick={onPurchase} 
            className="flex-1"
            disabled={addOn.isPurchased || !addOn.eligibility.eligible}
          >
            {addOn.isPurchased ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Purchased
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Purchase
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddOnCard({ addOn, onViewDetails, onPurchase }: any) {
  const IconComponent = categoryIcons[addOn.category as keyof typeof categoryIcons]
  
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryColors[addOn.category as keyof typeof categoryColors]}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{addOn.displayName}</CardTitle>
              <Badge variant="outline" className="text-xs mt-1">
                {capitalize(addOn.category)}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            {addOn.isPopular && (
              <Badge variant="secondary" className="text-xs">Popular</Badge>
            )}
            {addOn.isRecommended && (
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {addOn.shortDescription || addOn.description}
          </p>
          
          {addOn.benefits && addOn.benefits.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Key Benefits:</div>
              <ul className="text-xs space-y-1">
                {addOn.benefits.slice(0, 2).map((benefit: string, index: number) => (
                  <li key={index} className="flex items-start gap-1">
                    <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="text-center">
            {addOn.pricing.monthly && (
              <div className="font-semibold">
                {formatCurrency(addOn.pricing.monthly)}/mo
              </div>
            )}
            {addOn.pricing.yearly && (
              <div className="text-xs text-muted-foreground">
                {formatCurrency(addOn.pricing.yearly)}/yr
                {addOn.pricing.formattedPricing?.savings && (
                  <span className="text-green-600 ml-1">
                    (Save {addOn.pricing.formattedPricing.savings}%)
                  </span>
                )}
              </div>
            )}
            {addOn.pricing.oneTime && (
              <div className="font-semibold">
                {formatCurrency(addOn.pricing.oneTime)} one-time
              </div>
            )}
            {addOn.trialDays > 0 && (
              <div className="text-xs text-blue-600">
                {addOn.trialDays}-day free trial
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
              Details
            </Button>
            <Button 
              size="sm" 
              onClick={onPurchase} 
              className="flex-1"
              disabled={addOn.isPurchased || !addOn.eligibility.eligible}
            >
              {addOn.isPurchased ? 'Purchased' : 'Purchase'}
            </Button>
          </div>
          
          {!addOn.eligibility.eligible && (
            <p className="text-xs text-red-600 text-center">
              {addOn.eligibility.reason}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CompactAddOnCard({ addOn, onViewDetails, onPurchase }: any) {
  const IconComponent = categoryIcons[addOn.category as keyof typeof categoryIcons]
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${categoryColors[addOn.category as keyof typeof categoryColors]}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{addOn.displayName}</div>
            <div className="text-xs text-muted-foreground">{capitalize(addOn.category)}</div>
          </div>
        </div>
        
        <div className="text-center mb-3">
          {addOn.pricing.monthly && (
            <div className="font-semibold text-sm">
              {formatCurrency(addOn.pricing.monthly)}/mo
            </div>
          )}
        </div>
        
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1 text-xs">
            View
          </Button>
          <Button 
            size="sm" 
            onClick={onPurchase} 
            className="flex-1 text-xs"
            disabled={addOn.isPurchased || !addOn.eligibility.eligible}
          >
            {addOn.isPurchased ? 'Owned' : 'Buy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddOnCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-muted rounded animate-pulse" />
            <div className="w-16 h-3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="w-full h-3 bg-muted rounded animate-pulse" />
          <div className="w-3/4 h-3 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-20 h-4 bg-muted rounded animate-pulse mx-auto" />
          <div className="w-16 h-3 bg-muted rounded animate-pulse mx-auto" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
          <div className="flex-1 h-8 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}