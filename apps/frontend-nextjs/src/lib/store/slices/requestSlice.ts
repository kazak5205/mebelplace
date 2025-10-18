import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Request {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  budget?: number;
  location?: string;
  images: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  offers_count: number;
}

export interface RequestOffer {
  id: number;
  request_id: number;
  user_id: number;
  price: number;
  description: string;
  delivery_time: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface RequestState {
  requests: Request[];
  currentRequest: Request | null;
  offers: RequestOffer[];
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
const initialState: RequestState = {
  requests: [],
  currentRequest: null,
  offers: [],
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
export const fetchRequests = createAsyncThunk<
  { requests: Request[]; pagination: any },
  { page?: number; limit?: number; status?: string },
  { rejectValue: string }
>(
  'request/fetchRequests',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки заявок'
      );
    }
  }
);

export const createRequest = createAsyncThunk<
  Request,
  {
    title: string;
    description: string;
    category: string;
    budget?: number;
    location?: string;
    images: File[];
  },
  { rejectValue: string }
>(
  'request/create',
  async (requestData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', requestData.title);
      formData.append('description', requestData.description);
      formData.append('category', requestData.category);
      if (requestData.budget) {
        formData.append('budget', requestData.budget.toString());
      }
      if (requestData.location) {
        formData.append('location', requestData.location);
      }
      requestData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const response = await api.post('/requests/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания заявки'
      );
    }
  }
);

export const fetchRequestById = createAsyncThunk<
  Request,
  number,
  { rejectValue: string }
>(
  'request/fetchById',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${requestId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки заявки'
      );
    }
  }
);

export const fetchRequestOffers = createAsyncThunk<
  RequestOffer[],
  number,
  { rejectValue: string }
>(
  'request/fetchOffers',
  async (requestId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${requestId}/offers`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки предложений'
      );
    }
  }
);

export const createOffer = createAsyncThunk<
  RequestOffer,
  {
    requestId: number;
    price: number;
    description: string;
    deliveryTime: string;
  },
  { rejectValue: string }
>(
  'request/createOffer',
  async ({ requestId, price, description, deliveryTime }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/requests/${requestId}/offers/create`, {
        price,
        description,
        delivery_time: deliveryTime,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания предложения'
      );
    }
  }
);

export const acceptOffer = createAsyncThunk<
  void,
  { requestId: number; offerId: number },
  { rejectValue: string }
>(
  'request/acceptOffer',
  async ({ requestId, offerId }, { rejectWithValue }) => {
    try {
      await api.post(`/requests/${requestId}/offers/${offerId}/accept`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка принятия предложения'
      );
    }
  }
);

// Request slice
const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRequest: (state, action: PayloadAction<Request>) => {
      state.currentRequest = action.payload;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
      state.offers = [];
    },
    addRequest: (state, action: PayloadAction<Request>) => {
      state.requests.unshift(action.payload);
    },
    updateRequest: (state, action: PayloadAction<Request>) => {
      const index = state.requests.findIndex(req => req.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
      if (state.currentRequest && state.currentRequest.id === action.payload.id) {
        state.currentRequest = action.payload;
      }
    },
    removeRequest: (state, action: PayloadAction<number>) => {
      state.requests = state.requests.filter(req => req.id !== action.payload);
    },
    addOffer: (state, action: PayloadAction<RequestOffer>) => {
      state.offers.push(action.payload);
      if (state.currentRequest) {
        state.currentRequest.offers_count += 1;
      }
    },
    updateOffer: (state, action: PayloadAction<RequestOffer>) => {
      const index = state.offers.findIndex(offer => offer.id === action.payload.id);
      if (index !== -1) {
        state.offers[index] = action.payload;
      }
    },
    removeOffer: (state, action: PayloadAction<number>) => {
      state.offers = state.offers.filter(offer => offer.id !== action.payload);
      if (state.currentRequest) {
        state.currentRequest.offers_count = Math.max(0, state.currentRequest.offers_count - 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch requests
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.requests = action.payload.requests;
        } else {
          state.requests.push(...action.payload.requests);
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки заявок';
      });

    // Create request
    builder
      .addCase(createRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      });

    // Fetch request by ID
    builder
      .addCase(fetchRequestById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRequest = action.payload;
        state.error = null;
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки заявки';
      });

    // Fetch request offers
    builder
      .addCase(fetchRequestOffers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestOffers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.offers = action.payload;
        state.error = null;
      })
      .addCase(fetchRequestOffers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки предложений';
      });

    // Create offer
    builder
      .addCase(createOffer.fulfilled, (state, action) => {
        state.offers.push(action.payload);
        if (state.currentRequest) {
          state.currentRequest.offers_count += 1;
        }
      });

    // Accept offer
    builder
      .addCase(acceptOffer.fulfilled, (state, action) => {
        const { offerId } = action.meta.arg;
        const offer = state.offers.find(o => o.id === offerId);
        if (offer) {
          offer.status = 'accepted';
        }
        if (state.currentRequest) {
          state.currentRequest.status = 'in_progress';
        }
      });
  },
});

export const {
  clearError,
  setCurrentRequest,
  clearCurrentRequest,
  addRequest,
  updateRequest,
  removeRequest,
  addOffer,
  updateOffer,
  removeOffer,
} = requestSlice.actions;

export default requestSlice.reducer;
