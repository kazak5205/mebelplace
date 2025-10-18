'use client'

import { useState } from 'react'
import type { Video } from '../types/video'
import { useVideoInteractions } from '../hooks/useVideoInteractions'
import { formatCount } from '@/lib/utils/format'

interface VideoInteractionsProps {
  video: Video
  onOpenComments: () => void
}

export function VideoInteractions({ video, onOpenComments }: VideoInteractionsProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  
  const {
    isLiked,
    isSaved,
    toggleLike,
    toggleSave,
    share,
    isLiking,
    isSaving,
  } = useVideoInteractions(video.id, video.is_liked, video.is_saved)
  
  const handleShare = (platform: string) => {
    share(platform)
    setShowShareMenu(false)
  }
  
  return (
    <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6">
      {/* Like */}
      <button
        onClick={() => toggleLike()}
        disabled={isLiking}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <span className={`text-2xl transition-transform ${isLiking ? 'scale-110' : ''}`}>
            {isLiked ? '❤️' : '🤍'}
          </span>
        </div>
        <span className="text-xs">{formatCount(video.like_count)}</span>
      </button>
      
      {/* Comment */}
      <button
        onClick={onOpenComments}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <span className="text-2xl">💬</span>
        </div>
        <span className="text-xs">{formatCount(video.comment_count)}</span>
      </button>
      
      {/* Save */}
      <button
        onClick={() => toggleSave()}
        disabled={isSaving}
        className="flex flex-col items-center gap-1 text-white"
      >
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
          <span className={`text-2xl transition-transform ${isSaving ? 'scale-110' : ''}`}>
            {isSaved ? '🔖' : '📑'}
          </span>
        </div>
        <span className="text-xs">{formatCount(video.save_count)}</span>
      </button>
      
      {/* Share */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-2xl">📤</span>
          </div>
          <span className="text-xs">{formatCount(video.share_count)}</span>
        </button>
        
        {/* Share menu */}
        {showShareMenu && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 backdrop-blur-md rounded-lg flex flex-col gap-2 min-w-[120px]">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-white text-sm"
            >
              <span>📱</span> WhatsApp
            </button>
            <button
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-white text-sm"
            >
              <span>✈️</span> Telegram
            </button>
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-white text-sm"
            >
              <span>📷</span> Instagram
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setShowShareMenu(false)
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded text-white text-sm"
            >
              <span>🔗</span> Copy Link
            </button>
          </div>
        )}
      </div>
      
      {/* AR View (if available) */}
      {video.has_ar && video.model_url && (
        <button
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <span className="text-2xl">🔮</span>
          </div>
          <span className="text-xs">AR View</span>
        </button>
      )}
    </div>
  )
}

// Utility function (create in lib/utils/format.ts if doesn't exist)
// const formatCount = (count: number) => {
//   if (count >= 1000000) {
//     return `${(count / 1000000).toFixed(1)}M`
//   }
//   if (count >= 1000) {
//     return `${(count / 1000).toFixed(1)}K`
//   }
//   return count.toString()
// }

