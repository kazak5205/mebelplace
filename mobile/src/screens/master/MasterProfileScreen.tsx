import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Avatar,
  Chip,
  Button,
  IconButton,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@shared/contexts/AuthContext';
import { authService } from '../../services/authService';
import { videoService } from '../../services/videoService';
import type { Video } from '@shared/types';

const MasterProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
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

      const response = await videoService.getMasterVideos(user?.id || '');
      
      if (response.success) {
        setVideos(response.data);
      }
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUpdatingProfile(true);
        
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);

        const response = await authService.uploadAvatar(formData);
        
        if (response.success) {
          updateUser(response.data);
          Alert.alert('Успех', 'Фото профиля обновлено');
        } else {
          Alert.alert('Ошибка', 'Не удалось обновить фото');
        }
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
              const response = await videoService.delete(videoId);
              
              if (response.success) {
                setVideos(prev => prev.filter(video => video.id !== videoId));
                Alert.alert('Успех', 'Видео удалено');
              } else {
                Alert.alert('Ошибка', 'Не удалось удалить видео');
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
    <Card style={styles.videoCard}>
      <TouchableOpacity onPress={() => handleVideoPress(item)}>
        <Card.Cover 
          source={{ uri: item.thumbnail }} 
          style={styles.thumbnail}
        />
        <Card.Content style={styles.videoContent}>
          <Paragraph style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Paragraph>
          <View style={styles.videoStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color="#F44336" />
              <Text style={styles.statText}>{item.likesCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={14} color="#666" />
              <Text style={styles.statText}>{item.viewsCount}</Text>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
      <IconButton
        icon="delete"
        size={20}
        iconColor="#F44336"
        style={styles.deleteButton}
        onPress={() => handleDeleteVideo(item.id, item.title)}
      />
    </Card>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Профиль мастера</Title>
        <TouchableOpacity onPress={handleEditProfile}>
          <Ionicons name="settings" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ListHeaderComponent={
          <>
            {/* Profile Info */}
            <Card style={styles.profileCard}>
              <Card.Content style={styles.profileContent}>
                <View style={styles.avatarContainer}>
                  <TouchableOpacity onPress={handleChangeAvatar} disabled={isUpdatingProfile}>
                    {user?.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    ) : (
                      <Avatar.Text 
                        size={80} 
                        label={user?.name?.charAt(0).toUpperCase() || 'M'} 
                        style={styles.avatar}
                      />
                    )}
                    {isUpdatingProfile && (
                      <View style={styles.avatarLoading}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleChangeAvatar} style={styles.changeAvatarButton}>
                    <Ionicons name="camera" size={16} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.profileInfo}>
                  <Title style={styles.profileName}>{user?.name}</Title>
                  <Text style={styles.profileType}>
                    {user?.isCompany ? 'Компания' : 'Мастер'}
                  </Text>
                  {user?.bio && (
                    <Paragraph style={styles.profileBio}>{user.bio}</Paragraph>
                  )}
                </View>
                
                <View style={styles.profileStats}>
                  <TouchableOpacity style={styles.statContainer} onPress={handleSubscribersPress}>
                    <Text style={styles.statNumber}>{user?.subscribersCount || 0}</Text>
                    <Text style={styles.statLabel}>Подписчиков</Text>
                  </TouchableOpacity>
                  <View style={styles.statContainer}>
                    <Text style={styles.statNumber}>{videos.length}</Text>
                    <Text style={styles.statLabel}>Видео</Text>
                  </View>
                  <View style={styles.statContainer}>
                    <Text style={styles.statNumber}>{user?.rating || 'Нет'}</Text>
                    <Text style={styles.statLabel}>Рейтинг</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleCreateVideo}
                style={styles.actionButton}
                icon="video-plus"
              >
                Создать видеорекламу
              </Button>
              <Button
                mode="outlined"
                onPress={handleSupportPress}
                style={styles.actionButton}
                icon="help-circle"
              >
                Поддержка
              </Button>
            </View>

            {/* Settings */}
            <Card style={styles.settingsCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Настройки</Title>
                
                <TouchableOpacity style={styles.settingItem} onPress={handleEditProfile}>
                  <Ionicons name="person" size={24} color="#666" />
                  <Text style={styles.settingText}>Редактировать профиль</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem} onPress={handleSubscribersPress}>
                  <Ionicons name="people" size={24} color="#666" />
                  <Text style={styles.settingText}>Подписчики</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem} onPress={handleSupportPress}>
                  <Ionicons name="chatbubble" size={24} color="#666" />
                  <Text style={styles.settingText}>Служба поддержки</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
                
                <Divider style={styles.divider} />
                
                <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                  <Ionicons name="log-out" size={24} color="#F44336" />
                  <Text style={[styles.settingText, { color: '#F44336' }]}>Выйти</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              </Card.Content>
            </Card>

            {/* Videos Section */}
            <View style={styles.videosHeader}>
              <Title style={styles.sectionTitle}>Мои видеорекламы</Title>
              <Text style={styles.videosCount}>{videos.length} видео</Text>
            </View>
          </>
        }
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.videosList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Нет видеореклам</Text>
            <Text style={styles.emptySubtext}>
              Создайте свое первое видеорекламу
            </Text>
            <Button
              mode="contained"
              onPress={handleCreateVideo}
              style={styles.emptyButton}
              icon="video-plus"
            >
              Создать видео
            </Button>
          </View>
        }
      />
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
  profileCard: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileBio: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statContainer: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  divider: {
    marginVertical: 8,
  },
  videosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  videosCount: {
    fontSize: 14,
    color: '#666',
  },
  videosList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  videoCard: {
    flex: 1,
    margin: 4,
    elevation: 2,
    position: 'relative',
  },
  thumbnail: {
    height: 120,
  },
  videoContent: {
    padding: 8,
  },
  videoTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  videoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
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
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
});

export default MasterProfileScreen;
