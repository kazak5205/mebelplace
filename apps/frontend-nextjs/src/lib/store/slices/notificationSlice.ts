import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'chat' | 'call' | 'request' | 'video';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  chat_notifications: boolean;
  call_notifications: boolean;
  request_notifications: boolean;
  video_notifications: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings | null;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  settings: null,
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>(
  'notification/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки уведомлений'
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.post(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отметки уведомления'
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/notifications/read-all');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отметки всех уведомлений'
      );
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk<
  NotificationSettings,
  void,
  { rejectValue: string }
>(
  'notification/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки настроек'
      );
    }
  }
);

export const updateNotificationSettings = createAsyncThunk<
  NotificationSettings,
  Partial<NotificationSettings>,
  { rejectValue: string }
>(
  'notification/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await api.put('/notifications/settings', settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка обновления настроек'
      );
    }
  }
);

export const updatePushToken = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  'notification/updatePushToken',
  async (token, { rejectWithValue }) => {
    try {
      await api.post('/notifications/push-token', { token });
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка обновления push токена'
      );
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markAsRead: (state, action: PayloadAction<number>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.is_read = true;
      });
      state.unreadCount = 0;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки уведомлений';
      });

    // Mark notification as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.meta.arg);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.is_read = true;
        });
        state.unreadCount = 0;
      });

    // Fetch notification settings
    builder
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки настроек';
      });

    // Update notification settings
    builder
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const {
  clearError,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  updateUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
