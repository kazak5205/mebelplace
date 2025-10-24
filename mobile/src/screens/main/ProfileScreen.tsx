import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@shared/contexts/AuthContext';
import { userService } from '../../services/userService';
import { apiService } from '../../services/apiService';
import { FadeInView, ScaleInView } from '../../components/TikTokAnimations';
import type { Video } from '@shared/types';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Video[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBookmarkedVideos();
      loadSubscriptions();
    }
  }, [user]);

  const loadBookmarkedVideos = async () => {
    try {
      setLoadingBookmarks(true);
      const data: any = await userService.getBookmarkedVideos();
      setBookmarkedVideos(data || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const loadSubscriptions = async () => {
    if (!user) return;
    try {
      setLoadingSubscriptions(true);
      const data: any = await userService.getSubscriptions(user.id);
      const subs = data.subscriptions || data || [];
      
      // Для каждого мастера дозагружаем актуальные данные (как на web)
      const subsWithCounts = await Promise.all(
        subs.map(async (sub: any) => {
          try {
            const masterData: any = await apiService.get(`/users/${sub.id}`);
            return {
              ...sub,
              subscribersCount: (masterData.data || masterData).subscribers_count || (masterData.data || masterData).subscribersCount || 0
            };
          } catch (error) {
            console.error(`Failed to load master ${sub.id}:`, error);
            return sub;
          }
        })
      );
      
      setSubscriptions(subsWithCounts);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBookmarkedVideos(), loadSubscriptions()]);
    setRefreshing(false);
  };

  const handleAvatarChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Загрузка аватара на сервер
      console.log('Avatar selected:', result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || user.phone || 'User';

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* TikTok-Style Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Мой профиль</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar with gradient border - TikTok style */}
        <FadeInView delay={100} style={styles.avatarSection}>
          <ScaleInView delay={200}>
            <LinearGradient
              colors={['#ec4899', '#fbbf24', '#06b6d4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.avatarInner}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <TouchableOpacity style={styles.cameraButton} onPress={handleAvatarChange}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </ScaleInView>
        </FadeInView>

        {/* Username */}
        <FadeInView delay={300}>
          <Text style={styles.username}>
            @{(user.username || displayName).toLowerCase().replace(/\s/g, '_')}
          </Text>
        </FadeInView>

        {/* Edit Button (для всех пользователей) */}
        <FadeInView delay={400}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Редактировать</Text>
          </TouchableOpacity>
        </FadeInView>
      </View>

      {/* Для клиентов показываем Мои мастера + Избранное */}
      {user.role !== 'master' && (
        <View style={styles.clientContent}>
          {/* Мои мастера */}
          <FadeInView delay={500}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#fff" />
                  <Text style={styles.sectionTitle}>Мои мастера</Text>
                </View>
                <Text style={styles.sectionCount}>{subscriptions.length} мастеров</Text>
              </View>

              {loadingSubscriptions ? (
                <ActivityIndicator color="#f97316" style={styles.loader} />
              ) : subscriptions.length > 0 ? (
                <View style={styles.mastersList}>
                  {subscriptions.map((subscription, index) => (
                    <TouchableOpacity
                      key={subscription.id}
                      style={styles.masterCard}
                      onPress={() => navigation.navigate('MasterChannel', { masterId: subscription.id })}
                    >
                      <Image 
                        source={{ uri: subscription.avatar || 'https://via.placeholder.com/48' }}
                        style={styles.masterAvatar}
                      />
                      <View style={styles.masterInfo}>
                        <Text style={styles.masterName}>{subscription.username}</Text>
                        <Text style={styles.masterStats}>
                          {subscription.subscribersCount || 0} подписчиков
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  Вы пока не подписаны ни на одного мастера
                </Text>
              )}
            </View>
          </FadeInView>

          {/* Избранное */}
          <FadeInView delay={600}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="heart" size={20} color="#fff" />
                  <Text style={styles.sectionTitle}>Избранное</Text>
                </View>
                <Text style={styles.sectionCount}>{bookmarkedVideos.length} видео</Text>
              </View>

              {loadingBookmarks ? (
                <ActivityIndicator color="#f97316" style={styles.loader} />
              ) : bookmarkedVideos.length > 0 ? (
                <View style={styles.videosGrid}>
                  {bookmarkedVideos.map((video, index) => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoItem}
                      onPress={() => {
                        // Открываем видео
                        navigation.navigate('Главная', {
                          screen: 'Home',
                          params: { videoId: video.id }
                        });
                      }}
                    >
                      <Image
                        source={{ uri: video.thumbnailUrl || 'https://via.placeholder.com/200x350' }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  У вас пока нет избранных видео
                </Text>
              )}
            </View>
          </FadeInView>
        </View>
      )}
    </ScrollView>
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
  profileHeader: {
    backgroundColor: '#111',
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    padding: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  gradientBorder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
  },
  avatarInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#111',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  clientContent: {
    padding: 16,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loader: {
    marginVertical: 32,
  },
  mastersList: {
    gap: 12,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  masterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  masterStats: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  videoItem: {
    width: (width - 38) / 3, // 3 колонки
    aspectRatio: 9 / 16,
    backgroundColor: '#1a1a1a',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    paddingVertical: 32,
  },
});

export default ProfileScreen;
