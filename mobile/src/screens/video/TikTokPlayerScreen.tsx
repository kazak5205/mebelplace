import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { apiService } from '../../services/apiService';

const { width, height } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  author_id: string;
  likes: number;
  views: number;
  comments_count: number;
  is_liked?: boolean;
  author?: {
    username: string;
    avatar?: string;
  };
  tags?: string[];
  created_at: string;
}

const TikTokPlayerScreen = ({ route, navigation }: any) => {
  const { videos: initialVideos, initialIndex = 0 } = route.params || {};
  
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos || []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  useEffect(() => {
    if (!initialVideos || initialVideos.length === 0) {
      loadVideos();
    }
  }, []);

  useEffect(() => {
    // Воспроизводим только текущее видео
    Object.keys(videoRefs.current).forEach((key, index) => {
      const videoRef = videoRefs.current[key];
      if (videoRef) {
        if (index === currentIndex) {
          videoRef.playAsync();
          recordView(videos[currentIndex]);
        } else {
          videoRef.pauseAsync();
          videoRef.setPositionAsync(0);
        }
      }
    });
  }, [currentIndex]);

  const loadVideos = async () => {
    try {
      const response = await apiService.get('/videos/feed', { limit: 20 });
      setVideos(response.data?.videos || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const recordView = async (video: VideoItem) => {
    if (!video) return;
    try {
      await apiService.post(`/videos/${video.id}/view`, {
        durationWatched: 0,
        completionRate: 0,
      });
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const handleLike = async () => {
    const video = videos[currentIndex];
    if (!video) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (video.is_liked) {
        await apiService.delete(`/videos/${video.id}/like`);
      } else {
        await apiService.post(`/videos/${video.id}/like`);
      }

      setVideos((prev) =>
        prev.map((v, i) =>
          i === currentIndex
            ? {
                ...v,
                is_liked: !v.is_liked,
                likes: v.is_liked ? v.likes - 1 : v.likes + 1,
              }
            : v
        )
      );
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const handleDoubleTap = () => {
    handleLike();
  };

  const togglePlayPause = async () => {
    const videoRef = videoRefs.current[currentIndex.toString()];
    if (!videoRef) return;

    try {
      const status = await videoRef.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await videoRef.pauseAsync();
          setIsPlaying(false);
        } else {
          await videoRef.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error);
    }
  };

  const toggleMute = async () => {
    const videoRef = videoRefs.current[currentIndex.toString()];
    if (!videoRef) return;

    try {
      const newMutedState = !isMuted;
      await videoRef.setIsMutedAsync(newMutedState);
      setIsMuted(newMutedState);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  const handleShare = () => {
    // Реализация поделиться
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus, index: number) => {
    if (status.isLoaded && status.didJustFinish && !status.isLooping) {
      // Автоплей следующего видео
      if (index === currentIndex && currentIndex < videos.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      }
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}м назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}ч назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}д назад`;
    
    const day = date.getDate();
    const month = date.toLocaleDateString('ru-RU', { month: 'short' });
    return `${day} ${month}`;
  };

  const renderVideo = ({ item, index }: { item: VideoItem; index: number }) => {
    return (
      <View style={styles.videoContainer}>
        <Video
          ref={(ref) => (videoRefs.current[index.toString()] = ref)}
          source={{ uri: item.video_url }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={index === currentIndex}
          isLooping={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={(status) => handlePlaybackStatusUpdate(status, index)}
        />

        {/* Прозрачный оверлей для взаимодействия */}
        <TouchableOpacity
          style={styles.videoOverlay}
          activeOpacity={1}
          onPress={togglePlayPause}
        />

        {/* Правая панель действий */}
        <View style={styles.rightActions}>
          {/* Аватар автора */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={24} color="#FFF" />
            </View>
          </View>

          {/* Лайк */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <MaterialCommunityIcons
              name={item.is_liked ? 'heart' : 'heart-outline'}
              size={36}
              color="#FFF"
            />
            <Text style={styles.actionText}>{formatCount(item.likes)}</Text>
          </TouchableOpacity>

          {/* Комментарии */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(true)}
          >
            <MaterialCommunityIcons name="comment-outline" size={34} color="#FFF" />
            <Text style={styles.actionText}>{formatCount(item.comments_count || 0)}</Text>
          </TouchableOpacity>

          {/* Поделиться */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <FontAwesome name="send-o" size={28} color="#FFF" />
            <Text style={styles.actionText}>Поделиться</Text>
          </TouchableOpacity>

          {/* Сохранить */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bookmark-outline" size={32} color="#FFF" />
          </TouchableOpacity>

          {/* Звук */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={28}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* Информация о видео */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        >
          <View style={styles.videoInfo}>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                @{item.author?.username || 'Master'}
              </Text>
              <Text style={styles.timeAgo}> • {formatTimeAgo(item.created_at)}</Text>
            </View>

            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {item.description && (
              <Text style={styles.videoDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Text key={tagIndex} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}

            {/* Прогресс индикатор */}
            <View style={styles.progressContainer}>
              {videos.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor:
                        i === currentIndex
                          ? '#FFF'
                          : i < currentIndex
                          ? 'rgba(255,255,255,0.5)'
                          : 'rgba(255,255,255,0.2)',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Кнопка закрыть */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  if (videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width,
    height,
    backgroundColor: '#000',
  },
  video: {
    width,
    height,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingTop: 100,
  },
  videoInfo: {
    paddingHorizontal: 16,
    paddingRight: 90,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
});

export default TikTokPlayerScreen;

