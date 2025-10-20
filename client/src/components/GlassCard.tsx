import React from 'react'
import { motion } from 'framer-motion'
import type { GlassCardProps } from '@shared/types'
import { clsx } from 'clsx'
import { animations } from '../utils/animations'

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  onClick, 
  variant = 'default' 
}) => {
  const baseClasses = 'glass-card'
  const variantClasses = {
    default: '',
    hover: 'glass-card-hover',
    active: 'glass-card-active'
  }

  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    className
  )

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      {...animations.card}
      {...(onClick ? animations.button : {})}
      transition={{ 
        ...animations.card.transition,
        ...(variant === 'hover' && onClick ? animations.hover : {})
      }}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
