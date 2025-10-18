import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
}

export function Progress({ value, max = 100, className = '', size = 'md', variant = 'default', showValue = false }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-gradient-to-r from-orange-400 to-orange-600',
    success: 'bg-gradient-to-r from-green-400 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    danger: 'bg-gradient-to-r from-red-400 to-red-600'
  };

  return (
    <div className={`w-full glass-bg-primary rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <div
        className={`h-full transition-all duration-300 ease-in-out ${variantClasses[variant]}`}
        style={{ width: `${percentage}%` }}
      />
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {value}/{max}
        </div>
      )}
    </div>
  );
}
