'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AutomationDashboard from '@/components/automation/AutomationDashboard';
import RulesList from '@/components/automation/RulesList';
import ExecutionHistory from '@/components/automation/ExecutionHistory';
import CreateRuleModal from '@/components/automation/CreateRuleModal';
import EditRuleModal from '@/components/automation/EditRuleModal';
import { AutomationRule } from '@/services/automationApi';

export default function AutomationPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleCreateRule = () => {
    setCreateModalOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setEditModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleViewRuleHistory = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setActiveTab('history');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automation Engine</h1>
        <p className="text-gray-600">Manage your automated workflows and rules</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="rules">All Rules</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AutomationDashboard
            key={refreshTrigger}
            onCreateRule={handleCreateRule}
            onEditRule={handleEditRule}
            onViewHistory={handleViewRuleHistory}
          />
        </TabsContent>

        <TabsContent value="rules">
          <RulesList
            key={refreshTrigger}
            onEditRule={handleEditRule}
            onRefresh={handleSuccess}
          />
        </TabsContent>

        <TabsContent value="history">
          <ExecutionHistory
            selectedRuleId={selectedRule?.ruleId}
          />
        </TabsContent>
      </Tabs>

      {/* Create Rule Modal */}
      <CreateRuleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Edit Rule Modal */}
      <EditRuleModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRule(null);
        }}
        rule={selectedRule}
        onSuccess={handleSuccess}
      />
    </div>
  );
}