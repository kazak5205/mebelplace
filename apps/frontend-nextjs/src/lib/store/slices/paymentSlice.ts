import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface PaymentProvider {
  id: number;
  name: string;
  type: 'card' | 'wallet' | 'bank_transfer';
  is_connected: boolean;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  currency: string;
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  payment_provider: string;
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentState {
  providers: PaymentProvider[];
  transactions: Transaction[];
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
const initialState: PaymentState = {
  providers: [],
  transactions: [],
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
export const fetchPaymentProviders = createAsyncThunk<
  PaymentProvider[],
  void,
  { rejectValue: string }
>(
  'payment/fetchProviders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/providers');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки платежных провайдеров'
      );
    }
  }
);

export const connectPaymentProvider = createAsyncThunk<
  PaymentProvider,
  { providerId: number; config: any },
  { rejectValue: string }
>(
  'payment/connectProvider',
  async ({ providerId, config }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payments/providers/${providerId}/connect`, {
        config,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка подключения платежного провайдера'
      );
    }
  }
);

export const fetchTransactions = createAsyncThunk<
  { transactions: Transaction[]; pagination: any },
  { page?: number; limit?: number; type?: string },
  { rejectValue: string }
>(
  'payment/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/transactions', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          type: params.type,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки транзакций'
      );
    }
  }
);

export const processPayment = createAsyncThunk<
  Transaction,
  { amount: number; currency: string; description: string; providerId: number },
  { rejectValue: string }
>(
  'payment/process',
  async ({ amount, currency, description, providerId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/process', {
        amount,
        currency,
        description,
        provider_id: providerId,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка обработки платежа'
      );
    }
  }
);

export const refundPayment = createAsyncThunk<
  Transaction,
  { transactionId: number; amount?: number; reason: string },
  { rejectValue: string }
>(
  'payment/refund',
  async ({ transactionId, amount, reason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payments/transactions/${transactionId}/refund`, {
        amount,
        reason,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка возврата платежа'
      );
    }
  }
);

// Payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    removeTransaction: (state, action: PayloadAction<number>) => {
      state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
    },
    updateProvider: (state, action: PayloadAction<PaymentProvider>) => {
      const index = state.providers.findIndex(provider => provider.id === action.payload.id);
      if (index !== -1) {
        state.providers[index] = action.payload;
      } else {
        state.providers.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch payment providers
    builder
      .addCase(fetchPaymentProviders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providers = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки платежных провайдеров';
      });

    // Connect payment provider
    builder
      .addCase(connectPaymentProvider.fulfilled, (state, action) => {
        const index = state.providers.findIndex(provider => provider.id === action.payload.id);
        if (index !== -1) {
          state.providers[index] = action.payload;
        } else {
          state.providers.push(action.payload);
        }
      });

    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.transactions = action.payload.transactions;
        } else {
          state.transactions.push(...action.payload.transactions);
        }
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки транзакций';
      });

    // Process payment
    builder
      .addCase(processPayment.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });

    // Refund payment
    builder
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });
  },
});

export const {
  clearError,
  addTransaction,
  updateTransaction,
  removeTransaction,
  updateProvider,
} = paymentSlice.actions;

export default paymentSlice.reducer;
