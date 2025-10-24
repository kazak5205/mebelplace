/**
 * HomeScreen - TikTok-style video feed
 * Синхронизировано с web HomePage - показывает VideoPlayer на весь экран
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';
import type { Video } from '@shared/types';

const HomeScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialIndex, setInitialIndex] = useState(0);
  const videoId = route?.params?.videoId;

  useEffect(() => {
    loadVideos();
  }, [videoId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      
      // Если есть videoId, загружаем видео автора (как на web)
      if (videoId) {
        try {
          const video = await videoService.getVideo(videoId);
          const authorId = video.authorId || video.author_id;
          
          if (authorId) {
            const response = await videoService.getVideos({ 
              author_id: authorId,
              limit: 50 
            });
            setVideos(response.videos || []);
            
            const index = response.videos.findIndex((v: Video) => v.id === videoId);
            setInitialIndex(index !== -1 ? index : 0);
            
            // Переходим на TikTok Player
            navigation.replace('TikTokPlayer', {
              videos: response.videos,
              initialIndex: index !== -1 ? index : 0
            });
            return;
          }
        } catch (error) {
          console.error('Failed to load specific video:', error);
        }
      }
      
      // Обычная загрузка фида (синхронизировано с web)
      const params = user?.role === 'master' 
        ? { limit: 50, exclude_author: user.id }
        : { limit: 50, recommendations: true };
      
      const response = await videoService.getVideos(params);
      setVideos(response.videos || []);
      setInitialIndex(0);
      
      // Переходим на TikTok Player
      navigation.replace('TikTokPlayer', {
        videos: response.videos,
        initialIndex: 0
      });
      
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Пока нет видео</Text>
        <Text style={styles.emptySubtext}>Загрузите первое видео!</Text>
      </View>
    );
  }

  // Если видео загружены, показываем TikTok плеер
  // (navigation.replace выше уже переводит на TikTokPlayer)
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default HomeScreen;
