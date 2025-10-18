'use client'

import { useState } from 'react'
import { useStoryChannels } from '../hooks/useStories'
import { StoryRing } from './StoryRing'
import { StoryViewer } from './StoryViewer'

export function StoriesBar() {
  const { data: channels = [], isLoading } = useStoryChannels()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  
  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }
  
  if (channels.length === 0) {
    return null
  }
  
  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
        {channels.map((channel) => (
          <StoryRing
            key={channel.author_id}
            channel={channel}
            onClick={() => setSelectedChannelId(channel.author_id)}
          />
        ))}
      </div>
      
      {/* Story Viewer Modal */}
      {selectedChannelId && (
        <StoryViewer
          channelId={selectedChannelId}
          channels={channels}
          onClose={() => setSelectedChannelId(null)}
        />
      )}
    </>
  )
}

