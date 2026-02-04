'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react';
import { automationApi, AutomationRule } from '@/services/automationApi';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RulesListProps {
  onEditRule?: (rule: AutomationRule) => void;
  onRefresh?: () => void;
}

export default function RulesList({ onEditRule, onRefresh }: RulesListProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await automationApi.getRules({ limit: 100 });
      setRules(response.rules);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast.error('Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    try {
      setToggleLoading(ruleId);
      const updatedRule = await automationApi.toggleRule(ruleId);
      
      setRules(prev => prev.map(rule => 
        rule.ruleId === ruleId ? updatedRule : rule
      ));
      
      toast.success(`Rule ${updatedRule.isActive ? 'activated' : 'deactivated'} successfully`);
      onRefresh?.();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle rule');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleName: string) => {
    if (!confirm(`Are you sure you want to delete the rule "${ruleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(ruleId);
      await automationApi.deleteRule(ruleId);
      
      setRules(prev => prev.filter(rule => rule.ruleId !== ruleId));
      toast.success('Rule deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleTestRule = async (ruleId: string) => {
    try {
      await automationApi.testRule(ruleId);
      toast.success('Rule test completed successfully');
    } catch (error) {
      console.error('Error testing rule:', error);
      toast.error('Failed to test rule');
    }
  };

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.trigger.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesScope = scopeFilter === 'all' || rule.scope === scopeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && rule.isActive) ||
                         (statusFilter === 'inactive' && !rule.isActive);

    return matchesSearch && matchesScope && matchesStatus;
  });

  const getStatusIcon = (rule: AutomationRule) => {
    if (rule.isActive) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getExecutionBadge = (count: number) => {
    if (count === 0) return <Badge variant="secondary">Never executed</Badge>;
    if (count < 10) return <Badge variant="outline">{count} executions</Badge>;
    if (count < 100) return <Badge variant="default">{count} executions</Badge>;
    return <Badge variant="default" className="bg-green-600">{count}+ executions</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search rules by name, description, or event type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="PLATFORM">Platform</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Automation Rules ({filteredRules.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadRules}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRules.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rules found</h3>
              <p className="text-gray-600">
                {searchTerm || scopeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first automation rule to get started'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <div key={rule.ruleId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(rule)}
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {rule.scope}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Priority {rule.priority}
                        </Badge>
                      </div>
                      
                      {rule.description && (
                        <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          Trigger: {rule.trigger.eventType}
                        </span>
                        <span>{rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}</span>
                        {rule.lastExecuted && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {new Date(rule.lastExecuted).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {getExecutionBadge(rule.executionCount)}
                        <span className="text-xs text-gray-500">
                          Created {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestRule(rule.ruleId)}
                      >
                        Test
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditRule?.(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant={rule.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleToggleRule(rule.ruleId)}
                        disabled={toggleLoading === rule.ruleId}
                      >
                        {toggleLoading === rule.ruleId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : rule.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteRule(rule.ruleId, rule.name)}
                            className="text-red-600"
                            disabled={deleteLoading === rule.ruleId}
                          >
                            {deleteLoading === rule.ruleId ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete Rule
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}