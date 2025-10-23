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
  Avatar,
  Chip,
  Searchbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import type { User } from '@shared/types';

const SubscribersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      // Предполагаем, что у нас есть endpoint для получения подписчиков мастера
      const response = await subscriptionService.getSubscribers(user?.id || '', pageNum, 20);
      
      if (response.success) {
        const newSubscribers = response.data;
        
        if (isRefresh || pageNum === 1) {
          setSubscribers(newSubscribers);
        } else {
          setSubscribers(prev => [...prev, ...newSubscribers]);
        }
        
        setHasMore(newSubscribers.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadSubscribers(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadSubscribers(page + 1);
    }
  }, [hasMore, isLoading, page]);

  const handleUserPress = (subscriber: User) => {
    // Можно перейти к профилю пользователя или начать чат
    navigation.navigate('Chat', {
      userId: subscriber.id,
      userName: subscriber.name,
    });
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Заблокировать пользователя',
      `Вы уверены, что хотите заблокировать ${userName}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Заблокировать',
          onPress: async () => {
            try {
              // Здесь должен быть вызов API для блокировки пользователя
              // const response = await userService.blockUser(userId);
              
              Alert.alert('Успех', 'Пользователь заблокирован');
              // Обновляем список подписчиков
              loadSubscribers(1, true);
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при блокировке');
            }
          },
        },
      ]
    );
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.phone?.includes(searchQuery)
  );

  const renderSubscriber = ({ item }: { item: User }) => (
    <Card style={styles.subscriberCard}>
      <TouchableOpacity onPress={() => handleUserPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.subscriberHeader}>
            <Avatar.Text 
              size={50} 
              label={item.name.charAt(0).toUpperCase()} 
              style={styles.avatar}
            />
            <View style={styles.subscriberInfo}>
              <Title style={styles.subscriberName}>{item.name}</Title>
              <Text style={styles.subscriberPhone}>{item.phone}</Text>
              <Text style={styles.subscribedDate}>
                Подписался: {new Date(item.subscribedAt || item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleBlockUser(item.id, item.name)}
              style={styles.blockButton}
            >
              <Ionicons name="ban" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
          
          {item.bio && (
            <Paragraph style={styles.subscriberBio} numberOfLines={2}>
              {item.bio}
            </Paragraph>
          )}
          
          <View style={styles.subscriberStats}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={16} color="#666" />
              <Text style={styles.statText}>Написать</Text>
            </View>
            <Chip 
              mode="outlined" 
              style={styles.subscriberChip}
              textStyle={{ color: '#4CAF50' }}
            >
              Подписчик
            </Chip>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderFooter = () => {
    if (!isLoading || subscribers.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isLoading && subscribers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка подписчиков...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Подписчики</Title>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Всего подписчиков: {subscribers.length}
        </Text>
      </View>
      
      <Searchbar
        placeholder="Поиск подписчиков..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {filteredSubscribers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Подписчики не найдены' : 'Нет подписчиков'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Пока никто не подписался на ваш канал'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubscribers}
          renderItem={renderSubscriber}
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
  statsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subscriberCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  subscriberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  subscriberInfo: {
    flex: 1,
  },
  subscriberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subscriberPhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  subscribedDate: {
    fontSize: 12,
    color: '#3b82f6',
  },
  blockButton: {
    padding: 8,
  },
  subscriberBio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  subscriberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  subscriberChip: {
    alignSelf: 'flex-start',
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

export default SubscribersScreen;
