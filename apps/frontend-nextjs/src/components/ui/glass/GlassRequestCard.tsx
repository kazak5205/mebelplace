'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  MapPin, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MessageCircle,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Tag,
  FileText,
  Image,
  Video,
  Download,
  Share2,
  Heart,
  Bookmark,
  MoreHorizontal
} from 'lucide-react';

export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'on_hold';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface RequestAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  url: string;
  size?: number;
  thumbnail?: string;
}

export interface RequestBid {
  id: string;
  masterId: string;
  masterName: string;
  masterAvatar?: string;
  amount: number;
  message?: string;
  estimatedTime?: string;
  isSelected?: boolean;
  createdAt: string;
}

export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  priority: RequestPriority;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city: string;
    address?: string;
    coordinates?: [number, number];
  };
  client: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    phone?: string;
    email?: string;
  };
  timeline: {
    createdAt: string;
    deadline?: string;
    estimatedDuration?: string;
  };
  attachments?: RequestAttachment[];
  bids?: RequestBid[];
  tags?: string[];
  isUrgent?: boolean;
  isBookmarked?: boolean;
  isLiked?: boolean;
  likesCount?: number;
  viewsCount?: number;
  bidsCount?: number;
}

export interface GlassRequestCardProps {
  request: Request;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  showBids?: boolean;
  showAttachments?: boolean;
  showClientInfo?: boolean;
  showBudget?: boolean;
  showTimeline?: boolean;
  showTags?: boolean;
  showStats?: boolean;
  className?: string;
  onClick?: (request: Request) => void;
  onBid?: (requestId: string) => void;
  onContact?: (request: Request) => void;
  onBookmark?: (requestId: string, isBookmarked: boolean) => void;
  onLike?: (requestId: string, isLiked: boolean) => void;
  onShare?: (request: Request) => void;
  onEdit?: (requestId: string) => void;
  onDelete?: (requestId: string) => void;
  onViewDetails?: (requestId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-4',
    titleSize: 'text-base',
    subtitleSize: 'text-sm',
    descriptionSize: 'text-sm',
    spacing: 'space-y-2'
  },
  md: {
    padding: 'p-6',
    titleSize: 'text-lg',
    subtitleSize: 'text-base',
    descriptionSize: 'text-sm',
    spacing: 'space-y-3'
  },
  lg: {
    padding: 'p-8',
    titleSize: 'text-xl',
    subtitleSize: 'text-lg',
    descriptionSize: 'text-base',
    spacing: 'space-y-4'
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
    icon: AlertCircle,
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
  rejected: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    icon: XCircle,
    label: 'Отклонено'
  },
  on_hold: {
    color: 'text-gray-400',
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    icon: Clock,
    label: 'Приостановлено'
  }
};

