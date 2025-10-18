'use client'

import { useState, useEffect, useRef } from 'react'
import { useChannelStories, useViewStory } from '../hooks/useStories'
import type { Channel, Story } from '../types/story'

interface StoryViewerProps {
  channelId: string
  channels: Channel[]
  onClose: () => void
}

export function StoryViewer({ channelId, channels, onClose }: StoryViewerProps) {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(
    channels.findIndex((c) => c.author_id === channelId)
  )
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  
  const currentChannel = channels[currentChannelIndex]
  const { data: stories = [] } = useChannelStories(currentChannel?.author_id)
  const viewMutation = useViewStory()
  
  const currentStory = stories[currentStoryIndex]
  
  // Mark as viewed
  useEffect(() => {
    if (currentStory && !isPaused) {
      viewMutation.mutate(currentStory.id)
    }
  }, [currentStory?.id, isPaused])
  
  // Auto-advance timer
  useEffect(() => {
    if (!currentStory || isPaused) return
    
    const duration = currentStory.media_type === 'video' 
      ? currentStory.duration * 1000 
      : 5000 // 5 seconds for images
    
    timerRef.current = setTimeout(() => {
      goToNext()
    }, duration)
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentStory, isPaused, currentStoryIndex])
  
  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    } else if (currentChannelIndex > 0) {
      // Previous channel
      setCurrentChannelIndex(currentChannelIndex - 1)
      setCurrentStoryIndex(0)
    }
  }
  
  const goToNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else if (currentChannelIndex < channels.length - 1) {
      // Next channel
      setCurrentChannelIndex(currentChannelIndex + 1)
      setCurrentStoryIndex(0)
    } else {
      // End of all stories
      onClose()
    }
  }
  
  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    if (x < width / 3) {
      goToPrevious()
    } else if (x > (width * 2) / 3) {
      goToNext()
    } else {
      setIsPaused(!isPaused)
    }
  }
  
  if (!currentStory) {
    return null
  }
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all ${
                index === currentStoryIndex ? 'animate-progress' : ''
              }`}
              style={{
                width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? '0%' : '0%'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-2">
          <img
            src={currentChannel.author.avatar_url || '/default-avatar.png'}
            alt={currentChannel.author.name}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <span className="font-semibold">{currentChannel.author.name}</span>
          <span className="text-sm text-white/70">
            {new Date(currentStory.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <button onClick={onClose} className="text-2xl">✕</button>
      </div>
      
      {/* Story content */}
      <div className="relative w-full max-w-lg h-full" onClick={handleTap}>
        {currentStory.media_type === 'image' ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            src={currentStory.media_url}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
          />
        )}
        
        {/* Text overlay */}
        {currentStory.text && (
          <div
            className="absolute inset-x-0 bottom-20 text-center px-4"
            style={{
              color: currentStory.text_color || '#FFFFFF',
              backgroundColor: currentStory.text_bg_color 
                ? `${currentStory.text_bg_color}80` 
                : 'transparent'
            }}
          >
            <p className="text-xl font-bold">{currentStory.text}</p>
          </div>
        )}
        
        {/* Link (swipe up) */}
        {currentStory.link_url && (
          <a
            href={currentStory.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-10 inset-x-0 text-center text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <span>{currentStory.link_text || 'Swipe up'}</span>
              <span>↑</span>
            </div>
          </a>
        )}
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-white text-6xl">⏸</div>
          </div>
        )}
      </div>
    </div>
  )
}

