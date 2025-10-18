'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useVideoInView } from '@/hooks/useIntersectionObserver'

interface OptimizedVideoProps {
  src: string
  poster?: string
  className?: string
  muted?: boolean
  loop?: boolean
  playsInline?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onLoadStart?: () => void
  onCanPlay?: () => void
  onError?: (error: string) => void
  preload?: 'none' | 'metadata' | 'auto'
  autoPlay?: boolean
  controls?: boolean
}

function OptimizedVideo({
  src,
  poster,
  className = '',
  muted = true,
  loop = true,
  playsInline = true,
  onPlay,
  onPause,
  onEnded,
  onLoadStart,
  onCanPlay,
  onError,
  preload = 'metadata',
  autoPlay = true,
  controls = false
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Auto play/pause based on visibility
  const { ref: inViewRef, inView } = useVideoInView({
    threshold: 0.5,
    onEnterView: useCallback(() => {
      if (autoPlay && videoRef.current && !hasError) {
        videoRef.current.play().catch((error) => {
          console.warn('Auto-play failed:', error)
          onError?.('Auto-play failed')
        })
      }
    }, [autoPlay, hasError, onError]),
    onExitView: useCallback(() => {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause()
      }
    }, [isPlaying])
  })

  // Combine refs
  const setRefs = useCallback((node: HTMLVideoElement | null) => {
    if (videoRef.current !== node) {
      videoRef.current = node
    }
    if (typeof inViewRef === 'function') {
      inViewRef(node)
    }
  }, [inViewRef])

  // Handle play state
  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    onPlay?.()
  }, [onPlay])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    onPause?.()
  }, [onPause])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    onEnded?.()
  }, [onEnded])

  const handleLoadStart = useCallback(() => {
    setIsLoading(true)
    onLoadStart?.()
  }, [onLoadStart])

  const handleCanPlay = useCallback(() => {
    setIsLoading(false)
    onCanPlay?.()
  }, [onCanPlay])

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = (e.target as HTMLVideoElement).error
    const errorMessage = error ? `Video error: ${error.message}` : 'Video loading failed'
    setHasError(true)
    setIsLoading(false)
    onError?.(errorMessage)
  }, [onError])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  // Manual play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current || hasError) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch((error) => {
        console.warn('Manual play failed:', error)
        onError?.('Play failed')
      })
    }
  }, [isPlaying, hasError, onError])

  // Seek to position (0-1)
  const seekTo = useCallback((position: number) => {
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = duration * Math.max(0, Math.min(1, position))
    }
  }, [duration])

  // Retry loading on error
  const handleRetry = useCallback(() => {
    if (videoRef.current) {
      setHasError(false)
      setIsLoading(true)
      videoRef.current.load()
    }
  }, [])

  // Preload next video (for feed optimization)
  useEffect(() => {
    if (inView && preload === 'auto' && videoRef.current) {
      videoRef.current.load()
    }
  }, [inView, preload])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        ref={setRefs}
        src={src}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        controls={controls}
        className="w-full h-full object-cover"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/90 text-white">
          <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 10l6 6 6-6" />
          </svg>
          <p className="text-sm text-gray-400 mb-4 text-center px-4">
            Ошибка загрузки видео
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-[#FF6600] hover:bg-[#E55A00] text-white text-sm rounded transition-colors"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Play/Pause overlay (only when not using native controls) */}
      {!controls && !isLoading && !hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity hover:bg-black/70">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Progress bar (when not using native controls) */}
      {!controls && !isLoading && !hasError && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-[#FF6600] transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default OptimizedVideo
export { OptimizedVideo }

// Specialized component for video feed
export function FeedVideo({
  src,
  poster,
  className = '',
  onViewStart,
  onViewEnd,
  ...props
}: OptimizedVideoProps & {
  onViewStart?: () => void
  onViewEnd?: () => void
}) {
  const { ref: inViewRef, inView } = useVideoInView({
    threshold: 0.5,
    onEnterView: onViewStart,
    onExitView: onViewEnd
  })

  return (
    <div ref={inViewRef} className={className}>
      <OptimizedVideo
        src={src}
        poster={poster}
        className="w-full h-full"
        autoPlay={inView}
        {...props}
      />
    </div>
  )
}

// Component for video thumbnails with play button
export function VideoThumbnail({
  src,
  poster,
  className = '',
  onClick,
  duration
}: {
  src: string
  poster?: string
  className?: string
  onClick?: () => void
  duration?: number
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`relative cursor-pointer hover:scale-105 transition-transform ${className}`}
      onClick={onClick}
    >
      <OptimizedVideo
        src={src}
        poster={poster}
        className="w-full h-full rounded-lg"
        autoPlay={false}
        controls={false}
        preload="metadata"
      />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      {/* Duration badge */}
      {duration && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
          {formatDuration(duration)}
        </div>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
    </div>
  )
}

