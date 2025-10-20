import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalVideos: 0,
    unreadMessages: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Загружаем статистику и последние видео
      const [videosResponse] = await Promise.all([
        apiService.getVideos(1, 5),
      ]);

      if (videosResponse.success) {
        setRecentVideos(videosResponse.data);
      }

      // Мокаем статистику для демонстрации
      setStats({
        totalOrders: 12,
        activeOrders: 3,
        completedOrders: 9,
        totalVideos: 45,
        unreadMessages: 2,
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title style={styles.greeting}>
              {getGreeting()}, {user?.username}!
            </Title>
            <Paragraph style={styles.subtitle}>
              Добро пожаловать в MebelPlace
            </Paragraph>
            <Chip
              icon="account"
              style={styles.roleChip}
            >
              {user?.role === 'customer' ? 'Покупатель' : 'Поставщик'}
            </Chip>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Быстрые действия</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="play-outline"
                onPress={() => navigation.navigate('Видео')}
                style={styles.actionButton}
                buttonColor="#000"
              >
                Видео
              </Button>
              <Button
                mode="contained"
                icon="add-outline"
                onPress={() => navigation.navigate('Заявки всем', { screen: 'CreateOrder' })}
                style={styles.actionButton}
                buttonColor="#000"
              >
                Создать заявку
              </Button>
            </View>
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                icon="camera-outline"
                onPress={() => navigation.navigate('Видео', { screen: 'Camera' })}
                style={styles.actionButton}
                textColor="#000"
              >
                Камера
              </Button>
              <Button
                mode="outlined"
                icon="chatbubble-outline"
                onPress={() => navigation.navigate('Чат')}
                style={styles.actionButton}
                textColor="#000"
              >
                Сообщения
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Статистика</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalOrders}</Text>
                <Text style={styles.statLabel}>Всего заявок</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.activeOrders}</Text>
                <Text style={styles.statLabel}>Активные</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.completedOrders}</Text>
                <Text style={styles.statLabel}>Завершенные</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalVideos}</Text>
                <Text style={styles.statLabel}>Видео</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Videos */}
        {recentVideos.length > 0 && (
          <Card style={styles.videosCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Последние видео</Title>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentVideos.map((video: any, index) => (
                  <Card
                    key={video.id || index}
                    style={[styles.videoCard, { width: width * 0.6 }]}
                    onPress={() => navigation.navigate('Видео', { 
                      screen: 'TikTokPlayer', 
                      params: { videos: recentVideos, initialIndex: index } 
                    })}
                  >
                    <Card.Cover
                      source={{ uri: video.thumbnail || 'https://via.placeholder.com/300x200' }}
                      style={styles.videoThumbnail}
                    />
                    <Card.Content style={styles.videoContent}>
                      <Paragraph numberOfLines={2} style={styles.videoTitle}>
                        {video.title || 'Без названия'}
                      </Paragraph>
                      <Text style={styles.videoStats}>
                        <Ionicons name="eye" size={12} color="#666" /> {video.views || 0}
                        {' • '}
                        <Ionicons name="heart" size={12} color="#666" /> {video.likes || 0}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Notifications */}
        {stats.unreadMessages > 0 && (
          <Card style={styles.notificationCard}>
            <Card.Content>
              <View style={styles.notificationContent}>
                <Ionicons name="mail-unread-outline" size={24} color="#000" />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>Новые сообщения</Text>
                  <Text style={styles.notificationSubtitle}>
                    У вас {stats.unreadMessages} непрочитанных сообщений
                  </Text>
                </View>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Чат')}
                  textColor="#000"
                >
                  Открыть
                </Button>
              </View>
            </Card.Content>
          </Card>
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  videosCard: {
    marginBottom: 16,
    elevation: 2,
  },
  videoCard: {
    marginRight: 12,
    elevation: 1,
  },
  videoThumbnail: {
    height: 120,
  },
  videoContent: {
    paddingTop: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  videoStats: {
    fontSize: 12,
    color: '#666',
  },
  notificationCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#f5f5f5',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
