import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Story {
  id: number;
  user_id: number;
  content: string;
  media_type: 'image' | 'video';
  media_url: string;
  duration?: number;
  views_count: number;
  likes_count: number;
  is_liked: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface StoryState {
  stories: Story[];
  userStories: Story[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Initial state
const initialState: StoryState = {
  stories: [],
  userStories: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Async thunks
export const fetchStories = createAsyncThunk<
  { stories: Story[]; pagination: any },
  { page?: number; limit?: number },
  { rejectValue: string }
>(
  'story/fetchStories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/stories', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки историй'
      );
    }
  }
);

export const createStory = createAsyncThunk<
  Story,
  { content: string; media: File; mediaType: 'image' | 'video' },
  { rejectValue: string }
>(
  'story/create',
  async (storyData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('content', storyData.content);
      formData.append('media', storyData.media);
      formData.append('media_type', storyData.mediaType);

      const response = await api.post('/stories/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания истории'
      );
    }
  }
);

export const viewStory = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'story/view',
  async (storyId, { rejectWithValue }) => {
    try {
      await api.post(`/stories/${storyId}/view`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка просмотра истории'
      );
    }
  }
);

export const likeStory = createAsyncThunk<
  { storyId: number; isLiked: boolean; likesCount: number },
  number,
  { rejectValue: string }
>(
  'story/like',
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/stories/${storyId}/like`);
      return {
        storyId,
        isLiked: true,
        likesCount: response.data.likes_count,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка лайка истории'
      );
    }
  }
);

export const fetchUserStories = createAsyncThunk<
  Story[],
  { userId: number; page?: number; limit?: number },
  { rejectValue: string }
>(
  'story/fetchUserStories',
  async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/stories/user/${userId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки историй пользователя'
      );
    }
  }
);

// Story slice
const storySlice = createSlice({
  name: 'story',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.unshift(action.payload);
    },
    updateStory: (state, action: PayloadAction<Story>) => {
      const index = state.stories.findIndex(story => story.id === action.payload.id);
      if (index !== -1) {
        state.stories[index] = action.payload;
      }
      
      const userIndex = state.userStories.findIndex(story => story.id === action.payload.id);
      if (userIndex !== -1) {
        state.userStories[userIndex] = action.payload;
      }
    },
    removeStory: (state, action: PayloadAction<number>) => {
      state.stories = state.stories.filter(story => story.id !== action.payload);
      state.userStories = state.userStories.filter(story => story.id !== action.payload);
    },
    incrementStoryViews: (state, action: PayloadAction<number>) => {
      const story = state.stories.find(s => s.id === action.payload);
      if (story) {
        story.views_count += 1;
      }
      
      const userStory = state.userStories.find(s => s.id === action.payload);
      if (userStory) {
        userStory.views_count += 1;
      }
    },
    updateStoryLike: (state, action: PayloadAction<{ storyId: number; isLiked: boolean; likesCount: number }>) => {
      const { storyId, isLiked, likesCount } = action.payload;
      
      const story = state.stories.find(s => s.id === storyId);
      if (story) {
        story.is_liked = isLiked;
        story.likes_count = likesCount;
      }
      
      const userStory = state.userStories.find(s => s.id === storyId);
      if (userStory) {
        userStory.is_liked = isLiked;
        userStory.likes_count = likesCount;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch stories
    builder
      .addCase(fetchStories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.stories = action.payload.stories;
        } else {
          state.stories.push(...action.payload.stories);
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки историй';
      });

    // Create story
    builder
      .addCase(createStory.fulfilled, (state, action) => {
        state.stories.unshift(action.payload);
        state.userStories.unshift(action.payload);
      });

    // View story
    builder
      .addCase(viewStory.fulfilled, (state, action) => {
        const storyId = action.meta.arg;
        const story = state.stories.find(s => s.id === storyId);
        if (story) {
          story.views_count += 1;
        }
        
        const userStory = state.userStories.find(s => s.id === storyId);
        if (userStory) {
          userStory.views_count += 1;
        }
      });

    // Like story
    builder
      .addCase(likeStory.fulfilled, (state, action) => {
        const { storyId, isLiked, likesCount } = action.payload;
        
        const story = state.stories.find(s => s.id === storyId);
        if (story) {
          story.is_liked = isLiked;
          story.likes_count = likesCount;
        }
        
        const userStory = state.userStories.find(s => s.id === storyId);
        if (userStory) {
          userStory.is_liked = isLiked;
          userStory.likes_count = likesCount;
        }
      });

    // Fetch user stories
    builder
      .addCase(fetchUserStories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.userStories = action.payload;
        } else {
          state.userStories.push(...action.payload);
        }
        state.error = null;
      })
      .addCase(fetchUserStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки историй пользователя';
      });
  },
});

export const {
  clearError,
  addStory,
  updateStory,
  removeStory,
  incrementStoryViews,
  updateStoryLike,
} = storySlice.actions;

export default storySlice.reducer;
