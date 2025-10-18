import React from 'react';

interface VerticalVideoFeedProps {
  videos: any[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function VerticalVideoFeed({ videos, loading, onLoadMore, hasMore }: VerticalVideoFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 glass-bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div key={video.id} className="glass-bg-secondary rounded-lg p-4">
          <h3 className="glass-text-primary font-semibold">{video.title}</h3>
          <p className="glass-text-secondary text-sm">{video.description}</p>
        </div>
      ))}
    </div>
  );
}
