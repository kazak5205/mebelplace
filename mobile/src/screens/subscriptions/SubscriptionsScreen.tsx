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
import type { Master } from '@shared/types';

const SubscriptionsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [masters, setMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await subscriptionService.get();
      
      if (response.success) {
        setMasters(response.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSubscriptions(true);
  }, []);

  const handleUnsubscribe = async (masterId: string, masterName: string) => {
    Alert.alert(
      'Отписаться',
      `Вы уверены, что хотите отписаться от ${masterName}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отписаться',
          onPress: async () => {
            try {
              const response = await subscriptionService.unsubscribe(masterId);
              
              if (response.success) {
                setMasters(prev => prev.filter(master => master.id !== masterId));
                Alert.alert('Успех', 'Вы отписались от мастера');
              } else {
                Alert.alert('Ошибка', 'Не удалось отписаться');
              }
            } catch (error) {
              console.error('Error unsubscribing:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при отписке');
            }
          },
        },
      ]
    );
  };

  const handleMasterPress = (master: Master) => {
    navigation.navigate('MasterChannel', { 
      masterId: master.id, 
      masterName: master.name 
    });
  };

  const filteredMasters = masters.filter(master =>
    master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMaster = ({ item }: { item: Master }) => (
    <Card style={styles.masterCard}>
      <TouchableOpacity onPress={() => handleMasterPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.masterHeader}>
            <Avatar.Text 
              size={50} 
              label={item.name.charAt(0).toUpperCase()} 
              style={styles.avatar}
            />
            <View style={styles.masterInfo}>
              <Title style={styles.masterName}>{item.name}</Title>
              <Text style={styles.masterType}>
                {item.isCompany ? 'Компания' : 'Мастер'}
              </Text>
              {item.subscribersCount && (
                <Text style={styles.subscribersCount}>
                  {item.subscribersCount} подписчиков
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => handleUnsubscribe(item.id, item.name)}
              style={styles.unsubscribeButton}
            >
              <Ionicons name="heart-dislike" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
          
          {item.description && (
            <Paragraph style={styles.masterDescription} numberOfLines={2}>
              {item.description}
            </Paragraph>
          )}
          
          <View style={styles.masterStats}>
            <View style={styles.statItem}>
              <Ionicons name="videocam" size={16} color="#666" />
              <Text style={styles.statText}>{item.videosCount || 0} видео</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{item.rating || 'Нет'}</Text>
            </View>
            <Chip 
              mode="outlined" 
              style={styles.subscribedChip}
              textStyle={{ color: '#4CAF50' }}
            >
              Подписан
            </Chip>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  if (isLoading && masters.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка подписок...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Мои подписки</Title>
        <View style={styles.placeholder} />
      </View>
      
      <Searchbar
        placeholder="Поиск мастеров..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {filteredMasters.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'Мастера не найдены' : 'Нет подписок'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Подпишитесь на мастеров, чтобы видеть их новые видео'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMasters}
          renderItem={renderMaster}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  masterCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  masterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  masterType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  subscribersCount: {
    fontSize: 12,
    color: '#3b82f6',
  },
  unsubscribeButton: {
    padding: 8,
  },
  masterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  masterStats: {
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
  subscribedChip: {
    alignSelf: 'flex-start',
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

export default SubscriptionsScreen;
