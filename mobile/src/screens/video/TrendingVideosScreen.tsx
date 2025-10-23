import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Appbar, Card, Button, IconButton } from 'react-native-paper';
import { videoService } from '@shared/services';

const TrendingVideosScreen = ({ navigation }: any) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrendingVideos = async () => {
    try {
      setLoading(true);
      const response = await videoService.getTrendingVideos();
      if (response.success) {
        setVideos(response.data);
      }
    } catch (error) {
      console.error('Error loading trending videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrendingVideos();
    setRefreshing(false);
  };

  useEffect(() => {
    loadTrendingVideos();
  }, []);

  const renderVideo = ({ item }: any) => (
    <Card style={styles.videoCard}>
      <Card.Cover source={{ uri: item.thumbnail_url || item.video_url }} />
      <Card.Content>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.videoStats}>
          <Text style={styles.statText}>👀 {item.views_count || 0}</Text>
          <Text style={styles.statText}>❤️ {item.likes_count || 0}</Text>
          <Text style={styles.statText}>💬 {item.comments_count || 0}</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('VideoPlayer', { videoId: item.id })}
        >
          Смотреть
        </Button>
        <IconButton
          icon="heart"
          onPress={() => handleLike(item.id)}
        />
        <IconButton
          icon="bookmark"
          onPress={() => handleBookmark(item.id)}
        />
      </Card.Actions>
    </Card>
  );

  const handleLike = async (videoId: number) => {
    try {
      await videoService.likeVideo(videoId);
      // Обновляем локальное состояние
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, likes_count: (video.likes_count || 0) + 1, is_liked: true }
          : video
      ));
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleBookmark = async (videoId: number) => {
    try {
      await videoService.bookmarkVideo(videoId);
      // Обновляем локальное состояние
      setVideos(videos.map(video => 
        video.id === videoId 
          ? { ...video, is_bookmarked: true }
          : video
      ));
    } catch (error) {
      console.error('Error bookmarking video:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Загрузка трендовых видео...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Трендовые видео" />
      </Appbar.Header>
      
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  videoCard: {
    marginBottom: 16,
    elevation: 4,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
});

export default TrendingVideosScreen;
