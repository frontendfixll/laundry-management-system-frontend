import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CAMPAIGN_STATUSES = {
  DRAFT: { label: 'Draft', color: 'gray', icon: Clock },
  ACTIVE: { label: 'Active', color: 'green', icon: CheckCircle },
  PAUSED: { label: 'Paused', color: 'yellow', icon: Pause },
  COMPLETED: { label: 'Completed', color: 'blue', icon: CheckCircle },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'orange', icon: Clock },
  REJECTED: { label: 'Rejected', color: 'red', icon: X }
};

const TRIGGER_TYPES = {
  ORDER_CHECKOUT: 'Order Checkout',
  USER_REGISTRATION: 'User Registration',
  ORDER_COMPLETION: 'Order Completion',
  TIME_BASED: 'Time Based',
  MANUAL: 'Manual'
};

export default function CampaignList() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      } else {
        toast.error(data.message || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Delete campaign error:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
        fetchCampaigns();
      } else {
        toast.error(data.message || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Update campaign status error:', error);
      toast.error('Failed to update campaign status');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = CAMPAIGN_STATUSES[status] || CAMPAIGN_STATUSES.DRAFT;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600">Manage your tenant campaigns and promotions</p>
        </div>
        <button
          onClick={() => navigate('/admin/campaigns/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {Object.entries(CAMPAIGN_STATUSES).map(([value, config]) => (
              <option key={value} value={value}>{config.label}</option>
            ))}
          </select>

          <button
            onClick={fetchCampaigns}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
            <button
              onClick={() => navigate('/admin/campaigns/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger & Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget & Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-sm text-gray-500 mt-1">{campaign.description}</div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(campaign.startDate), 'MMM dd')} - {format(new Date(campaign.endDate), 'MMM dd')}
                          </span>
                          <span>Priority: {campaign.priority}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {TRIGGER_TYPES[campaign.trigger?.type] || campaign.trigger?.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.trigger?.conditions?.minOrderValue > 0 && (
                            <span>Min order: {formatCurrency(campaign.trigger.conditions.minOrderValue)}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Promotions: {campaign.attachedPromotions?.length || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {campaign.analytics?.conversions || 0} conversions
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.analytics?.impressions || 0} impressions
                        </div>
                        <div className="text-xs text-green-600">
                          {formatCurrency(campaign.analytics?.totalSavings || 0)} saved
                        </div>
                        {campaign.analytics?.roi !== undefined && (
                          <div className="text-xs text-blue-600">
                            ROI: {campaign.analytics.roi.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(campaign.budget?.spentAmount || 0)} / {formatCurrency(campaign.budget?.totalAmount || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Usage: {campaign.usageLimits?.usedCount || 0} / {campaign.usageLimits?.totalUsage || '∞'}
                        </div>
                        {campaign.budgetUtilization !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, campaign.budgetUtilization)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/campaigns/${campaign._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/campaigns/${campaign._id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Campaign"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {campaign.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(campaign._id, 'PAUSED')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Pause Campaign"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        {campaign.status === 'PAUSED' && (
                          <button
                            onClick={() => handleStatusChange(campaign._id, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900"
                            title="Resume Campaign"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}