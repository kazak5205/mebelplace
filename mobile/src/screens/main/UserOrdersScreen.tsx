import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  FAB,
  Searchbar,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { apiService } from '../../services/apiService';
import type { Order } from '@shared/types';

const UserOrdersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pinnedOrders, setPinnedOrders] = useState<string[]>([]);

  const statusOptions = [
    { key: 'all', label: 'Все', color: '#666' },
    { key: 'pending', label: 'Ожидает', color: '#FF9800' },
    { key: 'in_progress', label: 'В работе', color: '#3b82f6' },
    { key: 'completed', label: 'Завершено', color: '#4CAF50' },
    { key: 'cancelled', label: 'Отменено', color: '#F44336' },
  ];

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, searchQuery]);

  const loadOrders = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await apiService.getOrders(pageNum, 20);
      
      if (response.success) {
        const newOrders = response.data;
        
        if (isRefresh || pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }
        
        setHasMore(newOrders.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadOrders(1, true);
  }, [selectedStatus, searchQuery]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadOrders(page + 1);
    }
  }, [hasMore, isLoading, page, selectedStatus, searchQuery]);

  const handleDeleteOrder = async (orderId: string, orderTitle: string) => {
    Alert.alert(
      'Удалить заявку',
      `Вы уверены, что хотите удалить заявку "${orderTitle}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              const response = await apiService.deleteOrder(orderId);
              
              if (response.success) {
                setOrders(prev => prev.filter(order => order.id !== orderId));
                setPinnedOrders(prev => prev.filter(id => id !== orderId));
                Alert.alert('Успех', 'Заявка удалена');
              } else {
                Alert.alert('Ошибка', 'Не удалось удалить заявку');
              }
            } catch (error) {
              console.error('Error deleting order:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении');
            }
          },
        },
      ]
    );
  };

  const handlePinOrder = (orderId: string) => {
    setPinnedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderResponses', { orderId: order.id });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'in_progress':
        return 'В работе';
      case 'completed':
        return 'Завершено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const filteredOrders = orders
    .filter(order => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        return order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               order.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      // Сначала закрепленные заявки
      const aPinned = pinnedOrders.includes(a.id);
      const bPinned = pinnedOrders.includes(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      // Затем по дате создания
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const SwipeableOrderCard = ({ order }: { order: Order }) => {
    const translateX = new Animated.Value(0);
    const [showActions, setShowActions] = useState(false);

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX } = event.nativeEvent;
        
        if (translationX < -100) {
          // Показать действия
          Animated.spring(translateX, {
            toValue: -120,
            useNativeDriver: true,
          }).start();
          setShowActions(true);
        } else {
          // Скрыть действия
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setShowActions(false);
        }
      }
    };

    const hideActions = () => {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      setShowActions(false);
    };

    return (
      <View style={styles.swipeContainer}>
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.pinButton]}
            onPress={() => {
              handlePinOrder(order.id);
              hideActions();
            }}
          >
            <Ionicons 
              name={pinnedOrders.includes(order.id) ? "pin" : "pin-outline"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {pinnedOrders.includes(order.id) ? 'Открепить' : 'Закрепить'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              handleDeleteOrder(order.id, order.title);
              hideActions();
            }}
          >
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.actionButtonText}>Удалить</Text>
          </TouchableOpacity>
        </View>

        {/* Order Card */}
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.orderCard,
              { transform: [{ translateX }] }
            ]}
          >
            <TouchableOpacity onPress={() => handleOrderPress(order)}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Title style={styles.orderTitle}>{order.title}</Title>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </Text>
                    {pinnedOrders.includes(order.id) && (
                      <Chip 
                        mode="outlined" 
                        style={styles.pinnedChip}
                        textStyle={{ color: '#FFD700' }}
                      >
                        Закреплено
                      </Chip>
                    )}
                  </View>
                  <Chip 
                    mode="outlined" 
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(order.status) }
                    ]}
                    textStyle={{ color: 'white' }}
                  >
                    {getStatusLabel(order.status)}
                  </Chip>
                </View>
                
                <Paragraph style={styles.orderDescription} numberOfLines={3}>
                  {order.description}
                </Paragraph>
                
                <View style={styles.orderFooter}>
                  <View style={styles.orderStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="chatbubble" size={16} color="#666" />
                      <Text style={styles.statText}>{order.responsesCount || 0} откликов</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="eye" size={16} color="#666" />
                      <Text style={styles.statText}>{order.viewsCount || 0} просмотров</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity style={styles.responsesButton}>
                    <Text style={styles.responsesButtonText}>Ответы на заявку</Text>
                    <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <SwipeableOrderCard order={item} />
  );

  const renderFooter = () => {
    if (!isLoading || orders.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка заявок...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Мои заявки</Title>
        <View style={styles.placeholder} />
      </View>
      
      <Searchbar
        placeholder="Поиск заявок..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {/* Status Filter */}
      <View style={styles.statusContainer}>
        <FlatList
          horizontal
          data={statusOptions}
          renderItem={({ item }) => (
            <Chip
              mode={selectedStatus === item.key ? 'flat' : 'outlined'}
              selected={selectedStatus === item.key}
              onPress={() => setSelectedStatus(item.key)}
              style={styles.statusChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusList}
        />
      </View>
      
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery || selectedStatus !== 'all' ? 'Заявки не найдены' : 'Нет заявок'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedStatus !== 'all'
              ? 'Попробуйте изменить фильтры'
              : 'Создайте свою первую заявку'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
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
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateOrder')}
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
  placeholder: {
    width: 24,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  statusContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusList: {
    paddingHorizontal: 16,
  },
  statusChip: {
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
  swipeContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  actionButtons: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  pinButton: {
    backgroundColor: '#FFD700',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: 'white',
    elevation: 2,
    zIndex: 2,
  },
  cardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  pinnedChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  orderDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  responsesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responsesButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    marginRight: 4,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserOrdersScreen;
