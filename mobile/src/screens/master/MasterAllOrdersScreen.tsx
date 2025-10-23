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
  Chip,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { apiService } from '../../services/apiService';
import type { Order } from '@shared/types';

const MasterAllOrdersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { key: 'all', label: 'Все' },
    { key: 'kitchen', label: 'Кухни' },
    { key: 'bedroom', label: 'Спальни' },
    { key: 'living', label: 'Гостиные' },
    { key: 'children', label: 'Детские' },
    { key: 'office', label: 'Офисная' },
    { key: 'bathroom', label: 'Ванная' },
    { key: 'other', label: 'Другое' },
  ];

  useEffect(() => {
    loadOrders();
  }, [selectedCategory, searchQuery]);

  const loadOrders = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await apiService.getOrders(pageNum, 20);
      
      if (response.success) {
        const newOrders = response.data;
        
        // Фильтруем по категории и поиску
        let filteredOrders = newOrders;
        
        if (selectedCategory !== 'all') {
          filteredOrders = filteredOrders.filter(order => 
            order.category === selectedCategory
          );
        }
        
        if (searchQuery.trim()) {
          filteredOrders = filteredOrders.filter(order =>
            order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (isRefresh || pageNum === 1) {
          setOrders(filteredOrders);
        } else {
          setOrders(prev => [...prev, ...filteredOrders]);
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
  }, [selectedCategory, searchQuery]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadOrders(page + 1);
    }
  }, [hasMore, isLoading, page, selectedCategory, searchQuery]);

  const handleRespondToOrder = (order: Order) => {
    navigation.navigate('RespondToOrder', { orderId: order.id });
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

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Title style={styles.orderTitle}>{item.title}</Title>
              <Text style={styles.orderUser}>Заказчик: {item.user.name}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString('ru-RU')}
              </Text>
            </View>
            <Chip 
              mode="outlined" 
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) }
              ]}
              textStyle={{ color: 'white' }}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          
          <Paragraph style={styles.orderDescription} numberOfLines={3}>
            {item.description}
          </Paragraph>
          
          <View style={styles.orderFooter}>
            <View style={styles.orderStats}>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={16} color="#666" />
                <Text style={styles.statText}>{item.responsesCount || 0} откликов</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="eye" size={16} color="#666" />
                <Text style={styles.statText}>{item.viewsCount || 0} просмотров</Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={() => handleRespondToOrder(item)}
              style={styles.respondButton}
              icon="reply"
            >
              Откликнуться
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
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
        <Title style={styles.headerTitle}>Все заявки</Title>
        <View style={styles.placeholder} />
      </View>
      
      <Searchbar
        placeholder="Поиск заявок..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <Chip
              mode={selectedCategory === item.key ? 'flat' : 'outlined'}
              selected={selectedCategory === item.key}
              onPress={() => setSelectedCategory(item.key)}
              style={styles.categoryChip}
            >
              {item.label}
            </Chip>
          )}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery || selectedCategory !== 'all' ? 'Заявки не найдены' : 'Нет заявок'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedCategory !== 'all'
              ? 'Попробуйте изменить фильтры'
              : 'Пока нет новых заявок от клиентов'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
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
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
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
  orderCard: {
    marginBottom: 16,
    elevation: 2,
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
  orderUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  statusChip: {
    alignSelf: 'flex-start',
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
  respondButton: {
    alignSelf: 'flex-end',
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

export default MasterAllOrdersScreen;
