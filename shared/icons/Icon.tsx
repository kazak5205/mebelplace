/**
 * Unified Icon Component
 * Works with both Lucide icons and custom brand icons
 */

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { IconProps, getIconName, ICON_NAMES, BRAND_ICONS } from './index'

// Import all Lucide icons dynamically
const iconMap = new Map<string, LucideIcon>()

// Lazy load Lucide icons
const getLucideIcon = (iconName: string): LucideIcon | null => {
  if (iconMap.has(iconName)) {
    return iconMap.get(iconName)!
  }
  
  try {
    // Dynamic import of Lucide icons
    const iconModule = require(`lucide-react/dist/esm/icons/${iconName}`)
    const IconComponent = iconModule[iconName] as LucideIcon
    if (IconComponent) {
      iconMap.set(iconName, IconComponent)
      return IconComponent
    }
  } catch (error) {
    console.warn(`Icon "${iconName}" not found in Lucide React`)
  }
  
  return null
}

// Brand icon components (placeholder - replace with actual SVG components)
const BrandIcon: React.FC<{ name: string; size?: number | string; className?: string }> = ({ 
  name, 
  size = 24, 
  className = '' 
}) => {
  // Placeholder for brand icons - replace with actual SVG components
  const brandIconMap: Record<string, React.ComponentType<any>> = {
    MebelPlaceLogo: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" opacity="0.3"/>
        <rect x="4" y="5" width="16" height="10" rx="1" fill="currentColor"/>
        <circle cx="8" cy="10" r="2" fill="white"/>
        <circle cx="16" cy="10" r="2" fill="white"/>
      </svg>
    ),
    FurnitureIcon: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <rect x="3" y="12" width="18" height="8" rx="1" fill="currentColor"/>
        <rect x="5" y="8" width="14" height="4" rx="1" fill="currentColor"/>
        <rect x="7" y="4" width="10" height="4" rx="1" fill="currentColor"/>
      </svg>
    ),
    HammerIcon: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <path d="M15 2l-3 3-2-2-1 1 2 2-3 3 1 1 3-3 2 2 1-1-2-2 3-3z" fill="currentColor"/>
        <path d="M8 12l-2 2-1-1 2-2-3-3 1-1 3 3 2-2 1 1-2 2 3 3z" fill="currentColor"/>
      </svg>
    ),
    ToolsIcon: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="currentColor"/>
      </svg>
    ),
  }
  
  const IconComponent = brandIconMap[name]
  return IconComponent ? <IconComponent /> : null
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = '',
  color,
  strokeWidth = 2,
  fill,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = false,
  ...props
}) => {
  const iconName = getIconName(name)
  
  // Check if it's a brand icon
  if (name in BRAND_ICONS) {
    return (
      <BrandIcon
        name={iconName}
        size={size}
        className={className}
        {...props}
      />
    )
  }
  
  // Get Lucide icon
  const LucideIconComponent = getLucideIcon(iconName)
  
  if (!LucideIconComponent) {
    console.warn(`Icon "${name}" (${iconName}) not found`)
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        {...props}
      >
        ?
      </div>
    )
  }
  
  return (
    <LucideIconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  )
}

export default Icon
