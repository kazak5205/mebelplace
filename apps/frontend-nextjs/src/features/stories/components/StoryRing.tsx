'use client'

import type { Channel } from '../types/story'

interface StoryRingProps {
  channel: Channel
  onClick: () => void
}

export function StoryRing({ channel, onClick }: StoryRingProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1"
    >
      <div className={`relative ${channel.has_unviewed ? 'story-ring-unviewed' : 'story-ring-viewed'}`}>
        <img
          src={channel.author.avatar_url || '/default-avatar.png'}
          alt={channel.author.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white"
        />
        
        {/* Unviewed count badge */}
        {channel.has_unviewed && channel.unviewed_count > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {channel.unviewed_count}
          </div>
        )}
      </div>
      
      <span className="text-xs text-center max-w-[64px] truncate">
        {channel.author.name}
      </span>
    </button>
  )
}

