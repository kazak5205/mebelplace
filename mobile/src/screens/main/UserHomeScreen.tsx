import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { videoService } from '../../services/videoService';
import { subscriptionService } from '../../services/subscriptionService';
import type { Video } from '@shared/types';

const { width, height } = Dimensions.get('window');

const UserHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await videoService.getFeed(pageNum, 10);
      
      if (response.success) {
        const newVideos = response.data;
        
        if (isRefresh || pageNum === 1) {
          setVideos(newVideos);
        } else {
          setVideos(prev => [...prev, ...newVideos]);
        }
        
        setHasMore(newVideos.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadVideos(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadVideos(page + 1);
    }
  }, [hasMore, isLoading, page]);

  const handleLike = async (videoId: string) => {
    try {
      const response = await videoService.likeVideo(videoId);
      if (response.success) {
        setVideos(prev => 
          prev.map(video => 
            video.id === videoId 
              ? { 
                  ...video, 
                  isLiked: !video.isLiked,
                  likesCount: video.isLiked ? video.likesCount - 1 : video.likesCount + 1
                }
              : video
          )
        );
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleBookmark = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      const response = video.isBookmarked 
        ? await videoService.removeBookmark(videoId)
        : await videoService.addBookmark(videoId);

      if (response.success) {
        setVideos(prev => 
          prev.map(v => 
            v.id === videoId 
              ? { ...v, isBookmarked: !v.isBookmarked }
              : v
          )
        );
      }
    } catch (error) {
      console.error('Error bookmarking video:', error);
    }
  };

  const handleSubscribe = async (masterId: string) => {
    try {
      const response = await subscriptionService.subscribe(masterId);
      if (response.success) {
        Alert.alert('Успех', 'Вы подписались на мастера');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleOrderFurniture = (video: Video) => {
    // Переходим в чат с мастером с предзаполненным сообщением
    navigation.navigate('Chat', {
      masterId: video.master.id,
      masterName: video.master.name,
      initialMessage: 'Хочу заказать эту мебель',
      videoId: video.id,
    });
  };

  const handleMasterPress = (masterId: string, masterName: string) => {
    navigation.navigate('MasterChannel', { masterId, masterName });
  };

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <View style={styles.videoContainer}>
      <Card.Cover 
        source={{ uri: item.thumbnail }} 
        style={styles.videoThumbnail}
      />
      
      {/* Video Overlay */}
      <View style={styles.videoOverlay}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => navigation.navigate('VideoPlayer', { video: item })}
        >
          <Ionicons name="play-circle" size={60} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>
      
      {/* Right Side Actions */}
      <View style={styles.actionsContainer}>
        {/* Master Avatar & Subscribe */}
        <View style={styles.masterSection}>
          <TouchableOpacity 
            onPress={() => handleMasterPress(item.master.id, item.master.name)}
          >
            <Avatar.Text 
              size={40} 
              label={item.master.name.charAt(0).toUpperCase()} 
              style={styles.masterAvatar}
            />
          </TouchableOpacity>
          <IconButton
            icon="heart"
            iconColor={item.isSubscribed ? "#F44336" : "#666"}
            size={24}
            onPress={() => handleSubscribe(item.master.id)}
          />
        </View>
        
        {/* Like */}
        <View style={styles.actionItem}>
          <IconButton
            icon={item.isLiked ? "heart" : "heart-outline"}
            iconColor={item.isLiked ? "#F44336" : "#666"}
            size={28}
            onPress={() => handleLike(item.id)}
          />
          <Text style={styles.actionText}>{item.likesCount}</Text>
        </View>
        
        {/* Comment */}
        <View style={styles.actionItem}>
          <IconButton
            icon="chatbubble-outline"
            iconColor="#666"
            size={28}
            onPress={() => navigation.navigate('VideoPlayer', { video: item, showComments: true })}
          />
          <Text style={styles.actionText}>{item.commentsCount}</Text>
        </View>
        
        {/* Share */}
        <View style={styles.actionItem}>
          <IconButton
            icon="share-outline"
            iconColor="#666"
            size={28}
            onPress={() => {
              // Share functionality
            }}
          />
          <Text style={styles.actionText}>Поделиться</Text>
        </View>
        
        {/* Bookmark */}
        <View style={styles.actionItem}>
          <IconButton
            icon={item.isBookmarked ? "bookmark" : "bookmark-outline"}
            iconColor={item.isBookmarked ? "#FFD700" : "#666"}
            size={28}
            onPress={() => handleBookmark(item.id)}
          />
          <Text style={styles.actionText}>Избранное</Text>
        </View>
      </View>
      
      {/* Bottom Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.masterName}>{item.master.name}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Order Button */}
        <Button
          mode="contained"
          onPress={() => handleOrderFurniture(item)}
          style={styles.orderButton}
          icon="shopping-cart"
        >
          Заказать эту мебель
        </Button>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || videos.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка видео...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  videoContainer: {
    width: width,
    height: height,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
  },
  masterSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  masterAvatar: {
    marginBottom: 8,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  masterName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  orderButton: {
    alignSelf: 'flex-start',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default UserHomeScreen;
