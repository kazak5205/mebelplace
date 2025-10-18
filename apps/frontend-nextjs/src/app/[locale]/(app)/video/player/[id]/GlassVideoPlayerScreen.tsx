'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Video {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  videoUrl: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  isLiked: boolean;
  createdAt: string;
}

interface GlassVideoPlayerScreenProps {
  videoId: string;
}

export default function GlassVideoPlayerScreen({ videoId }: GlassVideoPlayerScreenProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Data is fetched via API hooks

  // Data is fetched via API hooks

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = 0.5;
      setVolume(0.5);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSpeedChange = () => {
    const video = videoRef.current;
    if (!video) return;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    video.playbackRate = newSpeed;
    setPlaybackSpeed(newSpeed);
  };

  const handleLike = () => {
    if (!video) return;
    setVideo(prev => prev ? {
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center">
        <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base flex items-center justify-center p-4">
        <GlassCard variant="elevated" padding="xl" className="text-center max-w-md">
          <GlassCardContent>
            <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              Видео не найдено
            </h3>
            <p className="glass-text-secondary mb-4">
              Возможно, видео было удалено или ссылка неверна
            </p>
            <GlassButton variant="gradient" onClick={() => router.push('/feed')}>
              Вернуться к ленте
            </GlassButton>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base">
      {/* Video Container */}
      <div 
        className="relative w-full h-screen bg-black"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={video.thumbnail}
          onClick={handlePlayPause}
        >
          <source src={video.videoUrl} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>

        {/* Video Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="glass-bg-primary/80 text-white hover:glass-bg-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </GlassButton>
              
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeedChange}
                  className="glass-bg-primary/80 text-white hover:glass-bg-primary"
                >
                  {playbackSpeed}x
                </GlassButton>
              </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <GlassButton
                  variant="ghost"
                  size="xl"
                  onClick={handlePlayPause}
                  className="w-20 h-20 glass-bg-primary/80 text-white hover:glass-bg-primary rounded-full"
                >
                  <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </GlassButton>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 glass-bg-secondary rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handlePlayPause}
                    className="glass-bg-primary/80 text-white hover:glass-bg-primary"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </GlassButton>

                  <div className="flex items-center gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={handleMute}
                      className="glass-bg-primary/80 text-white hover:glass-bg-primary"
                    >
                      {isMuted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      )}
                    </GlassButton>

                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 glass-bg-secondary rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                  </div>

                  <span className="text-white text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="glass-bg-primary/80 text-white hover:glass-bg-primary"
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </GlassButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Info Overlay */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="glass-bg-primary/80 rounded-lg p-4 backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-white mb-2">
              {video.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 glass-bg-secondary rounded-full flex items-center justify-center">
                  {video.author.avatar ? (
                    <img 
                      src={video.author.avatar} 
                      alt={video.author.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <span>{video.author.name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {video.views.toLocaleString()}
                </div>
                
                <GlassButton
                  variant={video.isLiked ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={handleLike}
                  className="text-white"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {video.likes}
                </GlassButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
