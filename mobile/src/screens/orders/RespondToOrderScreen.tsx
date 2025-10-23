import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  ActivityIndicator,
  Avatar,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { apiService } from '../../services/apiService';
import type { Order } from '@shared/types';

const RespondToOrderScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

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

  const handleSubmitResponse = async () => {
    if (!message.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите сообщение');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiService.respondToOrder(orderId, {
        message: message.trim(),
        price: price.trim() || undefined,
        deliveryTime: deliveryTime.trim() || undefined,
        additionalInfo: additionalInfo.trim() || undefined,
      });
      
      if (response.success) {
        Alert.alert(
          'Успех',
          'Ваш отклик отправлен заказчику',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось отправить отклик');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке отклика');
    } finally {
      setIsSubmitting(false);
    }
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
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>Заявка не найдена</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Отклик на заявку</Title>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Details */}
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <Avatar.Text 
                size={40} 
                label={order.user.name.charAt(0).toUpperCase()} 
                style={styles.avatar}
              />
              <View style={styles.orderInfo}>
                <Title style={styles.orderTitle}>{order.title}</Title>
                <Text style={styles.orderUser}>Заказчик: {order.user.name}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                </Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <Paragraph style={styles.orderDescription}>
              {order.description}
            </Paragraph>
            
            {order.images && order.images.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesLabel}>Прикрепленные фото:</Text>
                <Text style={styles.imagesCount}>{order.images.length} фото</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Response Form */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>Ваш отклик</Title>
            
            <TextInput
              label="Сообщение *"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              placeholder="Опишите ваше предложение, опыт работы, материалы..."
              mode="outlined"
            />
            
            <TextInput
              label="Предложенная цена (₸)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="Например: 150000"
              mode="outlined"
            />
            
            <TextInput
              label="Срок изготовления"
              value={deliveryTime}
              onChangeText={setDeliveryTime}
              style={styles.textInput}
              placeholder="Например: 2-3 недели"
              mode="outlined"
            />
            
            <TextInput
              label="Дополнительная информация"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={3}
              style={styles.textInput}
              placeholder="Гарантии, условия доставки, особые требования..."
              mode="outlined"
            />
          </Card.Content>
        </Card>
        
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmitResponse}
            loading={isSubmitting}
            disabled={isSubmitting || !message.trim()}
            style={styles.submitButton}
            icon="send"
          >
            Отправить отклик
          </Button>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    margin: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
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
  divider: {
    marginVertical: 12,
  },
  orderDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagesLabel: {
    fontSize: 14,
    color: '#666',
  },
  imagesCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  submitButton: {
    paddingVertical: 8,
  },
});

export default RespondToOrderScreen;
