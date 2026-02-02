/**
 * NotificationPriorityHandler - Handle P0-P4 notifications differently
 * Part of the Socket.IO Notification Engine Frontend Components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  category: string;
  eventType: string;
  createdAt: string;
  metadata?: any;
  requiresAck?: boolean;
}

interface NotificationPriorityHandlerProps {
  notification: Notification;
  onAcknowledge?: (notificationId: string) => void;
  onDismiss?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

const priorityConfig = {
  P0: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Critical',
    autoHide: null,
  },
  P1: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    label: 'High',
    autoHide: 8000,
  },
  P2: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Medium',
    autoHide: 5000,
  },
  P3: {
    icon: Bell,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    label: 'Info',
    autoHide: 3000,
  },
  P4: {
    icon: Bell,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    label: 'Silent',
    autoHide: 1000,
  }
};

export function NotificationPriorityHandler({
  notification,
  onAcknowledge,
  onDismiss,
  onMarkAsRead
}: NotificationPriorityHandlerProps) {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Ensure we have a valid priority config, default to P3 (Info) if not found
  const config = priorityConfig[notification.priority as keyof typeof priorityConfig] || priorityConfig.P3;
  const IconComponent = config?.icon || Bell;

  // Auto-hide timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (config.autoHide !== null && typeof config.autoHide === 'number') {
      const initialSeconds = config.autoHide / 1000;
      setTimeLeft(initialSeconds);

      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer!);
            if (onDismiss) onDismiss(notification.id);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [config.autoHide, notification.id, onDismiss]);

  const handleAcknowledge = useCallback(() => {
    if (onAcknowledge) {
      onAcknowledge(notification.id);
      setIsAcknowledged(true);
    }
  }, [notification.id, onAcknowledge]);

  const handleMarkAsRead = useCallback(() => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, onMarkAsRead]);

  return (
    <div className={cn(
      "w-80 pointer-events-auto",
      "bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden",
      "transform transition-all duration-300 animate-in slide-in-from-right-full",
      isAcknowledged && "opacity-50 grayscale scale-95"
    )}>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Icon Container */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
            config.bg
          )}>
            <IconComponent className={cn("w-5 h-5", config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
                {config.label}
              </span>
              <button
                onClick={() => onDismiss && onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 truncate">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex space-x-2">
                {notification.requiresAck && !isAcknowledged && (
                  <button
                    onClick={handleAcknowledge}
                    className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                  >
                    Ack
                  </button>
                )}
                {!isAcknowledged && (
                  <button
                    onClick={handleMarkAsRead}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>

              {timeLeft !== null && timeLeft > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-medium text-gray-400">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-hide */}
      {timeLeft !== null && timeLeft > 0 && config.autoHide !== null && (
        <div className="h-1 bg-gray-100/50 w-full">
          <div
            className={cn("h-full transition-all duration-1000 ease-linear", config.color.replace('text', 'bg'))}
            style={{ width: `${(timeLeft / (config.autoHide / 1000)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}