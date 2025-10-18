'use client'

import { useRef, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
import type { Video } from '../types/video'
import { useVideoInteractions } from '../hooks/useVideoInteractions'
import { trackVideoView } from '../api/videoApi'

interface VideoPlayerProps {
  video: Video
  onDoubleTap?: () => void
}

export function VideoPlayer({ video, onDoubleTap }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showHeart, setShowHeart] = useState(false)
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null)
  const lastTap = useRef(0)
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.7, // 70% visible
  })
  
  const {
    isLiked,
    toggleLike,
    isLiking,
  } = useVideoInteractions(video.id, video.is_liked)
  
  // Autoplay when in view
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    if (inView) {
      // Start playing
      videoElement.play().catch(() => {
        // Autoplay failed (browser policy) - user needs to interact
      })
      setIsPlaying(true)
      setWatchStartTime(Date.now())
    } else {
      // Pause when out of view
      videoElement.pause()
      setIsPlaying(false)
      
      // Track view
      if (watchStartTime) {
        const watchTime = Math.floor((Date.now() - watchStartTime) / 1000)
        const completed = watchTime >= video.duration * 0.9 // 90% watched = completed
        trackVideoView(video.id, watchTime, completed).catch(() => {})
        setWatchStartTime(null)
      }
    }
  }, [inView, video.id, video.duration, watchStartTime])
  
  // Double-tap like
  const handleTap = () => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap!
      if (!isLiked) {
        toggleLike()
      }
      
      // Show heart animation
      setShowHeart(true)
      
      // Haptic feedback (mobile)
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      // Hide heart after animation
      setTimeout(() => setShowHeart(false), 600)
      
      onDoubleTap?.()
    }
    
    lastTap.current = now
  }
  
  // Toggle play/pause
  const togglePlay = () => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    if (isPlaying) {
      videoElement.pause()
      setIsPlaying(false)
    } else {
      videoElement.play()
      setIsPlaying(true)
    }
  }
  
  // Toggle mute
  const toggleMute = () => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    videoElement.muted = !isMuted
    setIsMuted(!isMuted)
  }
  
  return (
    <div
      ref={inViewRef}
      className="relative w-full h-screen snap-start snap-always"
      onClick={handleTap}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        poster={video.thumbnail_url}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      
      {/* Double-tap heart animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-9xl">❤️</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Video info */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={video.author?.avatar_url || '/default-avatar.png'}
            alt={video.author?.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="font-semibold">{video.author?.name}</p>
            {video.author?.is_verified && (
              <span className="text-xs text-blue-400">✓ Verified</span>
            )}
          </div>
        </div>
        
        <p className="font-medium mb-1">{video.title}</p>
        {video.description && (
          <p className="text-sm text-gray-200 line-clamp-2">{video.description}</p>
        )}
        
        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {video.tags.map((tag) => (
              <span key={tag} className="text-sm text-blue-300">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleMute()
          }}
          className="p-2 bg-black/50 rounded-full backdrop-blur-sm text-white"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}

