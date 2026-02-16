'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, AlertCircle, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ModalSelect, ModalSelectContent, ModalSelectItem, ModalSelectTrigger, ModalSelectValue } from '@/components/ui/modal-select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SlidePanel } from '@/components/ui/slide-panel'
import { useAddOnUsageStats } from '@/hooks/useAddOns'
import { formatNumber, formatDate, capitalize } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AddOnUsageModalProps {
  open: boolean
  tenantAddOn: any
  onClose: () => void
}

export function AddOnUsageModal({ open, tenantAddOn, onClose }: AddOnUsageModalProps) {
  const [period, setPeriod] = useState('30d')
  
  const { stats, loading, error, refetch } = useAddOnUsageStats(period, tenantAddOn?.addOn?._id)

  if (!tenantAddOn) return null

  const usageTracking = tenantAddOn.usageTracking
  const totalCredits = usageTracking?.totalUsed + usageTracking?.remainingCredits || 0
  const usagePercentage = totalCredits > 0 ? (usageTracking?.totalUsed / totalCredits) * 100 : 0

  return (
    <SlidePanel open={open} onClose={onClose} title={tenantAddOn?.addOn?.displayName ? `Usage: ${tenantAddOn.addOn.displayName}` : 'Usage Statistics'} width="2xl" accentBar="bg-purple-500">
          <div className="flex items-center justify-between gap-2 mb-4">
            <ModalSelect value={period} onValueChange={setPeriod}>
              <ModalSelectTrigger className="w-[120px]">
                <ModalSelectValue />
              </ModalSelectTrigger>
              <ModalSelectContent>
                <ModalSelectItem value="7d">Last 7 days</ModalSelectItem>
                <ModalSelectItem value="30d">Last 30 days</ModalSelectItem>
                <ModalSelectItem value="90d">Last 90 days</ModalSelectItem>
              </ModalSelectContent>
            </ModalSelect>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Error loading usage statistics: {error.message}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Usage Overview */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Total Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(usageTracking?.totalUsed || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Credits consumed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Remaining</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(usageTracking?.remainingCredits || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Credits available
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Usage Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {usagePercentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Of total credits
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Credit Usage</CardTitle>
                  <CardDescription>
                    Current usage of your allocated credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used: {formatNumber(usageTracking?.totalUsed || 0)}</span>
                      <span>Remaining: {formatNumber(usageTracking?.remainingCredits || 0)}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{formatNumber(totalCredits)} total credits</span>
                    </div>
                  </div>

                  {usageTracking?.lowBalanceAlerted && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Low Balance Alert</div>
                        <p>
                          Your credit balance is below the threshold of {usageTracking.renewalThreshold} credits.
                          {usageTracking.autoRenew ? ' Auto-renewal is enabled.' : ' Consider purchasing more credits.'}
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Settings</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auto-renew:</span>
                          <Badge variant={usageTracking?.autoRenew ? 'default' : 'secondary'}>
                            {usageTracking?.autoRenew ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Low balance threshold:</span>
                          <span>{usageTracking?.renewalThreshold || 0} credits</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Billing Info</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Billing cycle:</span>
                          <span>{capitalize(tenantAddOn.billingCycle)}</span>
                        </div>
                        {tenantAddOn.nextBillingDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next billing:</span>
                            <span>{formatDate(tenantAddOn.nextBillingDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Usage Chart */}
              {usageTracking?.dailyUsage && usageTracking.dailyUsage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Daily Usage Trend</CardTitle>
                    <CardDescription>
                      Credit consumption over the last {period}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={usageTracking.dailyUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                          formatter={(value, name) => [formatNumber(value as number), name === 'used' ? 'Credits Used' : 'Credits Remaining']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="used" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="used"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="remaining" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          name="remaining"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Usage Statistics */}
              {stats && (
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Usage Summary</CardTitle>
                      <CardDescription>
                        Statistics for the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stats.usageStats?.map((stat: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-muted-foreground">{stat.name}:</span>
                          <span className="font-medium">{formatNumber(stat.value)}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                      <CardDescription>
                        Latest usage transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.recentTransactions?.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <div className="text-sm font-medium">
                                  {transaction.description || 'Usage'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(transaction.createdAt)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  -{formatNumber(transaction.amount)} credits
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No recent activity
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manage Usage</CardTitle>
                  <CardDescription>
                    Configure your usage settings and purchase additional credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Purchase Credits
                    </Button>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Configure Auto-renewal
                    </Button>
                    <Button variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Set Alerts
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Usage Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
    </SlidePanel>
  )
}