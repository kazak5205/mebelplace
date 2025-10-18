import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  is_online?: boolean;
  last_seen?: string;
}

export interface UserState {
  currentUser: User | null;
  users: User[];
  blockedUsers: User[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  users: [],
  blockedUsers: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'user/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки профиля'
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk<
  User,
  Partial<User>,
  { rejectValue: string }
>(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/me', userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка обновления профиля'
      );
    }
  }
);

export const uploadUserAvatar = createAsyncThunk<
  { avatar_url: string },
  File,
  { rejectValue: string }
>(
  'user/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки аватара'
      );
    }
  }
);

export const fetchUserById = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>(
  'user/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки пользователя'
      );
    }
  }
);

export const blockUser = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'user/block',
  async (userId, { rejectWithValue }) => {
    try {
      await api.post(`/users/${userId}/block`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка блокировки пользователя'
      );
    }
  }
);

export const unblockUser = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'user/unblock',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${userId}/block`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка разблокировки пользователя'
      );
    }
  }
);

export const fetchBlockedUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>(
  'user/fetchBlocked',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/blocked');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки заблокированных пользователей'
      );
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    addUser: (state, action: PayloadAction<User>) => {
      const existingIndex = state.users.findIndex(user => user.id === action.payload.id);
      if (existingIndex === -1) {
        state.users.push(action.payload);
      } else {
        state.users[existingIndex] = action.payload;
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки профиля';
      });

    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка обновления профиля';
      });

    // Upload user avatar
    builder
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser.avatar_url = action.payload.avatar_url;
        }
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingIndex = state.users.findIndex(user => user.id === action.payload.id);
        if (existingIndex === -1) {
          state.users.push(action.payload);
        } else {
          state.users[existingIndex] = action.payload;
        }
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки пользователя';
      });

    // Block user
    builder
      .addCase(blockUser.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          state.blockedUsers.push(user);
        }
      });

    // Unblock user
    builder
      .addCase(unblockUser.fulfilled, (state, action) => {
        const userId = action.meta.arg;
        state.blockedUsers = state.blockedUsers.filter(user => user.id !== userId);
      });

    // Fetch blocked users
    builder
      .addCase(fetchBlockedUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlockedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blockedUsers = action.payload;
        state.error = null;
      })
      .addCase(fetchBlockedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки заблокированных пользователей';
      });
  },
});

export const {
  clearError,
  setCurrentUser,
  updateCurrentUser,
  addUser,
  updateUser,
  removeUser,
} = userSlice.actions;

export default userSlice.reducer;
