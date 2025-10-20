import { useEffect, useRef } from 'react';
import { Video } from 'expo-av';

interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export const useVideoPreloader = (videos: VideoItem[], currentIndex: number) => {
  const preloadedVideos = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Предзагружаем текущее и следующее видео
    const videosToPreload = [
      videos[currentIndex],
      videos[currentIndex + 1],
      videos[currentIndex - 1]
    ].filter(Boolean);

    videosToPreload.forEach(video => {
      if (video && !preloadedVideos.current.has(video.id)) {
        preloadedVideos.current.add(video.id);
        
        // Предзагружаем видео в фоне
        Video.prefetch(video.videoUrl, {
          shouldCache: true,
          cachePolicy: 'cache'
        }).catch(error => {
          console.log('Video preload failed:', error);
        });
      }
    });
  }, [videos, currentIndex]);

  return preloadedVideos.current;
};
