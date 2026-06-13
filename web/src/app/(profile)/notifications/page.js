/**
 * Notifications Page
 * Display all user notifications with filters and actions
 */

'use client';

import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import {
    useDeleteAllNotifications,
    useDeleteNotification,
    useMarkAllAsRead,
    useMarkAsRead,
    useNotifications,
} from '@/hooks/useNotifications';
import {
    ArrowLeftOutlined,
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { App, Empty, Modal, Spin, Tabs } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NotificationsPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch notifications based on active tab
  const { data, isLoading, error } = useNotifications({
    page: 1,
    limit: 50,
    unreadOnly: activeTab === 'unread',
  });
  
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAll } = useDeleteAllNotifications();
  
  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

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
  };

  /**
   * Handle delete notification
   */
  const handleDelete = (notificationId, e) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Delete Notification',
      content: 'Are you sure you want to delete this notification?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        deleteNotification(notificationId, {
          onSuccess: () => {
            message.success('Notification deleted');
          },
        });
      },
    });
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        message.success('All notifications marked as read');
      },
    });
  };

  /**
   * Handle delete all
   */
  const handleDeleteAll = () => {
    Modal.confirm({
      title: 'Delete All Notifications',
      content: 'Are you sure you want to delete all notifications? This action cannot be undone.',
      okText: 'Delete All',
      okType: 'danger',
      onOk: () => {
        deleteAll(undefined, {
          onSuccess: () => {
            message.success('All notifications deleted');
          },
        });
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

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white/95 pb-20">
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white/95 pb-20">
        <div className="text-center p-8">
          <p className="text-red-500">Failed to load notifications</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white/95 pb-20">
      {/* Gradient Header */}
      <div className="bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-600 px-4 sm:px-6 py-6 sm:py-8 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeftOutlined className="text-lg" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Notifications
          </h1>
          <p className="text-white/90 text-sm sm:text-base">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! 🎉'}
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
              >
                <CheckOutlined />
                <span className="hidden sm:inline">Mark all as read</span>
                <span className="sm:hidden">Mark all</span>
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <DeleteOutlined />
              <span className="hidden sm:inline">Delete all</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: <span className="text-xs sm:text-sm">All ({notifications.length})</span>,
            },
            {
              key: 'unread',
              label: <span className="text-xs sm:text-sm">Unread ({unreadCount})</span>,
            },
          ]}
        />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 mt-4">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <BellOutlined className="text-3xl sm:text-4xl text-emerald-600" />
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">No notifications</p>
                  <p className="text-sm sm:text-base text-gray-600">
                    {activeTab === 'unread' 
                      ? "You don't have any unread notifications" 
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              }
            >
              <button
                onClick={() => router.push('/products')}
                className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Browse Products
              </button>
            </Empty>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group bg-white rounded-xl p-3 sm:p-4 border transition-all cursor-pointer ${
                  !notification.isRead 
                    ? 'border-l-4 border-l-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200' 
                    : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  {/* Icon and Content */}
                  <div className="flex items-start gap-2 sm:gap-3 flex-1">
                    <div className="text-xl sm:text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                        {notification.data?.orderNumber && (
                          <span className="font-medium text-emerald-600">
                            Order #{notification.data.orderNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(notification._id, e)}
                    className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 opacity-70 group-hover:opacity-100"
                    title="Delete"
                  >
                    <DeleteOutlined className="text-red-500 text-sm sm:text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
