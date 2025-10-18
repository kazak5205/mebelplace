'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Play, 
  Pause, 
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Star,
  Award,
  Flag,
  Calendar,
  User,
  MessageCircle,
  FileText,
  Image,
  Video,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal
} from 'lucide-react';

export type TimelineItemStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

export type TimelineItemType = 'milestone' | 'task' | 'event' | 'note' | 'achievement' | 'deadline' | 'custom';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  status: TimelineItemStatus;
  type: TimelineItemType;
  date: Date;
  endDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'other';
    url: string;
    size?: number;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    timestamp: Date;
  }>;
  tags?: string[];
  metadata?: Record<string, any>;
  isExpandable?: boolean;
  isExpanded?: boolean;
  children?: TimelineItem[];
}

export interface GlassTimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'vertical' | 'horizontal';
  showDates?: boolean;
  showStatus?: boolean;
  showProgress?: boolean;
  showAssignees?: boolean;
  showAttachments?: boolean;
  showComments?: boolean;
  showTags?: boolean;
  showActions?: boolean;
  showExpandToggle?: boolean;
  showAddButton?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  allowItemCreation?: boolean;
  allowItemEditing?: boolean;
  allowItemDeletion?: boolean;
  allowStatusChange?: boolean;
  autoExpand?: boolean;
  className?: string;
  onItemClick?: (item: TimelineItem) => void;
  onItemCreate?: (date: Date) => void;
  onItemEdit?: (item: TimelineItem) => void;
  onItemDelete?: (itemId: string) => void;
  onStatusChange?: (itemId: string, status: TimelineItemStatus) => void;
  onItemExpand?: (itemId: string, expanded: boolean) => void;
  onCommentAdd?: (itemId: string, comment: string) => void;
  onAttachmentAdd?: (itemId: string, file: File) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    itemSpacing: 'space-y-2',
    padding: 'p-2',
    fontSize: 'text-xs',
    titleSize: 'text-sm',
    iconSize: 'w-4 h-4',
    lineWidth: 'w-0.5',
    dotSize: 'w-3 h-3'
  },
  md: {
    itemSpacing: 'space-y-3',
    padding: 'p-3',
    fontSize: 'text-sm',
    titleSize: 'text-base',
    iconSize: 'w-5 h-5',
    lineWidth: 'w-1',
    dotSize: 'w-4 h-4'
  },
  lg: {
    itemSpacing: 'space-y-4',
    padding: 'p-4',
    fontSize: 'text-base',
    titleSize: 'text-lg',
    iconSize: 'w-6 h-6',
    lineWidth: 'w-1.5',
    dotSize: 'w-5 h-5'
  },
  xl: {
    itemSpacing: 'space-y-6',
    padding: 'p-6',
    fontSize: 'text-lg',
    titleSize: 'text-xl',
    iconSize: 'w-7 h-7',
    lineWidth: 'w-2',
    dotSize: 'w-6 h-6'
  }
};

// Status configurations
const statusConfig = {
  pending: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
    icon: Clock,
    label: 'Ожидает'
  },
  in_progress: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    icon: Play,
    label: 'В работе'
  },
  completed: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    icon: CheckCircle,
    label: 'Завершено'
  },
  cancelled: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: XCircle,
    label: 'Отменено'
  },
  on_hold: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    icon: Pause,
    label: 'Приостановлено'
  }
};

// Type configurations
const typeConfig = {
  milestone: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    icon: Flag,
    label: 'Веха'
  },
  task: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    icon: CheckCircle,
    label: 'Задача'
  },
  event: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    icon: Calendar,
    label: 'Событие'
  },
  note: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    icon: FileText,
    label: 'Заметка'
  },
  achievement: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    icon: Award,
    label: 'Достижение'
  },
  deadline: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    icon: AlertCircle,
    label: 'Дедлайн'
  },
  custom: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    icon: Star,
    label: 'Пользовательское'
  }
};

