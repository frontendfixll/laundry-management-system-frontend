/**
 * NotificationInbox - Complete inbox with filtering
 * Part of the Socket.IO Notification Engine Frontend Components
 */

import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Calendar,
  Tag
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category?: string;
  eventType: string;
  type?: string;
  createdAt: string;
  metadata?: any;
  data?: any;
  icon?: string;
  severity?: string;
  isRead?: boolean;
  requiresAck?: boolean;
}

interface NotificationInboxProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onAcknowledge?: (notificationId: string) => void;
  onClear: () => void;
}

type FilterType = 'all' | 'unread' | 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
type SortType = 'newest' | 'oldest' | 'priority';

const priorityConfig = {
  P0: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' },
  P1: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'High' },
  P2: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Medium' },
  P3: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Low' },
  P4: { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-25', label: 'Silent' }
};

export const NotificationInbox: React.FC<NotificationInboxProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onAcknowledge,
  onClear
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(notifications.map(n => n.category)));
    return ['all', ...cats];
  }, [notifications]);

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !(n.isRead || n.metadata?.isRead));
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.priority === filter);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        n.eventType.toLowerCase().includes(term)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priority':
          const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
          const orderA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
          const orderB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
          return orderA - orderB;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [notifications, filter, sort, searchTerm, selectedCategory]);

  // Stats
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.metadata?.isRead).length;
    const byPriority = {
      P0: notifications.filter(n => (n.priority || 'P3') === 'P0').length,
      P1: notifications.filter(n => (n.priority || 'P3') === 'P1').length,
      P2: notifications.filter(n => (n.priority || 'P3') === 'P2').length,
      P3: notifications.filter(n => (n.priority || 'P3') === 'P3' || !['P0', 'P1', 'P2', 'P4'].includes(n.priority)).length,
      P4: notifications.filter(n => (n.priority || 'P3') === 'P4').length,
    };
    return { total, unread, byPriority };
  }, [notifications]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
      {/* Header - Sticky */}
      <div className="p-2 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center">
            <Bell className="h-3.5 w-3.5 mr-1" />
            Notifications
          </h2>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onMarkAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-[10px] font-medium px-1.5 py-0.5"
              disabled={stats.unread === 0}
            >
              <CheckCheck className="h-2.5 w-2.5 inline mr-0.5" />
              Mark all read
            </button>
            <button
              onClick={onClear}
              className="text-red-600 hover:text-red-800 text-[10px] font-medium px-1.5 py-0.5"
            >
              <Trash2 className="h-2.5 w-2.5 inline mr-0.5" />
              Clear all
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          {/* Priority Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="P0">Critical</option>
            <option value="P1">High</option>
            <option value="P2">Medium</option>
            <option value="P3">Low</option>
          </select>
        </div>
      </div>

      {/* Notifications List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm">
              {searchTerm || filter !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'You\'re all caught up!'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const config = priorityConfig[notification.priority as keyof typeof priorityConfig] || priorityConfig.P3;
              const IconComponent = config?.icon || Bell;
              const isRead = notification.metadata?.isRead;

              return (
                <div
                  key={notification.id}
                  className={`p-2.5 hover:bg-gray-50 transition-colors ${!isRead ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex items-start space-x-2">
                    <div className={`flex-shrink-0 ${config.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.color} font-medium`}>
                            {notification.priority}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        {!isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <h4 className={`text-xs font-semibold ${!isRead ? 'text-gray-900' : 'text-gray-700'} mb-0.5`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1.5">
                        {notification.message}
                      </p>

                      {/* Module tags for permission updates */}
                      {(notification.eventType === 'tenancy_permissions_updated' ||
                        notification.eventType === 'permission_updated' ||
                        notification.type === 'detailed_permission_update') &&
                        (notification.metadata?.permissions || notification.data?.permissions) && (
                          <div className="mb-1 flex flex-wrap gap-1">
                            {Object.keys(notification.metadata?.permissions || notification.data?.permissions || {})
                              .filter(module => !module.startsWith('$') && !module.startsWith('_'))
                              .map(module => (
                                <span key={module} className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100 px-1.5 py-0.5 rounded font-medium uppercase">
                                  {module}
                                </span>
                              ))}
                          </div>
                        )}
                      <div className="flex items-center space-x-2">
                        {!isRead && (
                          <button
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium px-1 py-0.5"
                          >
                            <Check className="h-2.5 w-2.5 inline mr-0.5" />
                            Mark as read
                          </button>
                        )}
                        {notification.requiresAck && onAcknowledge && (
                          <button
                            onClick={() => onAcknowledge(notification.id)}
                            className="text-[10px] text-green-600 hover:text-green-800 font-medium px-1 py-0.5"
                          >
                            <CheckCheck className="h-2.5 w-2.5 inline mr-0.5" />
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};