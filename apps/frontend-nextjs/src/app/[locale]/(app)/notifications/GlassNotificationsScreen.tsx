'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';
import { useNotifications, useNotificationActions } from '@/lib/api/hooks';
import { Notification } from '@/lib/api/types';

export default function GlassNotificationsScreen() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // API hooks
  const { data: notifications, loading, error, refresh } = useNotifications();
  const { markAsRead, markAllAsRead, loading: actionsLoading } = useNotificationActions();

  const types = [
    'all',
    'request',
    'message',
    'order',
    'system',
    'promotion'
  ];

  const getTypeText = (type: string) => {
    switch (type) {
      case 'request': return 'Заявки';
      case 'message': return 'Сообщения';
      case 'order': return 'Заказы';
      case 'system': return 'Система';
      case 'promotion': return 'Акции';
      default: return 'Все';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'request':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'order':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'promotion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7M4.828 17l2.586-2.586a2 2 0 012.828 0L12 17" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'glass-bg-accent-orange-500';
      case 'message': return 'glass-bg-accent-blue-500';
      case 'order': return 'glass-bg-success';
      case 'system': return 'glass-bg-accent-purple-500';
      case 'promotion': return 'glass-bg-danger';
      default: return 'glass-bg-secondary';
    }
  };

  // Data is now fetched via API hooks - no useEffect needed

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId.toString());
      refresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refresh();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const filteredNotifications = (notifications || []).filter((notification: any) => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.is_read) || 
      (filter === 'read' && notification.is_read);
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesFilter && matchesType;
  });

  const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 glass-bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7M4.828 17l2.586-2.586a2 2 0 012.828 0L12 17" />
                </svg>
                Уведомления
                {unreadCount > 0 && (
                  <span className="px-2 py-1 glass-bg-danger text-white rounded-full text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </GlassCardTitle>
              
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <GlassButton variant="secondary" size="md" onClick={handleMarkAllAsRead} disabled={actionsLoading}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Отметить все как прочитанные
                  </GlassButton>
                )}
                <GlassButton variant="ghost" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Настройки
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'unread', 'read'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'unread' && 'Непрочитанные'}
                    {filterType === 'read' && 'Прочитанные'}
                  </GlassButton>
                ))}
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Тип:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {getTypeText(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification: any) => (
            <GlassCard 
              key={notification.id} 
              variant={notification.is_read ? "interactive" : "elevated"} 
              padding="lg"
              className={`hover:glass-shadow-md transition-all ${
                !notification.is_read ? 'ring-2 ring-orange-400/50' : ''
              }`}
            >
              <GlassCardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold glass-text-primary">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm glass-text-muted">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 glass-bg-accent-orange-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    
                    <p className="glass-text-secondary leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    
                    {/* Sender Info */}
                    {notification.metadata?.sender && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                          {notification.metadata.sender.avatar ? (
                            <img 
                              src={notification.metadata.sender.avatar} 
                              alt={notification.metadata.sender.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-3 h-3 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm glass-text-secondary">
                          {notification.metadata.sender.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {notification.actionUrl && (
                        <GlassButton variant="gradient" size="sm">
                          Открыть
                        </GlassButton>
                      )}
                      {!notification.is_read && (
                        <GlassButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={actionsLoading}
                        >
                          Отметить как прочитанное
                        </GlassButton>
                      )}
                      <GlassButton variant="ghost" size="sm">
                        ⋯
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </GlassCardHeader>
            </GlassCard>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12 7M4.828 17l2.586-2.586a2 2 0 012.828 0L12 17" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Уведомления не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'unread' 
                  ? 'У вас нет непрочитанных уведомлений'
                  : filter === 'read'
                  ? 'У вас нет прочитанных уведомлений'
                  : 'У вас пока нет уведомлений'
                }
              </p>
              {filter !== 'all' && (
                <GlassButton variant="gradient" size="lg" onClick={() => setFilter('all')}>
                  Показать все уведомления
                </GlassButton>
              )}
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