// Animation variants
const timelineVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const progressVariants = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassTimeline: React.FC<GlassTimelineProps> = ({
  items,
  variant = 'default',
  size = 'md',
  orientation = 'vertical',
  showDates = true,
  showStatus = true,
  showProgress = true,
  showAssignees = true,
  showAttachments = true,
  showComments = true,
  showTags = true,
  showActions = true,
  showExpandToggle = true,
  showAddButton = true,
  showFilters = true,
  showSearch = true,
  allowItemCreation = true,
  allowItemEditing = true,
  allowItemDeletion = true,
  allowStatusChange = true,
  autoExpand = false,
  className,
  onItemClick,
  onItemCreate,
  onItemEdit,
  onItemDelete,
  onStatusChange,
  onItemExpand,
  onCommentAdd,
  onAttachmentAdd
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TimelineItemStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TimelineItemType | 'all'>('all');

  const config = sizeConfig[size];

  // Calculate progress
  const progress = useMemo(() => {
    const total = items.length;
    const completed = items.filter(item => item.status === 'completed').length;
    return total > 0 ? (completed / total) * 100 : 0;
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, searchQuery, statusFilter, typeFilter]);

  // Handle item expand
  const handleItemExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
    onItemExpand?.(itemId, newExpanded.has(itemId));
  };

  // Handle status change
  const handleStatusChange = (itemId: string, newStatus: TimelineItemStatus) => {
    onStatusChange?.(itemId, newStatus);
  };

  // Render status indicator
  const renderStatusIndicator = (item: TimelineItem) => {
    const statusInfo = statusConfig[item.status];
    const StatusIcon = statusInfo.icon;

    return (
      <div className={cn(
        'flex items-center justify-center rounded-full border-2',
        statusInfo.bg,
        statusInfo.border,
        config.dotSize
      )}>
        <StatusIcon className={cn(
          statusInfo.color,
          config.iconSize
        )} />
      </div>
    );
  };

  // Render type indicator
  const renderTypeIndicator = (item: TimelineItem) => {
    const typeInfo = typeConfig[item.type];
    const TypeIcon = typeInfo.icon;

    return (
      <div className={cn(
        'flex items-center justify-center rounded-full',
        typeInfo.bg,
        config.dotSize
      )}>
        <TypeIcon className={cn(
          typeInfo.color,
          config.iconSize
        )} />
      </div>
    );
  };

  // Render assignee
  const renderAssignee = (assignee: TimelineItem['assignee']) => {
    if (!assignee || !showAssignees) return null;

    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          {assignee.avatar ? (
            <img
              src={assignee.avatar}
              alt={assignee.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-xs">
              {assignee.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm text-white/80">{assignee.name}</span>
      </div>
    );
  };

  // Render attachments
  const renderAttachments = (attachments: TimelineItem['attachments']) => {
    if (!attachments?.length || !showAttachments) return null;

    const getAttachmentIcon = (type: string) => {
      switch (type) {
        case 'image': return Image;
        case 'video': return Video;
        case 'document': return FileText;
        default: return FileText;
      }
    };

    return (
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => {
          const Icon = getAttachmentIcon(attachment.type);
          return (
            <button
              key={attachment.id}
              onClick={() => window.open(attachment.url, '_blank')}
              className="flex items-center space-x-1 px-2 py-1 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
            >
              <Icon className="w-3 h-3 text-white/60" />
              <span className="text-xs text-white/80">{attachment.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Render comments
  const renderComments = (comments: TimelineItem['comments']) => {
    if (!comments?.length || !showComments) return null;

    return (
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="p-2 bg-glass-secondary/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/80">{comment.author}</span>
              <span className="text-xs text-white/60">
                {comment.timestamp.toLocaleDateString('ru-RU')}
              </span>
            </div>
            <p className="text-sm text-white/70">{comment.content}</p>
          </div>
        ))}
      </div>
    );
  };

  // Render tags
  const renderTags = (tags: TimelineItem['tags']) => {
    if (!tags?.length || !showTags) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-glass-accent/20 text-orange-300 rounded-full border border-orange-500/30"
          >
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  // Render actions
  const renderActions = (item: TimelineItem) => {
    if (!showActions) return null;

    return (
      <div className="flex items-center space-x-1">
        {allowStatusChange && item.status !== 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(item.id, 'completed');
            }}
            className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors duration-200"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}

        {allowItemEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onItemEdit?.(item);
            }}
            className="p-1.5 text-white/60 hover:bg-glass-secondary/30 hover:text-white rounded-lg transition-colors duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {allowItemDeletion && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onItemDelete?.(item.id);
            }}
            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button className="p-1.5 text-white/60 hover:bg-glass-secondary/30 hover:text-white rounded-lg transition-colors duration-200">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render timeline item
  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const isExpanded = expandedItems.has(item.id);
    const statusInfo = statusConfig[item.status];
    const typeInfo = typeConfig[item.type];

    return (
      <motion.div
        key={item.id}
        className="relative"
        variants={itemVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        {/* Timeline line */}
        {index < filteredItems.length - 1 && (
          <div className={cn(
            'absolute left-6 top-12 bg-glass-border/30',
            config.lineWidth,
            'h-16'
          )} />
        )}

        <div className="flex items-start space-x-4">
          {/* Status indicator */}
          <div className="flex-shrink-0 mt-1">
            {renderStatusIndicator(item)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'p-4 bg-glass-primary/50 backdrop-blur-sm rounded-xl border border-glass-border/50 cursor-pointer hover:bg-glass-primary/70 transition-colors duration-200',
                config.padding
              )}
              onClick={() => onItemClick?.(item)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={cn(
                      'font-semibold text-white truncate',
                      config.titleSize
                    )}>
                      {item.title}
                    </h3>
                    
                    {/* Type badge */}
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      typeInfo.bg,
                      typeInfo.color
                    )}>
                      {typeInfo.label}
                    </span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className={cn(
                      'text-white/80 line-clamp-2',
                      config.fontSize
                    )}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {renderActions(item)}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  {/* Date */}
                  {showDates && (
                    <div className="flex items-center space-x-1 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span className={config.fontSize}>
                        {item.date.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  )}

                  {/* Assignee */}
                  {renderAssignee(item.assignee)}
                </div>

                {/* Expand toggle */}
                {showExpandToggle && (item.isExpandable || item.attachments?.length || item.comments?.length) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemExpand(item.id);
                    }}
                    className="p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Tags */}
              {renderTags(item.tags)}

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="mt-4 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Attachments */}
                    {renderAttachments(item.attachments)}

                    {/* Comments */}
                    {renderComments(item.comments)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render header
  const renderHeader = () => {
    return (
      <div className="space-y-4 mb-6">
        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Прогресс</span>
              <span className="text-sm text-white/60">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                variants={progressVariants}
                initial="initial"
                animate="animate"
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>
        )}

        {/* Search and filters */}
        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Поиск по временной шкале..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TimelineItemStatus | 'all')}
                className="px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                <option value="all">Все статусы</option>
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
                <option value="on_hold">Приостановлено</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TimelineItemType | 'all')}
                className="px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                <option value="all">Все типы</option>
                <option value="milestone">Вехи</option>
                <option value="task">Задачи</option>
                <option value="event">События</option>
                <option value="note">Заметки</option>
                <option value="achievement">Достижения</option>
                <option value="deadline">Дедлайны</option>
                <option value="custom">Пользовательские</option>
              </select>
            </div>
          )}

          {showAddButton && allowItemCreation && (
            <button
              onClick={() => onItemCreate?.(new Date())}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        className
      )}
      variants={timelineVariants}
      initial="initial"
      animate="animate"
    >
      <div className={config.padding}>
        {renderHeader()}
        
        <div className={config.itemSpacing}>
          {filteredItems.map((item, index) => renderTimelineItem(item, index))}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-glass-secondary/30 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Нет элементов</h3>
            <p className="text-white/60">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Попробуйте изменить фильтры поиска'
                : 'Добавьте первый элемент в временную шкалу'
              }
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Convenience components
export const GlassTimelineCompact: React.FC<Omit<GlassTimelineProps, 'variant' | 'size'>> = (props) => (
  <GlassTimeline {...props} variant="compact" size="sm" />
);

