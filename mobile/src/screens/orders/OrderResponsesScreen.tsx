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
  Button,
  ActivityIndicator,
  Avatar,
  Chip,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { apiService } from '../../services/apiService';
import type { OrderResponse } from '@shared/types';

const OrderResponsesScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [responses, setResponses] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, [orderId]);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      // Синхронизировано с web: getOrderResponses возвращает responses
      const responses = await apiService.getOrderResponses(orderId);
      setResponses(responses || []);
    } catch (error) {
      console.error('Error loading responses:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке откликов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptResponse = async (responseId: string) => {
    Alert.alert(
      'Принять отклик',
      'Вы уверены, что хотите принять этот отклик?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Принять',
          onPress: async () => {
            try {
              // Синхронизировано с web: acceptOrderResponse возвращает result
              await apiService.acceptOrderResponse(orderId, responseId);
              Alert.alert('Успех', 'Отклик принят');
              loadResponses();
            } catch (error) {
              console.error('Error accepting response:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при принятии отклика');
            }
          },
        },
      ]
    );
  };

  const handleRejectResponse = async (responseId: string) => {
    Alert.alert(
      'Отклонить отклик',
      'Вы уверены, что хотите отклонить этот отклик?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отклонить',
          onPress: async () => {
            try {
              // Синхронизировано с web: rejectOrderResponse возвращает result
              await apiService.rejectOrderResponse(orderId, responseId);
              Alert.alert('Успех', 'Отклик отклонен');
              loadResponses();
            } catch (error) {
              console.error('Error rejecting response:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при отклонении отклика');
            }
          },
        },
      ]
    );
  };

  const handleGoToChat = (masterId: string, masterName: string) => {
    navigation.navigate('Chat', {
      masterId,
      masterName,
      orderId,
    });
  };

  const renderResponse = ({ item }: { item: OrderResponse }) => (
    <Card style={styles.responseCard}>
      <Card.Content>
        <View style={styles.responseHeader}>
          <Avatar.Text 
            size={40} 
            label={item.master.name.charAt(0).toUpperCase()} 
            style={styles.avatar}
          />
          <View style={styles.masterInfo}>
            <Title style={styles.masterName}>{item.master.name}</Title>
            <Text style={styles.responseDate}>
              {new Date(item.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            style={[
              styles.statusChip,
              { backgroundColor: item.status === 'accepted' ? '#4CAF50' : '#FF9800' }
            ]}
          >
            {item.status === 'accepted' ? 'Принят' : 'Ожидает'}
          </Chip>
        </View>
        
        <Paragraph style={styles.responseMessage}>
          {item.message}
        </Paragraph>
        
        {item.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Предложенная цена:</Text>
            <Text style={styles.priceValue}>{item.price} ₸</Text>
          </View>
        )}
        
        {item.deliveryTime && (
          <View style={styles.deliveryContainer}>
            <Text style={styles.deliveryLabel}>Срок изготовления:</Text>
            <Text style={styles.deliveryValue}>{item.deliveryTime}</Text>
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <View style={styles.actionsContainer}>
          <Button
            mode="outlined"
            onPress={() => handleGoToChat(item.master.id, item.master.name)}
            style={styles.chatButton}
            icon="message"
          >
            В чат
          </Button>
          
          {item.status !== 'accepted' && (
            <>
              <Button
                mode="contained"
                onPress={() => handleAcceptResponse(item.id)}
                style={styles.acceptButton}
                icon="check"
              >
                Принять
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleRejectResponse(item.id)}
                style={styles.rejectButton}
                icon="close"
                buttonColor="#F44336"
                textColor="white"
              >
                Отклонить
              </Button>
            </>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка откликов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Отклики на заявку</Title>
        <View style={styles.placeholder} />
      </View>
      
      {responses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Пока нет откликов</Text>
          <Text style={styles.emptySubtext}>
            Мастера еще не откликнулись на вашу заявку
          </Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          renderItem={renderResponse}
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
  responseCard: {
    marginBottom: 16,
    elevation: 2,
  },
  responseHeader: {
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
  responseDate: {
    fontSize: 12,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  responseMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatButton: {
    flex: 1,
    marginRight: 8,
  },
  acceptButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 4,
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

export default OrderResponsesScreen;
