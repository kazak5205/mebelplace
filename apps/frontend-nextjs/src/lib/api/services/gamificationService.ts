import { api } from '../client';
import { UserLevel, Achievement, LeaderboardEntry, GamificationRule } from '@/lib/store/slices/gamificationSlice';

export const gamificationService = {
  // Get user level
  getUserLevel: async (): Promise<UserLevel> => {
    const response = await api.get('/gamification/user-level');
    return response.data;
  },

  // Get user achievements
  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/gamification/leaderboard');
    return response.data;
  },

  // Get gamification rules
  getRules: async (): Promise<GamificationRule[]> => {
    const response = await api.get('/gamification/rules');
    return response.data;
  },

  // Award points
  awardPoints: async (actionType: string, points: number): Promise<{ points: number; new_level?: UserLevel }> => {
    const response = await api.post('/gamification/award-points', {
      action_type: actionType,
      points,
    });
    return response.data;
  },
};
