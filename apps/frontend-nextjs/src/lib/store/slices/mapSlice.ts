import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface GeoObject {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  rating: number;
  reviews_count: number;
  images: string[];
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface MapReview {
  id: number;
  geo_object_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface MapState {
  geoObjects: GeoObject[];
  currentGeoObject: GeoObject | null;
  reviews: MapReview[];
  searchResults: GeoObject[];
  isLoading: boolean;
  error: string | null;
  mapCenter: {
    lat: number;
    lng: number;
  };
  mapZoom: number;
  selectedCategory: string | null;
}

// Initial state
const initialState: MapState = {
  geoObjects: [],
  currentGeoObject: null,
  reviews: [],
  searchResults: [],
  isLoading: false,
  error: null,
  mapCenter: {
    lat: 43.2220, // Almaty coordinates
    lng: 76.8512,
  },
  mapZoom: 10,
  selectedCategory: null,
};

// Async thunks
export const fetchGeoObjects = createAsyncThunk<
  GeoObject[],
  { lat?: number; lng?: number; radius?: number; category?: string },
  { rejectValue: string }
>(
  'map/fetchGeoObjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/map/geo-objects', {
        params: {
          latitude: params.lat,
          longitude: params.lng,
          radius: params.radius,
          category: params.category,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки гео-объектов'
      );
    }
  }
);

export const createGeoObject = createAsyncThunk<
  GeoObject,
  {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    category: string;
    address: string;
    phone?: string;
    website?: string;
    images: File[];
  },
  { rejectValue: string }
>(
  'map/createGeoObject',
  async (geoObjectData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('name', geoObjectData.name);
      formData.append('description', geoObjectData.description);
      formData.append('latitude', geoObjectData.latitude.toString());
      formData.append('longitude', geoObjectData.longitude.toString());
      formData.append('category', geoObjectData.category);
      formData.append('address', geoObjectData.address);
      if (geoObjectData.phone) {
        formData.append('phone', geoObjectData.phone);
      }
      if (geoObjectData.website) {
        formData.append('website', geoObjectData.website);
      }
      geoObjectData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const response = await api.post('/map/geo-objects/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания гео-объекта'
      );
    }
  }
);

export const fetchGeoObjectById = createAsyncThunk<
  GeoObject,
  number,
  { rejectValue: string }
>(
  'map/fetchGeoObjectById',
  async (geoObjectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/map/geo-objects/${geoObjectId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки гео-объекта'
      );
    }
  }
);

export const searchMapObjects = createAsyncThunk<
  GeoObject[],
  { query: string; lat?: number; lng?: number; radius?: number },
  { rejectValue: string }
>(
  'map/search',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/map/search', {
        params: {
          q: searchParams.query,
          latitude: searchParams.lat,
          longitude: searchParams.lng,
          radius: searchParams.radius,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка поиска на карте'
      );
    }
  }
);

export const fetchGeoObjectReviews = createAsyncThunk<
  MapReview[],
  number,
  { rejectValue: string }
>(
  'map/fetchReviews',
  async (geoObjectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/map/geo-objects/${geoObjectId}/reviews`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки отзывов'
      );
    }
  }
);

export const addGeoObjectReview = createAsyncThunk<
  MapReview,
  { geoObjectId: number; rating: number; comment: string },
  { rejectValue: string }
>(
  'map/addReview',
  async ({ geoObjectId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/map/geo-objects/${geoObjectId}/reviews`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка добавления отзыва'
      );
    }
  }
);

// Map slice
const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMapCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.mapCenter = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.mapZoom = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setCurrentGeoObject: (state, action: PayloadAction<GeoObject>) => {
      state.currentGeoObject = action.payload;
    },
    clearCurrentGeoObject: (state) => {
      state.currentGeoObject = null;
      state.reviews = [];
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    addGeoObject: (state, action: PayloadAction<GeoObject>) => {
      state.geoObjects.unshift(action.payload);
    },
    updateGeoObject: (state, action: PayloadAction<GeoObject>) => {
      const index = state.geoObjects.findIndex(obj => obj.id === action.payload.id);
      if (index !== -1) {
        state.geoObjects[index] = action.payload;
      }
      if (state.currentGeoObject && state.currentGeoObject.id === action.payload.id) {
        state.currentGeoObject = action.payload;
      }
    },
    removeGeoObject: (state, action: PayloadAction<number>) => {
      state.geoObjects = state.geoObjects.filter(obj => obj.id !== action.payload);
    },
    addReview: (state, action: PayloadAction<MapReview>) => {
      state.reviews.unshift(action.payload);
      if (state.currentGeoObject) {
        state.currentGeoObject.reviews_count += 1;
      }
    },
    updateReview: (state, action: PayloadAction<MapReview>) => {
      const index = state.reviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
    removeReview: (state, action: PayloadAction<number>) => {
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
      if (state.currentGeoObject) {
        state.currentGeoObject.reviews_count = Math.max(0, state.currentGeoObject.reviews_count - 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch geo objects
    builder
      .addCase(fetchGeoObjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeoObjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.geoObjects = action.payload;
        state.error = null;
      })
      .addCase(fetchGeoObjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки гео-объектов';
      });

    // Create geo object
    builder
      .addCase(createGeoObject.fulfilled, (state, action) => {
        state.geoObjects.unshift(action.payload);
      });

    // Fetch geo object by ID
    builder
      .addCase(fetchGeoObjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeoObjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGeoObject = action.payload;
        state.error = null;
      })
      .addCase(fetchGeoObjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки гео-объекта';
      });

    // Search map objects
    builder
      .addCase(searchMapObjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMapObjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchMapObjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка поиска на карте';
      });

    // Fetch geo object reviews
    builder
      .addCase(fetchGeoObjectReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGeoObjectReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
        state.error = null;
      })
      .addCase(fetchGeoObjectReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки отзывов';
      });

    // Add geo object review
    builder
      .addCase(addGeoObjectReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload);
        if (state.currentGeoObject) {
          state.currentGeoObject.reviews_count += 1;
        }
      });
  },
});

export const {
  clearError,
  setMapCenter,
  setMapZoom,
  setSelectedCategory,
  setCurrentGeoObject,
  clearCurrentGeoObject,
  clearSearchResults,
  addGeoObject,
  updateGeoObject,
  removeGeoObject,
  addReview,
  updateReview,
  removeReview,
} = mapSlice.actions;

export default mapSlice.reducer;
