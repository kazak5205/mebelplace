import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface ReferralCode {
  id: number;
  user_id: number;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  referrals: {
    id: number;
    referred_user_id: number;
    status: 'pending' | 'completed' | 'cancelled';
    earnings: number;
    created_at: string;
    referred_user: {
      id: number;
      username: string;
      avatar_url?: string;
    };
  }[];
}

export interface ReferralState {
  referralCode: ReferralCode | null;
  referralStats: ReferralStats | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ReferralState = {
  referralCode: null,
  referralStats: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const generateReferralCode = createAsyncThunk<
  ReferralCode,
  void,
  { rejectValue: string }
>(
  'referral/generateCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/referrals/generate-code');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка генерации реферального кода'
      );
    }
  }
);

export const applyReferralCode = createAsyncThunk<
  { success: boolean; message: string },
  string,
  { rejectValue: string }
>(
  'referral/applyCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.post('/referrals/apply-code', { code });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка применения реферального кода'
      );
    }
  }
);

export const fetchReferralStats = createAsyncThunk<
  ReferralStats,
  void,
  { rejectValue: string }
>(
  'referral/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/referrals/stats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки статистики рефералов'
      );
    }
  }
);

// Referral slice
const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setReferralCode: (state, action: PayloadAction<ReferralCode>) => {
      state.referralCode = action.payload;
    },
    updateReferralStats: (state, action: PayloadAction<Partial<ReferralStats>>) => {
      if (state.referralStats) {
        state.referralStats = { ...state.referralStats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Generate referral code
    builder
      .addCase(generateReferralCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReferralCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralCode = action.payload;
        state.error = null;
      })
      .addCase(generateReferralCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка генерации реферального кода';
      });

    // Apply referral code
    builder
      .addCase(applyReferralCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyReferralCode.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(applyReferralCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка применения реферального кода';
      });

    // Fetch referral stats
    builder
      .addCase(fetchReferralStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.referralStats = action.payload;
        state.error = null;
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки статистики рефералов';
      });
  },
});

export const {
  clearError,
  setReferralCode,
  updateReferralStats,
} = referralSlice.actions;

export default referralSlice.reducer;
