import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  Avatar,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

interface OrderDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  customer: {
    id: string;
    username: string;
    avatar?: string;
    phone?: string;
  };
  responses: Array<{
    id: string;
    supplier: {
      id: string;
      username: string;
      avatar?: string;
    };
    message: string;
    price?: number;
    timeline?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrderById(orderId);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить заявку');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке заявки');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!order) return;
    
    Alert.prompt(
      'Отклик на заявку',
      'Введите ваше предложение:',
      async (message) => {
        if (!message?.trim()) return;
        
        try {
          setIsResponding(true);
          const response = await apiService.respondToOrder(order.id, {
            message: message.trim(),
          });
          
          if (response.success) {
            Alert.alert('Успех', 'Ваш отклик отправлен');
            loadOrderDetails(); // Перезагружаем данные
          } else {
            Alert.alert('Ошибка', 'Не удалось отправить отклик');
          }
        } catch (error) {
          console.error('Error responding to order:', error);
          Alert.alert('Ошибка', 'Произошла ошибка при отправке отклика');
        } finally {
          setIsResponding(false);
        }
      }
    );
  };

  const handleAcceptResponse = async (responseId: string) => {
    if (!order) return;
    
    Alert.alert(
      'Принять отклик',
      'Вы уверены, что хотите принять этот отклик?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Принять',
          onPress: async () => {
            try {
              const response = await apiService.acceptOrderResponse(order.id, responseId);
              
              if (response.success) {
                Alert.alert('Успех', 'Отклик принят');
                loadOrderDetails();
              } else {
                Alert.alert('Ошибка', 'Не удалось принять отклик');
              }
            } catch (error) {
              console.error('Error accepting response:', error);
              Alert.alert('Ошибка', 'Произошла ошибка');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in_progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Отменено';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка заявки...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Заявка не найдена</Text>
        <Button onPress={() => navigation.goBack()}>
          Назад
        </Button>
      </View>
    );
  }

  const isCustomer = user?.id === order.customer.id;
  const canRespond = !isCustomer && user?.role === 'supplier' && order.status === 'pending';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Order Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerTop}>
              <Title style={styles.orderTitle}>{order.title}</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) + '20' }]}
                textStyle={{ color: getStatusColor(order.status) }}
              >
                {getStatusLabel(order.status)}
              </Chip>
            </View>
            
            <Paragraph style={styles.orderDescription}>
              {order.description}
            </Paragraph>
            
            <View style={styles.orderInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="folder" size={16} color="#666" />
                <Text style={styles.infoText}>{order.category}</Text>
              </View>
              
              {order.budget && (
                <View style={styles.infoItem}>
                  <Ionicons name="cash" size={16} color="#666" />
                  <Text style={styles.infoText}>{order.budget.toLocaleString()} ₸</Text>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.infoText}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Customer Info */}
        <Card style={styles.customerCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Заказчик</Title>
            <View style={styles.customerInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: order.customer.avatar }}
                style={styles.customerAvatar}
              />
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.customer.username}</Text>
                {order.customer.phone && (
                  <Text style={styles.customerPhone}>{order.customer.phone}</Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Responses */}
        <Card style={styles.responsesCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>
              Отклики ({order.responses.length})
            </Title>
            
            {order.responses.length === 0 ? (
              <Text style={styles.noResponsesText}>Пока нет откликов</Text>
            ) : (
              order.responses.map((response, index) => (
                <View key={response.id}>
                  <View style={styles.responseItem}>
                    <Avatar.Image
                      size={40}
                      source={{ uri: response.supplier.avatar }}
                      style={styles.responseAvatar}
                    />
                    <View style={styles.responseContent}>
                      <View style={styles.responseHeader}>
                        <Text style={styles.responseAuthor}>
                          {response.supplier.username}
                        </Text>
                        <Text style={styles.responseDate}>
                          {formatDate(response.createdAt)}
                        </Text>
                      </View>
                      
                      <Text style={styles.responseMessage}>
                        {response.message}
                      </Text>
                      
                      {response.price && (
                        <Text style={styles.responsePrice}>
                          Цена: {response.price.toLocaleString()} ₸
                        </Text>
                      )}
                      
                      {response.timeline && (
                        <Text style={styles.responseTimeline}>
                          Срок: {response.timeline}
                        </Text>
                      )}
                      
                      {isCustomer && order.status === 'pending' && (
                        <Button
                          mode="contained"
                          onPress={() => handleAcceptResponse(response.id)}
                          style={styles.acceptButton}
                          compact
                        >
                          Принять
                        </Button>
                      )}
                    </View>
                  </View>
                  
                  {index < order.responses.length - 1 && <Divider style={styles.responseDivider} />}
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Action Button */}
        {canRespond && (
          <Button
            mode="contained"
            onPress={handleRespond}
            loading={isResponding}
            disabled={isResponding}
            style={styles.respondButton}
            icon="message"
          >
            Откликнуться
          </Button>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  orderDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  customerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  responsesCard: {
    marginBottom: 16,
    elevation: 2,
  },
  noResponsesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  responseItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  responseAvatar: {
    marginRight: 12,
  },
  responseContent: {
    flex: 1,
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  responseDate: {
    fontSize: 12,
    color: '#666',
  },
  responseMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  responsePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  responseTimeline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  acceptButton: {
    alignSelf: 'flex-start',
  },
  responseDivider: {
    marginVertical: 8,
  },
  respondButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
});

export default OrderDetailsScreen;
