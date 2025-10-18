import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface UserLevel {
  level: number;
  experience_points: number;
  experience_to_next_level: number;
  level_name: string;
  level_color: string;
  level_icon: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  points: number;
  level: number;
  level_name: string;
}

export interface GamificationRule {
  id: number;
  name: string;
  description: string;
  action_type: string;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GamificationState {
  userLevel: UserLevel | null;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  rules: GamificationRule[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: GamificationState = {
  userLevel: null,
  achievements: [],
  leaderboard: [],
  rules: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserLevel = createAsyncThunk<
  UserLevel,
  void,
  { rejectValue: string }
>(
  'gamification/fetchUserLevel',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/user-level');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки уровня пользователя'
      );
    }
  }
);

export const fetchUserAchievements = createAsyncThunk<
  Achievement[],
  void,
  { rejectValue: string }
>(
  'gamification/fetchAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/achievements');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки достижений'
      );
    }
  }
);

export const fetchLeaderboard = createAsyncThunk<
  LeaderboardEntry[],
  void,
  { rejectValue: string }
>(
  'gamification/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/leaderboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки таблицы лидеров'
      );
    }
  }
);

export const fetchGamificationRules = createAsyncThunk<
  GamificationRule[],
  void,
  { rejectValue: string }
>(
  'gamification/fetchRules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/gamification/rules');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки правил геймификации'
      );
    }
  }
);

export const awardPoints = createAsyncThunk<
  { points: number; new_level?: UserLevel },
  { action_type: string; points: number },
  { rejectValue: string }
>(
  'gamification/awardPoints',
  async ({ action_type, points }, { rejectWithValue }) => {
    try {
      const response = await api.post('/gamification/award-points', {
        action_type,
        points,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка начисления очков'
      );
    }
  }
);

// Gamification slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserLevel: (state, action: PayloadAction<UserLevel>) => {
      state.userLevel = action.payload;
    },
    updateAchievement: (state, action: PayloadAction<Achievement>) => {
      const index = state.achievements.findIndex(achievement => achievement.id === action.payload.id);
      if (index !== -1) {
        state.achievements[index] = action.payload;
      } else {
        state.achievements.push(action.payload);
      }
    },
    updateLeaderboardEntry: (state, action: PayloadAction<LeaderboardEntry>) => {
      const index = state.leaderboard.findIndex(entry => entry.user_id === action.payload.user_id);
      if (index !== -1) {
        state.leaderboard[index] = action.payload;
      } else {
        state.leaderboard.push(action.payload);
      }
      // Sort by rank
      state.leaderboard.sort((a, b) => a.rank - b.rank);
    },
  },
  extraReducers: (builder) => {
    // Fetch user level
    builder
      .addCase(fetchUserLevel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserLevel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userLevel = action.payload;
        state.error = null;
      })
      .addCase(fetchUserLevel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки уровня пользователя';
      });

    // Fetch user achievements
    builder
      .addCase(fetchUserAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.achievements = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки достижений';
      });

    // Fetch leaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки таблицы лидеров';
      });

    // Fetch gamification rules
    builder
      .addCase(fetchGamificationRules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGamificationRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rules = action.payload;
        state.error = null;
      })
      .addCase(fetchGamificationRules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки правил геймификации';
      });

    // Award points
    builder
      .addCase(awardPoints.fulfilled, (state, action) => {
        if (action.payload.new_level && state.userLevel) {
          state.userLevel = action.payload.new_level;
        } else if (state.userLevel) {
          state.userLevel.experience_points += action.payload.points;
        }
      });
  },
});

export const {
  clearError,
  updateUserLevel,
  updateAchievement,
  updateLeaderboardEntry,
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
