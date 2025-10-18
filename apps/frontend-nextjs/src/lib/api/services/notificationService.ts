import { api } from '../client';
import { Notification, NotificationSettings } from '@/lib/store/slices/notificationSlice';

export const notificationService = {
  // Get notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },

  // Get notification settings
  getSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  // Update push token
  updatePushToken: async (token: string): Promise<void> => {
    await api.post('/notifications/push-token', { token });
  },
};
