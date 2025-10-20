import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
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

const OrdersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

      const response = await apiService.getOrders(pageNum, 10);
      
      if (response.success) {
        const newOrders = response.data;
        
        if (isRefresh || pageNum === 1) {
          setOrders(newOrders);
        } else {
          setOrders(prev => [...prev, ...newOrders]);
        }
        
        setHasMore(newOrders.length === 10);
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
  }, []);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadOrders(page + 1, false);
    }
  }, [isLoading, hasMore, page]);

  const handleOrderPress = (order: Order) => {
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption?.color || '#666';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(option => option.key === status);
    return statusOption?.label || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard} onPress={() => handleOrderPress(item)}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <Title style={styles.orderTitle} numberOfLines={2}>
            {item.title}
          </Title>
          <Chip
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusLabel(item.status)}
          </Chip>
        </View>
        
        <Paragraph style={styles.orderDescription} numberOfLines={3}>
          {item.description}
        </Paragraph>
        
        <View style={styles.orderInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>{item.client.name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="folder" size={16} color="#666" />
            <Text style={styles.infoText}>{item.category}</Text>
          </View>
          
          {item.budget && (
            <View style={styles.infoItem}>
              <Ionicons name="cash" size={16} color="#666" />
              <Text style={styles.infoText}>{item.budget.toLocaleString()} ₸</Text>
            </View>
          )}
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.dateText}>
            {formatDate(item.createdAt)}
          </Text>
          
          <View style={styles.responsesInfo}>
            <Ionicons name="chatbubbles" size={16} color="#666" />
            <Text style={styles.responsesText}>
              {item.responses.length} откликов
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Поиск заявок..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.statusContainer}>
        <FlatList
          data={statusOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Chip
              selected={selectedStatus === item.key}
              onPress={() => setSelectedStatus(item.key)}
              style={[
                styles.statusChip,
                selectedStatus === item.key && { backgroundColor: item.color + '20' }
              ]}
              textStyle={[
                styles.statusChipText,
                selectedStatus === item.key && { color: item.color }
              ]}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || orders.length === 0) return null;
    
    return (
      <View style={styles.footer}>
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
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  statusChipText: {
    color: '#666',
  },
  orderCard: {
    marginBottom: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  orderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  responsesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responsesText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#f97316',
  },
});

export default OrdersScreen;
