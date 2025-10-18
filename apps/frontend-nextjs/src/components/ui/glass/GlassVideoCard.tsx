/**
 * GlassVideoCard - Видео карточка с double-tap лайк, particle burst, hover preview
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, Volume2, VolumeX, MoreHorizontal } from 'lucide-react';
import { GlassCard, GlassCardContent } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassIconButton } from './GlassIconButton';
import { cn } from '@/lib/utils';

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  tags?: string[];
}

export interface GlassVideoCardProps {
  video: Video;
  onDoubleTap?: (video: Video) => void;
  onHover?: (video: Video) => void;
  onLike?: (video: Video) => void;
  onPlay?: (video: Video) => void;
  onPause?: (video: Video) => void;
  onShare?: (video: Video) => void;
  onMore?: (video: Video) => void;
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  transparency?: 'heavy' | 'light' | 'interactive';
  animation?: 'hover' | 'focus' | 'active' | 'loading';
  particleSystem?: 'hearts' | 'stars' | 'confetti' | 'sparkles';
  className?: string;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  enableDoubleTap?: boolean;
  enableHoverPreview?: boolean;
  aspectRatio?: 'square' | 'video' | 'wide';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export const GlassVideoCard: React.FC<GlassVideoCardProps> = ({
  video,
  onDoubleTap,
  onHover,
  onLike,
  onPlay,
  onPause,
  onShare,
  onMore,
  glassVariant = 'primary',
  transparency = 'heavy',
  animation = 'hover',
  particleSystem = 'hearts',
  className,
  showControls = true,
  autoPlay = false,
  muted = true,
  enableDoubleTap = true,
  enableHoverPreview = true,
  aspectRatio = 'video',
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);

  // Particle system for like animation
  const createParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const particleCount = particleSystem === 'hearts' ? 20 : particleSystem === 'stars' ? 30 : 40;
    const colors = particleSystem === 'hearts' 
      ? ['#FF6B9D', '#FF8E9B', '#FFB3BA']
      : particleSystem === 'stars'
      ? ['#FFD700', '#FFA500', '#FF6347']
      : particleSystem === 'confetti'
      ? ['#FF6600', '#FF8533', '#FFB366', '#FFD9B3', '#FFF2E6']
      : ['#FFD700', '#FFA500', '#FF6347'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 2 + Math.random() * 3;
      const life = 1000 + Math.random() * 1000;
      
      newParticles.push({
        id: `${Date.now()}-${i}`,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        life,
        maxLife: life,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [particleSystem]);

  // Update particles
  React.useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 16,
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter(particle => particle.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  // Handle double tap for like
  const handleDoubleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!enableDoubleTap) return;

    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (timeDiff < 300) {
      e.preventDefault();
      
      // Get tap position
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e as React.MouseEvent).clientX - rect.left;
        const y = (e as React.MouseEvent).clientY - rect.top;
        createParticles(x, y);
      }

      // Trigger like
      handleLike();
      onDoubleTap?.(video);
    }
    
    lastTapRef.current = now;
  }, [enableDoubleTap, onDoubleTap, video, createParticles]);

  // Handle like
  const handleLike = useCallback(() => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);
    onLike?.(video);
  }, [isLiked, onLike, video]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
      onPause?.(video);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
      onPlay?.(video);
    }
  }, [isPlaying, onPlay, onPause, video]);

  // Handle hover
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (enableHoverPreview) {
      setShowPreview(true);
      onHover?.(video);
    }
  }, [enableHoverPreview, onHover, video]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (enableHoverPreview) {
      setShowPreview(false);
    }
  }, [enableHoverPreview]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format views
  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/10 backdrop-blur-md border-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm border-white/10',
    accent: 'bg-orange-500/20 backdrop-blur-md border-orange-500/30',
    dark: 'bg-black/20 backdrop-blur-lg border-white/5',
    light: 'bg-white/20 backdrop-blur-sm border-white/30',
  };

  // Transparency classes
  const transparencyClasses = {
    heavy: 'bg-white/8',
    light: 'bg-white/12',
    interactive: 'bg-white/15',
  };

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        glassClasses[glassVariant],
        transparencyClasses[transparency],
        aspectRatioClasses[aspectRatio],
        className
      )}
      onTouchEnd={handleDoubleTap}
      onDoubleClick={handleDoubleTap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={animation === 'hover' ? { scale: 1.03, y: -4 } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={video.thumbnail}
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={video.videoUrl} type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <motion.h3 
          className="text-white font-semibold text-lg mb-1 line-clamp-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {video.title}
        </motion.h3>
        
        <motion.div 
          className="flex items-center justify-between text-white/80 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span>{video.author.name}</span>
          <span>{formatViews(video.views)} просмотров</span>
        </motion.div>
      </div>

      {/* Duration Badge */}
      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
        <span className="text-white text-sm font-medium">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Like Button */}
      <motion.div 
        className="absolute bottom-4 right-4"
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
      >
        <button
          onClick={handleLike}
          className={cn(
            'w-12 h-12 rounded-full border flex items-center justify-center hover:scale-110 transition-transform',
            isLiked ? 'bg-red-500/20 border-red-500/30' : 'bg-white/10 border-white/20'
          )}
        >
          <Heart 
            className={cn(
              'w-6 h-6',
              isLiked ? 'text-red-500 fill-red-500' : 'text-white'
            )} 
          />
        </button>
        
        {/* Like Count */}
        <motion.div 
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium"
          animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatViews(likesCount)}
        </motion.div>
      </motion.div>

      {/* Play/Pause Button */}
      {showControls && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered || !isPlaying ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <GlassButton
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </GlassButton>
        </motion.div>
      )}

      {/* Volume Control */}
      {showControls && (
        <motion.div 
          className="absolute top-3 left-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </motion.div>
      )}

      {/* More Options */}
      {onMore && (
        <motion.div 
          className="absolute top-3 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -20 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => onMore(video)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </motion.div>
      )}

      {/* Particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: particle.size / 2,
              transform: `rotate(${particle.rotation}deg)`,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: particle.life / particle.maxLife,
              scale: [0, 1, 0.8],
              y: particle.y,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </AnimatePresence>

      {/* Hover Preview Overlay */}
      {showPreview && enableHoverPreview && (
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <Play className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Предварительный просмотр</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GlassVideoCard;
