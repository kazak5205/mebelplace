import React from 'react';

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-bg-secondary rounded-lg p-4 animate-pulse">
          <div className="h-4 glass-bg-primary rounded mb-2" />
          <div className="h-3 glass-bg-primary rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
