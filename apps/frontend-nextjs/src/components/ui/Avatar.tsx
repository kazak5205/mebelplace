import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function Avatar({ src, alt = '', name, size = 'md', className = '', fallback }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  const fallbackText = fallback || name?.charAt(0).toUpperCase() || alt?.charAt(0).toUpperCase() || '?';

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold overflow-hidden`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallbackText
      )}
    </div>
  );
}
