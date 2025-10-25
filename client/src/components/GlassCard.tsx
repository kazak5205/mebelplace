import React from 'react'
import { motion } from 'framer-motion'
import { GlassCardProps } from '../types'
import { clsx } from 'clsx'

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={onClick && variant === 'hover' ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
