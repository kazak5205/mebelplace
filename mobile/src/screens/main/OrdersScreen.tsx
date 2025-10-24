/**
 * OrdersScreen - TikTok-style orders list for users
 * Синхронизировано с web OrdersPage - dark theme, glass effect, animations
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { FadeInView } from '../../components/TikTokAnimations';

interface Order {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  category: string;
  region: string;
  created_at: string;
  response_count: number;
}

const OrdersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({ page: 1, limit: 50 });
      setOrders(response.orders || []);
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'in_progress': return '#60a5fa';
      case 'completed': return '#34d399';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const renderOrder = ({ item, index }: { item: Order; index: number }) => (
    <FadeInView delay={index * 50}>
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderTitleSection}>
                <Text style={styles.orderTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.orderDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              
              {item.images && item.images.length > 0 && (
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.orderThumbnail}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Meta */}
            <View style={styles.orderMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText}>{item.category || 'Без категории'}</Text>
              </View>
              
              {item.region && (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.metaText}>{item.region}</Text>
                </View>
              )}
              
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText}>
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.orderFooter}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
              
              {item.response_count > 0 && (
                <TouchableOpacity
                  style={styles.responsesButton}
                  onPress={() => navigation.navigate('OrderResponses', { orderId: item.id })}
                >
                  <Ionicons name="chatbubbles" size={16} color="#f97316" />
                  <Text style={styles.responsesText}>{item.response_count} откликов</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </FadeInView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search & Filter - TikTok Style */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск заявок..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <View style={styles.filters}>
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'Ожидает' },
            { key: 'in_progress', label: 'В работе' },
            { key: 'completed', label: 'Завершено' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                statusFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                statusFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyText}>Нет заявок</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Попробуйте изменить запрос' : 'Создайте первую заявку'}
            </Text>
          </View>
        }
      />

      {/* FAB - Create Order */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateOrder')}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#f97316', '#ea580c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
  header: {
    backgroundColor: '#111',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  filterText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  orderTitleSection: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  orderDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  orderThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  responsesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  responsesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f97316',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrdersScreen;
