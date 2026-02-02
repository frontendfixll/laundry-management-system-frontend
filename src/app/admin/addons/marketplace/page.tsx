'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Star, Zap, Shield, Palette, Plug, HeadphonesIcon, ShoppingCart, Eye, Check, ArrowRight, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMarketplaceAddOns } from '@/hooks/useAddOns'
import { capitalize } from '@/lib/utils'
import { CompactAddOnPurchaseModal } from '@/components/addons/CompactAddOnPurchaseModal'
import { AddOnDetailsModal } from '@/components/addons/AddOnDetailsModal'

const categoryIcons = {
  capacity: Zap,
  feature: Star,
  usage: Shield,
  branding: Palette,
  integration: Plug,
  support: HeadphonesIcon
}

const categoryGradients = {
  capacity: 'from-blue-500 to-indigo-600',
  feature: 'from-purple-500 to-pink-600',
  usage: 'from-orange-500 to-red-600',
  branding: 'from-pink-500 to-rose-600',
  integration: 'from-indigo-500 to-purple-600',
  support: 'from-green-500 to-emerald-600'
}

export default function AddOnMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [priceRange, setPriceRange] = useState('')
  const [page, setPage] = useState(1)
  const [selectedAddOn, setSelectedAddOn] = useState(null)
  const [purchasingAddOn, setPurchasingAddOn] = useState(null)

  // Modified handlers that close dropdowns when opening modals
  const handleViewDetails = (addOn: any) => {
    setSelectedAddOn(addOn)
  }

  const handlePurchase = (addOn: any) => {
    setPurchasingAddOn(addOn)
  }

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(() => ({
    search: searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    sortBy,
    priceRange,
    page,
    limit: 12
  }), [searchTerm, categoryFilter, sortBy, priceRange, page])

  const {
    addOns,
    loading,
    error,
    pagination,
    filterOptions,
    refetch
  } = useMarketplaceAddOns(filters)

  const handlePurchaseSuccess = () => {
    setPurchasingAddOn(null)
    refetch()
  }

  const featuredAddOns = addOns?.filter(addon => addon.isFeatured) || []
  const popularAddOns = addOns?.filter(addon => addon.isPopular) || []
  const eligibleAddOns = addOns?.filter(addon => addon.eligibility.eligible) || []
  const restrictedAddOns = addOns?.filter(addon => !addon.eligibility.eligible) || []

  return (
    <div className="space-y-6 pb-8">
      {/* Main Header - SuperAdmin Style */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Add-on Marketplace</h1>
              <p className="text-purple-100">Discover and purchase powerful add-ons to enhance your business</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/admin/addons/my-addons">
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/20">
                <Package className="w-5 h-5 mr-2" />
                My Add-ons
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Add-ons */}
      {featuredAddOns.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Add-ons</h2>
              <p className="text-gray-600 mt-2">Hand-picked add-ons to supercharge your business</p>
            </div>
            <Button variant="outline" className="hidden sm:flex">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {featuredAddOns.slice(0, 6).map((addOn) => (
              <FeaturedAddOnCard
                key={addOn._id}
                addOn={addOn}
                onViewDetails={() => handleViewDetails(addOn)}
                onPurchase={() => handlePurchase(addOn)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Find Your Perfect Add-on</CardTitle>
          <CardDescription className="text-lg">
            Search through our collection of powerful business enhancers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search add-ons by name, feature, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] h-12 border-2 rounded-xl">
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
                <SelectTrigger className="w-[180px] h-12 border-2 rounded-xl">
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
                <SelectTrigger className="w-[180px] h-12 border-2 rounded-xl">
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
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Summary */}
      {addOns && addOns.length > 0 && restrictedAddOns.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Plan Eligibility</h3>
                <p className="text-sm text-amber-700">
                  {eligibleAddOns.length} add-ons available • {restrictedAddOns.length} require plan upgrade
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              View Plans
            </Button>
          </div>
        </div>
      )}

      {/* Add-ons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading add-ons...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading add-ons</h3>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button onClick={refetch} size="lg">
            Try Again
          </Button>
        </div>
      ) : addOns?.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No add-ons found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {addOns?.map((addOn) => (
              <AddOnCard
                key={addOn._id}
                addOn={addOn}
                onViewDetails={() => handleViewDetails(addOn)}
                onPurchase={() => handlePurchase(addOn)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-12">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                size="lg"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.pages}
                size="lg"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Popular Add-ons */}
      {popularAddOns.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular This Month</h2>
              <p className="text-gray-600 mt-2">Most loved by our community</p>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {popularAddOns.slice(0, 8).map((addOn) => (
              <CompactAddOnCard
                key={addOn._id}
                addOn={addOn}
                onViewDetails={() => handleViewDetails(addOn)}
                onPurchase={() => handlePurchase(addOn)}
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
            handlePurchase(selectedAddOn)
            setSelectedAddOn(null)
          }}
        />
      )}

      {purchasingAddOn && (
        <CompactAddOnPurchaseModal
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
  const gradientClass = categoryGradients[addOn.category as keyof typeof categoryGradients]
  
  return (
    <div className="group relative h-[260px] w-full flex flex-col overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white rounded-lg">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      {/* Header with Featured Badge */}
      <div className="pb-2 p-3 relative z-10 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradientClass} shadow-md flex-shrink-0`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate leading-tight">
                {addOn.displayName}
              </h3>
            </div>
          </div>
          {/* Featured Badge - No Overlap */}
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md text-xs px-2 py-1 flex-shrink-0 ml-2">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
        <Badge variant="outline" className="border-gray-300 text-xs px-2 py-0 h-5 w-fit">
          {capitalize(addOn.category)}
        </Badge>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-3 pt-0 relative z-10 min-h-0">
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1 overflow-hidden">
          {addOn.description}
        </p>
        
        {/* Pricing Section - Separate Row */}
        <div className="mb-3 flex-shrink-0">
          <div className="text-left">
            {addOn.pricing.monthly && addOn.pricing.monthly > 0 ? (
              <div className="text-xl font-bold text-gray-900 leading-tight">
                ₹{addOn.pricing.monthly}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </div>
            ) : addOn.pricing.oneTime && addOn.pricing.oneTime > 0 ? (
              <div className="text-xl font-bold text-gray-900 leading-tight">
                ₹{addOn.pricing.oneTime}
                <span className="text-sm font-normal text-gray-500"> once</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-900 leading-tight">
                Free
              </div>
            )}
            {addOn.trialDays > 0 && (
              <div className="text-xs text-blue-600 mt-1 font-medium">
                {addOn.trialDays}-day free trial
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Full Width Row */}
        <div className="flex-shrink-0">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={onViewDetails} 
              className="flex-1 text-sm h-9 border-gray-300 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button 
              onClick={onPurchase} 
              className="flex-1 text-sm h-9 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md"
              disabled={addOn.isPurchased || !addOn.eligibility.eligible}
            >
              {addOn.isPurchased ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Owned
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddOnCard({ addOn, onViewDetails, onPurchase }: any) {
  const IconComponent = categoryIcons[addOn.category as keyof typeof categoryIcons]
  const gradientClass = categoryGradients[addOn.category as keyof typeof categoryGradients]
  
  return (
    <div className="group h-[100px] w-full flex hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white overflow-hidden rounded-md relative">
      {/* Main Content Section with Icon Integrated */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        {/* Title with Small Icon */}
        <div className="mb-1">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`p-1 rounded-md bg-gradient-to-br ${gradientClass} shadow-sm flex-shrink-0`}>
              <IconComponent className="h-3 w-3 text-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors flex-1">
              {addOn.displayName}
            </h3>
            {addOn.isPopular && (
              <Badge className="text-xs px-1 py-0 bg-gradient-to-r from-pink-500 to-rose-500 border-0 text-white flex-shrink-0">
                🔥
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-1 py-0 border-gray-300 bg-gray-50 font-medium">
              {capitalize(addOn.category)}
            </Badge>
            {addOn.trialDays > 0 && (
              <Badge className="text-xs bg-blue-100 text-blue-700 border-0 px-1 py-0">
                {addOn.trialDays}d
              </Badge>
            )}
          </div>
        </div>
        
        {/* Description - Single Line */}
        <div className="flex-1 mb-1">
          <p className="text-xs text-gray-600 leading-tight line-clamp-1 overflow-hidden">
            {addOn.shortDescription || addOn.description}
          </p>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            {addOn.pricing.monthly && addOn.pricing.monthly > 0 ? (
              <>
                <span className="text-sm font-bold text-gray-900">₹{addOn.pricing.monthly}</span>
                <span className="text-xs font-medium text-gray-500">/mo</span>
              </>
            ) : addOn.pricing.oneTime && addOn.pricing.oneTime > 0 ? (
              <>
                <span className="text-sm font-bold text-gray-900">₹{addOn.pricing.oneTime}</span>
                <span className="text-xs font-medium text-gray-500">once</span>
              </>
            ) : (
              <span className="text-sm font-bold text-green-600">Free</span>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails} 
            className="text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-1 py-0.5 h-auto flex items-center justify-center"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Right Section - Action Button */}
      <div className="flex-shrink-0 w-[70px] p-3 flex items-center justify-center">
        <Button 
          size="sm" 
          onClick={onPurchase} 
          className={`w-full h-7 font-semibold text-xs rounded-md shadow-sm transition-all duration-300 flex items-center justify-center ${
            addOn.isPurchased 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md'
          }`}
          disabled={!addOn.eligibility.eligible}
        >
          {addOn.isPurchased ? (
            <>
              <Check className="h-3 w-3 mr-0.5" />
              Own
            </>
          ) : (
            <>
              <ShoppingCart className="h-3 w-3 mr-0.5" />
              Get
            </>
          )}
        </Button>
      </div>
      
      {/* Eligibility Message - Compact Overlay */}
      {!addOn.eligibility.eligible && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-md">
          <div className="text-center p-2 max-w-xs">
            <AlertCircle className="h-3 w-3 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-700 font-medium leading-tight">
              {addOn.eligibility.reason}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function CompactAddOnCard({ addOn, onViewDetails, onPurchase }: any) {
  const IconComponent = categoryIcons[addOn.category as keyof typeof categoryIcons]
  const gradientClass = categoryGradients[addOn.category as keyof typeof categoryGradients]
  
  return (
    <Card className="h-[160px] w-full flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 bg-white overflow-hidden">
      <CardContent className="p-3 flex-1 flex flex-col h-full">
        {/* Header - Fixed Height */}
        <div className="flex items-center gap-2 mb-2 flex-shrink-0 h-8">
          <div className={`p-1 rounded-lg bg-gradient-to-br ${gradientClass} shadow-sm flex-shrink-0`}>
            <IconComponent className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-xs truncate leading-tight">
              {addOn.displayName}
            </div>
            <div className="text-xs text-gray-500 truncate">{capitalize(addOn.category)}</div>
          </div>
        </div>
        
        {/* Pricing Section - Fixed Height */}
        <div className="mb-2 flex-shrink-0 h-12">
          <div className="text-center bg-gray-50 rounded-lg p-2 h-full flex items-center justify-center">
            {addOn.pricing.monthly && addOn.pricing.monthly > 0 ? (
              <div className="text-sm font-bold text-gray-900 leading-tight">
                ₹{addOn.pricing.monthly}
                <span className="text-xs font-normal text-gray-500 block">/mo</span>
              </div>
            ) : addOn.pricing.oneTime && addOn.pricing.oneTime > 0 ? (
              <div className="text-sm font-bold text-gray-900 leading-tight">
                ₹{addOn.pricing.oneTime}
                <span className="text-xs font-normal text-gray-500 block">once</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-gray-900 leading-tight">
                Free
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Fixed at Bottom */}
        <div className="mt-auto flex-shrink-0">
          <div className="flex gap-1.5 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewDetails} 
              className="flex-1 text-xs h-7 border-gray-300 hover:bg-gray-50 px-2"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button 
             size="sm" 
              onClick={onPurchase} 
              className="flex-1 text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white border-0 px-2"
              disabled={addOn.isPurchased || !addOn.eligibility.eligible}
            >
              {addOn.isPurchased ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Owned
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Buy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}