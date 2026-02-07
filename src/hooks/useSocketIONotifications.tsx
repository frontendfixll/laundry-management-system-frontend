/**
 * useSocketIONotifications - Main React hook for Socket.IO notifications
 * Replaces the legacy SSE-based notification system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { notificationApi } from '../services/api';

interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  eventType: string;
  icon?: string;
  severity?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
  createdAt: string;
  metadata?: any;
  requiresAck?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  byPriority: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
}

interface UseSocketIONotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  acknowledgeNotification: (notificationId: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reconnect: () => void;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

const SOCKET_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SOCKET_URL
    ? new URL(process.env.NEXT_PUBLIC_SOCKET_URL).origin
    : (process.env.NEXT_PUBLIC_API_URL
      ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
      : 'http://localhost:5000'))
  : 'http://localhost:5000';

export const useSocketIONotifications = (): UseSocketIONotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, token } = useAuthStore();

  // Calculate stats from notifications
  const calculateStats = useCallback((notifs: Notification[]) => {
    const stats: NotificationStats = {
      total: notifs.length,
      unread: 0,
      byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
    };

    notifs.forEach(notif => {
      // Check both isRead (top-level from backend) and metadata.isRead (legacy)
      const isRead = (notif as any).isRead || notif.metadata?.isRead;
      if (!isRead) {
        stats.unread++;
      }
      const priority = notif.priority || 'P3';
      stats.byPriority[priority as keyof typeof stats.byPriority]++;
    });

    return stats;
  }, []);

  // Acknowledge notification (for P0/P1)
  const acknowledgeNotification = useCallback((notificationId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notification_ack', {
        notificationId,
        acknowledged: true
      });
    }
  }, []);

  // Handle new notification
  const handleNewNotification = useCallback((notification: Notification) => {
    // Ensure priority exists
    if (!notification.priority) {
      notification.priority = 'P3';
    }

    setNotifications(prev => {
      // DEDUPLICATION: Check if this notification already exists in the list
      const exists = prev.some(n => (n.id === notification.id) || (n._id === notification.id));
      if (exists) {
        console.log(`♻️ Skipping duplicate notification: ${notification.id}`);
        return prev;
      }

      const updated = [notification, ...prev];
      setStats(calculateStats(updated));
      return updated;
    });

    // Play notification sound for high priority
    if (['P0', 'P1'].includes(notification.priority)) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });
      } catch (error) { }
    }

    // Show toast notification
    const isHighPriority = ['P0', 'P1'].includes(notification.priority);
    toast(
      (t) => (
        <div className="flex flex-col gap-1">
          <div className="font-bold flex items-center gap-2">
            {isHighPriority && <span className="text-red-500">🚨</span>}
            {notification.title}
          </div>
          <div className="text-sm opacity-90">{notification.message}</div>
          {notification.requiresAck && (
            <button
              onClick={() => {
                acknowledgeNotification(notification.id);
                toast.dismiss(t.id);
              }}
              className="mt-2 bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      ),
      {
        duration: isHighPriority ? Infinity : 6000,
        position: 'top-right',
        style: {
          borderLeft: isHighPriority ? '4px solid #ef4444' : '4px solid #3b82f6',
          minWidth: '300px'
        }
      }
    );
  }, [calculateStats, acknowledgeNotification]);

  // Fetch initial notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;

    try {
      console.log('🔄 Fetching historical notifications...');
      const data = await notificationApi.getNotifications() as any;

      if (data && data.notifications) {
        // Map backend _id to frontend id for consistency
        const mappedNotifications = data.notifications.map((n: any) => ({
          ...n,
          id: n._id || n.id
        }));

        setNotifications(mappedNotifications);
        setStats(calculateStats(mappedNotifications));
        console.log(`✅ Loaded ${mappedNotifications.length} notifications from database`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, token, calculateStats]);

  // Connect to Socket.IO server
  const connect = useCallback(() => {
    if (!user || !token || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const socket = io(SOCKET_URL, {
        auth: {
          token: token
        },
        query: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log(`✅ Socket.IO connected: ${socket.id} for user: ${user?._id || 'unknown'}`);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);

        // Fetch historical notifications upon connection
        fetchNotifications();
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Auto-reconnect unless manually disconnected
        if (reason !== 'io client disconnect') {
          setConnectionError(`Disconnected: ${reason}`);
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionError(error.message);
        scheduleReconnect();
      });

      // Connection confirmation
      socket.on('connection_confirmed', (data) => {
        console.log('✅ Socket.IO connection confirmed:', data);
      });

      // Notification events
      socket.on('notification', handleNewNotification);

      // High priority notifications (for tenant admins)
      socket.on('high_priority_notification', (notification) => {
        handleNewNotification({
          ...notification,
          metadata: { ...notification.metadata, isHighPriority: true }
        });
      });

      // Permission refresh (for real-time permission updates)
      socket.on('permission_refresh_required', () => {
        console.log('🔄 Permission refresh required');
        // Trigger permission refresh in auth store
        // This would be handled by the auth system
      });

      // Real-time permission sync (Enhanced)
      socket.on('permission_sync', async (data) => {
        console.log('🔄 Real-time permission sync received:', data);

        if (data.type === 'permission_sync' && data.data) {
          const { permissions, features, role } = data.data;

          // Update auth store with new permissions
          const { handlePermissionUpdate } = useAuthStore.getState();
          handlePermissionUpdate({ permissions, features, role });

          // Dispatch custom event for immediate UI reaction
          window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: data.data }));

          console.log('✅ Permissions synced silently via permission_sync');
        }
      });

      socket.on('permissionsUpdated', async (data) => {
        console.log('🔄 Permission update received via Socket:', data);

        // Show slide notification
        if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
          console.log('📢 Triggering Flash bridge for permission_update');
          (window as any).__addSlideNotification({
            title: 'Permissions Updated',
            message: data.message || 'Your access permissions have been updated',
            type: 'permission_update', // Triggers Flash
            duration: 0,
            actionText: 'Refresh UI',
            onAction: () => window.location.reload()
          });
        }

        // Trigger authenticated refresh
        const { refreshUserData } = useAuthStore.getState();
        await refreshUserData();

        window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: data }));
      });

      // Legacy support: tenancyFeaturesUpdated
      socket.on('tenancyFeaturesUpdated', async (data) => {
        console.log('🔄 Legacy tenancyFeaturesUpdated event:', data);

        if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
          (window as any).__addSlideNotification({
            title: 'Features Updated',
            message: 'Your tenancy features have been updated',
            type: 'tenancy_features_updated',
            duration: 7000
          });
        }

        const { refreshUserData } = useAuthStore.getState();
        await refreshUserData();

        window.dispatchEvent(new CustomEvent('tenancyFeaturesUpdated', { detail: data }));
      });

      // Legacy support: tenancyPermissionsUpdated
      socket.on('tenancyPermissionsUpdated', async (data) => {
        console.log('🔄 Legacy tenancyPermissionsUpdated event:', data);

        if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
          (window as any).__addSlideNotification({
            title: 'Permissions Updated',
            message: 'Your access permissions have been updated',
            type: 'tenancy_permissions_updated', // Triggers Flash
            duration: 0
          });
        }

        const { refreshUserData } = useAuthStore.getState();
        await refreshUserData();

        window.dispatchEvent(new CustomEvent('tenancyPermissionsUpdated', { detail: data }));
      });

      // Legacy support: roleChanged
      socket.on('roleChanged', async (data) => {
        console.log('👤 Role changed event:', data);

        if (typeof window !== 'undefined' && (window as any).__addSlideNotification) {
          (window as any).__addSlideNotification({
            title: 'Role Updated',
            message: `Your role has been changed to ${data.newRole}`,
            type: 'role_changed', // Triggers Flash
            duration: 0
          });
        }

        const { refreshUserData } = useAuthStore.getState();
        await refreshUserData();

        window.dispatchEvent(new CustomEvent('roleChanged', { detail: data }));
      });

      // Force token refresh
      socket.on('force_token_refresh', async (data) => {
        console.log('🔄 Force token refresh received:', data);

        // toast('Refreshing your session...', {
        //   duration: 3000
        // });
        console.log('🔄 Session refresh requested');

        // Trigger auth store refresh
        const { refreshUserData } = useAuthStore.getState();
        try {
          await refreshUserData();
          // toast.success('Session refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh session:', error);
          // toast.error('Please refresh the page manually');
        }
      });

      // Session revoked (security)
      socket.on('session_revoked', (data) => {
        console.log('🚨 Session revoked:', data);

        // toast.error(data.message || 'Your session has been revoked', {
        //   duration: 0, // Don't auto-dismiss
        //   style: {
        //     background: '#dc2626',
        //     color: 'white'
        //   }
        // });

        // Force logout after a short delay
        setTimeout(() => {
          const { logout } = useAuthStore.getState();
          logout();
          window.location.href = '/login';
        }, 3000);
      });

      // Acknowledgment confirmation
      socket.on('ack_confirmed', (data) => {
        console.log('✅ Acknowledgment confirmed:', data);
      });

      // Subscription confirmations
      socket.on('subscription_confirmed', (data) => {
        console.log('✅ Channel subscription confirmed:', data);
      });

      socket.on('unsubscription_confirmed', (data) => {
        console.log('✅ Channel unsubscription confirmed:', data);
      });

      // Error handling
      socket.on('ack_error', (error) => {
        console.error('❌ Acknowledgment error:', error);
        toast.error('Failed to acknowledge notification');
      });

      socket.on('subscription_error', (error) => {
        console.error('❌ Subscription error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      setIsConnecting(false);
      setConnectionError('Failed to create connection');
      scheduleReconnect();
    }
  }, [user, token, handleNewNotification]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      connect();
    }, 5000); // Reconnect after 5 seconds
  }, [connect]);

  // Disconnect from Socket.IO server
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);


  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true, metadata: { ...notif.metadata, isRead: true } }
          : notif
      );
      setStats(calculateStats(updated));
      return updated;
    });

    // Notify backend
    notificationApi.markAsRead([notificationId]).catch(err => {
      console.error('Failed to sync markAsRead to backend:', err);
    });
  }, [calculateStats]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({
        ...notif,
        isRead: true,
        metadata: { ...notif.metadata, isRead: true }
      }));
      setStats(calculateStats(updated));
      return updated;
    });

    // Notify backend
    notificationApi.markAllAsRead().catch(err => {
      console.error('Failed to sync markAllAsRead to backend:', err);
    });
  }, [calculateStats]);

  // Clear all notifications
  const clearNotifications = useCallback(async () => {
    // Optimistic UI update
    setNotifications([]);
    setStats({
      total: 0,
      unread: 0,
      byPriority: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 }
    });

    try {
      await notificationApi.clearAllNotifications();
    } catch (err) {
      console.error('Failed to sync clearNotifications to backend:', err);
    }
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Initialize connection when user and token are available
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    notifications,
    stats,
    isConnected,
    isConnecting,
    connectionError,
    acknowledgeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect,
    refresh: fetchNotifications,
    isLoading
  };
};