'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Package, 
  Plus, 
  Star, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone,
  CheckCircle,
  Clock,
  X,
  Info,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { withRouteGuard } from '@/components/withRouteGuard'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface AddOn {
  _id: string
  name: string
  slug: string
  displayName: string
  description: string
  shortDescription?: string
  category: 'capacity' | 'feature' | 'usage' | 'branding' | 'integration' | 'support'
  subcategory?: string
  tags: string[]
  pricing: {
    monthly?: number
    yearly?: number
    oneTime?: number
  }
  billingCycle: 'monthly' | 'yearly' | 'one-time' | 'usage-based'
  config: any
  icon: string
  color: string
  benefits: string[]
  features: string[]
  useCases: string[]
  status: 'draft' | 'active' | 'hidden' | 'deprecated'
  isPopular: boolean
  isRecommended: boolean
  isFeatured: boolean
  trialDays: number
  maxQuantity: number
}

interface TenantAddOn {
  _id: string
  addOn: AddOn
  status: 'active' | 'trial' | 'expired' | 'cancelled'
  quantity: number
  startDate: string
  endDate?: string
  trialEndDate?: string
  usage?: {
    current: number
    limit: number
    unit: string
  }
  nextBillingDate?: string
  amount: number
}

interface BillingInfo {
  currentPlan: {
    name: string
    price: number
    billingCycle: string
    features: string[]
  }
  nextBillingDate: string
  totalMonthlySpend: number
  addOnsCount: number
}

const categoryIcons = {
  capacity: Users,
  feature: Zap,
  usage: TrendingUp,
  branding: Globe,
  integration: Package,
  support: Shield
}

const categoryColors = {
  capacity: 'bg-blue-100 text-blue-800',
  feature: 'bg-purple-100 text-purple-800',
  usage: 'bg-orange-100 text-orange-800',
  branding: 'bg-pink-100 text-pink-800',
  integration: 'bg-indigo-100 text-indigo-800',
  support: 'bg-green-100 text-green-800'
}

