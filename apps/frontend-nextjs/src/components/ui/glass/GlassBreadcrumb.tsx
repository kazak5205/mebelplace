'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Folder, 
  File, 
  User, 
  Settings, 
  Search, 
  Star, 
  Heart, 
  MessageCircle, 
  Bell, 
  Calendar, 
  MapPin, 
  Tag, 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Copy,
  ExternalLink
} from 'lucide-react';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  isDisabled?: boolean;
  isClickable?: boolean;
  metadata?: {
    count?: number;
    badge?: string;
    tooltip?: string;
    description?: string;
  };
  children?: BreadcrumbItem[];
}

export interface GlassBreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  showIcons?: boolean;
  showSeparators?: boolean;
  showHomeIcon?: boolean;
  showItemCounts?: boolean;
  showItemBadges?: boolean;
  showItemTooltips?: boolean;
  showItemDescriptions?: boolean;
  showCollapseButton?: boolean;
  showExpandButton?: boolean;
  showRefreshButton?: boolean;
  showBackButton?: boolean;
  showForwardButton?: boolean;
  showBreadcrumbActions?: boolean;
  allowItemClick?: boolean;
  allowItemHover?: boolean;
  allowItemContextMenu?: boolean;
  allowItemDrag?: boolean;
  allowItemDrop?: boolean;
  maxVisibleItems?: number;
  collapseThreshold?: number;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  onItemHover?: (item: BreadcrumbItem, index: number) => void;
  onItemContextMenu?: (item: BreadcrumbItem, index: number, event: React.MouseEvent) => void;
  onItemDrag?: (item: BreadcrumbItem, index: number) => void;
  onItemDrop?: (item: BreadcrumbItem, index: number, targetItem: BreadcrumbItem, targetIndex: number) => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
  onBack?: () => void;
  onForward?: () => void;
  onBreadcrumbAction?: (action: string, item: BreadcrumbItem) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    itemPadding: 'px-2 py-1',
    iconSize: 'w-3 h-3',
    fontSize: 'text-xs',
    spacing: 'space-x-1',
    separatorSize: 'w-3 h-3'
  },
  md: {
    itemPadding: 'px-3 py-1.5',
    iconSize: 'w-4 h-4',
    fontSize: 'text-sm',
    spacing: 'space-x-2',
    separatorSize: 'w-4 h-4'
  },
  lg: {
    itemPadding: 'px-4 py-2',
    iconSize: 'w-5 h-5',
    fontSize: 'text-base',
    spacing: 'space-x-3',
    separatorSize: 'w-5 h-5'
  },
  xl: {
    itemPadding: 'px-5 py-2.5',
    iconSize: 'w-6 h-6',
    fontSize: 'text-lg',
    spacing: 'space-x-4',
    separatorSize: 'w-6 h-6'
  }
};

