import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { videoService } from '../../services/videoService';
import type { Video } from '@shared/types';

const TrendingVideosScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const periodOptions = [
    { key: 'day', label: 'Сегодня' },
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'all', label: 'Все время' },
  ];

  useEffect(() => {
    loadTrendingVideos();
  }, [selectedPeriod]);

  const loadTrendingVideos = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await videoService.getTrending(selectedPeriod, pageNum, 20);
      
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
      console.error('Error loading trending videos:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadTrendingVideos(1, true);
  }, [selectedPeriod]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadTrendingVideos(page + 1);
    }
  }, [hasMore, isLoading, page, selectedPeriod]);

  const handleVideoPress = (video: Video) => {
    navigation.navigate('VideoPlayer', { video });
  };

  const handleMasterPress = (masterId: string, masterName: string) => {
    navigation.navigate('MasterChannel', { masterId, masterName });
  };

  const renderVideo = ({ item, index }: { item: Video; index: number }) => (
    <Card style={styles.videoCard}>
      <TouchableOpacity onPress={() => handleVideoPress(item)}>
        <View style={styles.rankingContainer}>
          <Chip 
            mode="outlined" 
            style={[
              styles.rankingChip,
              { backgroundColor: index < 3 ? '#FFD700' : '#f0f0f0' }
            ]}
            textStyle={{ 
              color: index < 3 ? '#000' : '#666',
              fontWeight: 'bold'
            }}
          >
            #{index + 1}
          </Chip>
        </View>
        
        <Card.Cover 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail}
        />
        <Card.Content style={styles.cardContent}>
          <View style={styles.videoHeader}>
            <TouchableOpacity 
              style={styles.masterInfo}
              onPress={() => handleMasterPress(item.master.id, item.master.name)}
            >
              <Text style={styles.masterName}>{item.master.name}</Text>
              <Text style={styles.videoDate}>
                {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </TouchableOpacity>
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
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={16} color="#4CAF50" />
              <Text style={styles.trendingText}>Тренд</Text>
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
        <Text style={styles.loadingText}>Загрузка трендовых видео...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Трендовые видео</Title>
        <View style={styles.placeholder} />
      </View>
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <FlatList
          horizontal
          data={periodOptions}
          renderItem={({ item }) => (
            <Chip
              mode={selectedPeriod === item.key ? 'flat' : 'outlined'}
              selected={selectedPeriod === item.key}
              onPress={() => setSelectedPeriod(item.key)}
              style={styles.periodChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.periodList}
        />
      </View>
      
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trending-up-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет трендовых видео</Text>
          <Text style={styles.emptySubtext}>
            Попробуйте выбрать другой период
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
  periodSelector: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  periodList: {
    paddingHorizontal: 16,
  },
  periodChip: {
    marginRight: 8,
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
    position: 'relative',
  },
  rankingContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  rankingChip: {
    alignSelf: 'flex-start',
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
  trendingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
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

export default TrendingVideosScreen;
