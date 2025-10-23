import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { orderStatusService } from '../../services/orderStatusService';
import type { OrderStatusHistory } from '@shared/types';

const OrderStatusHistoryScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatusHistory();
  }, [orderId]);

  const loadStatusHistory = async () => {
    try {
      setIsLoading(true);
      const response = await orderStatusService.getHistory(orderId);
      
      if (response.success) {
        setHistory(response.data);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить историю статусов');
      }
    } catch (error) {
      console.error('Error loading status history:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке истории');
    } finally {
      setIsLoading(false);
    }
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
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
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
      case 'accepted':
        return 'Принято';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const renderHistoryItem = ({ item, index }: { item: OrderStatusHistory; index: number }) => (
    <View style={styles.historyItem}>
      <View style={styles.timelineContainer}>
        <View style={[
          styles.timelineDot,
          { backgroundColor: getStatusColor(item.status) }
        ]} />
        {index < history.length - 1 && <View style={styles.timelineLine} />}
      </View>
      
      <Card style={styles.historyCard}>
        <Card.Content>
          <View style={styles.historyHeader}>
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
            <Text style={styles.historyDate}>
              {new Date(item.createdAt).toLocaleString('ru-RU')}
            </Text>
          </View>
          
          {item.reason && (
            <Paragraph style={styles.reasonText}>
              {item.reason}
            </Paragraph>
          )}
          
          {item.changedBy && (
            <Text style={styles.changedByText}>
              Изменено: {item.changedBy.name}
            </Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка истории...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>История статусов</Title>
        <View style={styles.placeholder} />
      </View>
      
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>История пуста</Text>
          <Text style={styles.emptySubtext}>
            Пока нет изменений статуса заявки
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
  historyItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    minHeight: 40,
  },
  historyCard: {
    flex: 1,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  changedByText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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

export default OrderStatusHistoryScreen;
