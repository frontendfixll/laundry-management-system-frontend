'use client'

import { useState } from 'react'
import { Plus, Settings, TrendingUp, Users, DollarSign, Clock, AlertCircle, CheckCircle, XCircle, Eye, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useTenantAddOns, useAddOnUsageStats } from '@/hooks/useAddOns'
import { formatCurrency, formatDate, formatNumber, capitalize } from '@/lib/utils'
import { AddOnCancelModal } from '@/components/addons/AddOnCancelModal'
import { AddOnUsageModal } from '@/components/addons/AddOnUsageModal'
import Link from 'next/link'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  trial: 'bg-blue-100 text-blue-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
}

const statusIcons = {
  active: CheckCircle,
  trial: Clock,
  suspended: AlertCircle,
  cancelled: XCircle,
  expired: XCircle
}

export default function MyAddOnsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [cancellingAddOn, setCancellingAddOn] = useState(null)
  const [viewingUsage, setViewingUsage] = useState(null)

  const {
    addOns,
    summary,
    loading,
    error,
    cancelAddOn,
    refetch
  } = useTenantAddOns({
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    includeUsage: true
  })

  const { stats: usageStats } = useAddOnUsageStats('30d')

  const handleCancelSuccess = () => {
    setCancellingAddOn(null)
    refetch()
  }

  const activeAddOns = addOns?.filter(addon => addon.status === 'active') || []
  const trialAddOns = addOns?.filter(addon => addon.status === 'trial') || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Add-ons</h1>
          <p className="text-muted-foreground">
            Manage your active add-ons and view usage statistics
          </p>
        </div>
        <Link href="/addons/marketplace">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Browse Add-ons
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Add-ons</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.trial || 0} in trial
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                activeAddOns.reduce((sum, addon) => {
                  const pricing = addon.effectivePricing
                  return sum + (pricing?.monthly || 0) * addon.quantity
                }, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                addOns?.reduce((sum, addon) => {
                  return sum + (addon.usageTracking?.remainingCredits || 0)
                }, 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Credits remaining
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary?.byCategory || {}).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Add-ons Quick View */}
      {activeAddOns.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Active Add-ons</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeAddOns.slice(0, 6).map((tenantAddOn) => (
              <AddOnQuickCard
                key={tenantAddOn.id}
                tenantAddOn={tenantAddOn}
                onViewUsage={() => setViewingUsage(tenantAddOn)}
                onCancel={() => setCancellingAddOn(tenantAddOn)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trial Add-ons */}
      {trialAddOns.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Trial Add-ons</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trialAddOns.map((tenantAddOn) => (
              <TrialAddOnCard
                key={tenantAddOn.id}
                tenantAddOn={tenantAddOn}
                onViewUsage={() => setViewingUsage(tenantAddOn)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Add-ons</CardTitle>
          <CardDescription>
            Complete list of your add-ons with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="capacity">Capacity</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="usage">Usage</SelectItem>
                <SelectItem value="branding">Branding</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading add-ons: {error.message}
            </div>
          ) : addOns?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No add-ons found</div>
              <Link href="/addons/marketplace">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Add-ons
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Add-on</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addOns?.map((tenantAddOn) => (
                    <TableRow key={tenantAddOn.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{tenantAddOn.addOn.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {capitalize(tenantAddOn.addOn.category)}
                            {tenantAddOn.quantity > 1 && ` • ${tenantAddOn.quantity}x`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tenantAddOn.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {tenantAddOn.effectivePricing?.monthly && 
                              formatCurrency(tenantAddOn.effectivePricing.monthly * tenantAddOn.quantity)
                            }
                            {tenantAddOn.effectivePricing?.yearly && 
                              formatCurrency(tenantAddOn.effectivePricing.yearly * tenantAddOn.quantity)
                            }
                            {tenantAddOn.effectivePricing?.oneTime && 
                              formatCurrency(tenantAddOn.effectivePricing.oneTime * tenantAddOn.quantity)
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {capitalize(tenantAddOn.billingCycle)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {tenantAddOn.usageTracking ? (
                          <UsageIndicator usageTracking={tenantAddOn.usageTracking} />
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {tenantAddOn.nextBillingDate ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              {formatDate(tenantAddOn.nextBillingDate)}
                            </div>
                            {tenantAddOn.daysRemaining && (
                              <div className="text-xs text-muted-foreground">
                                {tenantAddOn.daysRemaining} days
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {tenantAddOn.usageTracking && (
                              <DropdownMenuItem onClick={() => setViewingUsage(tenantAddOn)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Usage
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            {tenantAddOn.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => setCancellingAddOn(tenantAddOn)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {cancellingAddOn && (
        <AddOnCancelModal
          open={!!cancellingAddOn}
          tenantAddOn={cancellingAddOn}
          onClose={() => setCancellingAddOn(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {viewingUsage && (
        <AddOnUsageModal
          open={!!viewingUsage}
          tenantAddOn={viewingUsage}
          onClose={() => setViewingUsage(null)}
        />
      )}
    </div>
  )
}

function AddOnQuickCard({ tenantAddOn, onViewUsage, onCancel }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{tenantAddOn.addOn.displayName}</CardTitle>
          <StatusBadge status={tenantAddOn.status} />
        </div>
        <CardDescription>
          {capitalize(tenantAddOn.addOn.category)}
          {tenantAddOn.quantity > 1 && ` • ${tenantAddOn.quantity}x`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Monthly Cost:</span>
          <span className="font-medium">
            {formatCurrency((tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity)}
          </span>
        </div>
        
        {tenantAddOn.usageTracking && (
          <UsageIndicator usageTracking={tenantAddOn.usageTracking} />
        )}
        
        {tenantAddOn.nextBillingDate && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next Billing:</span>
            <span className="font-medium">{formatDate(tenantAddOn.nextBillingDate)}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {tenantAddOn.usageTracking && (
            <Button variant="outline" size="sm" onClick={onViewUsage} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Usage
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1">
            <Settings className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TrialAddOnCard({ tenantAddOn, onViewUsage }: any) {
  const trialEndsAt = new Date(tenantAddOn.activatedAt)
  trialEndsAt.setDate(trialEndsAt.getDate() + tenantAddOn.addOn.trialDays)
  const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{tenantAddOn.addOn.displayName}</CardTitle>
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Trial
          </Badge>
        </div>
        <CardDescription>
          {capitalize(tenantAddOn.addOn.category)} • {daysLeft} days left
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Trial Progress:</span>
            <span className="font-medium">{Math.max(0, daysLeft)} days left</span>
          </div>
          <Progress 
            value={Math.max(0, (tenantAddOn.addOn.trialDays - daysLeft) / tenantAddOn.addOn.trialDays * 100)} 
            className="h-2"
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">After Trial:</span>
          <span className="font-medium">
            {formatCurrency((tenantAddOn.effectivePricing?.monthly || 0) * tenantAddOn.quantity)}/mo
          </span>
        </div>
        
        {tenantAddOn.usageTracking && (
          <UsageIndicator usageTracking={tenantAddOn.usageTracking} />
        )}
        
        <div className="flex gap-2 pt-2">
          {tenantAddOn.usageTracking && (
            <Button variant="outline" size="sm" onClick={onViewUsage} className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Usage
            </Button>
          )}
          <Button size="sm" className="flex-1">
            Continue Trial
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const IconComponent = statusIcons[status as keyof typeof statusIcons]
  
  return (
    <Badge variant="secondary" className={statusColors[status as keyof typeof statusColors]}>
      <IconComponent className="h-3 w-3 mr-1" />
      {capitalize(status)}
    </Badge>
  )
}

function UsageIndicator({ usageTracking }: { usageTracking: any }) {
  const totalCredits = usageTracking.totalUsed + usageTracking.remainingCredits
  const usagePercentage = totalCredits > 0 ? (usageTracking.totalUsed / totalCredits) * 100 : 0
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Usage:</span>
        <span className="font-medium">
          {formatNumber(usageTracking.remainingCredits)} credits left
        </span>
      </div>
      <Progress value={usagePercentage} className="h-2" />
      {usageTracking.lowBalanceAlerted && (
        <div className="text-xs text-orange-600">Low balance alert</div>
      )}
    </div>
  )
}