import { apiClient } from '@/lib/api/client'

export interface UserPoints {
  user_id: string
  total_points: number
  level: number
  rank: number
  next_level_at: number
  updated_at: string
}

export interface Achievement {
  id: string
  code: string
  title: Record<string, string>
  description: Record<string, string>
  icon: string
  points: number
  requirement: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar: string
  total_points: number
  level: number
}

export interface UserProgress {
  points: UserPoints
  achievements: UserAchievement[]
  rank: number
  available_achievements: Achievement[]
}

export const gamificationApi = {
  getMyProgress: async (): Promise<UserProgress> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/gamification/progress`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getLeaderboard: async (period: 'all_time' | 'daily' | 'weekly' | 'monthly' = 'all_time'): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/gamification/leaderboard?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getAllAchievements: async (): Promise<Achievement[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/gamification/achievements`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },

  getMyAchievements: async (): Promise<UserAchievement[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mebelplace.com.kz/api/v2'}/gamification/achievements/my`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.data
  },
}

