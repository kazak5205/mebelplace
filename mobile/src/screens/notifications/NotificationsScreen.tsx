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
  Button,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '@shared/types';

const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsLoading(true);
      }

      const response = await notificationService.get(pageNum, 20);
      
      if (response.success) {
        const newNotifications = response.data;
        
        if (isRefresh || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setHasMore(newNotifications.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadNotifications(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadNotifications(page + 1);
    }
  }, [hasMore, isLoading, page]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markRead(notificationId);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        Alert.alert('Успех', 'Все уведомления отмечены как прочитанные');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Ошибка', 'Не удалось отметить все уведомления');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Удалить уведомление',
      'Вы уверены, что хотите удалить это уведомление?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          onPress: async () => {
            try {
              const response = await notificationService.delete(notificationId);
              
              if (response.success) {
                setNotifications(prev => 
                  prev.filter(notif => notif.id !== notificationId)
                );
              } else {
                Alert.alert('Ошибка', 'Не удалось удалить уведомление');
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Отмечаем как прочитанное
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Переходим к соответствующему экрану
    switch (notification.type) {
      case 'order_response':
        navigation.navigate('OrderResponses', { orderId: notification.data?.orderId });
        break;
      case 'order_accepted':
        navigation.navigate('OrderDetails', { orderId: notification.data?.orderId });
        break;
      case 'new_message':
        navigation.navigate('Chat', { 
          chatId: notification.data?.chatId,
          masterId: notification.data?.masterId,
          masterName: notification.data?.masterName,
        });
        break;
      case 'new_video':
        navigation.navigate('MasterChannel', { 
          masterId: notification.data?.masterId,
          masterName: notification.data?.masterName,
        });
        break;
      default:
        // Для других типов уведомлений можно добавить логику
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_response':
        return 'chatbubble';
      case 'order_accepted':
        return 'checkmark-circle';
      case 'new_message':
        return 'mail';
      case 'new_video':
        return 'videocam';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_response':
        return '#3b82f6';
      case 'order_accepted':
        return '#4CAF50';
      case 'new_message':
        return '#FF9800';
      case 'new_video':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard
      ]}
    >
      <TouchableOpacity onPress={() => handleNotificationPress(item)}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={getNotificationIcon(item.type)} 
                size={24} 
                color={getNotificationColor(item.type)} 
              />
            </View>
            <View style={styles.notificationInfo}>
              <Title style={[
                styles.notificationTitle,
                !item.isRead && styles.unreadTitle
              ]}>
                {item.title}
              </Title>
              <Paragraph style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Paragraph>
              <Text style={styles.notificationDate}>
                {new Date(item.createdAt).toLocaleString('ru-RU')}
              </Text>
            </View>
            <View style={styles.notificationActions}>
              {!item.isRead && (
                <View style={styles.unreadDot} />
              )}
              <IconButton
                icon="delete"
                size={20}
                iconColor="#F44336"
                onPress={() => handleDeleteNotification(item.id)}
              />
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );

  const renderFooter = () => {
    if (!isLoading || notifications.length === 0) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка уведомлений...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Уведомления</Title>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Отметить все</Text>
        </TouchableOpacity>
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Нет уведомлений</Text>
          <Text style={styles.emptySubtext}>
            Здесь будут появляться новые уведомления
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
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
  markAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
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
  notificationCard: {
    marginBottom: 12,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    color: '#666',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  notificationActions: {
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginBottom: 8,
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

export default NotificationsScreen;
