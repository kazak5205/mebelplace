/**
 * Master Channel Screen - Профиль мастера с видео и информацией
 * Синхронизирован с client/src/pages/MasterChannelPage.tsx
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { apiService } from '../../services/apiService';
import { useAuth } from '@shared/contexts/AuthContext';
import type { User, Video } from '@shared/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.45;

interface MasterChannelScreenProps {
  route: any;
  navigation: any;
}

const MasterChannelScreen: React.FC<MasterChannelScreenProps> = ({ route, navigation }) => {
  const { masterId } = route.params;
  const { user } = useAuth();
  
  const [master, setMaster] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwner = user?.id === masterId;

  useEffect(() => {
    loadMasterData();
  }, [masterId]);

  const loadMasterData = async () => {
    try {
      setIsLoading(true);
      
      // Загружаем видео мастера
      const videosResponse = await apiService.getVideos(1, 50);
      
      if (videosResponse.success && videosResponse.data?.length > 0) {
        const masterVideos = Array.isArray(videosResponse.data) 
          ? videosResponse.data.filter((v: any) => v.master?.id === masterId || v.author?.id === masterId)
          : [];
        
        setVideos(masterVideos);
        
        // Берем информацию о мастере из первого видео
        if (masterVideos.length > 0) {
          const masterInfo = masterVideos[0].master || masterVideos[0].author;
          setMaster(masterInfo);
          setSelectedVideo(masterVideos[0]);
        }
      }
      
      // Загрузить информацию о подписке (пока закомментировано - endpoint будет добавлен позже)
      // const followResponse = await apiService.get(`/users/${masterId}/following`);
      // setIsFollowing(followResponse.data?.isFollowing || false);
      
    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMasterData();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isFollowing) {
        // await apiService.unfollowUser(masterId);
        setIsFollowing(false);
      } else {
        // await apiService.followUser(masterId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const handleMessage = () => {
    // Открыть чат с мастером
    navigation.navigate('Чат', {
      screen: 'Chat',
      params: { userId: masterId }
    });
  };

  const handleVideoPress = (video: Video, index: number) => {
    navigation.navigate('Видео', {
      screen: 'TikTokPlayer',
      params: { videos, initialIndex: index }
    });
  };

  const handleUploadVideo = () => {
    navigation.navigate('Видео', {
      screen: 'Camera'
    });
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!master) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Мастер не найден</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Назад
        </Button>
      </View>
    );
  }

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => (
    <TouchableOpacity onPress={() => handleVideoPress(item, index)} style={styles.videoCard}>
      <Image
        source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/200x300' }}
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoOverlay}>
        <View style={styles.videoStats}>
          <View style={styles.videoStat}>
            <Ionicons name="play" size={14} color="#fff" />
            <Text style={styles.videoStatText}>{formatCount(item.viewsCount)}</Text>
          </View>
          <View style={styles.videoStat}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.videoStatText}>{formatCount(item.likesCount)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.videoTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль мастера</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Master Info Card */}
      <Card style={styles.masterCard}>
        <Card.Content>
          <View style={styles.masterHeader}>
            {master.avatar ? (
              <Avatar.Image size={80} source={{ uri: master.avatar }} />
            ) : (
              <Avatar.Text size={80} label={master.name.charAt(0).toUpperCase()} />
            )}
            
            <View style={styles.masterInfo}>
              <Text style={styles.masterName}>{master.name}</Text>
              
              {master.specialties && master.specialties.length > 0 && (
                <Text style={styles.masterSpecialties} numberOfLines={2}>
                  {master.specialties.join(', ')}
                </Text>
              )}
              
              <View style={styles.masterStats}>
                {master.rating && (
                  <View style={styles.statItem}>
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text style={styles.statText}>
                      {master.rating.toFixed(1)} ({master.reviewsCount})
                    </Text>
                  </View>
                )}
                
                {master.location && (
                  <View style={styles.statItem}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.statText}>
                      {master.location.city}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isOwner ? (
              <Button
                mode="contained"
                onPress={handleUploadVideo}
                icon="video-plus"
                style={styles.actionButton}
                buttonColor="#f97316"
              >
                Загрузить видео
              </Button>
            ) : (
              <>
                <Button
                  mode={isFollowing ? 'outlined' : 'contained'}
                  onPress={handleFollow}
                  icon={isFollowing ? 'check' : 'plus'}
                  style={[styles.actionButton, styles.followButton]}
                  buttonColor={isFollowing ? undefined : '#f97316'}
                >
                  {isFollowing ? 'Подписан' : 'Подписаться'}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleMessage}
                  icon="message-text"
                  style={styles.actionButton}
                  buttonColor="#6b7280"
                >
                  Написать
                </Button>
              </>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatCount(videos.length)}</Text>
              <Text style={styles.statLabel}>Видео</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatCount(master.followersCount || 0)}</Text>
              <Text style={styles.statLabel}>Подписчики</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {formatCount(videos.reduce((sum, v) => sum + v.viewsCount, 0))}
              </Text>
              <Text style={styles.statLabel}>Просмотры</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Videos Grid */}
      <View style={styles.videosSection}>
        <Text style={styles.sectionTitle}>Видео ({videos.length})</Text>
        
        {videos.length === 0 ? (
          <View style={styles.emptyVideos}>
            <Ionicons name="videocam-outline" size={48} color="#ccc" />
            <Text style={styles.emptyVideosText}>
              {isOwner ? 'Загрузите первое видео' : 'У этого мастера пока нет видео'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.videosGrid}
            columnWrapperStyle={styles.videoRow}
          />
        )}
      </View>
    </ScrollView>
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  masterCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  masterHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  masterInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  masterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  masterSpecialties: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  masterStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  followButton: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
  },
  videosSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  videosGrid: {
    paddingBottom: 16,
  },
  videoRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  videoCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  videoThumbnail: {
    width: '100%',
    height: 240,
    backgroundColor: '#eee',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'flex-end',
    padding: 8,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 12,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoStatText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    padding: 8,
  },
  emptyVideos: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyVideosText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    minWidth: 120,
  },
});

export default MasterChannelScreen;