// Animation variants
const breadcrumbVariants = {
  initial: { opacity: 0, y: -10 },
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
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const separatorVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassBreadcrumb: React.FC<GlassBreadcrumbProps> = ({
  items,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  showIcons = true,
  showSeparators = true,
  showHomeIcon = true,
  showItemCounts = true,
  showItemBadges = true,
  showItemTooltips = true,
  showItemDescriptions = false,
  showCollapseButton = false,
  showExpandButton = false,
  showRefreshButton = false,
  showBackButton = false,
  showForwardButton = false,
  showBreadcrumbActions = false,
  allowItemClick = true,
  allowItemHover = true,
  allowItemContextMenu = false,
  allowItemDrag = false,
  allowItemDrop = false,
  maxVisibleItems = 5,
  collapseThreshold = 3,
  className,
  onItemClick,
  onItemHover,
  onItemContextMenu,
  onItemDrag,
  onItemDrop,
  onCollapse,
  onExpand,
  onRefresh,
  onBack,
  onForward,
  onBreadcrumbAction
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const config = sizeConfig[size];
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle item click
  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (!allowItemClick || item.isDisabled || !item.isClickable) return;
    onItemClick?.(item, index);
  };

  // Handle item hover
  const handleItemHover = (item: BreadcrumbItem, index: number) => {
    if (!allowItemHover) return;
    setHoveredItem(index);
    onItemHover?.(item, index);
  };

  // Handle item context menu
  const handleItemContextMenu = (item: BreadcrumbItem, index: number, event: React.MouseEvent) => {
    if (!allowItemContextMenu) return;
    event.preventDefault();
    onItemContextMenu?.(item, index, event);
  };

  // Handle item drag start
  const handleItemDragStart = (item: BreadcrumbItem, index: number) => {
    if (!allowItemDrag) return;
    setDraggedItem(index);
    onItemDrag?.(item, index);
  };

  // Handle item drop
  const handleItemDrop = (targetItem: BreadcrumbItem, targetIndex: number) => {
    if (!allowItemDrop || draggedItem === null) return;
    const draggedItemData = items[draggedItem];
    onItemDrop?.(draggedItemData, draggedItem, targetItem, targetIndex);
    setDraggedItem(null);
  };

  // Handle collapse/expand
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) {
      onExpand?.();
    } else {
      onCollapse?.();
    }
  };

  // Render item icon
  const renderItemIcon = (item: BreadcrumbItem) => {
    if (!showIcons) return null;

    const Icon = item.icon || (item.id === 'home' ? Home : Folder);

    return (
      <Icon className={cn(
        'flex-shrink-0',
        config.iconSize,
        item.isActive ? 'text-orange-400' : 'text-white/60'
      )} />
    );
  };

  // Render item content
  const renderItemContent = (item: BreadcrumbItem) => {
    return (
      <div className="flex items-center space-x-2">
        {renderItemIcon(item)}
        <span className={cn(
          'truncate',
          config.fontSize,
          item.isActive ? 'text-orange-400 font-medium' : 'text-white/80',
          item.isDisabled && 'text-white/40'
        )}>
          {item.label}
        </span>
        
        {/* Item count */}
        {showItemCounts && item.metadata?.count && (
          <span className="px-1.5 py-0.5 text-xs bg-glass-secondary/30 text-white/60 rounded-full">
            {item.metadata.count}
          </span>
        )}

        {/* Item badge */}
        {showItemBadges && item.metadata?.badge && (
          <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded-full">
            {item.metadata.badge}
          </span>
        )}
      </div>
    );
  };

  // Render item tooltip
  const renderItemTooltip = (item: BreadcrumbItem) => {
    if (!showItemTooltips || !item.metadata?.tooltip) return null;

    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {item.metadata.tooltip}
      </div>
    );
  };

  // Render item description
  const renderItemDescription = (item: BreadcrumbItem) => {
    if (!showItemDescriptions || !item.metadata?.description) return null;

    return (
      <div className="text-xs text-white/60 mt-1 line-clamp-2">
        {item.metadata.description}
      </div>
    );
  };

  // Render breadcrumb item
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isHovered = hoveredItem === index;
    const isDragged = draggedItem === index;

    return (
      <motion.div
        key={item.id}
        className={cn(
          'relative group flex items-center',
          config.itemPadding,
          'rounded-lg transition-all duration-200',
          item.isActive && 'bg-orange-500/20',
          item.isDisabled && 'opacity-50 cursor-not-allowed',
          allowItemClick && item.isClickable && !item.isDisabled && 'cursor-pointer hover:bg-glass-secondary/30',
          isHovered && 'bg-glass-secondary/20',
          isDragged && 'opacity-50 scale-95'
        )}
        variants={itemVariants}
        initial="initial"
        animate="animate"
        whileHover={allowItemHover ? "hover" : undefined}
        onClick={() => handleItemClick(item, index)}
        onMouseEnter={() => handleItemHover(item, index)}
        onMouseLeave={() => setHoveredItem(null)}
        onContextMenu={(e) => handleItemContextMenu(item, index, e)}
        draggable={allowItemDrag}
        onDragStart={() => handleItemDragStart(item, index)}
        onDragEnd={() => setDraggedItem(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleItemDrop(item, index)}
      >
        {renderItemContent(item)}
        {renderItemTooltip(item)}
        {renderItemDescription(item)}
      </motion.div>
    );
  };

  // Render separator
  const renderSeparator = (index: number) => {
    if (!showSeparators || index === items.length - 1) return null;

    return (
      <motion.div
        className={cn(
          'flex items-center justify-center text-white/40',
          config.separatorSize
        )}
        variants={separatorVariants}
        initial="initial"
        animate="animate"
      >
        <ChevronRight className={cn(
          'w-full h-full',
          orientation === 'vertical' && 'rotate-90'
        )} />
      </motion.div>
    );
  };

  // Render overflow menu
  const renderOverflowMenu = () => {
    if (items.length <= maxVisibleItems) return null;

    const hiddenItems = items.slice(0, -maxVisibleItems + 1);

    return (
      <div className="relative">
        <button
          onClick={() => setShowOverflowMenu(!showOverflowMenu)}
          className={cn(
            'flex items-center justify-center',
            config.itemPadding,
            'rounded-lg transition-colors duration-200',
            'text-white/60 hover:text-white hover:bg-glass-secondary/30'
          )}
        >
          <MoreHorizontal className={config.iconSize} />
        </button>

        <AnimatePresence>
          {showOverflowMenu && (
            <motion.div
              className="absolute top-full left-0 mt-2 w-48 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg overflow-hidden z-10"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
            >
              {hiddenItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleItemClick(item, index);
                    setShowOverflowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                >
                  {renderItemIcon(item)}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render breadcrumb actions
  const renderBreadcrumbActions = () => {
    if (!showBreadcrumbActions) return null;

    return (
      <div className="flex items-center space-x-1">
        {showBackButton && (
          <button
            onClick={onBack}
            className={cn(
              'flex items-center justify-center',
              config.itemPadding,
              'rounded-lg transition-colors duration-200',
              'text-white/60 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            <ArrowLeft className={config.iconSize} />
          </button>
        )}

        {showForwardButton && (
          <button
            onClick={onForward}
            className={cn(
              'flex items-center justify-center',
              config.itemPadding,
              'rounded-lg transition-colors duration-200',
              'text-white/60 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            <ArrowRight className={config.iconSize} />
          </button>
        )}

        {showRefreshButton && (
          <button
            onClick={onRefresh}
            className={cn(
              'flex items-center justify-center',
              config.itemPadding,
              'rounded-lg transition-colors duration-200',
              'text-white/60 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            <RefreshCw className={config.iconSize} />
          </button>
        )}

        {showCollapseButton && (
          <button
            onClick={handleCollapse}
            className={cn(
              'flex items-center justify-center',
              config.itemPadding,
              'rounded-lg transition-colors duration-200',
              'text-white/60 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className={config.iconSize} />
            ) : (
              <ChevronLeft className={config.iconSize} />
            )}
          </button>
        )}

        {showExpandButton && (
          <button
            onClick={handleCollapse}
            className={cn(
              'flex items-center justify-center',
              config.itemPadding,
              'rounded-lg transition-colors duration-200',
              'text-white/60 hover:text-white hover:bg-glass-secondary/30'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className={config.iconSize} />
            ) : (
              <ChevronLeft className={config.iconSize} />
            )}
          </button>
        )}
      </div>
    );
  };

  // Render breadcrumb items
  const renderBreadcrumbItems = () => {
    const visibleItems = isCollapsed 
      ? items.slice(-1) 
      : items.slice(-maxVisibleItems);

    return (
      <div className={cn(
        'flex items-center',
        config.spacing,
        orientation === 'vertical' && 'flex-col space-y-2 space-x-0'
      )}>
        {/* Overflow menu */}
        {!isCollapsed && items.length > maxVisibleItems && renderOverflowMenu()}

        {/* Breadcrumb items */}
        {visibleItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderBreadcrumbItem(item, index)}
            {renderSeparator(index)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        className
      )}
      variants={breadcrumbVariants}
      initial="initial"
      animate="animate"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {renderBreadcrumbItems()}
          {renderBreadcrumbActions()}
        </div>
      </div>
    </motion.div>
  );
};

// Convenience components
export const GlassBreadcrumbCompact: React.FC<Omit<GlassBreadcrumbProps, 'variant' | 'size'>> = (props) => (
  <GlassBreadcrumb {...props} variant="compact" size="sm" />
);

export const GlassBreadcrumbDetailed: React.FC<Omit<GlassBreadcrumbProps, 'variant' | 'size'>> = (props) => (
  <GlassBreadcrumb {...props} variant="detailed" size="lg" />
);

export const GlassBreadcrumbMinimal: React.FC<Omit<GlassBreadcrumbProps, 'variant'>> = (props) => (
  <GlassBreadcrumb {...props} variant="minimal" showIcons={false} showSeparators={false} showBreadcrumbActions={false} />
);

// Example usage component
export const GlassBreadcrumbExample: React.FC = () => {
  const sampleItems: BreadcrumbItem[] = [
    {
      id: 'home',
      label: 'Главная',
      href: '/',
      icon: Home,
      isClickable: true,
      metadata: {
        tooltip: 'Вернуться на главную страницу'
      }
    },
    {
      id: 'projects',
      label: 'Проекты',
      href: '/projects',
      icon: Folder,
      isClickable: true,
      metadata: {
        count: 12,
        tooltip: 'Просмотреть все проекты'
      }
    },
    {
      id: 'kitchen-project',
      label: 'Кухня в современном стиле',
      href: '/projects/kitchen-project',
      icon: File,
      isClickable: true,
      metadata: {
        badge: 'Активный',
        tooltip: 'Открыть проект кухни'
      }
    },
    {
      id: 'design',
      label: 'Дизайн',
      href: '/projects/kitchen-project/design',
      icon: Settings,
      isClickable: true,
      metadata: {
        count: 3,
        tooltip: 'Редактировать дизайн'
      }
    },
    {
      id: 'materials',
      label: 'Материалы',
      href: '/projects/kitchen-project/design/materials',
      icon: Tag,
      isActive: true,
      isClickable: false,
      metadata: {
        description: 'Выбор материалов для кухни'
      }
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default breadcrumb */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычные хлебные крошки</h3>
        <GlassBreadcrumb
          items={sampleItems}
          showIcons
          showSeparators
          showHomeIcon
          showItemCounts
          showItemBadges
          showItemTooltips
          showItemDescriptions
          showBreadcrumbActions
          showBackButton
          showForwardButton
          showRefreshButton
          allowItemClick
          allowItemHover
          allowItemContextMenu
          maxVisibleItems={4}
          onItemClick={(item, index) => console.log('Item clicked:', item.label, index)}
            onItemHover={(item, index) => console.log('Item hovered:', item.label, index)}
            onItemContextMenu={(item, index, event) => console.log('Item context menu:', item.label, index)}
            onBack={() => console.log('Back clicked')}
            onForward={() => console.log('Forward clicked')}
            onRefresh={() => console.log('Refresh clicked')}
            onBreadcrumbAction={(action, item) => console.log('Breadcrumb action:', action, item.label)}
        />
      </div>

      {/* Compact breadcrumb */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактные хлебные крошки</h3>
        <GlassBreadcrumbCompact
          items={sampleItems}
          showIcons
          showSeparators
          showItemCounts
          showItemBadges
          maxVisibleItems={3}
          onItemClick={(item, index) => console.log('Compact item clicked:', item.label, index)}
        />
      </div>

      {/* Minimal breadcrumb */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальные хлебные крошки</h3>
        <GlassBreadcrumbMinimal
          items={sampleItems}
          onItemClick={(item, index) => console.log('Minimal item clicked:', item.label, index)}
        />
      </div>

      {/* Vertical breadcrumb */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Вертикальные хлебные крошки</h3>
        <div className="max-w-xs">
          <GlassBreadcrumb
            items={sampleItems}
            orientation="vertical"
            showIcons
            showSeparators
            showItemCounts
            showItemBadges
            showItemTooltips
            onItemClick={(item, index) => console.log('Vertical item clicked:', item.label, index)}
          />
        </div>
      </div>
    </div>
  );
};

