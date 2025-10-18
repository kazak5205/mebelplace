/**
 * GlassChatBubble - Пузырек сообщения с glass эффектом, slide анимацией, voice messages
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Mic, 
  MicOff, 
  Download, 
  Eye, 
  EyeOff,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassIconButton } from './GlassIconButton';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  text?: string;
  voiceMessage?: {
    url: string;
    duration: number;
    waveform?: number[];
  };
  file?: {
    name: string;
    url: string;
    size: number;
    type: string;
  };
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  video?: {
    url: string;
    thumbnail: string;
    duration: number;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOwn: boolean;
  replyTo?: {
    id: string;
    text: string;
    author: string;
  };
}

export interface GlassChatBubbleProps {
  message: Message;
  onPlay?: (message: Message) => void;
  onPause?: (message: Message) => void;
  onDownload?: (message: Message) => void;
  onRetry?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  animation?: 'slideIn' | 'fadeIn' | 'scaleIn' | 'none';
  direction?: 'left' | 'right';
  voiceMessage?: boolean;
  waveform?: number[];
  showAvatar?: boolean;
  showTimestamp?: boolean;
  showStatus?: boolean;
  maxWidth?: string;
  className?: string;
}

export const GlassChatBubble: React.FC<GlassChatBubbleProps> = ({
  message,
  onPlay,
  onPause,
  onDownload,
  onRetry,
  onReply,
  onReact,
  glassVariant = 'primary',
  animation = 'slideIn',
  direction = 'left',
  voiceMessage = false,
  waveform = [],
  showAvatar = true,
  showTimestamp = true,
  showStatus = true,
  maxWidth = 'max-w-xs',
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  // Voice message duration and waveform
  const duration = message.voiceMessage?.duration || 0;
  const messageWaveform = message.voiceMessage?.waveform || waveform;

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return date.toLocaleDateString('ru-RU');
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Handle voice message play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      onPause?.(message);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
      onPlay?.(message);
    }
  };

  // Update audio time
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }
  }, [message.voiceMessage?.url]);

  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/10 backdrop-blur-md border-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm border-white/10',
    accent: 'bg-orange-500/20 backdrop-blur-md border-orange-500/30',
    dark: 'bg-black/20 backdrop-blur-lg border-white/5',
    light: 'bg-white/20 backdrop-blur-sm border-white/30',
  };

  // Animation variants
  const animationVariants = {
    slideIn: {
      initial: { 
        opacity: 0, 
        x: direction === 'left' ? -20 : 20,
        y: 10 
      },
      animate: { 
        opacity: 1, 
        x: 0, 
        y: 0 
      },
      exit: { 
        opacity: 0, 
        x: direction === 'left' ? -20 : 20,
        y: -10 
      },
    },
    fadeIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.8, y: -20 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    },
  };

  const variants = animationVariants[animation];

  return (
    <motion.div
      className={cn(
        'flex gap-3 mb-4',
        direction === 'right' ? 'flex-row-reverse' : 'flex-row',
        className
      )}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Avatar */}
      {showAvatar && (
        <motion.div
          className={cn(
            'flex-shrink-0',
            direction === 'right' ? 'ml-2' : 'mr-2'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
            <img
              src={message.author.avatar}
              alt={message.author.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}

      {/* Message Content */}
      <div className={cn('flex flex-col', direction === 'right' ? 'items-end' : 'items-start')}>
        {/* Reply To */}
        {message.replyTo && (
          <motion.div
            className={cn(
              'mb-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-sm',
              maxWidth
            )}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-white/60 text-xs mb-1">Ответ на сообщение от {message.replyTo.author}</div>
            <div className="text-white/80 line-clamp-2">{message.replyTo.text}</div>
          </motion.div>
        )}

        {/* Message Bubble */}
        <GlassCard
          className={cn(
            'relative overflow-hidden',
            glassClasses[glassVariant],
            maxWidth,
            direction === 'right' ? 'rounded-br-sm' : 'rounded-bl-sm'
          )}
        >
          {/* Voice Message */}
          {message.voiceMessage && (
            <div className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Waveform */}
                  <div className="flex items-center gap-1 mb-2">
                    {messageWaveform.map((bar, index) => (
                      <motion.div
                        key={index}
                        className="bg-white/60 rounded-full"
                        style={{
                          width: '3px',
                          height: `${Math.max(bar * 20, 4)}px`,
                        }}
                        animate={isPlaying ? {
                          height: [`${Math.max(bar * 20, 4)}px`, `${Math.max(bar * 30, 8)}px`, `${Math.max(bar * 20, 4)}px`],
                        } : {}}
                        transition={{ 
                          duration: 0.5, 
                          repeat: isPlaying ? Infinity : 0,
                          delay: index * 0.05 
                        }}
                      />
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>{Math.floor(currentTime)}с</span>
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white/60 rounded-full"
                        style={{
                          width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    <span>{duration}с</span>
                  </div>
                </div>

                {/* Voice indicator */}
                <div className="flex-shrink-0">
                  <Mic className="w-4 h-4 text-white/60" />
                </div>
              </div>

              {/* Audio element */}
              <audio
                ref={audioRef}
                src={message.voiceMessage.url}
                preload="metadata"
              />
            </div>
          )}

          {/* File Message */}
          {message.file && (
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{message.file.name}</div>
                  <div className="text-white/60 text-sm">{formatFileSize(message.file.size)}</div>
                </div>
                <button
                  onClick={() => onDownload?.(message)}
                  className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Download className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Image Message */}
          {message.image && (
            <div className="relative">
              <img
                src={message.image.url}
                alt={message.image.alt}
                className="w-full h-auto rounded-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => window.open(message.image?.url, '_blank')}
                    className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Message */}
          {message.video && (
            <div className="relative">
              <video
                src={message.video.url}
                poster={message.video.thumbnail}
                className="w-full h-auto rounded-lg"
                controls
              />
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-white text-sm">
                  {Math.floor(message.video.duration / 60)}:
                  {Math.floor(message.video.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* Text Message */}
          {message.text && (
            <div className="p-4">
              <motion.p
                className="text-white leading-relaxed whitespace-pre-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {message.text}
              </motion.p>
            </div>
          )}

          {/* Message Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-1">
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <span className="text-white text-sm">↩</span>
                </button>
              )}
              {onReact && (
                <button
                  onClick={() => onReact(message, '❤️')}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <span className="text-white text-sm">❤️</span>
                </button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Timestamp and Status */}
        <motion.div
          className={cn(
            'flex items-center gap-2 mt-1 text-xs text-white/60',
            direction === 'right' ? 'flex-row-reverse' : 'flex-row'
          )}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {showTimestamp && (
            <span>{formatTimestamp(message.timestamp)}</span>
          )}
          {showStatus && (
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          )}
        </motion.div>

        {/* Failed Message Retry */}
        {message.status === 'failed' && onRetry && (
          <motion.div
            className="mt-2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassButton
              onClick={() => onRetry(message)}
              size="sm"
              variant="secondary"
              className="text-red-400 border-red-400/30"
            >
              Повторить отправку
            </GlassButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GlassChatBubble;
