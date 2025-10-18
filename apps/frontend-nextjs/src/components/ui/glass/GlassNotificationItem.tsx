'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  User, 
  Star, 
  Award, 
  Calendar, 
  Phone, 
  Mail,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Eye,
  Trash2,
  Archive,
  MoreHorizontal,
  ChevronRight,
  Clock,
  ExternalLink
} from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message' | 'like' | 'follow' | 'achievement' | 'reminder' | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  avatar?: string;
  icon?: React.ComponentType<{ className?: string }>;
  timestamp: string;
  isRead: boolean;
  isArchived: boolean;
  isPinned: boolean;
  actions?: NotificationAction[];
  metadata?: {
    userId?: string;
    userName?: string;
    url?: string;
    image?: string;
    amount?: number;
    currency?: string;
  };
  expiresAt?: string;
  category?: string;
  tags?: string[];
}

export interface GlassNotificationItemProps {
  notification: Notification;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  showPriority?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
  showMetadata?: boolean;
  className?: string;
  onClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAsUnread?: (notificationId: string) => void;
  onArchive?: (notificationId: string) => void;
  onUnarchive?: (notificationId: string) => void;
  onPin?: (notificationId: string) => void;
  onUnpin?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onActionClick?: (notificationId: string, actionId: string) => void;
  animated?: boolean;
  swipeToDismiss?: boolean;
  onSwipeDismiss?: (notificationId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-3',
    avatarSize: 'w-8 h-8',
    titleSize: 'text-sm',
    messageSize: 'text-xs',
    timestampSize: 'text-xs',
    spacing: 'space-y-2'
  },
  md: {
    padding: 'p-4',
    avatarSize: 'w-10 h-10',
    titleSize: 'text-base',
    messageSize: 'text-sm',
    timestampSize: 'text-sm',
    spacing: 'space-y-2'
  },
  lg: {
    padding: 'p-6',
    avatarSize: 'w-12 h-12',
    titleSize: 'text-lg',
    messageSize: 'text-base',
    timestampSize: 'text-base',
    spacing: 'space-y-3'
  }
};

// Type configurations
const typeConfig = {
  info: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: Info
  },
  success: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: CheckCircle
  },
  warning: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: AlertCircle
  },
  error: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: AlertCircle
  },
  message: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    icon: MessageCircle
  },
  like: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: Heart
  },
  follow: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: User
  },
  achievement: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: Award
  },
  reminder: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    icon: Clock
  },
  system: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    icon: Bell
  }
};

// Priority configurations
const priorityConfig = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/20', label: 'Низкий' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Средний' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Высокий' },
  urgent: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Срочный' }
};

