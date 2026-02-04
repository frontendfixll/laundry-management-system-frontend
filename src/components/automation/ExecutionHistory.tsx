'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  RefreshCw,
  Calendar,
  Filter,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { automationApi, AutomationRule } from '@/services/automationApi';
import { toast } from 'sonner';

interface ExecutionHistoryProps {
  selectedRuleId?: string;
}

interface ExecutionRecord {
  id: string;
  ruleId: string;
  ruleName: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  executedAt: string;
  executionTime: number;
  eventType: string;
  error?: string;
}

export default function ExecutionHistory({ selectedRuleId }: ExecutionHistoryProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRule, setFilterRule] = useState<string>(selectedRuleId || 'all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('7d');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRuleId) {
      setFilterRule(selectedRuleId);
    }
  }, [selectedRuleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load rules for filter dropdown
      const rulesResponse = await automationApi.getRules({ limit: 100 });
      setRules(rulesResponse.rules);

      // Generate mock execution history (replace with real API call)
      const mockExecutions = generateMockExecutions(rulesResponse.rules);
      setExecutions(mockExecutions);
      
    } catch (error) {
      console.error('Error loading execution history:', error);
      toast.error('Failed to load execution history');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock execution data (replace with real API)
  const generateMockExecutions = (rules: AutomationRule[]): ExecutionRecord[] => {
    const executions: ExecutionRecord[] = [];
    const statuses: ('SUCCESS' | 'FAILED' | 'PENDING')[] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'SUCCESS'];
    
    rules.forEach(rule => {
      for (let i = 0; i < rule.executionCount; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        
        const executedAt = new Date();
        executedAt.setDate(executedAt.getDate() - daysAgo);
        executedAt.setHours(executedAt.getHours() - hoursAgo);
        executedAt.setMinutes(executedAt.getMinutes() - minutesAgo);

        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        executions.push({
          id: `exec_${rule.ruleId}_${i}`,
          ruleId: rule.ruleId,
          ruleName: rule.name,
          status,
          executedAt: executedAt.toISOString(),
          executionTime: Math.floor(Math.random() * 500) + 50,
          eventType: rule.trigger.eventType,
          error: status === 'FAILED' ? 'Network timeout error' : undefined
        });
      }
    });

    return executions.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
  };

  // Filter executions
  const filteredExecutions = executions.filter(execution => {
    const matchesRule = filterRule === 'all' || execution.ruleId === filterRule;
    const matchesStatus = filterStatus === 'all' || execution.status === filterStatus;
    
    // Filter by period
    const executionDate = new Date(execution.executedAt);
    const now = new Date();
    let matchesPeriod = true;
    
    switch (filterPeriod) {
      case '1d':
        matchesPeriod = (now.getTime() - executionDate.getTime()) <= 24 * 60 * 60 * 1000;
        break;
      case '7d':
        matchesPeriod = (now.getTime() - executionDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        matchesPeriod = (now.getTime() - executionDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        break;
    }

    return matchesRule && matchesStatus && matchesPeriod;
  });

  // Calculate stats
  const totalExecutions = filteredExecutions.length;
  const successfulExecutions = filteredExecutions.filter(e => e.status === 'SUCCESS').length;
  const failedExecutions = filteredExecutions.filter(e => e.status === 'FAILED').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
  const avgExecutionTime = totalExecutions > 0 
    ? Math.round(filteredExecutions.reduce((sum, e) => sum + e.executionTime, 0) / totalExecutions)
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{totalExecutions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{failedExecutions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold text-gray-900">{avgExecutionTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filterRule} onValueChange={setFilterRule}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rules</SelectItem>
                  {rules.map(rule => (
                    <SelectItem key={rule.ruleId} value={rule.ruleId}>
                      {rule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Execution History ({filteredExecutions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredExecutions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No execution history</h3>
              <p className="text-gray-600">
                No rule executions found for the selected filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExecutions.slice(0, 50).map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{execution.ruleName}</span>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Event: {execution.eventType}</span>
                        <span>Time: {execution.executionTime}ms</span>
                        <span>{new Date(execution.executedAt).toLocaleString()}</span>
                      </div>
                      {execution.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {execution.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredExecutions.length > 50 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Showing first 50 executions. Use filters to narrow down results.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}