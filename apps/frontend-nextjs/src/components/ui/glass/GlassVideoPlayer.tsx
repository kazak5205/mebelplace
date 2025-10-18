'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Settings,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

export interface VideoQuality {
  label: string;
  value: string;
  resolution: string;
}

export interface VideoSource {
  src: string;
  type: string;
  quality: VideoQuality;
}

export interface GlassVideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  title?: string;
  description?: string;
  duration?: number;
  currentTime?: number;
  volume?: number;
  isPlaying?: boolean;
  isMuted?: boolean;
  isFullscreen?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'cinema';
  showTitle?: boolean;
  showDescription?: boolean;
  showQualitySelector?: boolean;
  showSpeedSelector?: boolean;
  showShareButton?: boolean;
  showDownloadButton?: boolean;
  showLikeButton?: boolean;
  showCommentButton?: boolean;
  showViewCount?: boolean;
  showDuration?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMute?: (muted: boolean) => void;
  onFullscreen?: (fullscreen: boolean) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  onSpeedChange?: (speed: number) => void;
  onShare?: () => void;
  onDownload?: () => void;
  onLike?: (liked: boolean) => void;
  onComment?: () => void;
  onError?: (error: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    width: 'w-64',
    height: 'h-36',
    controlsPadding: 'p-2',
    titleSize: 'text-sm',
    descriptionSize: 'text-xs'
  },
  md: {
    width: 'w-96',
    height: 'h-56',
    controlsPadding: 'p-3',
    titleSize: 'text-base',
    descriptionSize: 'text-sm'
  },
  lg: {
    width: 'w-full',
    height: 'h-64',
    controlsPadding: 'p-4',
    titleSize: 'text-lg',
    descriptionSize: 'text-base'
  },
  xl: {
    width: 'w-full',
    height: 'h-96',
    controlsPadding: 'p-6',
    titleSize: 'text-xl',
    descriptionSize: 'text-lg'
  }
};