// Animation variants
const itemVariants = {
  initial: { opacity: 0, x: -20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  swipeLeft: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  swipeRight: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const actionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassNotificationItem: React.FC<GlassNotificationItemProps> = ({
  notification,
  variant = 'default',
  size = 'md',
  showActions = true,
  showTimestamp = true,
  showAvatar = true,
  showPriority = false,
  showCategory = false,
  showTags = false,
  showMetadata = false,
  className,
  onClick,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onUnarchive,
  onPin,
  onUnpin,
  onDelete,
  onActionClick,
  animated = true,
  swipeToDismiss = true,
  onSwipeDismiss
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [dragX, setDragX] = useState(0);

  const config = sizeConfig[size];
  const typeInfo = typeConfig[notification.type];
  const priorityInfo = priorityConfig[notification.priority];
  const TypeIcon = notification.icon || typeInfo.icon;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  const handleDragEnd = (event: any, info: any) => {
    if (!swipeToDismiss) return;
    
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      onSwipeDismiss?.(notification.id);
    } else {
      setDragX(0);
    }
  };

  const renderAvatar = () => {
    if (!showAvatar) return null;

    if (notification.avatar) {
      return (
        <img
          src={notification.avatar}
          alt="Avatar"
          className={cn(
            'rounded-full object-cover',
            config.avatarSize
          )}
        />
      );
    }

    return (
      <div className={cn(
        'rounded-full bg-gradient-to-br from-orange-400 to-orange-600',
        'flex items-center justify-center',
        config.avatarSize
      )}>
        <TypeIcon className={cn(
          'text-white',
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
        )} />
      </div>
    );
  };

  const renderPriority = () => {
    if (!showPriority) return null;

    return (
      <div className={cn(
        'px-2 py-1 text-xs font-medium rounded-full',
        priorityInfo.bg,
        priorityInfo.color
      )}>
        {priorityInfo.label}
      </div>
    );
  };

  const renderCategory = () => {
    if (!showCategory || !notification.category) return null;

    return (
      <div className="px-2 py-1 text-xs bg-glass-secondary/30 text-white/60 rounded-full">
        {notification.category}
      </div>
    );
  };

  const renderTags = () => {
    if (!showTags || !notification.tags?.length) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {notification.tags.map((tag, index) => (
          <span
            key={index}
            className="px-1 py-0.5 text-xs bg-glass-accent/20 text-orange-300 rounded"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  const renderMetadata = () => {
    if (!showMetadata || !notification.metadata) return null;

    const { metadata } = notification;

    return (
      <div className="space-y-1">
        {metadata.userName && (
          <p className="text-sm text-white/80">
            <User className="w-4 h-4 inline mr-1" />
            {metadata.userName}
          </p>
        )}
        {metadata.amount && (
          <p className="text-sm font-medium text-green-400">
            {metadata.amount.toLocaleString()} {metadata.currency || 'KZT'}
          </p>
        )}
        {metadata.image && (
          <img
            src={metadata.image}
            alt="Notification image"
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center space-x-2">
        {/* Primary action */}
        {notification.actions?.[0] && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.(notification.id, notification.actions![0].id);
              notification.actions![0].onClick();
            }}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200',
              notification.actions[0].type === 'primary' 
                ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30'
                : notification.actions[0].type === 'danger'
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                : 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {notification.actions[0].label}
          </button>
        )}

        {/* Secondary actions */}
        {notification.actions?.slice(1).map((action) => (
          <button
            key={action.id}
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.(notification.id, action.id);
              action.onClick();
            }}
            className="px-2 py-1.5 text-sm text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </button>
        ))}

        {/* External link */}
        {notification.metadata?.url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(notification.metadata!.url, '_blank');
            }}
            className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}

        {/* More actions */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionMenu(!showActionMenu);
            }}
            className="p-1.5 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showActionMenu && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-48 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg overflow-hidden z-10"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
              >
                <div className="p-2 space-y-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.isRead ? onMarkAsUnread?.(notification.id) : onMarkAsRead?.(notification.id);
                      setShowActionMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{notification.isRead ? 'Отметить как непрочитанное' : 'Отметить как прочитанное'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.isPinned ? onUnpin?.(notification.id) : onPin?.(notification.id);
                      setShowActionMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                  >
                    <Star className="w-4 h-4" />
                    <span>{notification.isPinned ? 'Открепить' : 'Закрепить'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.isArchived ? onUnarchive?.(notification.id) : onArchive?.(notification.id);
                      setShowActionMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{notification.isArchived ? 'Восстановить' : 'Архивировать'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(notification.id);
                      setShowActionMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-sm';
      case 'minimal':
        return 'max-w-xs';
      case 'detailed':
        return 'max-w-lg';
      default:
        return 'max-w-md';
    }
  };

  return (
    <motion.div
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-sm',
        'overflow-hidden',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        !notification.isRead && 'ring-2 ring-orange-500/30',
        notification.isPinned && 'ring-2 ring-blue-500/30',
        notification.priority === 'urgent' && 'ring-2 ring-red-500/30',
        getVariantStyles(),
        className
      )}
      variants={animated ? itemVariants : undefined}
      initial={animated ? 'initial' : undefined}
      animate={animated ? 'animate' : undefined}
      exit={animated ? 'exit' : undefined}
      onClick={() => onClick?.(notification)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      drag={swipeToDismiss ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDrag={(event, info) => setDragX(info.offset.x)}
      onDragEnd={handleDragEnd}
      style={{ x: dragX }}
    >
      <div className={cn(config.padding, config.spacing)}>
        {/* Header */}
        <div className="flex items-start space-x-3">
          {renderAvatar()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h4 className={cn(
                  'font-semibold text-white truncate',
                  config.titleSize,
                  !notification.isRead && 'font-bold'
                )}>
                  {notification.title}
                </h4>
                
                <div className="flex items-center space-x-1">
                  {renderPriority()}
                  {renderCategory()}
                </div>
              </div>
              
              {showTimestamp && (
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(notification.timestamp)}</span>
                </div>
              )}
            </div>
            
            <p className={cn(
              'text-white/80 line-clamp-2',
              config.messageSize
            )}>
              {notification.message}
            </p>
            
            {/* Tags */}
            {renderTags()}
            
            {/* Metadata */}
            {renderMetadata()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-glass-border/30">
          {renderActions()}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full" />
      )}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// Convenience components
export const GlassNotificationItemCompact: React.FC<Omit<GlassNotificationItemProps, 'variant'>> = (props) => (
  <GlassNotificationItem {...props} variant="compact" showActions={false} showMetadata={false} />
);

export const GlassNotificationItemDetailed: React.FC<Omit<GlassNotificationItemProps, 'variant'>> = (props) => (
  <GlassNotificationItem {...props} variant="detailed" showActions showMetadata showCategory showTags showPriority />
);

export const GlassNotificationItemMinimal: React.FC<Omit<GlassNotificationItemProps, 'variant'>> = (props) => (
  <GlassNotificationItem {...props} variant="minimal" showActions={false} showAvatar={false} showTimestamp={false} />
);

// Example usage component
export const GlassNotificationItemExample: React.FC = () => {
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'message',
      priority: 'medium',
      title: 'Новое сообщение',
      message: 'Алексей Иванов отправил вам сообщение о проекте кухни',
      avatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false,
      isArchived: false,
      isPinned: false,
      actions: [
        { id: 'reply', label: 'Ответить', type: 'primary', onClick: () => console.log('Reply') },
        { id: 'view', label: 'Посмотреть', type: 'secondary', onClick: () => console.log('View') }
      ],
      metadata: {
        userId: '1',
        userName: 'Алексей Иванов',
        url: '/chat/1'
      }
    },
    {
      id: '2',
      type: 'like',
      priority: 'low',
      title: 'Лайк',
      message: 'Мария Петрова поставила лайк вашему проекту',
      avatar: '/api/placeholder/40/40',
      timestamp: '2024-01-15T09:15:00Z',
      isRead: true,
      isArchived: false,
      isPinned: false,
      metadata: {
        userId: '2',
        userName: 'Мария Петрова',
        image: '/api/placeholder/100/100'
      }
    },
    {
      id: '3',
      type: 'achievement',
      priority: 'high',
      title: 'Новое достижение!',
      message: 'Поздравляем! Вы получили достижение "Топ-100 мастеров"',
      timestamp: '2024-01-15T08:00:00Z',
      isRead: false,
      isArchived: false,
      isPinned: true,
      category: 'Достижения',
      tags: ['достижение', 'топ-100', 'мастер'],
      actions: [
        { id: 'view', label: 'Посмотреть', type: 'primary', onClick: () => console.log('View achievement') }
      ]
    },
    {
      id: '4',
      type: 'system',
      priority: 'urgent',
      title: 'Обновление системы',
      message: 'Плановое техническое обслуживание завтра с 02:00 до 04:00',
      timestamp: '2024-01-15T07:30:00Z',
      isRead: true,
      isArchived: false,
      isPinned: false,
      category: 'Система',
      actions: [
        { id: 'dismiss', label: 'Понятно', type: 'secondary', onClick: () => console.log('Dismiss') }
      ]
    },
    {
      id: '5',
      type: 'reminder',
      priority: 'medium',
      title: 'Напоминание',
      message: 'Не забудьте ответить на предложение по проекту "Кухня в современном стиле"',
      timestamp: '2024-01-15T06:45:00Z',
      isRead: true,
      isArchived: false,
      isPinned: false,
      category: 'Напоминания',
      actions: [
        { id: 'view', label: 'Посмотреть', type: 'primary', onClick: () => console.log('View reminder') },
        { id: 'dismiss', label: 'Отложить', type: 'secondary', onClick: () => console.log('Dismiss reminder') }
      ]
    }
  ];

  return (
    <div className="space-y-4 p-8">
      {/* Compact notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактные уведомления</h3>
        <div className="space-y-3 max-w-md">
          {sampleNotifications.slice(0, 3).map(notification => (
            <GlassNotificationItemCompact
              key={notification.id}
              notification={notification}
              onClick={(notification) => console.log('Clicked:', notification.title)}
              onMarkAsRead={(id) => console.log('Mark as read:', id)}
              onDelete={(id) => console.log('Delete:', id)}
            />
          ))}
        </div>
      </div>

      {/* Detailed notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Детальные уведомления</h3>
        <div className="space-y-4 max-w-lg">
          {sampleNotifications.slice(0, 2).map(notification => (
            <GlassNotificationItemDetailed
              key={notification.id}
              notification={notification}
              onClick={(notification) => console.log('Clicked:', notification.title)}
              onMarkAsRead={(id) => console.log('Mark as read:', id)}
              onArchive={(id) => console.log('Archive:', id)}
              onPin={(id) => console.log('Pin:', id)}
              onDelete={(id) => console.log('Delete:', id)}
              onActionClick={(notificationId, actionId) => console.log('Action:', notificationId, actionId)}
              swipeToDismiss
              onSwipeDismiss={(id) => console.log('Swipe dismiss:', id)}
            />
          ))}
        </div>
      </div>

      {/* Minimal notifications */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальные уведомления</h3>
        <div className="space-y-2 max-w-sm">
          {sampleNotifications.slice(0, 4).map(notification => (
            <GlassNotificationItemMinimal
              key={notification.id}
              notification={notification}
              onClick={(notification) => console.log('Clicked:', notification.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

