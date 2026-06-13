/**
 * Notification Bell Component
 * Shows notification icon with unread count badge and dropdown
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMarkAllAsRead, useMarkAsRead, useNotifications, useUnreadCount } from '@/hooks/useNotifications';
import {
  BellOutlined
} from '@ant-design/icons';
import { App, Badge, Dropdown, Empty, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Format date to relative time
 */
const formatDistanceToNow = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

export default function NotificationBell() {
  const router = useRouter();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Fetch unread count
  const { data: unreadData } = useUnreadCount({ enabled: !!user });
  const unreadCount = unreadData?.data?.count || 0;
  
  // Fetch notifications (only when dropdown is open)
  const { data: notificationsData, isLoading } = useNotifications(
    { page: 1, limit: 10 },
    { enabled: !!user && open }
  );
  
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  
  const notifications = notificationsData?.data || [];

  /**
   * Handle notification click
   */
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Navigate to related page
    if (notification.order) {
      router.push(`/orders/${notification.order}`);
    }
    
    setOpen(false);
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead(undefined, {
      onSuccess: () => {
        message.success('All notifications marked as read');
      },
    });
  };

  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (type) => {
    const icons = {
      order_created: '🛍️',
      order_confirmed: '✅',
      order_shipped: '🚚',
      order_delivered: '📦',
      order_cancelled: '❌',
      order_refunded: '💰',
      order_status_update: '📝',
      message: '💬',
      promotion: '🎉',
      system: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  if (!user) {
    return null;
  }

  const dropdownContent = (
    <div className="bg-white rounded-lg shadow-lg w-96 max-h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No notifications"
            />
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              router.push('/notifications');
              setOpen(false);
            }}
            className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      popupRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined className={`text-xl ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        </Badge>
      </button>
    </Dropdown>
  );
}
