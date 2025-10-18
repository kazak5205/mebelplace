import React from 'react';

interface VideosTabProps {
  userId?: number;
  isOwnProfile?: boolean;
}

export function VideosTab({ userId, isOwnProfile }: VideosTabProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Видео</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
