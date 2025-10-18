import React from 'react';

interface StoriesBarProps {
  channels?: any[];
  onCreateStory?: () => void;
}

export function StoriesBar({ channels = [], onCreateStory }: StoriesBarProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-4 mb-6">
      <h3 className="glass-text-primary font-semibold mb-2">Истории</h3>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-16 h-16 glass-bg-primary rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}
