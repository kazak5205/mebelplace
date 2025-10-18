import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Model3D {
  id: number;
  user_id: number;
  name: string;
  description: string;
  file_path: string;
  thumbnail_path: string;
  file_size: number;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface ModelVersion {
  id: number;
  model_id: number;
  version: string;
  file_path: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
}

export interface ARState {
  models: Model3D[];
  currentModel: Model3D | null;
  modelVersions: ModelVersion[];
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

// Initial state
const initialState: ARState = {
  models: [],
  currentModel: null,
  modelVersions: [],
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
export const fetchModels = createAsyncThunk<
  { models: Model3D[]; pagination: any },
  { page?: number; limit?: number; user_id?: number },
  { rejectValue: string }
>(
  'ar/fetchModels',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/ar/models', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          user_id: params.user_id,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки 3D моделей'
      );
    }
  }
);

export const uploadModel = createAsyncThunk<
  Model3D,
  { name: string; description: string; file: File },
  { rejectValue: string }
>(
  'ar/uploadModel',
  async (modelData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', modelData.name);
      formData.append('description', modelData.description);
      formData.append('model', modelData.file);

      const response = await api.post('/ar/models/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки 3D модели'
      );
    }
  }
);

export const fetchModelById = createAsyncThunk<
  Model3D,
  number,
  { rejectValue: string }
>(
  'ar/fetchModelById',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ar/models/${modelId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки 3D модели'
      );
    }
  }
);

export const fetchModelVersions = createAsyncThunk<
  ModelVersion[],
  number,
  { rejectValue: string }
>(
  'ar/fetchModelVersions',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ar/models/${modelId}/versions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки версий модели'
      );
    }
  }
);

export const addModelVersionAsync = createAsyncThunk<
  ModelVersion,
  { modelId: number; file: File },
  { rejectValue: string }
>(
  'ar/addModelVersion',
  async ({ modelId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('model', file);

      const response = await api.post(`/ar/models/${modelId}/versions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка добавления версии модели'
      );
    }
  }
);

export const activateModelVersion = createAsyncThunk<
  void,
  { modelId: number; versionId: number },
  { rejectValue: string }
>(
  'ar/activateModelVersion',
  async ({ modelId, versionId }, { rejectWithValue }) => {
    try {
      await api.post(`/ar/models/${modelId}/versions/${versionId}/activate`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка активации версии модели'
      );
    }
  }
);

export const validateModel = createAsyncThunk<
  { is_valid: boolean; errors: string[] },
  number,
  { rejectValue: string }
>(
  'ar/validateModel',
  async (modelId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ar/models/${modelId}/validate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка валидации модели'
      );
    }
  }
);

export const renderModel = createAsyncThunk<
  { render_url: string },
  { modelId: number; camera_angle: string; lighting: string },
  { rejectValue: string }
>(
  'ar/renderModel',
  async ({ modelId, camera_angle, lighting }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ar/models/${modelId}/render`, {
        camera_angle,
        lighting,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка рендеринга модели'
      );
    }
  }
);

export const searchModels = createAsyncThunk<
  Model3D[],
  { query: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  'ar/searchModels',
  async ({ query, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get('/ar/models/search', {
        params: { q: query, page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка поиска 3D моделей'
      );
    }
  }
);

// AR slice
const arSlice = createSlice({
  name: 'ar',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentModel: (state, action: PayloadAction<Model3D>) => {
      state.currentModel = action.payload;
    },
    clearCurrentModel: (state) => {
      state.currentModel = null;
      state.modelVersions = [];
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    addModel: (state, action: PayloadAction<Model3D>) => {
      state.models.unshift(action.payload);
    },
    updateModel: (state, action: PayloadAction<Model3D>) => {
      const index = state.models.findIndex(model => model.id === action.payload.id);
      if (index !== -1) {
        state.models[index] = action.payload;
      }
      if (state.currentModel && state.currentModel.id === action.payload.id) {
        state.currentModel = action.payload;
      }
    },
    removeModel: (state, action: PayloadAction<number>) => {
      state.models = state.models.filter(model => model.id !== action.payload);
    },
    addModelVersion: (state, action: PayloadAction<ModelVersion>) => {
      state.modelVersions.push(action.payload);
    },
    updateModelVersion: (state, action: PayloadAction<ModelVersion>) => {
      const index = state.modelVersions.findIndex(version => version.id === action.payload.id);
      if (index !== -1) {
        state.modelVersions[index] = action.payload;
      }
    },
    removeModelVersion: (state, action: PayloadAction<number>) => {
      state.modelVersions = state.modelVersions.filter(version => version.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch models
    builder
      .addCase(fetchModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.models = action.payload.models;
        } else {
          state.models.push(...action.payload.models);
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки 3D моделей';
      });

    // Upload model
    builder
      .addCase(uploadModel.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadModel.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.models.unshift(action.payload);
        state.error = null;
      })
      .addCase(uploadModel.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload || 'Ошибка загрузки 3D модели';
      });

    // Fetch model by ID
    builder
      .addCase(fetchModelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentModel = action.payload;
        state.error = null;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки 3D модели';
      });

    // Fetch model versions
    builder
      .addCase(fetchModelVersions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModelVersions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modelVersions = action.payload;
        state.error = null;
      })
      .addCase(fetchModelVersions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки версий модели';
      });

    // Add model version
    builder
      .addCase(addModelVersionAsync.fulfilled, (state, action) => {
        state.modelVersions.push(action.payload);
      });

    // Activate model version
    builder
      .addCase(activateModelVersion.fulfilled, (state, action) => {
        const { versionId } = action.meta.arg;
        state.modelVersions.forEach(version => {
          version.is_active = version.id === versionId;
        });
      });

    // Search models
    builder
      .addCase(searchModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchModels.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.models = action.payload;
        } else {
          state.models.push(...action.payload);
        }
        state.error = null;
      })
      .addCase(searchModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка поиска 3D моделей';
      });
  },
});

export const {
  clearError,
  setCurrentModel,
  clearCurrentModel,
  setUploadProgress,
  addModel,
  updateModel,
  removeModel,
  addModelVersion,
  updateModelVersion,
  removeModelVersion,
} = arSlice.actions;

export default arSlice.reducer;
