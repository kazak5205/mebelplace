/**
 * Master Channel Screen - Профиль мастера в стиле TikTok
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
  StatusBar,
} from 'react-native';
import {
  Text,
  Avatar,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { apiService } from '../../services/apiService';
import { userService } from '../../services/userService';
import { videoService } from '../../services/videoService';
import { useAuth } from '../../contexts/AuthContext';
import type { User, Video } from '@shared/types';
import { FadeInView, ScaleInView, SlideInView } from '../../components/TikTokAnimations';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 3 колонки как в TikTok
const AVATAR_SIZE = 100;

interface MasterChannelScreenProps {
  route: any;
  navigation: any;
}

type TabType = 'videos' | 'likes' | 'saved';

// Расширенный тип User с дополнительными полями от бэка
interface ExtendedUser extends User {
  name?: string;
  bio?: string;
  specialties?: string[];
  location?: {
    city: string;
    region?: string;
  };
  rating?: number;
  reviewsCount?: number;
  followingCount?: number;
  followersCount?: number;
}

const MasterChannelScreen: React.FC<MasterChannelScreenProps> = ({ route, navigation }) => {
  const { masterId } = route.params;
  const { user } = useAuth();
  
  const [master, setMaster] = useState<ExtendedUser | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('videos');
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
      
      // Загружаем информацию о мастере (apiService.get уже возвращает data)
      const userData:any = await apiService.get(`/users/${masterId}`);
      if (userData) {
        setMaster(userData as ExtendedUser);
      }
      
      // Загружаем видео мастера (videoService.getVideos возвращает { videos: [], pagination: {} })
      const videosResponse:any = await videoService.getVideos({ 
        masterId,
        page: 1,
        limit: 50 
      } as any);
      
      if (videosResponse && videosResponse.videos) {
        setVideos(videosResponse.videos as Video[]);
      }
      
      // Загружаем статус подписки
      if (user && !isOwner) {
        try {
          const subscriptionStatus:any = await userService.getSubscriptionStatus(masterId);
          setIsFollowing(subscriptionStatus?.isSubscribed || false);
        } catch (error) {
          console.error('Error loading subscription status:', error);
        }
      }
      
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
    if (!user) {
      // Если пользователь не авторизован, можно показать алерт или перенаправить на логин
      return;
    }
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isFollowing) {
        await userService.unsubscribe(masterId);
        setIsFollowing(false);
      } else {
        await userService.subscribe(masterId);
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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCurrentVideos = () => {
    switch (activeTab) {
      case 'likes':
        return likedVideos;
      case 'saved':
        return savedVideos;
      default:
        return videos;
    }
  };

  const renderVideoItem = ({ item, index }: { item: Video; index: number }) => (
    <TouchableOpacity onPress={() => handleVideoPress(item, index)} style={styles.videoCard}>
      <Image
        source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/200x300' }}
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoOverlay}>
        <View style={styles.videoStat}>
          <Ionicons name="play" size={16} color="#fff" />
          <Text style={styles.videoStatText}>
            {formatCount(item.views || (item as any).views_count || (item as any).viewsCount || 0)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{master.name}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* TikTok Style Profile Header */}
        <View style={styles.profileHeader}>
          {/* Avatar with gradient border */}
          <ScaleInView duration={600} style={styles.avatarContainer}>
            <LinearGradient
              colors={['#FE2C55', '#FFC107', '#00F2EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={styles.avatarInner}>
                {master.avatar ? (
                  <Image source={{ uri: master.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{(master.name || master.username || 'M').charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </ScaleInView>

          {/* Username */}
          <FadeInView delay={200} duration={500}>
            <Text style={styles.username}>@{(master.name || master.username || 'master').toLowerCase().replace(/\s/g, '_')}</Text>
          </FadeInView>

          {/* Stats Row - TikTok Style */}
          <SlideInView delay={300} from="bottom" style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>
                {formatCount(master.followingCount || (master as any).following_count || 0)}
              </Text>
              <Text style={styles.statLabel}>Подписки</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>
                {formatCount((master as any).subscribersCount || (master as any).subscribers_count || master.followersCount || (master as any).followers_count || 0)}
              </Text>
              <Text style={styles.statLabel}>Подписчики</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statNumber}>
                {formatCount(videos.reduce((sum, v) => sum + (v.likeCount || (v as any).like_count || v.likes || 0), 0))}
              </Text>
              <Text style={styles.statLabel}>Лайки</Text>
            </TouchableOpacity>
          </SlideInView>

          {/* Action Buttons */}
          <FadeInView delay={400} duration={500} style={styles.actionButtons}>
            {isOwner ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]} 
                onPress={handleUploadVideo}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Загрузить видео</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, isFollowing ? styles.followingButton : styles.primaryButton]} 
                  onPress={handleFollow}
                >
                  {isFollowing ? (
                    <>
                      <Ionicons name="checkmark" size={20} color="#000" />
                      <Text style={styles.followingButtonText}>Подписан</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Подписаться</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]} 
                  onPress={handleMessage}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#000" />
                </TouchableOpacity>
              </>
            )}
          </FadeInView>

          {/* Bio */}
          {master.bio && (
            <FadeInView delay={500} duration={500}>
              <Text style={styles.bio}>{master.bio}</Text>
            </FadeInView>
          )}

          {/* Specialties as hashtags */}
          {master.specialties && master.specialties.length > 0 && (
            <FadeInView delay={600} duration={500} style={styles.hashtagsContainer}>
              {master.specialties.slice(0, 3).map((specialty, index) => (
                <Text key={index} style={styles.hashtag}>#{specialty}</Text>
              ))}
            </FadeInView>
          )}

          {/* Location & Rating */}
          <FadeInView delay={700} duration={500} style={styles.infoRow}>
            {master.location && (
              <View style={styles.infoItem}>
                <Ionicons name="location" size={14} color="#666" />
                <Text style={styles.infoText}>{master.location.city}</Text>
              </View>
            )}
            {master.rating && (
              <View style={styles.infoItem}>
                <Ionicons name="star" size={14} color="#FFC107" />
                <Text style={styles.infoText}>{master.rating.toFixed(1)}</Text>
              </View>
            )}
          </FadeInView>
        </View>

        {/* Content Tabs - TikTok Style */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => handleTabChange('videos')}
          >
            <MaterialCommunityIcons 
              name="grid" 
              size={24} 
              color={activeTab === 'videos' ? '#000' : '#999'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
            onPress={() => handleTabChange('likes')}
          >
            <Ionicons 
              name="heart" 
              size={24} 
              color={activeTab === 'likes' ? '#000' : '#999'} 
            />
          </TouchableOpacity>
          
          {isOwner && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
              onPress={() => handleTabChange('saved')}
            >
              <Ionicons 
                name="bookmark" 
                size={24} 
                color={activeTab === 'saved' ? '#000' : '#999'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Videos Grid - 3 columns like TikTok */}
        {getCurrentVideos().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'videos' ? 'videocam-outline' : activeTab === 'likes' ? 'heart-outline' : 'bookmark-outline'} 
              size={64} 
              color="#ccc" 
            />
            <Text style={styles.emptyText}>
              {activeTab === 'videos' 
                ? (isOwner ? 'Загрузите первое видео' : 'Нет видео') 
                : activeTab === 'likes' 
                ? 'Нет лайкнутых видео' 
                : 'Нет сохраненных видео'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={getCurrentVideos()}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.videosGrid}
            columnWrapperStyle={styles.videoRow}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },

  // Profile Header - TikTok Style
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  
  // Avatar with gradient border
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: AVATAR_SIZE + 6,
    height: AVATAR_SIZE + 6,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: AVATAR_SIZE - 4,
    height: AVATAR_SIZE - 4,
    borderRadius: (AVATAR_SIZE - 4) / 2,
  },
  avatarPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#666',
  },

  // Username
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },

  // Stats Row - TikTok Style
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 4,
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#FE2C55',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  followingButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: 48,
  },

  // Bio & Info
  bio: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  hashtag: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },

  // Tabs - TikTok Style
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },

  // Videos Grid - 3 columns
  videosGrid: {
    paddingTop: 2,
  },
  videoRow: {
    justifyContent: 'flex-start',
  },
  videoCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.4,
    marginBottom: 2,
    marginRight: 2,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStatText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#8E8E93',
  },

  // Empty Container
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
  },
  backButton: {
    minWidth: 120,
    marginTop: 16,
  },
});

export default MasterChannelScreen;

