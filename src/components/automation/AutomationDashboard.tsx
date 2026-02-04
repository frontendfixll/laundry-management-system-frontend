'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Zap
} from 'lucide-react';
import { automationApi, AutomationStats, AutomationRule } from '@/services/automationApi';
import { toast } from 'sonner';

interface AutomationDashboardProps {
  onCreateRule?: () => void;
  onEditRule?: (rule: AutomationRule) => void;
  onViewHistory?: (rule: AutomationRule) => void;
}

export default function AutomationDashboard({ onCreateRule, onEditRule, onViewHistory }: AutomationDashboardProps) {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, rulesData] = await Promise.all([
        automationApi.getStats(),
        automationApi.getRules({ limit: 10 })
      ]);
      
      setStats(statsData);
      setRules(rulesData.rules);
    } catch (error) {
      console.error('Error loading automation dashboard:', error);
      toast.error('Failed to load automation dashboard');
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
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to toggle rule');
    } finally {
      setToggleLoading(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Engine</h1>
          <p className="text-gray-600">Manage your automated workflows and rules</p>
        </div>
        <Button onClick={onCreateRule} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engine Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {stats.isRunning ? (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-600">Running</span>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-red-600">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rules</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalExecutions > 0 
                      ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                      : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Recent Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules yet</h3>
              <p className="text-gray-600 mb-4">Create your first automation rule to get started</p>
              <Button onClick={onCreateRule}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.ruleId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {rule.scope}
                      </Badge>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {rule.executionCount} executions
                      </span>
                      {rule.lastExecuted && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last: {new Date(rule.lastExecuted).toLocaleDateString()}
                        </span>
                      )}
                      <span>Trigger: {rule.trigger.eventType}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewHistory?.(rule)}
                    >
                      History
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