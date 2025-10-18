import React from 'react';

interface AidaVideoCardProps {
  video: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onOrder?: () => void;
}

export default function AidaVideoCard({ video, onLike, onComment, onShare, onSave, onOrder }: AidaVideoCardProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-4">
      <h3 className="glass-text-primary font-semibold">{video.title}</h3>
      <p className="glass-text-secondary text-sm">{video.description}</p>
    </div>
  );
}
