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

const GuestHomeScreen = ({ navigation }: any) => {
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
    // Redirect to login for guests
    navigation.navigate('Auth' as never);
  };

  const handleComment = async (videoId: string) => {
    // Redirect to login for guests
    navigation.navigate('Auth' as never);
  };

  const handleCreateOrder = () => {
    // Redirect to login for guests
    navigation.navigate('Auth' as never);
  };

  const handleCreateVideo = () => {
    // Redirect to login for guests
    navigation.navigate('Auth' as never);
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
          onPress={() => navigation.navigate('Auth' as never)}
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

        {/* Comment Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Bookmark Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Ionicons 
            name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'} 
            size={24} 
            color={item.isBookmarked ? '#f97316' : '#fff'} 
          />
        </TouchableOpacity>

        {/* Order Furniture Button */}
        <TouchableOpacity 
          style={styles.orderButton}
          onPress={handleCreateOrder}
        >
          <Text style={styles.orderButtonText}>Заказать эту мебель</Text>
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
      {/* Guest Header */}
      <View style={styles.guestHeader}>
        <Text style={styles.guestTitle}>MebelPlace</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.loginButtonText}>Войти</Text>
        </TouchableOpacity>
      </View>

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

      {/* Guest Actions */}
      <View style={styles.guestActions}>
        <TouchableOpacity 
          style={styles.guestActionButton}
          onPress={handleCreateOrder}
        >
          <Ionicons name="add-circle" size={24} color="#f97316" />
          <Text style={styles.guestActionText}>Заявка всем</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.guestActionButton}
          onPress={handleCreateVideo}
        >
          <Ionicons name="videocam" size={24} color="#f97316" />
          <Text style={styles.guestActionText}>Создать видеорекламу</Text>
        </TouchableOpacity>
      </View>
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
  guestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  orderButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guestActions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  guestActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  guestActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default GuestHomeScreen;
