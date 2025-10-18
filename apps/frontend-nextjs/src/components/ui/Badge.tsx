import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'md', className = '', children }: BadgeProps) {
  const variantClasses = {
    default: 'glass-bg-secondary glass-text-primary',
    success: 'glass-bg-success glass-text-white',
    warning: 'glass-bg-warning glass-text-white',
    danger: 'glass-bg-danger glass-text-white',
    info: 'glass-bg-info glass-text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}