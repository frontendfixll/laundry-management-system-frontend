'use client';

import React, { useState, useEffect } from 'react';
import { SlidePanel } from '@/components/ui/slide-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings } from 'lucide-react';
import { automationApi, AutomationRule, CreateRuleData } from '@/services/automationApi';
import { toast } from 'sonner';

interface EditRuleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rule: AutomationRule | null;
}

// Available event types
const EVENT_TYPES = [
  { value: 'ORDER_PLACED', label: 'Order Placed', description: 'When a new order is created' },
  { value: 'ORDER_STATUS_CHANGED', label: 'Order Status Changed', description: 'When order status is updated' },
  { value: 'ORDER_DELAYED', label: 'Order Delayed', description: 'When order is delayed beyond expected time' },
  { value: 'ORDER_COMPLETED', label: 'Order Completed', description: 'When order is marked as completed' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received', description: 'When payment is successfully processed' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed', description: 'When payment processing fails' },
  { value: 'PAYMENT_OVERDUE', label: 'Payment Overdue', description: 'When payment is overdue' },
  { value: 'USER_REGISTERED', label: 'User Registered', description: 'When a new user signs up' },
  { value: 'USER_INACTIVE', label: 'User Inactive', description: 'When user hasn\'t been active for a period' },
];

// Available action types
const ACTION_TYPES = [
  { value: 'SEND_NOTIFICATION', label: 'Send Notification', description: 'Send real-time notification' },
  { value: 'SEND_EMAIL', label: 'Send Email', description: 'Send email notification' },
  { value: 'UPDATE_STATUS', label: 'Update Status', description: 'Update entity status' },
  { value: 'CREATE_TASK', label: 'Create Task', description: 'Create a task for staff' },
  { value: 'TRIGGER_WEBHOOK', label: 'Trigger Webhook', description: 'Call external webhook' },
];

// Notification types
const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

export default function EditRuleModal({ open, onClose, onSuccess, rule }: EditRuleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRuleData>({
    name: '',
    description: '',
    scope: 'TENANT',
    trigger: {
      eventType: '',
      conditions: {}
    },
    actions: [],
    priority: 1
  });

  // Populate form when rule changes
  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description || '',
        scope: rule.scope,
        tenantId: rule.tenantId,
        trigger: rule.trigger,
        actions: rule.actions,
        priority: rule.priority
      });
    }
  }, [rule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rule || !formData.name || !formData.trigger.eventType || formData.actions.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await automationApi.updateRule(rule.ruleId, formData);
      toast.success('Automation rule updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating rule:', error);
      toast.error('Failed to update automation rule');
    } finally {
      setLoading(false);
    }
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', config: {} }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const updateActionConfig = (index: number, configKey: string, configValue: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index 
          ? { ...action, config: { ...action.config, [configKey]: configValue } }
          : action
      )
    }));
  };

  const renderActionConfig = (action: any, index: number) => {
    switch (action.type) {
      case 'SEND_NOTIFICATION':
        return (
          <div className="space-y-3">
            <div>
              <Label>Notification Title</Label>
              <Input
                value={action.config.title || ''}
                onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
                placeholder="e.g., New Order Received"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={action.config.message || ''}
                onChange={(e) => updateActionConfig(index, 'message', e.target.value)}
                placeholder="e.g., Order #{{orderNumber}} has been placed"
                rows={3}
              />
            </div>
            <div>
              <Label>Notification Type</Label>
              <Select
                value={action.config.notificationType || ''}
                onValueChange={(value) => updateActionConfig(index, 'notificationType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'SEND_EMAIL':
        return (
          <div className="space-y-3">
            <div>
              <Label>Email Subject</Label>
              <Input
                value={action.config.subject || ''}
                onChange={(e) => updateActionConfig(index, 'subject', e.target.value)}
                placeholder="e.g., Order Confirmation"
              />
            </div>
            <div>
              <Label>Email Template</Label>
              <Input
                value={action.config.template || ''}
                onChange={(e) => updateActionConfig(index, 'template', e.target.value)}
                placeholder="e.g., order_confirmation"
              />
            </div>
          </div>
        );

      case 'UPDATE_STATUS':
        return (
          <div className="space-y-3">
            <div>
              <Label>Entity Type</Label>
              <Input
                value={action.config.entity || ''}
                onChange={(e) => updateActionConfig(index, 'entity', e.target.value)}
                placeholder="e.g., order, customer"
              />
            </div>
            <div>
              <Label>New Status</Label>
              <Input
                value={action.config.status || ''}
                onChange={(e) => updateActionConfig(index, 'status', e.target.value)}
                placeholder="e.g., processing, completed"
              />
            </div>
          </div>
        );

      case 'CREATE_TASK':
        return (
          <div className="space-y-3">
            <div>
              <Label>Task Title</Label>
              <Input
                value={action.config.title || ''}
                onChange={(e) => updateActionConfig(index, 'title', e.target.value)}
                placeholder="e.g., Follow up with customer"
              />
            </div>
            <div>
              <Label>Assignee</Label>
              <Input
                value={action.config.assignee || ''}
                onChange={(e) => updateActionConfig(index, 'assignee', e.target.value)}
                placeholder="e.g., customer_service, admin"
              />
            </div>
          </div>
        );

      case 'TRIGGER_WEBHOOK':
        return (
          <div className="space-y-3">
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={action.config.url || ''}
                onChange={(e) => updateActionConfig(index, 'url', e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!rule) return null;

  return (
    <SlidePanel open={open} onClose={onClose} title={rule ? `Edit: ${rule.name}` : 'Edit Automation Rule'} width="2xl" accentBar="bg-indigo-500">
      <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., New Order Notification"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">High (1)</SelectItem>
                    <SelectItem value="2">Medium (2)</SelectItem>
                    <SelectItem value="3">Low (3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{rule.scope}</Badge>
                <span className="text-sm text-gray-500">
                  Executed {rule.executionCount} times
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Trigger Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Event Type *</Label>
                <Select
                  value={formData.trigger.eventType}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger, eventType: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(event => (
                      <SelectItem key={event.value} value={event.value}>
                        <div>
                          <div className="font-medium">{event.label}</div>
                          <div className="text-sm text-gray-500">{event.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Actions</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.actions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No actions configured yet</p>
                  <p className="text-sm">Add an action to define what happens when this rule triggers</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.actions.map((action, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">Action {index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAction(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Action Type</Label>
                            <Select
                              value={action.type}
                              onValueChange={(value) => updateAction(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select action type" />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTION_TYPES.map(actionType => (
                                  <SelectItem key={actionType.value} value={actionType.value}>
                                    <div>
                                      <div className="font-medium">{actionType.label}</div>
                                      <div className="text-sm text-gray-500">{actionType.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {action.type && renderActionConfig(action, index)}

                          <div>
                            <Label>Delay (milliseconds)</Label>
                            <Input
                              type="number"
                              value={action.delay || 0}
                              onChange={(e) => updateAction(index, 'delay', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : null}
              Update Rule
            </Button>
          </div>
        </form>
    </SlidePanel>
  );
}