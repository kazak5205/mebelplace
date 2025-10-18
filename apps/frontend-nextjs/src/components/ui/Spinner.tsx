import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className = '', label }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-orange-500 ${sizeClasses[size]} ${className}`} />
      {label && (
        <p className="glass-text-secondary text-sm">{label}</p>
      )}
    </div>
  );
}
