import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';

interface Order {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  category: string;
  created_at: string;
  response_count: number;
  client_username: string;
  client_first_name: string;
  client_last_name: string;
  client_avatar: string;
}

const MasterOrdersScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({ page: 1, limit: 20 });
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleOrderPress = (order: Order) => {
    // Navigate to order details
    // navigation.navigate('OrderDetails' as never, { orderId: order.id } as never);
  };

  const handleRespondToOrder = async (order: Order) => {
    try {
      // TODO: Implement response to order
      Alert.alert('Отклик', 'Функция отклика на заявку будет добавлена в следующих версиях');
    } catch (error) {
      console.error('Error responding to order:', error);
      Alert.alert('Ошибка', 'Не удалось откликнуться на заявку');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'accepted':
        return 'Принято';
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
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.orderDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.orderMeta}>
            <Text style={styles.orderCategory}>{item.category}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </View>
        
        {item.images && item.images.length > 0 && (
          <Image 
            source={{ uri: `https://mebelplace.com.kz${item.images[0]}` }}
            style={styles.orderImage}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.respondButton}
          onPress={() => handleRespondToOrder(item)}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#f97316" />
          <Text style={styles.respondText}>
            Ответить на заявку
          </Text>
        </TouchableOpacity>
      </View>

      {/* Client Info */}
      <View style={styles.clientInfo}>
        <Image 
          source={{ 
            uri: item.client_avatar 
              ? `https://mebelplace.com.kz${item.client_avatar}` 
              : 'https://via.placeholder.com/30'
          }}
          style={styles.clientAvatar}
        />
        <Text style={styles.clientName}>
          {item.client_first_name} {item.client_last_name}
        </Text>
        <Text style={styles.clientUsername}>
          @{item.client_username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка заявок...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Все заявки</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Нет заявок</Text>
          <Text style={styles.emptyDescription}>
            Новые заявки от клиентов будут появляться здесь
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  filterButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  orderDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCategory: {
    fontSize: 12,
    color: '#f97316',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  respondText: {
    fontSize: 12,
    color: '#f97316',
    marginLeft: 4,
    fontWeight: '600',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  clientAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  clientUsername: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default MasterOrdersScreen;
