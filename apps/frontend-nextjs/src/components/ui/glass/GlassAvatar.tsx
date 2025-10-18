'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User, Camera, Edit3, Check, X } from 'lucide-react';

export interface GlassAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  editable?: boolean;
  onEdit?: () => void;
  onImageChange?: (file: File) => void;
  className?: string;
  showBorder?: boolean;
  showStatus?: boolean;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  onClick?: () => void;
  loading?: boolean;
  placeholder?: string;
}

// Size configurations
const sizeConfig = {
  xs: { size: 24, text: 'text-xs', icon: 12, status: 6, badge: 12 },
  sm: { size: 32, text: 'text-sm', icon: 16, status: 8, badge: 14 },
  md: { size: 40, text: 'text-base', icon: 20, status: 10, badge: 16 },
  lg: { size: 48, text: 'text-lg', icon: 24, status: 12, badge: 18 },
  xl: { size: 64, text: 'text-xl', icon: 32, status: 16, badge: 20 },
  '2xl': { size: 80, text: 'text-2xl', icon: 40, status: 20, badge: 24 }
};

// Status color configurations
const statusConfig = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500'
};

// Badge color configurations
const badgeConfig = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-500',
  accent: 'bg-orange-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
};

// Variant configurations
const variantConfig = {
  default: 'rounded-full',
  square: 'rounded-lg',
  rounded: 'rounded-xl'
};

// Animation variants
const avatarVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const editOverlayVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassAvatar: React.FC<GlassAvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'default',
  status,
  editable = false,
  onEdit,
  onImageChange,
  className,
  showBorder = true,
  showStatus = true,
  fallbackIcon = User,
  badge,
  badgeColor = 'accent',
  onClick,
  loading = false,
  placeholder
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const config = sizeConfig[size];
  const statusColor = status ? statusConfig[status] : '';
  const badgeColorClass = badgeConfig[badgeColor];
  const variantClass = variantConfig[variant];

  const handleImageError = () => {
    setImageError(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
    setIsEditing(false);
  };

  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '?';
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

  return (
    <div className={cn('relative inline-block', className)}>
      <motion.div
        className={cn(
          'relative overflow-hidden',
          'bg-glass-primary/30 backdrop-blur-sm',
          showBorder && 'border border-glass-border/50',
          'shadow-glass-sm',
          variantClass,
          onClick && 'cursor-pointer'
        )}
        style={{ width: config.size, height: config.size }}
        variants={avatarVariants}
        whileHover={onClick || editable ? 'hover' : undefined}
        whileTap={onClick || editable ? 'tap' : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-glass-primary/50 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Image or fallback */}
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center',
              'bg-gradient-to-br',
              name ? getGradientFromName(name) : 'from-gray-400 to-gray-600',
              'text-white font-semibold',
              config.text
            )}
          >
            {placeholder ? (
              <span className="text-center px-1">{placeholder}</span>
            ) : (
              <User className="w-1/2 h-1/2" />
            )}
          </div>
        )}

        {/* Edit overlay */}
        {editable && isHovered && !loading && (
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            variants={editOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                onEdit?.();
              }}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
            >
              <Edit3 className="w-3 h-3 text-white" />
            </button>
          </motion.div>
        )}

        {/* Status indicator */}
        {status && showStatus && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              statusColor
            )}
            style={{ width: config.status, height: config.status }}
          />
        )}

        {/* Badge */}
        {badge && (
          <div
            className={cn(
              'absolute -top-1 -right-1 rounded-full text-white text-xs font-bold',
              'flex items-center justify-center',
              'border-2 border-white',
              badgeColorClass
            )}
            style={{ 
              width: config.badge, 
              height: config.badge,
              fontSize: config.badge * 0.6
            }}
          >
            {badge}
          </div>
        )}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.div>

      {/* File input for editing */}
      {editable && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`avatar-upload-${name || 'default'}`}
        />
      )}

      {/* Edit modal */}
      {isEditing && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
        >
          <div className="bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg p-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  document.getElementById(`avatar-upload-${name || 'default'}`)?.click();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-glass-accent/20 hover:bg-glass-accent/30 rounded-lg transition-colors duration-200"
              >
                <Camera className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Изменить</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Convenience components
export const GlassUserAvatar: React.FC<{
  user: { name: string; avatar?: string; status?: 'online' | 'offline' | 'away' | 'busy' };
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ user, size = 'md', onClick }) => (
  <GlassAvatar
    src={user.avatar}
    name={user.name}
    status={user.status}
    size={size}
    onClick={onClick}
    showStatus
  />
);

export const GlassGroupAvatar: React.FC<{
  users: Array<{ name: string; avatar?: string }>;
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
}> = ({ users, size = 'md', maxVisible = 3 }) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <GlassAvatar
          key={index}
          src={user.avatar}
          name={user.name}
          size={size}
          className="border-2 border-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'bg-glass-primary/50 backdrop-blur-sm',
            'border-2 border-white rounded-full',
            'text-white font-semibold',
            size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export const GlassAvatarSkeleton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'square' | 'rounded';
}> = ({ size = 'md', variant = 'default' }) => {
  const config = sizeConfig[size];
  const variantClass = variantConfig[variant];

  return (
    <div
      className={cn(
        'bg-glass-secondary/30 animate-pulse',
        variantClass
      )}
      style={{ width: config.size, height: config.size }}
    />
  );
};

// Example usage component
export const GlassAvatarExample: React.FC = () => {
  const users = [
    { name: 'Алексей Иванов', avatar: undefined, status: 'online' as const },
    { name: 'Мария Петрова', avatar: undefined, status: 'away' as const },
    { name: 'Дмитрий Сидоров', avatar: undefined, status: 'offline' as const }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Single avatars */}
      <div className="flex items-center space-x-4">
        <GlassAvatar name="Алексей Иванов" size="xs" status="online" />
        <GlassAvatar name="Мария Петрова" size="sm" status="away" />
        <GlassAvatar name="Дмитрий Сидоров" size="md" status="offline" />
        <GlassAvatar name="Анна Козлова" size="lg" status="busy" />
        <GlassAvatar name="Петр Волков" size="xl" status="online" />
        <GlassAvatar name="Елена Морозова" size="2xl" status="away" />
      </div>

      {/* Variants */}
      <div className="flex items-center space-x-4">
        <GlassAvatar name="Квадрат" variant="square" size="lg" />
        <GlassAvatar name="Скругленный" variant="rounded" size="lg" />
        <GlassAvatar name="Круглый" variant="default" size="lg" />
      </div>

      {/* With badges */}
      <div className="flex items-center space-x-4">
        <GlassAvatar name="С бейджем" size="lg" badge="5" badgeColor="error" />
        <GlassAvatar name="Новое" size="lg" badge="NEW" badgeColor="accent" />
        <GlassAvatar name="VIP" size="lg" badge="VIP" badgeColor="warning" />
      </div>

      {/* Group avatars */}
      <div className="flex items-center space-x-4">
        <GlassGroupAvatar users={users} size="md" />
        <GlassGroupAvatar users={[...users, ...users]} size="lg" maxVisible={4} />
      </div>

      {/* Editable */}
      <div className="flex items-center space-x-4">
        <GlassAvatar name="Редактируемый" size="lg" editable />
        <GlassAvatar name="С кликом" size="lg" onClick={() => console.log('Clicked!')} />
      </div>
    </div>
  );
};
