import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';

const { width, height } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  authorId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

const MasterHomeScreen = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getVideos({ page: 1, limit: 20 });
      if (response.success) {
        setVideos(response.data.videos || []);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить видео');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleLike = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (video.isLiked) {
        await videoService.unlikeVideo(videoId);
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, isLiked: false, likes: v.likes - 1 }
            : v
        ));
      } else {
        await videoService.likeVideo(videoId);
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, isLiked: true, likes: v.likes + 1 }
            : v
        ));
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleBookmark = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      if (video.isBookmarked) {
        await videoService.removeBookmark(videoId);
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, isBookmarked: false }
            : v
        ));
      } else {
        await videoService.addBookmark(videoId);
        setVideos(prev => prev.map(v => 
          v.id === videoId 
            ? { ...v, isBookmarked: true }
            : v
        ));
      }
    } catch (error) {
      console.error('Error bookmarking video:', error);
    }
  };

  const handleSubscribe = async (authorId: string) => {
    try {
      // TODO: Implement subscription logic
      Alert.alert('Подписка', 'Функция подписки будет добавлена в следующих версиях');
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <View style={styles.videoContainer}>
      <View style={styles.videoWrapper}>
        <Image 
          source={{ uri: `https://mebelplace.com.kz${item.thumbnailUrl}` }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        
        {/* Video Info Overlay */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </View>

      {/* Right Side Actions */}
      <View style={styles.actionsContainer}>
        {/* Master Profile */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSubscribe(item.authorId)}
        >
          <Image 
            source={{ 
              uri: item.avatar 
                ? `https://mebelplace.com.kz${item.avatar}` 
                : 'https://via.placeholder.com/50'
            }}
            style={styles.masterAvatar}
          />
          <Text style={styles.masterName} numberOfLines={1}>
            {item.firstName} {item.lastName}
          </Text>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? 'heart' : 'heart-outline'} 
            size={24} 
            color={item.isLiked ? '#ff4757' : '#fff'} 
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        {/* Comment Button - Disabled for masters */}
        <TouchableOpacity style={styles.actionButton} disabled>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={[styles.actionText, { color: '#666' }]}>{item.comments}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleBookmark(item.id)}
        >
          <Ionicons 
            name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
            size={24} 
            color={item.isBookmarked ? '#f97316' : '#fff'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка видео...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    height: height,
    flexDirection: 'row',
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 80,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  actionsContainer: {
    width: 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
    paddingRight: 10,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  masterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  masterName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 50,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default MasterHomeScreen;
