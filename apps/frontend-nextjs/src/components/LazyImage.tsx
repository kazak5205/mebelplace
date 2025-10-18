'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useInView } from '@/hooks/useIntersectionObserver'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
  priority?: boolean
  quality?: number
  sizes?: string
  blurDataURL?: string
}

function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/placeholder-image.svg',
  fallback = '/placeholder-image.svg',
  onLoad,
  onError,
  priority = false,
  quality = 75,
  sizes,
  blurDataURL
}: LazyImageProps) {
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder)
  const [isLoading, setIsLoading] = useState(!priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    freezeOnceVisible: true
  })

  // Combine refs
  const setRefs = useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node
    if (typeof inViewRef === 'function') {
      inViewRef(node)
    }
  }, [inViewRef])

  // Generate optimized image URL
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('blob:')) {
      return originalSrc
    }

    // Add quality parameter if it's our CDN
    if (originalSrc.includes('mebelplace')) {
      const url = new URL(originalSrc)
      url.searchParams.set('q', quality.toString())
      if (width) url.searchParams.set('w', width.toString())
      if (height) url.searchParams.set('h', height.toString())
      return url.toString()
    }

    return originalSrc
  }, [quality, width, height])

  const loadImage = useCallback(() => {
    if (hasError) return

    setIsLoading(true)
    const optimizedSrc = getOptimizedSrc(src)
    const img = new Image()
    
    img.onload = () => {
      setCurrentSrc(optimizedSrc)
      setIsLoading(false)
      onLoad?.()
    }
    
    img.onerror = () => {
      setCurrentSrc(fallback)
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }
    
    img.src = optimizedSrc
  }, [src, fallback, onLoad, onError, hasError, getOptimizedSrc])

  useEffect(() => {
    if (priority || (inView && !hasError && currentSrc === placeholder)) {
      loadImage()
    }
  }, [priority, inView, hasError, currentSrc, placeholder, loadImage])

  // Retry loading on error
  const handleRetry = () => {
    setHasError(false)
    setCurrentSrc(placeholder)
    loadImage()
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && isLoading && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}

      <img
        ref={setRefs}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
      
      {/* Loading spinner */}
      {isLoading && !blurDataURL && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
          <div className="loading-spinner w-6 h-6"></div>
        </div>
      )}

      {/* Error state with retry */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80 text-white">
          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-400 mb-2">Ошибка загрузки</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-[#FF6600] hover:bg-[#E55A00] text-white text-xs rounded transition-colors"
          >
            Повторить
          </button>
        </div>
      )}
    </div>
  )
}

export default LazyImage
export { LazyImage }

// Optimized for video thumbnails with aspect ratio
export function LazyVideoThumbnail({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  onClick
}: {
  src: string
  alt: string
  className?: string
  aspectRatio?: string
  onClick?: () => void
}) {
  return (
    <div 
      className={`relative cursor-pointer hover:scale-105 transition-transform ${className}`}
      style={{ aspectRatio }}
      onClick={onClick}
    >
      <LazyImage
        src={src}
        alt={alt}
        className="absolute inset-0 rounded-lg"
        placeholder="/placeholder-video.jpg"
        fallback="/placeholder-video.jpg"
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
    </div>
  )
}

// Avatar component with fallback
export function LazyAvatar({
  src,
  alt,
  size = 40,
  className = '',
  fallbackIcon = true
}: {
  src: string
  alt: string
  size?: number
  className?: string
  fallbackIcon?: boolean
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-700 flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {!hasError ? (
        <LazyImage
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="w-full h-full"
          onError={() => setHasError(true)}
          priority={size <= 50} // Small avatars load immediately
        />
      ) : fallbackIcon ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#FF6600] to-[#E55A00] flex items-center justify-center text-white font-semibold">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}