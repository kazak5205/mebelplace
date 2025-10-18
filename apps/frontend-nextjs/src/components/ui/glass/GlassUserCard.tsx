'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  User, 
  MapPin, 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Check,
  Clock,
  Award,
  Users,
  Eye,
  ThumbsUp
} from 'lucide-react';

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  title?: string;
  description?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  isFavorite?: boolean;
  lastSeen?: string;
  followersCount?: number;
  followingCount?: number;
  viewsCount?: number;
  likesCount?: number;
  achievements?: string[];
  skills?: string[];
  portfolio?: Array<{
    id: string;
    image: string;
    title: string;
    likes: number;
  }>;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface GlassUserCardProps {
  user: UserProfile;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showActions?: boolean;
  showStats?: boolean;
  showPortfolio?: boolean;
  showContactInfo?: boolean;
  showSkills?: boolean;
  showAchievements?: boolean;
  className?: string;
  onClick?: (user: UserProfile) => void;
  onFavorite?: (userId: string, isFavorite: boolean) => void;
  onContact?: (user: UserProfile, method: 'message' | 'call' | 'email') => void;
  onShare?: (user: UserProfile) => void;
  onViewProfile?: (userId: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-4',
    avatarSize: 'w-12 h-12',
    titleSize: 'text-base',
    subtitleSize: 'text-sm',
    descriptionSize: 'text-sm',
    spacing: 'space-y-2'
  },
  md: {
    padding: 'p-6',
    avatarSize: 'w-16 h-16',
    titleSize: 'text-lg',
    subtitleSize: 'text-base',
    descriptionSize: 'text-sm',
    spacing: 'space-y-3'
  },
  lg: {
    padding: 'p-8',
    avatarSize: 'w-20 h-20',
    titleSize: 'text-xl',
    subtitleSize: 'text-lg',
    descriptionSize: 'text-base',
    spacing: 'space-y-4'
  }
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

const statVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassUserCard: React.FC<GlassUserCardProps> = ({
  user,
  variant = 'default',
  size = 'md',
  showActions = true,
  showStats = true,
  showPortfolio = false,
  showContactInfo = false,
  showSkills = false,
  showAchievements = false,
  className,
  onClick,
  onFavorite,
  onContact,
  onShare,
  onViewProfile
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const config = sizeConfig[size];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientFromName = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
      'from-indigo-400 to-indigo-600',
      'from-red-400 to-red-600'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const renderAvatar = () => (
    <div className="relative">
      <div className={cn(
        'rounded-full bg-gradient-to-br',
        getGradientFromName(user.name),
        'flex items-center justify-center text-white font-semibold',
        config.avatarSize
      )}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className={cn(config.titleSize)}>
            {getInitials(user.name)}
          </span>
        )}
      </div>
      
      {/* Online status */}
      {user.isOnline && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      )}
      
      {/* Verified badge */}
      {user.isVerified && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    if (!showStats) return null;

    const stats = [
      { icon: Star, label: 'Рейтинг', value: user.rating?.toFixed(1) || '0.0', color: 'text-yellow-400' },
      { icon: Users, label: 'Подписчики', value: user.followersCount || 0, color: 'text-blue-400' },
      { icon: Eye, label: 'Просмотры', value: user.viewsCount || 0, color: 'text-green-400' },
      { icon: ThumbsUp, label: 'Лайки', value: user.likesCount || 0, color: 'text-red-400' }
    ].filter(stat => stat.value !== 0 || stat.label === 'Рейтинг');

    return (
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="flex items-center space-x-2 p-2 bg-glass-secondary/30 rounded-lg"
            variants={statVariants}
            whileHover="hover"
          >
            <stat.icon className={cn('w-4 h-4', stat.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60 truncate">{stat.label}</p>
              <p className="text-sm font-medium text-white truncate">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!showSkills || !user.skills?.length) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Навыки</h4>
        <div className="flex flex-wrap gap-2">
          {user.skills.slice(0, showMore ? undefined : 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-glass-accent/20 text-orange-300 rounded-full border border-orange-500/30"
            >
              {skill}
            </span>
          ))}
          {user.skills.length > 3 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-2 py-1 text-xs text-white/60 hover:text-white transition-colors duration-200"
            >
              {showMore ? 'Меньше' : `+${user.skills.length - 3}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderAchievements = () => {
    if (!showAchievements || !user.achievements?.length) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80 flex items-center space-x-1">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>Достижения</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {user.achievements.slice(0, 3).map((achievement, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30"
            >
              {achievement}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderPortfolio = () => {
    if (!showPortfolio || !user.portfolio?.length) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Портфолио</h4>
        <div className="grid grid-cols-3 gap-2">
          {user.portfolio.slice(0, 3).map((item) => (
            <div key={item.id} className="relative group cursor-pointer">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-16 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-white font-medium truncate">{item.title}</p>
                  <p className="text-xs text-white/80">{item.likes} ❤️</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContactInfo = () => {
    if (!showContactInfo || !user.contactInfo) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80">Контакты</h4>
        <div className="space-y-1">
          {user.contactInfo.phone && (
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <Phone className="w-4 h-4" />
              <span>{user.contactInfo.phone}</span>
            </div>
          )}
          {user.contactInfo.email && (
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <Mail className="w-4 h-4" />
              <span>{user.contactInfo.email}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex items-center space-x-2">
        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(user.id, !user.isFavorite);
          }}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            user.isFavorite 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={cn('w-4 h-4', user.isFavorite && 'fill-current')} />
        </button>

        {/* Message */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContact?.(user, 'message');
          }}
          className="p-2 bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Call */}
        {user.contactInfo?.phone && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContact?.(user, 'call');
            }}
            className="p-2 bg-glass-secondary/30 text-white/60 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Phone className="w-4 h-4" />
          </button>
        )}

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(user);
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
            onViewProfile?.(user.id);
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
        return 'max-w-xs';
      case 'detailed':
        return 'max-w-lg';
      case 'minimal':
        return 'max-w-sm';
      default:
        return 'max-w-md';
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
        getVariantStyles(),
        className
      )}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={onClick ? "hover" : undefined}
      onClick={() => onClick?.(user)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={cn(config.padding, config.spacing)}>
        {/* Header */}
        <div className="flex items-start space-x-4">
          {renderAvatar()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className={cn(
                  'font-semibold text-white truncate',
                  config.titleSize
                )}>
                  {user.name}
                </h3>
                
                {user.username && (
                  <p className={cn(
                    'text-white/60 truncate',
                    config.subtitleSize
                  )}>
                    @{user.username}
                  </p>
                )}
                
                {user.title && (
                  <p className={cn(
                    'text-white/80 truncate',
                    config.subtitleSize
                  )}>
                    {user.title}
                  </p>
                )}
              </div>
              
              {user.lastSeen && (
                <div className="flex items-center space-x-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>{user.lastSeen}</span>
                </div>
              )}
            </div>
            
            {/* Location */}
            {user.location && (
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/60">{user.location}</span>
              </div>
            )}
            
            {/* Description */}
            {user.description && variant !== 'minimal' && (
              <p className={cn(
                'text-white/80 mt-2 line-clamp-2',
                config.descriptionSize
              )}>
                {user.description}
              </p>
            )}
          </div>
        </div>

        {/* Rating */}
        {user.rating && user.reviewCount && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.floor(user.rating!) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-white/20'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-white/80">
              {user.rating.toFixed(1)} ({user.reviewCount} отзывов)
            </span>
          </div>
        )}

        {/* Stats */}
        {variant === 'detailed' && renderStats()}

        {/* Skills */}
        {renderSkills()}

        {/* Achievements */}
        {renderAchievements()}

        {/* Portfolio */}
        {renderPortfolio()}

        {/* Contact Info */}
        {renderContactInfo()}

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
export const GlassUserCardCompact: React.FC<Omit<GlassUserCardProps, 'variant'>> = (props) => (
  <GlassUserCard {...props} variant="compact" showStats={false} showPortfolio={false} />
);

export const GlassUserCardDetailed: React.FC<Omit<GlassUserCardProps, 'variant'>> = (props) => (
  <GlassUserCard {...props} variant="detailed" showStats showPortfolio showSkills showAchievements />
);

export const GlassUserCardMinimal: React.FC<Omit<GlassUserCardProps, 'variant'>> = (props) => (
  <GlassUserCard {...props} variant="minimal" showActions={false} showStats={false} />
);

// Example usage component
export const GlassUserCardExample: React.FC = () => {
  const sampleUsers: UserProfile[] = [
    {
      id: '1',
      name: 'Алексей Иванов',
      username: 'alex_master',
      title: 'Мастер по изготовлению кухонь',
      description: 'Опытный мастер с 10-летним стажем. Специализируюсь на изготовлении кухонь на заказ по индивидуальным проектам.',
      location: 'Алматы, Казахстан',
      rating: 4.8,
      reviewCount: 156,
      isOnline: true,
      isVerified: true,
      isFavorite: false,
      lastSeen: '2 мин назад',
      followersCount: 1250,
      followingCount: 340,
      viewsCount: 15420,
      likesCount: 8920,
      skills: ['Дизайн кухонь', 'Изготовление мебели', '3D моделирование', 'Проектирование', 'Установка'],
      achievements: ['Лучший мастер 2023', 'Топ-100 мастеров', 'Сертифицированный дизайнер'],
      portfolio: [
        { id: '1', image: '/api/placeholder/100/100', title: 'Современная кухня', likes: 45 },
        { id: '2', image: '/api/placeholder/100/100', title: 'Классический стиль', likes: 32 },
        { id: '3', image: '/api/placeholder/100/100', title: 'Минимализм', likes: 28 }
      ],
      contactInfo: {
        phone: '+7 (777) 123-45-67',
        email: 'alex@example.com'
      }
    },
    {
      id: '2',
      name: 'Мария Петрова',
      username: 'maria_designer',
      title: 'Дизайнер интерьеров',
      description: 'Создаю уникальные интерьеры для домов и офисов.',
      location: 'Астана, Казахстан',
      rating: 4.9,
      reviewCount: 89,
      isOnline: false,
      isVerified: true,
      isFavorite: true,
      lastSeen: '1 час назад',
      followersCount: 890,
      viewsCount: 8750,
      likesCount: 4560,
      skills: ['Дизайн интерьеров', '3D визуализация', 'Цветовые решения']
    },
    {
      id: '3',
      name: 'Дмитрий Сидоров',
      username: 'dmitry_carpenter',
      title: 'Столяр',
      description: 'Изготовление мебели на заказ',
      location: 'Шымкент, Казахстан',
      rating: 4.7,
      reviewCount: 234,
      isOnline: true,
      isVerified: false,
      followersCount: 567,
      viewsCount: 12300,
      likesCount: 6780
    }
  ];

  return (
    <div className="space-y-6 p-8">
      {/* Compact cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактные карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleUsers.map(user => (
            <GlassUserCardCompact
              key={user.id}
              user={user}
              onClick={(user) => console.log('Clicked:', user.name)}
              onFavorite={(userId, isFavorite) => console.log('Favorite:', userId, isFavorite)}
              onContact={(user, method) => console.log('Contact:', user.name, method)}
            />
          ))}
        </div>
      </div>

      {/* Detailed card */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Детальная карточка</h3>
        <div className="max-w-lg">
          <GlassUserCardDetailed
            user={sampleUsers[0]}
            onClick={(user) => console.log('Clicked:', user.name)}
            onFavorite={(userId, isFavorite) => console.log('Favorite:', userId, isFavorite)}
            onContact={(user, method) => console.log('Contact:', user.name, method)}
            onShare={(user) => console.log('Share:', user.name)}
            onViewProfile={(userId) => console.log('View profile:', userId)}
          />
        </div>
      </div>

      {/* Minimal cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальные карточки</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleUsers.map(user => (
            <GlassUserCardMinimal
              key={user.id}
              user={user}
              onClick={(user) => console.log('Clicked:', user.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