export const GlassTimelineDetailed: React.FC<Omit<GlassTimelineProps, 'variant' | 'size'>> = (props) => (
  <GlassTimeline {...props} variant="detailed" size="lg" />
);

export const GlassTimelineMinimal: React.FC<Omit<GlassTimelineProps, 'variant'>> = (props) => (
  <GlassTimeline {...props} variant="minimal" showProgress={false} showFilters={false} showSearch={false} />
);

// Example usage component
export const GlassTimelineExample: React.FC = () => {
  const sampleItems: TimelineItem[] = [
    {
      id: '1',
      title: 'Начало проекта',
      description: 'Инициализация проекта по изготовлению кухни',
      status: 'completed',
      type: 'milestone',
      date: new Date(2024, 0, 1),
      priority: 'high',
      assignee: {
        id: '1',
        name: 'Алексей Иванов',
        avatar: '/api/placeholder/32/32'
      },
      tags: ['проект', 'инициализация']
    },
    {
      id: '2',
      title: 'Замеры помещения',
      description: 'Проведение замеров и создание технического задания',
      status: 'completed',
      type: 'task',
      date: new Date(2024, 0, 3),
      priority: 'high',
      assignee: {
        id: '2',
        name: 'Мария Петрова'
      },
      attachments: [
        {
          id: '1',
          name: 'measurements.pdf',
          type: 'document',
          url: '/api/placeholder/200/200'
        }
      ],
      comments: [
        {
          id: '1',
          author: 'Алексей Иванов',
          content: 'Замеры выполнены, можно переходить к дизайну',
          timestamp: new Date(2024, 0, 3, 16, 30)
        }
      ]
    },
    {
      id: '3',
      title: 'Создание дизайна',
      description: 'Разработка 3D модели и визуализации кухни',
      status: 'in_progress',
      type: 'task',
      date: new Date(2024, 0, 5),
      priority: 'medium',
      assignee: {
        id: '3',
        name: 'Дмитрий Сидоров'
      },
      tags: ['дизайн', '3d', 'визуализация']
    },
    {
      id: '4',
      title: 'Утверждение проекта',
      description: 'Согласование дизайна с заказчиком',
      status: 'pending',
      type: 'milestone',
      date: new Date(2024, 0, 10),
      priority: 'high'
    },
    {
      id: '5',
      title: 'Закупка материалов',
      description: 'Приобретение необходимых материалов и фурнитуры',
      status: 'pending',
      type: 'task',
      date: new Date(2024, 0, 12),
      priority: 'medium',
      tags: ['материалы', 'закупка']
    },
    {
      id: '6',
      title: 'Изготовление',
      description: 'Производство элементов кухни',
      status: 'pending',
      type: 'task',
      date: new Date(2024, 0, 15),
      priority: 'high',
      assignee: {
        id: '4',
        name: 'Петр Волков'
      }
    },
    {
      id: '7',
      title: 'Установка',
      description: 'Монтаж и установка готовой кухни',
      status: 'pending',
      type: 'milestone',
      date: new Date(2024, 0, 20),
      priority: 'urgent',
      assignee: {
        id: '5',
        name: 'Анна Козлова'
      }
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default timeline */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычная временная шкала</h3>
        <div className="max-w-4xl">
          <GlassTimeline
            items={sampleItems}
            showDates
            showStatus
            showProgress
            showAssignees
            showAttachments
            showComments
            showTags
            showActions
            showExpandToggle
            showAddButton
            showFilters
            showSearch
            allowItemCreation
            allowItemEditing
            allowItemDeletion
            allowStatusChange
            onItemClick={(item) => console.log('Item clicked:', item.title)}
            onItemCreate={(date) => console.log('Create item for:', date)}
            onItemEdit={(item) => console.log('Edit item:', item.title)}
            onItemDelete={(itemId) => console.log('Delete item:', itemId)}
            onStatusChange={(itemId, status) => console.log('Status change:', itemId, status)}
            onItemExpand={(itemId, expanded) => console.log('Item expand:', itemId, expanded)}
            onCommentAdd={(itemId, comment) => console.log('Add comment:', itemId, comment)}
            onAttachmentAdd={(itemId, file) => console.log('Add attachment:', itemId, file.name)}
          />
        </div>
      </div>

      {/* Compact timeline */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактная временная шкала</h3>
        <div className="max-w-2xl">
          <GlassTimelineCompact
            items={sampleItems}
            showProgress
            onItemClick={(item) => console.log('Compact item clicked:', item.title)}
            onStatusChange={(itemId, status) => console.log('Compact status change:', itemId, status)}
          />
        </div>
      </div>

      {/* Minimal timeline */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальная временная шкала</h3>
        <div className="max-w-lg">
          <GlassTimelineMinimal
            items={sampleItems}
            onItemClick={(item) => console.log('Minimal item clicked:', item.title)}
          />
        </div>
      </div>
    </div>
  );
};

