import { api } from '../client';
import { UserAnalytics, PlatformAnalytics, RevenueAnalytics, EngagementMetrics } from '@/lib/store/slices/analyticsSlice';

export const analyticsService = {
  // Get user analytics
  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get('/analytics/user');
    return response.data;
  },

  // Get platform analytics
  getPlatformAnalytics: async (): Promise<PlatformAnalytics> => {
    const response = await api.get('/analytics/platform');
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    const response = await api.get('/analytics/revenue');
    return response.data;
  },

  // Get engagement metrics
  getEngagementMetrics: async (): Promise<EngagementMetrics> => {
    const response = await api.get('/analytics/engagement');
    return response.data;
  },
};