// Priority configurations
const priorityConfig = {
  low: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Низкий' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Средний' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Высокий' },
  urgent: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Срочный' }
};

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const attachmentVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassRequestCard: React.FC<GlassRequestCardProps> = ({
  request,
  variant = 'default',
  size = 'md',
  showActions = true,
  showBids = true,
  showAttachments = true,
  showClientInfo = true,
  showBudget = true,
  showTimeline = true,
  showTags = true,
  showStats = true,
  className,
  onClick,
  onBid,
  onContact,
  onBookmark,
  onLike,
  onShare,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const config = sizeConfig[size];
  const statusInfo = statusConfig[request.status];
  const priorityInfo = priorityConfig[request.priority];

  const formatCurrency = (amount: number, currency: string = 'KZT') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'KZT' ? 'KZT' : 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    if (diffInHours < 48) return 'Вчера';
    return date.toLocaleDateString('ru-RU');
  };

  const renderStatus = () => {
    const StatusIcon = statusInfo.icon;
    
    return (
      <div className={cn(
        'flex items-center space-x-2 px-3 py-1 rounded-full',
        statusInfo.bg,
        statusInfo.border,
        'border'
      )}>
        <StatusIcon className={cn('w-4 h-4', statusInfo.color)} />
        <span className={cn('text-sm font-medium', statusInfo.color)}>
          {statusInfo.label}
        </span>
      </div>
    );
  };

  const renderPriority = () => (
    <div className={cn(
      'px-2 py-1 text-xs font-medium rounded-full',
      priorityInfo.bg,
      priorityInfo.color
    )}>
      {priorityInfo.label}
    </div>
  );

  const renderBudget = () => {
    if (!showBudget || !request.budget) return null;

    return (
      <div className="flex items-center space-x-2">
        <DollarSign className="w-4 h-4 text-green-400" />
        <span className="text-sm text-white/80">
          {formatCurrency(request.budget.min, request.budget.currency)} - {formatCurrency(request.budget.max, request.budget.currency)}
        </span>
      </div>
    );
  };

  const renderClientInfo = () => {
    if (!showClientInfo) return null;

    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          {request.client.avatar ? (
            <img
              src={request.client.avatar}
              alt={request.client.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-xs">
              {request.client.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{request.client.name}</p>
          {request.client.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-white/60">{request.client.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAttachments = () => {
    if (!showAttachments || !request.attachments?.length) return null;

    const getAttachmentIcon = (type: string) => {
      switch (type) {
        case 'image': return Image;
        case 'video': return Video;
        case 'document': return FileText;
        default: return FileText;
      }
    };

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Вложения</h4>
        <div className="flex flex-wrap gap-2">
          {request.attachments.slice(0, 3).map((attachment) => {
            const Icon = getAttachmentIcon(attachment.type);
            return (
              <motion.div
                key={attachment.id}
                className="flex items-center space-x-2 p-2 bg-glass-secondary/30 rounded-lg cursor-pointer"
                variants={attachmentVariants}
                whileHover="hover"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(attachment.url, '_blank');
                }}
              >
                <Icon className="w-4 h-4 text-white/60" />
                <span className="text-xs text-white/80 truncate max-w-20">
                  {attachment.name}
                </span>
              </motion.div>
            );
          })}
          {request.attachments.length > 3 && (
            <div className="flex items-center justify-center w-8 h-8 bg-glass-secondary/30 rounded-lg">
              <span className="text-xs text-white/60">+{request.attachments.length - 3}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBids = () => {
    if (!showBids || !request.bids?.length) return null;

    const selectedBid = request.bids.find(bid => bid.isSelected);
    const bidsCount = request.bids.length;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white/80">
            Предложения ({bidsCount})
          </h4>
          {selectedBid && (
            <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
              Выбрано
            </span>
          )}
        </div>
        
        {selectedBid && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {selectedBid.masterName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-white">{selectedBid.masterName}</span>
              </div>
              <span className="text-sm font-semibold text-green-400">
                {formatCurrency(selectedBid.amount)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTags = () => {
    if (!showTags || !request.tags?.length) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {request.tags.map((tag, index) => (
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

  const renderStats = () => {
    if (!showStats) return null;

    const stats = [
      { icon: Eye, value: request.viewsCount || 0, label: 'Просмотры' },
      { icon: Heart, value: request.likesCount || 0, label: 'Лайки' },
      { icon: MessageCircle, value: request.bidsCount || 0, label: 'Предложения' }
    ].filter(stat => stat.value > 0);

    return (
      <div className="flex items-center space-x-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-1">
            <stat.icon className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">{stat.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center space-x-2">
        {/* Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(request.id, !request.isLiked);
          }}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            request.isLiked 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={cn('w-4 h-4', request.isLiked && 'fill-current')} />
        </button>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.(request.id, !request.isBookmarked);
          }}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            request.isBookmarked 
              ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
              : 'bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark className={cn('w-4 h-4', request.isBookmarked && 'fill-current')} />
        </button>

        {/* Bid */}
        {request.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBid?.(request.id);
            }}
            className="px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200 text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Предложить
          </button>
        )}

        {/* Contact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContact?.(request);
          }}
          className="p-2 bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(request);
          }}
          className="p-2 bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* More */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(request.id);
          }}
          className="p-2 bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'max-w-sm';
      case 'detailed':
        return 'max-w-2xl';
      case 'minimal':
        return 'max-w-xs';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <motion.div
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        request.isUrgent && 'ring-2 ring-red-500/30',
        getVariantStyles(),
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      onClick={() => onClick?.(request)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={cn(config.padding, config.spacing)}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={cn(
                'font-semibold text-white truncate',
                config.titleSize
              )}>
                {request.title}
              </h3>
              {request.isUrgent && (
                <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full font-medium">
                  СРОЧНО
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              {renderStatus()}
              {renderPriority()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {renderBudget()}
          </div>
        </div>

        {/* Description */}
        {variant !== 'minimal' && (
          <div className="space-y-2">
            <p className={cn(
              'text-white/80',
              config.descriptionSize,
              !showFullDescription && 'line-clamp-2'
            )}>
              {request.description}
            </p>
            {request.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullDescription(!showFullDescription);
                }}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
              >
                {showFullDescription ? 'Свернуть' : 'Показать полностью'}
              </button>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">{request.location.city}</span>
          {request.location.address && (
            <span className="text-sm text-white/60">• {request.location.address}</span>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">{request.category}</span>
        </div>

        {/* Timeline */}
        {showTimeline && (
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Создано {formatDate(request.timeline.createdAt)}</span>
            </div>
            {request.timeline.deadline && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>До {formatDate(request.timeline.deadline)}</span>
              </div>
            )}
          </div>
        )}

        {/* Client Info */}
        {renderClientInfo()}

        {/* Tags */}
        {renderTags()}

        {/* Attachments */}
        {variant === 'detailed' && renderAttachments()}

        {/* Bids */}
        {renderBids()}

        {/* Stats */}
        {renderStats()}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-glass-border/30">
          {renderActions()}
        </div>
      </div>

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

// Convenience components
export const GlassRequestCardCompact: React.FC<Omit<GlassRequestCardProps, 'variant'>> = (props) => (
  <GlassRequestCard {...props} variant="compact" showBids={false} showAttachments={false} />
);

export const GlassRequestCardDetailed: React.FC<Omit<GlassRequestCardProps, 'variant'>> = (props) => (
  <GlassRequestCard {...props} variant="detailed" showBids showAttachments showStats />
);

export const GlassRequestCardMinimal: React.FC<Omit<GlassRequestCardProps, 'variant'>> = (props) => (
  <GlassRequestCard {...props} variant="minimal" showActions={false} showBids={false} showAttachments={false} />
);

// Example usage component
export const GlassRequestCardExample: React.FC = () => {
  const sampleRequests: Request[] = [
    {
      id: '1',
      title: 'Изготовление кухни на заказ',
      description: 'Нужно изготовить кухню в современном стиле с барной стойкой. Размер помещения 3x4 метра. Предпочтение светлым тонам с акцентами.',
      category: 'Кухни',
      status: 'pending',
      priority: 'high',
      budget: {
        min: 500000,
        max: 800000,
        currency: 'KZT'
      },
      location: {
        city: 'Алматы',
        address: 'ул. Абая, 150'
      },
      client: {
        id: '1',
        name: 'Анна Петрова',
        rating: 4.8,
        phone: '+7 (777) 123-45-67'
      },
      timeline: {
        createdAt: '2024-01-15T10:30:00Z',
        deadline: '2024-02-15T18:00:00Z',
        estimatedDuration: '2-3 недели'
      },
      attachments: [
        { id: '1', name: 'plan.jpg', type: 'image', url: '/api/placeholder/200/200' },
        { id: '2', name: 'moodboard.pdf', type: 'document', url: '/api/placeholder/200/200' }
      ],
      bids: [
        {
          id: '1',
          masterId: '1',
          masterName: 'Алексей Иванов',
          amount: 650000,
          message: 'Готов выполнить проект в срок',
          estimatedTime: '2 недели',
          isSelected: false,
          createdAt: '2024-01-15T12:00:00Z'
        },
        {
          id: '2',
          masterId: '2',
          masterName: 'Мария Сидорова',
          amount: 720000,
          message: 'Качественная работа с гарантией',
          estimatedTime: '3 недели',
          isSelected: true,
          createdAt: '2024-01-15T14:30:00Z'
        }
      ],
      tags: ['кухня', 'современный стиль', 'барная стойка'],
      isUrgent: false,
      isBookmarked: false,
      isLiked: false,
      likesCount: 12,
      viewsCount: 156,
      bidsCount: 2
    },
    {
      id: '2',
      title: 'Ремонт спальни',
      description: 'Полный ремонт спальни 12 кв.м.',
      category: 'Ремонт',
      status: 'in_progress',
      priority: 'medium',
      budget: {
        min: 300000,
        max: 500000,
        currency: 'KZT'
      },
      location: {
        city: 'Астана'
      },
      client: {
        id: '2',
        name: 'Дмитрий Козлов',
        rating: 4.5
      },
      timeline: {
        createdAt: '2024-01-10T09:00:00Z'
      },
      tags: ['ремонт', 'спальня'],
      isUrgent: true,
      isBookmarked: true,
      isLiked: true,
      likesCount: 8,
      viewsCount: 89,
      bidsCount: 5
    },
    {
      id: '3',
      title: 'Изготовление шкафа-купе',
      description: 'Шкаф-купе для прихожей 2.5м',
      category: 'Шкафы',
      status: 'completed',
      priority: 'low',
      budget: {
        min: 150000,
        max: 250000,
        currency: 'KZT'
      },
      location: {
        city: 'Шымкент'
      },
      client: {
        id: '3',
        name: 'Елена Морозова',
        rating: 4.9
      },
      timeline: {
        createdAt: '2024-01-05T11:00:00Z'
      },
      tags: ['шкаф-купе', 'прихожая'],
      isUrgent: false,
      isBookmarked: false,
      isLiked: false,
      likesCount: 15,
      viewsCount: 234,
      bidsCount: 3
    }
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Compact cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактные карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleRequests.map(request => (
            <GlassRequestCardCompact
              key={request.id}
              request={request}
              onClick={(request) => console.log('Clicked:', request.title)}
              onBid={(requestId) => console.log('Bid on:', requestId)}
              onContact={(request) => console.log('Contact:', request.title)}
              onBookmark={(requestId, isBookmarked) => console.log('Bookmark:', requestId, isBookmarked)}
              onLike={(requestId, isLiked) => console.log('Like:', requestId, isLiked)}
            />
          ))}
        </div>
      </div>

      {/* Detailed card */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Детальная карточка</h3>
        <div className="max-w-2xl">
          <GlassRequestCardDetailed
            request={sampleRequests[0]}
            onClick={(request) => console.log('Clicked:', request.title)}
            onBid={(requestId) => console.log('Bid on:', requestId)}
            onContact={(request) => console.log('Contact:', request.title)}
            onBookmark={(requestId, isBookmarked) => console.log('Bookmark:', requestId, isBookmarked)}
            onLike={(requestId, isLiked) => console.log('Like:', requestId, isLiked)}
            onShare={(request) => console.log('Share:', request.title)}
            onViewDetails={(requestId) => console.log('View details:', requestId)}
          />
        </div>
      </div>

      {/* Minimal cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальные карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleRequests.map(request => (
            <GlassRequestCardMinimal
              key={request.id}
              request={request}
              onClick={(request) => console.log('Clicked:', request.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

