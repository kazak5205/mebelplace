import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './apiService';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'video_liked' | 'new_comment' | 'new_message' | 'new_order_response' | 'order_accepted' | 'user_online';
  videoId?: string;
  orderId?: string;
  chatId?: string;
  userId?: string;
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize() {
    try {
      // Запрашиваем разрешения
      await this.requestPermissions();
      
      // Получаем push token
      await this.registerForPushNotifications();
      
      // Настраиваем слушатели
      this.setupNotificationListeners();
      
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  private async requestPermissions() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }
    } else {
      throw new Error('Must use physical device for Push Notifications');
    }
  }

  private async registerForPushNotifications() {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Замените на ваш Project ID
      });
      
      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);
      
      // Отправляем token на сервер
      await this.sendTokenToServer(this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.error('Error getting push token:', error);
      throw error;
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      // Отправляем push token на сервер для регистрации устройства
      await apiService.updateProfile({ pushToken: token });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  private setupNotificationListeners() {
    // Слушатель для входящих уведомлений
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Слушатель для нажатий на уведомления
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification) {
    const { data } = notification.request.content;
    
    // Обрабатываем разные типы уведомлений
    switch (data?.type) {
      case 'video_liked':
        this.handleVideoLikedNotification(data);
        break;
      case 'new_comment':
        this.handleNewCommentNotification(data);
        break;
      case 'new_message':
        this.handleNewMessageNotification(data);
        break;
      case 'new_order_response':
        this.handleNewOrderResponseNotification(data);
        break;
      case 'order_accepted':
        this.handleOrderAcceptedNotification(data);
        break;
      case 'user_online':
        this.handleUserOnlineNotification(data);
        break;
      default:
        console.log('Unknown notification type:', data?.type);
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;
    
    // Навигация в зависимости от типа уведомления
    switch (data?.type) {
      case 'video_liked':
      case 'new_comment':
        if (data.videoId) {
          // Навигация к видео
          // navigation.navigate('VideoPlayer', { videoId: data.videoId });
        }
        break;
      case 'new_message':
        if (data.chatId) {
          // Навигация к чату
          // navigation.navigate('Chat', { chatId: data.chatId });
        }
        break;
      case 'new_order_response':
      case 'order_accepted':
        if (data.orderId) {
          // Навигация к заявке
          // navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
        break;
    }
  }

  private handleVideoLikedNotification(data: any) {
    console.log('Video liked notification:', data);
    // Можно показать toast или обновить UI
  }

  private handleNewCommentNotification(data: any) {
    console.log('New comment notification:', data);
    // Можно показать toast или обновить UI
  }

  private handleNewMessageNotification(data: any) {
    console.log('New message notification:', data);
    // Можно показать toast или обновить UI
  }

  private handleNewOrderResponseNotification(data: any) {
    console.log('New order response notification:', data);
    // Можно показать toast или обновить UI
  }

  private handleOrderAcceptedNotification(data: any) {
    console.log('Order accepted notification:', data);
    // Можно показать toast или обновить UI
  }

  private handleUserOnlineNotification(data: any) {
    console.log('User online notification:', data);
    // Можно показать toast или обновить UI
  }

  // Методы для отправки локальных уведомлений
  async scheduleLocalNotification(notificationData: NotificationData) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: notificationData,
          sound: 'default',
        },
        trigger: null, // Немедленно
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async scheduleVideoLikedNotification(videoTitle: string, likerName: string) {
    await this.scheduleLocalNotification({
      type: 'video_liked',
      title: 'Новый лайк!',
      body: `${likerName} понравилось ваше видео "${videoTitle}"`,
      data: { type: 'video_liked' },
    });
  }

  async scheduleNewCommentNotification(videoTitle: string, commenterName: string) {
    await this.scheduleLocalNotification({
      type: 'new_comment',
      title: 'Новый комментарий',
      body: `${commenterName} прокомментировал "${videoTitle}"`,
      data: { type: 'new_comment' },
    });
  }

  async scheduleNewMessageNotification(senderName: string, messagePreview: string) {
    await this.scheduleLocalNotification({
      type: 'new_message',
      title: `Сообщение от ${senderName}`,
      body: messagePreview,
      data: { type: 'new_message' },
    });
  }

  async scheduleNewOrderResponseNotification(orderTitle: string, responderName: string) {
    await this.scheduleLocalNotification({
      type: 'new_order_response',
      title: 'Новый отклик на заявку',
      body: `${responderName} откликнулся на "${orderTitle}"`,
      data: { type: 'new_order_response' },
    });
  }

  async scheduleOrderAcceptedNotification(orderTitle: string) {
    await this.scheduleLocalNotification({
      type: 'order_accepted',
      title: 'Заявка принята!',
      body: `Ваша заявка "${orderTitle}" была принята`,
      data: { type: 'order_accepted' },
    });
  }

  // Очистка слушателей
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Получение текущего push token
  getExpoPushToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