function BillingPage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('marketplace')
  const [loading, setLoading] = useState(true)
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [myAddOns, setMyAddOns] = useState<TenantAddOn[]>([])
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch available add-ons
      const addOnsResponse = await fetch(`${API_URL}/addons/marketplace`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const addOnsData = await addOnsResponse.json()
      
      // Fetch my add-ons
      const myAddOnsResponse = await fetch(`${API_URL}/addons/my-addons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const myAddOnsData = await myAddOnsResponse.json()
      
      // Fetch billing info
      const billingResponse = await fetch(`${API_URL}/billing/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const billingData = await billingResponse.json()

      if (addOnsData.success) setAddOns(addOnsData.data.addOns)
      if (myAddOnsData.success) setMyAddOns(myAddOnsData.data.addOns)
      if (billingData.success) setBillingInfo(billingData.data)
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseAddOn = async (addOnId: string, billingCycle: string) => {
    try {
      setPurchaseLoading(addOnId)
      
      const response = await fetch(`${API_URL}/addons/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          addOnId,
          billingCycle,
          quantity: 1
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Add-on purchased successfully!')
        fetchData() // Refresh data
      } else {
        toast.error(data.message || 'Failed to purchase add-on')
      }
    } catch (error) {
      console.error('Failed to purchase add-on:', error)
      toast.error('Failed to purchase add-on')
    } finally {
      setPurchaseLoading(null)
    }
  }

  const handleCancelAddOn = async (tenantAddOnId: string) => {
    try {
      const response = await fetch(`${API_URL}/addons/cancel/${tenantAddOnId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Add-on cancelled successfully!')
        fetchData() // Refresh data
      } else {
        toast.error(data.message || 'Failed to cancel add-on')
      }
    } catch (error) {
      console.error('Failed to cancel add-on:', error)
      toast.error('Failed to cancel add-on')
    }
  }

  const filteredAddOns = addOns.filter(addOn => {
    const matchesCategory = selectedCategory === 'all' || addOn.category === selectedCategory
    const matchesSearch = addOn.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         addOn.description.toLowerCase().includes(searchTerm.toLowerCase())
    const notAlreadyPurchased = !myAddOns.some(myAddOn => 
      myAddOn.addOn._id === addOn._id && 
      ['active', 'trial'].includes(myAddOn.status)
    )
    
    return matchesCategory && matchesSearch && notAlreadyPurchased
  })

  const categories = [
    { id: 'all', label: 'All Add-ons', count: addOns.length },
    { id: 'capacity', label: 'Capacity', count: addOns.filter(a => a.category === 'capacity').length },
    { id: 'feature', label: 'Features', count: addOns.filter(a => a.category === 'feature').length },
    { id: 'usage', label: 'Usage', count: addOns.filter(a => a.category === 'usage').length },
    { id: 'branding', label: 'Branding', count: addOns.filter(a => a.category === 'branding').length },
    { id: 'integration', label: 'Integration', count: addOns.filter(a => a.category === 'integration').length },
    { id: 'support', label: 'Support', count: addOns.filter(a => a.category === 'support').length }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Billing & Add-ons</h1>
          <p className="text-gray-600">Manage your subscription and purchase add-ons</p>
        </div>
      </div>

      {/* Billing Overview */}
      {billingInfo && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingInfo.currentPlan.name}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(billingInfo.currentPlan.price)}/{billingInfo.currentPlan.billingCycle}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Add-ons</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{billingInfo.addOnsCount}</div>
              <p className="text-xs text-muted-foreground">
                Enhancing your plan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(billingInfo.totalMonthlySpend)}</div>
              <p className="text-xs text-muted-foreground">
                Total monthly cost
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(billingInfo.nextBillingDate)}</div>
              <p className="text-xs text-muted-foreground">
                Renewal date
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Add-ons Marketplace</TabsTrigger>
          <TabsTrigger value="my-addons">My Add-ons ({myAddOns.length})</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Categories Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Add-ons</CardTitle>
              <CardDescription>
                Enhance your LaundryPro experience with powerful add-ons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search add-ons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.id !== 'all' && categoryIcons[category.id as keyof typeof categoryIcons] && (
                        React.createElement(categoryIcons[category.id as keyof typeof categoryIcons], { className: "h-4 w-4" })
                      )}
                      {category.label}
                      <Badge variant="secondary" className="ml-1">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add-ons Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAddOns.map((addOn) => (
              <AddOnCard
                key={addOn._id}
                addOn={addOn}
                onPurchase={handlePurchaseAddOn}
                loading={purchaseLoading === addOn._id}
              />
            ))}
          </div>

          {filteredAddOns.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons found</h3>
                <p className="text-gray-500">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No add-ons are currently available'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-addons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Add-ons</CardTitle>
              <CardDescription>
                Manage your active add-ons and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myAddOns.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons yet</h3>
                  <p className="text-gray-500 mb-4">
                    Browse the marketplace to enhance your LaundryPro experience
                  </p>
                  <Button onClick={() => setActiveTab('marketplace')}>
                    Browse Add-ons
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myAddOns.map((tenantAddOn) => (
                    <MyAddOnCard
                      key={tenantAddOn._id}
                      tenantAddOn={tenantAddOn}
                      onCancel={handleCancelAddOn}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your payment history and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing History</h3>
                <p className="text-gray-500">
                  Billing history feature coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AddOnCardProps {
  addOn: AddOn
  onPurchase: (addOnId: string, billingCycle: string) => void
  loading: boolean
}

function AddOnCard({ addOn, onPurchase, loading }: AddOnCardProps) {
  const IconComponent = categoryIcons[addOn.category]
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {addOn.isPopular && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-orange-100 text-orange-800">
            <Star className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: addOn.color + '20', color: addOn.color }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{addOn.displayName}</CardTitle>
            <CardDescription className="mt-1">
              {addOn.shortDescription || addOn.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={categoryColors[addOn.category]}
          >
            {addOn.category}
          </Badge>
          {addOn.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {addOn.benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {addOn.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div>
              {addOn.pricing.monthly && (
                <div className="text-2xl font-bold">
                  {formatCurrency(addOn.pricing.monthly)}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </div>
              )}
              {addOn.pricing.yearly && (
                <div className="text-sm text-gray-500">
                  or {formatCurrency(addOn.pricing.yearly)}/year
                </div>
              )}
              {addOn.pricing.oneTime && (
                <div className="text-2xl font-bold">
                  {formatCurrency(addOn.pricing.oneTime)}
                  <span className="text-sm font-normal text-gray-500"> one-time</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {addOn.pricing.monthly && (
              <Button
                onClick={() => onPurchase(addOn._id, 'monthly')}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? 'Processing...' : 'Purchase Monthly'}
              </Button>
            )}
            {addOn.pricing.yearly && (
              <Button
                onClick={() => onPurchase(addOn._id, 'yearly')}
                disabled={loading}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {loading ? 'Processing...' : 'Purchase Yearly'}
              </Button>
            )}
            {addOn.pricing.oneTime && (
              <Button
                onClick={() => onPurchase(addOn._id, 'one-time')}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? 'Processing...' : 'Purchase Now'}
              </Button>
            )}
          </div>

          {addOn.trialDays > 0 && (
            <div className="mt-2 text-xs text-center text-gray-500">
              {addOn.trialDays} days free trial included
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface MyAddOnCardProps {
  tenantAddOn: TenantAddOn
  onCancel: (id: string) => void
}

function MyAddOnCard({ tenantAddOn, onCancel }: MyAddOnCardProps) {
  const { addOn } = tenantAddOn
  const IconComponent = categoryIcons[addOn.category]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: addOn.color + '20', color: addOn.color }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{addOn.displayName}</h3>
                <Badge className={getStatusColor(tenantAddOn.status)}>
                  {tenantAddOn.status}
                </Badge>
                {tenantAddOn.quantity > 1 && (
                  <Badge variant="outline">
                    Qty: {tenantAddOn.quantity}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{addOn.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Started: {formatDate(tenantAddOn.startDate)}</span>
                {tenantAddOn.nextBillingDate && (
                  <span>Next billing: {formatDate(tenantAddOn.nextBillingDate)}</span>
                )}
                <span>{formatCurrency(tenantAddOn.amount)}/month</span>
              </div>

              {tenantAddOn.usage && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{tenantAddOn.usage.current} / {tenantAddOn.usage.limit} {tenantAddOn.usage.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((tenantAddOn.usage.current / tenantAddOn.usage.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {tenantAddOn.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(tenantAddOn._id)}
                className="text-red-600 hover:text-red-700"
              >
                Cancel
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default withRouteGuard(BillingPage, {
  module: 'billing',
  action: 'view'
})