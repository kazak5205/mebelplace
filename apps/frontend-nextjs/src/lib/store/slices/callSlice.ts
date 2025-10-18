import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Call {
  id: number;
  caller_id: number;
  callee_id: number;
  status: 'initiated' | 'ringing' | 'answered' | 'ended' | 'missed' | 'rejected';
  type: 'audio' | 'video';
  duration?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  caller: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  callee: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export interface CallState {
  activeCall: Call | null;
  callHistory: Call[];
  incomingCall: Call | null;
  isInCall: boolean;
  isLoading: boolean;
  error: string | null;
  webrtcToken: string | null;
  webrtcConfig: any;
}

// Initial state
const initialState: CallState = {
  activeCall: null,
  callHistory: [],
  incomingCall: null,
  isInCall: false,
  isLoading: false,
  error: null,
  webrtcToken: null,
  webrtcConfig: null,
};

// Async thunks
export const initiateCall = createAsyncThunk<
  Call,
  { calleeId: number; type: 'audio' | 'video' },
  { rejectValue: string }
>(
  'call/initiate',
  async ({ calleeId, type }, { rejectWithValue }) => {
    try {
      const response = await api.post('/calls/initiate', {
        callee_id: calleeId,
        type,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка инициации звонка'
      );
    }
  }
);

export const answerCall = createAsyncThunk<
  Call,
  number,
  { rejectValue: string }
>(
  'call/answer',
  async (callId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/calls/${callId}/answer`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка ответа на звонок'
      );
    }
  }
);

export const endCall = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'call/end',
  async (callId, { rejectWithValue }) => {
    try {
      await api.post(`/calls/${callId}/end`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка завершения звонка'
      );
    }
  }
);

export const rejectCall = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>(
  'call/reject',
  async (callId, { rejectWithValue }) => {
    try {
      await api.post(`/calls/${callId}/reject`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отклонения звонка'
      );
    }
  }
);

export const fetchCallHistory = createAsyncThunk<
  Call[],
  void,
  { rejectValue: string }
>(
  'call/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/calls/history');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки истории звонков'
      );
    }
  }
);

export const getWebRTCToken = createAsyncThunk<
  { token: string; config: any },
  void,
  { rejectValue: string }
>(
  'call/getWebRTCToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/calls/webrtc-token');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка получения WebRTC токена'
      );
    }
  }
);

// Call slice
const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setIncomingCall: (state, action: PayloadAction<Call>) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    setActiveCall: (state, action: PayloadAction<Call>) => {
      state.activeCall = action.payload;
      state.isInCall = true;
      state.incomingCall = null;
    },
    clearActiveCall: (state) => {
      state.activeCall = null;
      state.isInCall = false;
    },
    updateCallStatus: (state, action: PayloadAction<{ callId: number; status: string }>) => {
      const { callId, status } = action.payload;
      
      if (state.activeCall && state.activeCall.id === callId) {
        state.activeCall.status = status as any;
      }
      
      if (state.incomingCall && state.incomingCall.id === callId) {
        state.incomingCall.status = status as any;
      }
      
      const historyCall = state.callHistory.find(call => call.id === callId);
      if (historyCall) {
        historyCall.status = status as any;
      }
    },
    addCallToHistory: (state, action: PayloadAction<Call>) => {
      state.callHistory.unshift(action.payload);
    },
    updateCallDuration: (state, action: PayloadAction<{ callId: number; duration: number }>) => {
      const { callId, duration } = action.payload;
      
      if (state.activeCall && state.activeCall.id === callId) {
        state.activeCall.duration = duration;
      }
      
      const historyCall = state.callHistory.find(call => call.id === callId);
      if (historyCall) {
        historyCall.duration = duration;
      }
    },
  },
  extraReducers: (builder) => {
    // Initiate call
    builder
      .addCase(initiateCall.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiateCall.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeCall = action.payload;
        state.isInCall = true;
        state.error = null;
      })
      .addCase(initiateCall.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка инициации звонка';
      });

    // Answer call
    builder
      .addCase(answerCall.fulfilled, (state, action) => {
        state.activeCall = action.payload;
        state.isInCall = true;
        state.incomingCall = null;
      });

    // End call
    builder
      .addCase(endCall.fulfilled, (state, action) => {
        const callId = action.meta.arg;
        if (state.activeCall && state.activeCall.id === callId) {
          state.callHistory.unshift(state.activeCall);
          state.activeCall = null;
          state.isInCall = false;
        }
      });

    // Reject call
    builder
      .addCase(rejectCall.fulfilled, (state, action) => {
        const callId = action.meta.arg;
        if (state.incomingCall && state.incomingCall.id === callId) {
          state.callHistory.unshift(state.incomingCall);
          state.incomingCall = null;
        }
      });

    // Fetch call history
    builder
      .addCase(fetchCallHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCallHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.callHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchCallHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки истории звонков';
      });

    // Get WebRTC token
    builder
      .addCase(getWebRTCToken.fulfilled, (state, action) => {
        state.webrtcToken = action.payload.token;
        state.webrtcConfig = action.payload.config;
      });
  },
});

export const {
  clearError,
  setIncomingCall,
  clearIncomingCall,
  setActiveCall,
  clearActiveCall,
  updateCallStatus,
  addCallToHistory,
  updateCallDuration,
} = callSlice.actions;

export default callSlice.reducer;
