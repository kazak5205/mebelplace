import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  FAB,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { videoService } from '../../services/videoService';
import type { Video } from '@shared/types';

const BookmarkedVideosScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadBookmarkedVideos();
  }, []);

  const loadBookmarkedVideos = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await videoService.getBookmarked(pageNum, 20);
      
      if (response.success) {
        const newVideos = response.data;
        
        if (isRefresh || pageNum === 1) {
          setVideos(newVideos);
        } else {
          setVideos(prev => [...prev, ...newVideos]);
        }
        
        setHasMore(newVideos.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading bookmarked videos:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadBookmarkedVideos(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadBookmarkedVideos(page + 1);
    }
  }, [hasMore, isLoading, page]);

  const handleRemoveBookmark = async (videoId: string) => {
    Alert.alert(
      'Удалить из избранного',
      'Вы уверены, что хотите удалить это видео из избранного?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              const response = await videoService.removeBookmark(videoId);
              
              if (response.success) {
                setVideos(prev => prev.filter(video => video.id !== videoId));
              } else {
                Alert.alert('Ошибка', 'Не удалось удалить из избранного');
              }
            } catch (error) {
              console.error('Error removing bookmark:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении');
            }
          },
        },
      ]
    );
  };

  const handleVideoPress = (video: Video) => {
    navigation.navigate('VideoPlayer', { video });
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <Card style={styles.videoCard}>
      <TouchableOpacity onPress={() => handleVideoPress(item)}>
        <Card.Cover 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail}
        />
        <Card.Content style={styles.cardContent}>
          <View style={styles.videoHeader}>
            <View style={styles.masterInfo}>
              <Text style={styles.masterName}>{item.master.name}</Text>
              <Text style={styles.videoDate}>
                {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <IconButton
              icon="bookmark"
              iconColor="#FFD700"
              size={24}
              onPress={() => handleRemoveBookmark(item.id)}
            />
          </View>
          
          <Paragraph style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Paragraph>
          
          <View style={styles.videoStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={16} color="#F44336" />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color="#666" />
              <Text style={styles.statText}>{item.commentsCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={16} color="#666" />
              <Text style={styles.statText}>{item.viewsCount}</Text>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
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
        <Text style={styles.loadingText}>Загрузка избранных видео...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Избранные видео</Title>
        <View style={styles.placeholder} />
      </View>
      
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет избранных видео</Text>
          <Text style={styles.emptySubtext}>
            Добавьте видео в избранное, нажав на иконку закладки
          </Text>
        </View>
      ) : (
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  videoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  thumbnail: {
    height: 200,
  },
  cardContent: {
    padding: 12,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 12,
    color: '#666',
  },
  videoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BookmarkedVideosScreen;
