import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Video {
  id: number;
  user_id: number;
  title: string;
  description: string;
  path: string;
  thumbnail_path: string;
  size_bytes: number;
  hashtags: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  is_liked?: boolean;
}

export interface VideoComment {
  id: number;
  video_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  replies?: VideoComment[];
  likes_count: number;
  is_liked?: boolean;
}

export interface VideoState {
  videos: Video[];
  currentVideo: Video | null;
  videoComments: VideoComment[];
  feed: Video[];
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface VideoFeedParams {
  page?: number;
  limit?: number;
  user_id?: number;
  hashtag?: string;
}

export interface UploadVideoData {
  title: string;
  description: string;
  hashtags: string[];
  file: File;
}

// Initial state
const initialState: VideoState = {
  videos: [],
  currentVideo: null,
  videoComments: [],
  feed: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

// Async thunks
export const fetchVideoFeed = createAsyncThunk<
  { videos: Video[]; pagination: any },
  VideoFeedParams,
  { rejectValue: string }
>(
  'video/fetchFeed',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/videos/feed', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          user_id: params.user_id,
          hashtag: params.hashtag,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки ленты видео'
      );
    }
  }
);

export const fetchVideoById = createAsyncThunk<
  Video,
  number,
  { rejectValue: string }
>(
  'video/fetchById',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки видео'
      );
    }
  }
);

export const uploadVideo = createAsyncThunk<
  Video,
  UploadVideoData,
  { rejectValue: string }
>(
  'video/upload',
  async (uploadData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('hashtags', JSON.stringify(uploadData.hashtags));
      formData.append('video', uploadData.file);

      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          // Progress will be handled by the slice
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки видео'
      );
    }
  }
);

export const likeVideo = createAsyncThunk<
  { videoId: number; isLiked: boolean; likesCount: number },
  number,
  { rejectValue: string }
>(
  'video/like',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      return {
        videoId,
        isLiked: true,
        likesCount: response.data.likes_count,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка лайка видео'
      );
    }
  }
);

export const unlikeVideo = createAsyncThunk<
  { videoId: number; isLiked: boolean; likesCount: number },
  number,
  { rejectValue: string }
>(
  'video/unlike',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/unlike`);
      return {
        videoId,
        isLiked: false,
        likesCount: response.data.likes_count,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка убирания лайка'
      );
    }
  }
);

export const fetchVideoComments = createAsyncThunk<
  VideoComment[],
  { videoId: number; page?: number; limit?: number },
  { rejectValue: string }
>(
  'video/fetchComments',
  async ({ videoId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/videos/${videoId}/comments`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки комментариев'
      );
    }
  }
);

export const addVideoComment = createAsyncThunk<
  VideoComment,
  { videoId: number; content: string },
  { rejectValue: string }
>(
  'video/addComment',
  async ({ videoId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/videos/${videoId}/comments`, {
        content,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка добавления комментария'
      );
    }
  }
);

// Video slice
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
      state.videoComments = [];
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    updateVideoInFeed: (state, action: PayloadAction<Video>) => {
      const index = state.feed.findIndex(video => video.id === action.payload.id);
      if (index !== -1) {
        state.feed[index] = action.payload;
      }
    },
    updateVideoInList: (state, action: PayloadAction<Video>) => {
      const index = state.videos.findIndex(video => video.id === action.payload.id);
      if (index !== -1) {
        state.videos[index] = action.payload;
      }
    },
    addCommentToVideo: (state, action: PayloadAction<VideoComment>) => {
      state.videoComments.unshift(action.payload);
      if (state.currentVideo) {
        state.currentVideo.comments_count += 1;
      }
    },
    updateCommentInVideo: (state, action: PayloadAction<VideoComment>) => {
      const index = state.videoComments.findIndex(comment => comment.id === action.payload.id);
      if (index !== -1) {
        state.videoComments[index] = action.payload;
      }
    },
    removeCommentFromVideo: (state, action: PayloadAction<number>) => {
      state.videoComments = state.videoComments.filter(comment => comment.id !== action.payload);
      if (state.currentVideo) {
        state.currentVideo.comments_count = Math.max(0, state.currentVideo.comments_count - 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch video feed
    builder
      .addCase(fetchVideoFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.feed = action.payload.videos;
        } else {
          state.feed.push(...action.payload.videos);
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchVideoFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки ленты видео';
      });

    // Fetch video by ID
    builder
      .addCase(fetchVideoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVideo = action.payload;
        state.error = null;
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки видео';
      });

    // Upload video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.videos.unshift(action.payload);
        state.error = null;
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Ошибка загрузки видео';
      });

    // Like video
    builder
      .addCase(likeVideo.fulfilled, (state, action) => {
        const { videoId, isLiked, likesCount } = action.payload;
        
        // Update in feed
        const feedIndex = state.feed.findIndex(video => video.id === videoId);
        if (feedIndex !== -1) {
          state.feed[feedIndex].is_liked = isLiked;
          state.feed[feedIndex].likes_count = likesCount;
        }
        
        // Update in videos list
        const videosIndex = state.videos.findIndex(video => video.id === videoId);
        if (videosIndex !== -1) {
          state.videos[videosIndex].is_liked = isLiked;
          state.videos[videosIndex].likes_count = likesCount;
        }
        
        // Update current video
        if (state.currentVideo && state.currentVideo.id === videoId) {
          state.currentVideo.is_liked = isLiked;
          state.currentVideo.likes_count = likesCount;
        }
      });

    // Unlike video
    builder
      .addCase(unlikeVideo.fulfilled, (state, action) => {
        const { videoId, isLiked, likesCount } = action.payload;
        
        // Update in feed
        const feedIndex = state.feed.findIndex(video => video.id === videoId);
        if (feedIndex !== -1) {
          state.feed[feedIndex].is_liked = isLiked;
          state.feed[feedIndex].likes_count = likesCount;
        }
        
        // Update in videos list
        const videosIndex = state.videos.findIndex(video => video.id === videoId);
        if (videosIndex !== -1) {
          state.videos[videosIndex].is_liked = isLiked;
          state.videos[videosIndex].likes_count = likesCount;
        }
        
        // Update current video
        if (state.currentVideo && state.currentVideo.id === videoId) {
          state.currentVideo.is_liked = isLiked;
          state.currentVideo.likes_count = likesCount;
        }
      });

    // Fetch video comments
    builder
      .addCase(fetchVideoComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideoComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videoComments = action.payload;
        state.error = null;
      })
      .addCase(fetchVideoComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки комментариев';
      });

    // Add video comment
    builder
      .addCase(addVideoComment.fulfilled, (state, action) => {
        state.videoComments.unshift(action.payload);
        if (state.currentVideo) {
          state.currentVideo.comments_count += 1;
        }
      });
  },
});

export const {
  clearError,
  clearCurrentVideo,
  setUploadProgress,
  updateVideoInFeed,
  updateVideoInList,
  addCommentToVideo,
  updateCommentInVideo,
  removeCommentFromVideo,
} = videoSlice.actions;

export default videoSlice.reducer;
