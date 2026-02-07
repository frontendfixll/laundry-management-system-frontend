'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap, ShieldAlert, RefreshCw, Layers, Trash2, Bell } from 'lucide-react';
import NotificationToast from './NotificationToast';
import { useSocketIONotifications } from '@/hooks/useSocketIONotifications';
import { useRouter } from 'next/navigation';

interface ToastNotification {
  _id: string;
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  eventType: string;
  createdAt: string;
  data: {
    link?: string;
    orderId?: string;
    [key: string]: any;
  };
  metadata?: any;
  isFlash?: boolean;
}

// Session-based persistence for flashes
const getFlashedIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = sessionStorage.getItem('flashed_notifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

const markAsFlashed = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const ids = getFlashedIds();
    ids.add(id);
    sessionStorage.setItem('flashed_notifications', JSON.stringify(Array.from(ids)));
  } catch (err) {
    console.error('Failed to save flashed ID:', err);
  }
};

export default function NotificationContainer() {
  const { notifications } = useSocketIONotifications();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [flash, setFlash] = useState<ToastNotification | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());
  const lastNotificationIdRef = useRef<string | null>(null);
  const componentMountTimeRef = useRef<Date>(new Date());
  const router = useRouter();

  // Show only the latest notification as toast or flash
  useEffect(() => {
    if (notifications.length > 0) {
      // 1. Find the latest notification that hasn't been shown yet in this session
      const flashedIds = getFlashedIds();

      // We look through notifications and find the most recent one that is:
      // - Recent (within 5 minutes)
      // - Critical (priority or keywords)
      // - Not already flashed in this session

      const now = new Date();

      // First, handle the ABSOLUTE latest one if it's new to the component state
      const latestNotification = notifications[0];
      const notificationTime = new Date(latestNotification.createdAt);
      const timeDiff = (now.getTime() - notificationTime.getTime()) / 1000;

      const isVeryRecent = timeDiff < 45; // Real-time window
      const isHistoricalRecent = timeDiff < 300; // 5 minute historical window
      const isAfterMount = notificationTime.getTime() > (componentMountTimeRef.current.getTime() - 5000);
      const isNewToState = latestNotification.id !== lastNotificationIdRef.current;
      const alreadyFlashed = flashedIds.has(latestNotification.id);

      if (isNewToState && (isVeryRecent || (isHistoricalRecent && !alreadyFlashed))) {
        console.log(`🔔 Processing notification: ${latestNotification.id} (${latestNotification.title}) | Diff: ${Math.round(timeDiff)}s`);
        lastNotificationIdRef.current = latestNotification.id;

        if (!shownNotificationsRef.current.has(latestNotification.id)) {
          shownNotificationsRef.current.add(latestNotification.id);

          const eType = ((latestNotification as any).eventType || (latestNotification as any).type || '').toLowerCase();
          const category = (latestNotification.category || '').toLowerCase();

          const isCritical = ['P0', 'P1'].includes(latestNotification.priority) ||
            ['permission', 'role', 'security', 'critical', 'alert', 'account_locked', 'feature', 'subscription', 'settings', 'revoked', 'granted', 'failed', 'stuck', 'suspended', 'order', 'customer', 'orderstatusupdated'].some(t => eType.includes(t)) ||
            ['orders', 'payments', 'security', 'system'].some(c => category.includes(c));

          const newNotification: ToastNotification = {
            ...latestNotification,
            _id: latestNotification.id,
            severity: latestNotification.priority === 'P0' ? 'error' :
              latestNotification.priority === 'P1' ? 'warning' :
                latestNotification.priority === 'P2' ? 'info' : 'success',
            icon: latestNotification.metadata?.icon ||
              (eType.includes('security') ? 'shield-alert' :
                eType.includes('permission') ? 'shield' : 'bell'),
            type: latestNotification.eventType || 'notification',
            data: latestNotification.metadata || {},
            isFlash: isCritical,
            metadata: { ...latestNotification.metadata, isHistorical: timeDiff > 45 }
          };

          if (isCritical && !alreadyFlashed) {
            console.log('💎 PERSISTENT FLASH TRIGGERED:', newNotification.title);
            markAsFlashed(latestNotification.id);
            setFlash(newNotification);
          } else if (!isCritical && isAfterMount) {
            // Only show non-critical toasts if they happened AFTER mount
            setToasts(prev => {
              const filtered = prev.filter(t => t.id !== newNotification.id);
              return [newNotification, ...filtered].slice(0, 10);
            });
          }
        }
      }
    }
  }, [notifications]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // System Flash Alert Component
  const SystemFlashAlert = ({ notification, onClose }: { notification: ToastNotification, onClose: () => void }) => {
    useEffect(() => {
      console.log('💎 SystemFlashAlert MOUNTED:', notification.title);
      return () => console.log('💎 SystemFlashAlert UNMOUNTED');
    }, [notification.id]);

    // Use notification icon or fallback to Zap
    const IconComponent = notification.priority === 'P0' || notification.priority === 'P1' ? ShieldAlert : Zap;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-blue-100 animate-zoom-in">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/10">
                <IconComponent className="text-white w-10 h-10 fill-current" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{notification.title}</h2>
              <p className="text-blue-100 text-sm font-medium leading-relaxed mb-4">{notification.message}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-50 uppercase tracking-wider border border-white/10">
                <RefreshCw size={10} className="animate-spin-slow" />
                Real-time Sync Active
              </div>
            </div>
          </div>
          <div className="p-6 bg-white space-y-3">
            <p className="text-[11px] text-gray-400 text-center font-medium px-4">
              {notification.metadata?.isHistorical
                ? 'This critical update occurred just before you joined. We recommend refreshing to ensure your dashboard is perfectly in sync.'
                : notification.eventType === 'permission_update'
                  ? 'Your access permissions were updated. A refresh is required to update the sidebar and features.'
                  : 'A critical system event was detected. We recommend refreshing to ensure your dashboard is fully synchronized.'}
            </p>
            <button
              id="flash-refresh-btn"
              onClick={() => {
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-200"
            >
              <RefreshCw size={18} />
              Refresh UI Now
            </button>
            <button
              onClick={() => {
                router.push('/admin/notifications');
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-white border border-blue-100 hover:border-blue-200 text-blue-600 font-bold py-3 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-blue-50"
            >
              <Bell size={18} />
              View Update Details
            </button>
            <button
              id="flash-close-btn"
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-900 font-bold py-2 text-sm transition-colors"
            >
              I'll stay on this page
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Implement global __addSlideNotification bridge for legacy code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__addSlideNotification = (data: any) => {
        // Robust detection using both type and eventType
        const rawType = (data.type || data.eventType || '').toLowerCase();
        const category = (data.category || '').toLowerCase();

        const isCritical = data.isFlash ||
          ['permission', 'role', 'security', 'critical', 'alert', 'account_locked', 'feature', 'subscription', 'settings', 'revoked', 'granted', 'failed', 'stuck', 'suspended', 'order', 'customer', 'orderstatusupdated'].some(t => rawType.includes(t)) ||
          ['orders', 'payments', 'security', 'system'].some(c => category.includes(c)) ||
          data.priority === 'P0' || data.priority === 'P1';

        console.log(`⚡ Bridge call received: "${data.title}" | Critical: ${isCritical} | Type: ${rawType}`);

        const newToast: ToastNotification = {
          _id: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          id: `bridge-${Date.now()}`,
          title: data.title || 'Notification',
          message: data.message || '',
          severity: data.type === 'error' ? 'error' :
            data.type === 'warning' ? 'warning' :
              data.type === 'success' ? 'success' : 'info',
          priority: isCritical ? 'P0' : (data.priority || 'P2'),
          icon: data.icon || 'bell',
          type: data.type || 'info',
          category: data.category || 'system',
          eventType: data.eventType || data.type || 'info',
          createdAt: new Date().toISOString(),
          data: data,
          metadata: data,
          isFlash: isCritical
        };

        if (isCritical) {
          console.log('💎 Setting Flash state via bridge');
          setFlash(newToast);
        } else {
          console.log('🍞 Adding to Toast stack via bridge');
          setToasts(prev => {
            const filtered = prev.filter(t => t.id !== newToast.id);
            return [newToast, ...filtered].slice(0, 10);
          });

          if (newToast.priority !== 'P0') {
            setTimeout(() => {
              setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, (data.duration || 7000));
          }
        }
      };
    }
  }, []);

  return (
    <>
      {/* System Flash Overlay */}
      {flash && <SystemFlashAlert notification={flash} onClose={() => setFlash(null)} />}

      {/* Toast Stack */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end pointer-events-none w-full max-w-sm">
        <div
          className="w-full space-y-2 overflow-y-auto no-scrollbar pointer-events-auto pr-2"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
        >
          {toasts.map(toast => (
            <div key={toast.id} className="animate-slide-in-right">
              <NotificationToast
                notification={toast}
                onClose={() => removeToast(toast.id)}
                duration={toast.priority === 'P0' ? 0 : 7000}
              />
            </div>
          ))}
        </div>
        {/* Notification Management & Verification Footer */}
        <div className="mt-3 pointer-events-auto flex flex-wrap items-center justify-end gap-2 animate-slide-in-bottom">
          {toasts.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  router.push('/admin/notifications');
                  setToasts([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full shadow-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-all hover:scale-105"
              >
                <Layers size={13} />
                View All ({toasts.length})
              </button>
              <button
                onClick={clearAllToasts}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full shadow-lg text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105"
              >
                <Trash2 size={13} />
                Clear
              </button>
            </div>
          )}


        </div>
      </div>
    </>
  );
}