// Animation variants
const controlsVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassVideoPlayer: React.FC<GlassVideoPlayerProps> = ({
  sources,
  poster,
  title,
  description,
  duration = 0,
  currentTime = 0,
  volume = 1,
  isPlaying = false,
  isMuted = false,
  isFullscreen = false,
  showControls = true,
  autoPlay = false,
  loop = false,
  className,
  size = 'lg',
  variant = 'default',
  showTitle = true,
  showDescription = true,
  showQualitySelector = true,
  showSpeedSelector = true,
  showShareButton = true,
  showDownloadButton = true,
  showLikeButton = true,
  showCommentButton = true,
  showViewCount = true,
  showDuration = true,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
  onQualityChange,
  onSpeedChange,
  onShare,
  onDownload,
  onLike,
  onComment,
  onError
}) => {
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [localCurrentTime, setLocalCurrentTime] = useState(currentTime);
  const [localVolume, setLocalVolume] = useState(volume);
  const [localIsMuted, setLocalIsMuted] = useState(isMuted);
  const [localIsFullscreen, setLocalIsFullscreen] = useState(isFullscreen);
  const [showControlsState, setShowControlsState] = useState(showControls);
  const [isHovered, setIsHovered] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(sources[0]?.quality);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [buffering, setBuffering] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  const config = sizeConfig[size];

  // Auto-hide controls
  useEffect(() => {
    if (!isHovered && !showControlsState) {
      const timer = setTimeout(() => {
        setShowControlsState(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, showControlsState]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const newIsPlaying = !localIsPlaying;
    setLocalIsPlaying(newIsPlaying);
    
    if (newIsPlaying) {
      onPlay?.();
    } else {
      onPause?.();
    }
  };

  const handleSeek = (event: React.MouseEvent) => {
    if (!progressRef.current || !duration) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    setLocalCurrentTime(newTime);
    onSeek?.(newTime);
  };

  const handleVolumeChange = (event: React.MouseEvent) => {
    if (!volumeRef.current) return;
    
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, clickX / rect.width));
    
    setLocalVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const handleMute = () => {
    const newMuted = !localIsMuted;
    setLocalIsMuted(newMuted);
    onMute?.(newMuted);
  };

  const handleFullscreen = () => {
    const newFullscreen = !localIsFullscreen;
    setLocalIsFullscreen(newFullscreen);
    onFullscreen?.(newFullscreen);
  };

  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);
    onQualityChange?.(quality);
    setShowQualityMenu(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    onSpeedChange?.(speed);
    setShowSpeedMenu(false);
  };

  const handleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    onLike?.(newLiked);
  };

  const renderControls = () => {
    if (!showControlsState) return null;

    return (
      <motion.div
        className={cn(
          'absolute inset-0 flex flex-col justify-between',
          'bg-gradient-to-t from-black/60 via-transparent to-transparent',
          config.controlsPadding
        )}
        variants={controlsVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {/* Top controls */}
        <div className="flex items-center justify-between">
          {showTitle && title && (
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-white truncate',
                config.titleSize
              )}>
                {title}
              </h3>
              {showDescription && description && (
                <p className={cn(
                  'text-white/80 truncate',
                  config.descriptionSize
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {showViewCount && (
              <div className="flex items-center space-x-1 text-white/80">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{viewCount.toLocaleString()}</span>
              </div>
            )}
            
            {showShareButton && (
              <button
                onClick={onShare}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Share2 className="w-4 h-4 text-white" />
              </button>
            )}
            
            {showDownloadButton && (
              <button
                onClick={onDownload}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="space-y-3">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="w-full h-1 bg-white/20 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-200"
              style={{ width: `${(localCurrentTime / duration) * 100}%` }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {localIsPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>

              <button className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200">
                <SkipBack className="w-4 h-4 text-white" />
              </button>

              <button className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200">
                <SkipForward className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMute}
                  className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {localIsMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </button>

                <div
                  ref={volumeRef}
                  className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
                  onClick={handleVolumeChange}
                >
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-200"
                    style={{ width: `${localIsMuted ? 0 : localVolume * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {showDuration && (
                <div className="flex items-center space-x-1 text-white/80">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {formatTime(localCurrentTime)} / {formatTime(duration)}
                  </span>
                </div>
              )}

              {/* Quality selector */}
              {showQualitySelector && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="px-3 py-1 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200 text-sm text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {selectedQuality.label}
                  </button>

                  <AnimatePresence>
                    {showQualityMenu && (
                      <motion.div
                        className="absolute bottom-full right-0 mb-2 w-32 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      >
                        {sources.map((source) => (
                          <button
                            key={source.quality.value}
                            onClick={() => handleQualityChange(source.quality)}
                            className="w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                          >
                            {source.quality.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Speed selector */}
              {showSpeedSelector && (
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-3 py-1 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200 text-sm text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {playbackSpeed}x
                  </button>

                  <AnimatePresence>
                    {showSpeedMenu && (
                      <motion.div
                        className="absolute bottom-full right-0 mb-2 w-20 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-xl shadow-glass-lg overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      >
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className="w-full px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-glass-secondary/30 transition-colors duration-200"
                          >
                            {speed}x
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button
                onClick={handleFullscreen}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {localIsFullscreen ? (
                  <Minimize className="w-4 h-4 text-white" />
                ) : (
                  <Maximize className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showLikeButton && (
                <button
                  onClick={handleLike}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
                    isLiked 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50 hover:text-white'
                  )}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                  <span className="text-sm">Лайк</span>
                </button>
              )}

              {showCommentButton && (
                <button
                  onClick={onComment}
                  className="flex items-center space-x-2 px-3 py-2 bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50 hover:text-white rounded-lg transition-colors duration-200"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Комментарии</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-glass-primary/50';
      case 'cinema':
        return 'bg-black/90';
      default:
        return 'bg-glass-primary/80';
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-glass-lg',
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        config.width,
        config.height,
        isFullscreen && 'fixed inset-0 w-full h-full z-50 rounded-none',
        getVariantStyles(),
        className
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowControlsState(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={() => setShowControlsState(true)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={localIsMuted}
        playsInline
        onPlay={() => setLocalIsPlaying(true)}
        onPause={() => setLocalIsPlaying(false)}
        onTimeUpdate={(e) => {
          const video = e.target as HTMLVideoElement;
          setLocalCurrentTime(video.currentTime);
        }}
        onVolumeChange={(e) => {
          const video = e.target as HTMLVideoElement;
          setLocalVolume(video.volume);
        }}
        onError={(e) => {
          onError?.('Ошибка воспроизведения видео');
        }}
      >
        {sources.map((source, index) => (
          <source
            key={index}
            src={source.src}
            type={source.type}
          />
        ))}
        Ваш браузер не поддерживает видео.
      </video>

      {/* Controls */}
      <AnimatePresence>
        {renderControls()}
      </AnimatePresence>

      {/* Buffering indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Play button overlay */}
      {!localIsPlaying && !isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
    </div>
  );
};

// Convenience components
export const GlassVideoPlayerMinimal: React.FC<Omit<GlassVideoPlayerProps, 'variant'>> = (props) => (
  <GlassVideoPlayer {...props} variant="minimal" showTitle={false} showDescription={false} />
);

export const GlassVideoPlayerCinema: React.FC<Omit<GlassVideoPlayerProps, 'variant'>> = (props) => (
  <GlassVideoPlayer {...props} variant="cinema" size="xl" />
);

// Example usage component
export const GlassVideoPlayerExample: React.FC = () => {
  const sampleSources: VideoSource[] = [
    {
      src: '/api/video/720p',
      type: 'video/mp4',
      quality: { label: '720p', value: '720p', resolution: '1280x720' }
    },
    {
      src: '/api/video/480p',
      type: 'video/mp4',
      quality: { label: '480p', value: '480p', resolution: '854x480' }
    },
    {
      src: '/api/video/360p',
      type: 'video/mp4',
      quality: { label: '360p', value: '360p', resolution: '640x360' }
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default player */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычный плеер</h3>
        <div className="max-w-2xl">
          <GlassVideoPlayer
            sources={sampleSources}
            poster="/api/placeholder/800/450"
            title="Изготовление кухни на заказ"
            description="Процесс создания современной кухни с барной стойкой"
            duration={1800}
            currentTime={300}
            volume={0.8}
            isPlaying={false}
            showControls
            showTitle
            showDescription
            showQualitySelector
            showSpeedSelector
            showShareButton
            showDownloadButton
            showLikeButton
            showCommentButton
            showViewCount
            showDuration
            onPlay={() => console.log('Play')}
            onPause={() => console.log('Pause')}
            onSeek={(time) => console.log('Seek to:', time)}
            onVolumeChange={(volume) => console.log('Volume:', volume)}
            onMute={(muted) => console.log('Muted:', muted)}
            onFullscreen={(fullscreen) => console.log('Fullscreen:', fullscreen)}
            onQualityChange={(quality) => console.log('Quality:', quality)}
            onSpeedChange={(speed) => console.log('Speed:', speed)}
            onShare={() => console.log('Share')}
            onDownload={() => console.log('Download')}
            onLike={(liked) => console.log('Like:', liked)}
            onComment={() => console.log('Comment')}
          />
        </div>
      </div>

      {/* Minimal player */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальный плеер</h3>
        <div className="max-w-md">
          <GlassVideoPlayerMinimal
            sources={sampleSources}
            poster="/api/placeholder/400/225"
            duration={600}
            size="md"
            showControls
          />
        </div>
      </div>

      {/* Different sizes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Разные размеры</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassVideoPlayer
            sources={sampleSources}
            poster="/api/placeholder/200/113"
            size="sm"
            showControls
          />
          <GlassVideoPlayer
            sources={sampleSources}
            poster="/api/placeholder/300/169"
            size="md"
            showControls
          />
          <GlassVideoPlayer
            sources={sampleSources}
            poster="/api/placeholder/400/225"
            size="lg"
            showControls
          />
          <GlassVideoPlayer
            sources={sampleSources}
            poster="/api/placeholder/500/281"
            size="xl"
            showControls
          />
        </div>
      </div>
    </div>
  );
};

