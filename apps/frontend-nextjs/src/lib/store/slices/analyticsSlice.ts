import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface UserAnalytics {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_followers: number;
  total_following: number;
  engagement_rate: number;
  top_hashtags: string[];
  views_by_day: { date: string; views: number }[];
  likes_by_day: { date: string; likes: number }[];
}

export interface PlatformAnalytics {
  total_users: number;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  active_users_today: number;
  active_users_this_week: number;
  active_users_this_month: number;
  users_by_day: { date: string; users: number }[];
  videos_by_day: { date: string; videos: number }[];
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_month: { month: string; revenue: number }[];
  revenue_by_source: { source: string; revenue: number }[];
  top_earners: { user_id: number; username: string; revenue: number }[];
}

export interface EngagementMetrics {
  average_session_duration: number;
  bounce_rate: number;
  pages_per_session: number;
  return_visitors_rate: number;
  engagement_by_content_type: { type: string; engagement: number }[];
}

export interface AnalyticsState {
  userAnalytics: UserAnalytics | null;
  platformAnalytics: PlatformAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  engagementMetrics: EngagementMetrics | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  userAnalytics: null,
  platformAnalytics: null,
  revenueAnalytics: null,
  engagementMetrics: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserAnalytics = createAsyncThunk<
  UserAnalytics,
  void,
  { rejectValue: string }
>(
  'analytics/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки аналитики пользователя'
      );
    }
  }
);

export const fetchPlatformAnalytics = createAsyncThunk<
  PlatformAnalytics,
  void,
  { rejectValue: string }
>(
  'analytics/fetchPlatform',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/platform');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки аналитики платформы'
      );
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk<
  RevenueAnalytics,
  void,
  { rejectValue: string }
>(
  'analytics/fetchRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/revenue');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки аналитики доходов'
      );
    }
  }
);

export const fetchEngagementMetrics = createAsyncThunk<
  EngagementMetrics,
  void,
  { rejectValue: string }
>(
  'analytics/fetchEngagement',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/engagement');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки метрик вовлеченности'
      );
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAnalytics: (state) => {
      state.userAnalytics = null;
      state.platformAnalytics = null;
      state.revenueAnalytics = null;
      state.engagementMetrics = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user analytics
    builder
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки аналитики пользователя';
      });

    // Fetch platform analytics
    builder
      .addCase(fetchPlatformAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlatformAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.platformAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchPlatformAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки аналитики платформы';
      });

    // Fetch revenue analytics
    builder
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки аналитики доходов';
      });

    // Fetch engagement metrics
    builder
      .addCase(fetchEngagementMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEngagementMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.engagementMetrics = action.payload;
        state.error = null;
      })
      .addCase(fetchEngagementMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки метрик вовлеченности';
      });
  },
});

export const { clearError, clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
