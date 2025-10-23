/**
 * Shared Icons System
 * Unified icon interface for web and mobile
 */

// Re-export all Lucide icons for web
export * from 'lucide-react'

// Icon name mapping for consistent usage
export const ICON_NAMES = {
  // Navigation
  HOME: 'Home',
  SEARCH: 'Search',
  MESSAGE_CIRCLE: 'MessageCircle',
  USER: 'User',
  SETTINGS: 'Settings',
  
  // Actions
  PLUS: 'Plus',
  EDIT: 'Edit',
  DELETE: 'Trash2',
  SAVE: 'Save',
  CANCEL: 'X',
  CLOSE: 'X',
  CHECK: 'Check',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  
  // Media
  PLAY: 'Play',
  PAUSE: 'Pause',
  VOLUME_2: 'Volume2',
  VOLUME_X: 'VolumeX',
  CAMERA: 'Camera',
  IMAGE: 'Image',
  VIDEO: 'Video',
  
  // Social
  HEART: 'Heart',
  SHARE: 'Share2',
  THUMBS_UP: 'ThumbsUp',
  BOOKMARK: 'Bookmark',
  
  // Auth
  LOCK: 'Lock',
  EYE: 'Eye',
  EYE_OFF: 'EyeOff',
  MAIL: 'Mail',
  PHONE: 'Phone',
  
  // Status
  LOADING: 'Loader2',
  SUCCESS: 'CheckCircle',
  ERROR: 'XCircle',
  WARNING: 'AlertTriangle',
  INFO: 'Info',
  
  // UI
  MENU: 'Menu',
  MORE_VERTICAL: 'MoreVertical',
  FILTER: 'Filter',
  SORT: 'ArrowUpDown',
  REFRESH: 'RefreshCw',
} as const

export type IconName = keyof typeof ICON_NAMES

// Brand icons (custom SVG icons)
export const BRAND_ICONS = {
  LOGO: 'MebelPlaceLogo',
  FURNITURE: 'FurnitureIcon',
  HAMMER: 'HammerIcon',
  TOOLS: 'ToolsIcon',
} as const

export type BrandIconName = keyof typeof BRAND_ICONS

// Icon component props
export interface IconProps {
  name: IconName | BrandIconName
  size?: number | string
  className?: string
  color?: string
  strokeWidth?: number
  fill?: string
  'aria-label'?: string
  'aria-hidden'?: boolean
}

// Helper to get icon name
export const getIconName = (name: IconName | BrandIconName): string => {
  if (name in ICON_NAMES) {
    return ICON_NAMES[name as IconName]
  }
  return name as string
}
