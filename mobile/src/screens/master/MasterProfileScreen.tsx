import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { videoService } from '../../services/videoService';
import type { Video } from '@shared/types';
import { FadeInView, ScaleInView, SlideInView } from '../../components/TikTokAnimations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;
const AVATAR_SIZE = 100;

type TabType = 'videos' | 'drafts' | 'private';

const MasterProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    loadMasterVideos();
  }, []);

  const loadMasterVideos = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      // Получаем видео текущего мастера через правильный API endpoint
      const response:any = await videoService.getVideos({ masterId: user?.id } as any);
      
      // Синхронизировано с web: videoService.getVideos возвращает { videos, pagination }
      setVideos(response.videos || []);
    } catch (error) {
      console.error('Error loading master videos:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMasterVideos(true);
  }, []);

  const handleChangeAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.95, // Высокое качество для аватара
      });

      if (!result.canceled && result.assets[0]) {
        setIsUpdatingProfile(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);

        // TODO: Использовать правильный endpoint для загрузки аватара
        // const response:any = await authService.uploadAvatar(formData);
        // if (response && response.data) {
        //   updateUser(response.data);
        //   Alert.alert('Успех', 'Фото профиля обновлено');
        // }
        
        Alert.alert('Инфо', 'Функция загрузки аватара будет добавлена позже');
      }
    } catch (error) {
      console.error('Error changing avatar:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при обновлении фото');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    Alert.alert(
      'Удалить видео',
      `Вы уверены, что хотите удалить видео "${videoTitle}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const response:any = await videoService.deleteVideo(videoId);
              
              if (response) {
                setVideos(prev => prev.filter(video => video.id !== videoId));
                Alert.alert('Успех', 'Видео удалено');
              }
            } catch (error) {
              console.error('Error deleting video:', error);
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

  const handleCreateVideo = () => {
    navigation.navigate('MasterCreateVideo');
  };

  const handleSubscribersPress = () => {
    navigation.navigate('Subscribers');
  };

  const handleSupportPress = () => {
    navigation.navigate('SupportChat');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleLogout = () => {
    Alert.alert(
      'Выйти',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigation будет обработан в AuthContext
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <TouchableOpacity 
      onPress={() => handleVideoPress(item)} 
      onLongPress={() => handleDeleteVideo(item.id, item.title)}
      style={styles.videoCard}
    >
      <Image 
        source={{ uri: item.thumbnailUrl }} 
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
      <View style={styles.videoOverlay}>
        <View style={styles.videoStat}>
          <Ionicons name="play" size={16} color="#fff" />
          <Text style={styles.videoStatText}>{formatCount(item.views)}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.videoDeleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDeleteVideo(item.id, item.title);
        }}
      >
        <Ionicons name="trash-outline" size={16} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEditProfile} style={styles.headerButton}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мой профиль</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ListHeaderComponent={
          <>
            {/* TikTok Style Profile Header */}
            <View style={styles.profileHeader}>
              {/* Avatar with gradient border */}
              <TouchableOpacity 
                onPress={handleChangeAvatar} 
                disabled={isUpdatingProfile}
                style={styles.avatarContainer}
              >
                <LinearGradient
                  colors={['#FE2C55', '#FFC107', '#00F2EA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <View style={styles.avatarInner}>
                    {user?.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'M'}</Text>
                      </View>
                    )}
                    {isUpdatingProfile && (
                      <View style={styles.avatarLoading}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </View>
                </LinearGradient>
                <View style={styles.changeAvatarButton}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Username */}
              <Text style={styles.username}>@{user?.name?.toLowerCase().replace(/\s/g, '_')}</Text>

              {/* Stats Row - TikTok Style */}
              <View style={styles.statsRow}>
                <TouchableOpacity style={styles.statItem}>
                  <Text style={styles.statNumber}>{formatCount(user?.followingCount || 0)}</Text>
                  <Text style={styles.statLabel}>Подписки</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.statItem} onPress={handleSubscribersPress}>
                  <Text style={styles.statNumber}>{formatCount(user?.subscribersCount || 0)}</Text>
                  <Text style={styles.statLabel}>Подписчики</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {formatCount(videos.reduce((sum, v) => sum + (v.likeCount || v.likes || 0), 0))}
                  </Text>
                  <Text style={styles.statLabel}>Лайки</Text>
                </TouchableOpacity>
              </View>

              {/* Bio */}
              {user?.bio && (
                <Text style={styles.bio}>{user.bio}</Text>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.primaryButton]} 
                  onPress={handleCreateVideo}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Создать видео</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]} 
                  onPress={handleSupportPress}
                >
                  <Ionicons name="help-circle-outline" size={20} color="#000" />
                  <Text style={styles.secondaryButtonText}>Поддержка</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Settings */}
              <View style={styles.quickSettings}>
                <TouchableOpacity style={styles.quickSettingItem} onPress={handleEditProfile}>
                  <Ionicons name="person-outline" size={24} color="#000" />
                  <Text style={styles.quickSettingText}>Профиль</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickSettingItem} onPress={handleSubscribersPress}>
                  <Ionicons name="people-outline" size={24} color="#000" />
                  <Text style={styles.quickSettingText}>Подписчики</Text>
                </TouchableOpacity>
              </View>
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
                style={[styles.tab, activeTab === 'drafts' && styles.activeTab]}
                onPress={() => handleTabChange('drafts')}
              >
                <Ionicons 
                  name="lock-closed" 
                  size={24} 
                  color={activeTab === 'drafts' ? '#000' : '#999'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'private' && styles.activeTab]}
                onPress={() => handleTabChange('private')}
              >
                <Ionicons 
                  name="bookmark" 
                  size={24} 
                  color={activeTab === 'private' ? '#000' : '#999'} 
                />
              </TouchableOpacity>
            </View>
          </>
        }
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.videosList}
        columnWrapperStyle={styles.videoRow}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Нет видео</Text>
            <Text style={styles.emptySubtext}>
              Создайте свое первое видео
            </Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, { marginTop: 16 }]}
              onPress={handleCreateVideo}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Создать видео</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    position: 'relative',
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
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FE2C55',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
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

  // Bio
  bio: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },

  // Quick Settings
  quickSettings: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
  },
  quickSettingItem: {
    alignItems: 'center',
    gap: 8,
  },
  quickSettingText: {
    fontSize: 12,
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
  videosList: {
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
  videoDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MasterProfileScreen;
