import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api/client';

// Types
export interface Chat {
  id: number;
  type: 'private' | 'group';
  name?: string;
  avatar_url?: string;
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  id: number;
  username: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen?: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  user_id: number;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file';
  file_url?: string;
  created_at: string;
  updated_at: string;
  user: ChatParticipant;
  is_read: boolean;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    hasMore: true,
  },
};

// Async thunks
export const fetchChats = createAsyncThunk<
  Chat[],
  void,
  { rejectValue: string }
>(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chats');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки чатов'
      );
    }
  }
);

export const createChat = createAsyncThunk<
  Chat,
  { participant_id: number; type?: 'private' | 'group' },
  { rejectValue: string }
>(
  'chat/create',
  async (chatData, { rejectWithValue }) => {
    try {
      const response = await api.post('/chats/create', chatData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания чата'
      );
    }
  }
);

export const fetchChatMessages = createAsyncThunk<
  ChatMessage[],
  { chatId: number; page?: number; limit?: number },
  { rejectValue: string }
>(
  'chat/fetchMessages',
  async ({ chatId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки сообщений'
      );
    }
  }
);

export const sendMessage = createAsyncThunk<
  ChatMessage,
  { chatId: number; content: string; messageType?: 'text' | 'image' | 'video' | 'file' },
  { rejectValue: string }
>(
  'chat/sendMessage',
  async ({ chatId, content, messageType = 'text' }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chats/${chatId}/send`, {
        content,
        message_type: messageType,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отправки сообщения'
      );
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
      state.messages = [];
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action: PayloadAction<ChatMessage>) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    removeMessage: (state, action: PayloadAction<number>) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload);
    },
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: number; message: ChatMessage }>) => {
      const chat = state.chats.find(c => c.id === action.payload.chatId);
      if (chat) {
        chat.last_message = action.payload.message;
        chat.updated_at = action.payload.message.created_at;
      }
    },
    incrementUnreadCount: (state, action: PayloadAction<number>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unread_count += 1;
      }
    },
    clearUnreadCount: (state, action: PayloadAction<number>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unread_count = 0;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch chats
    builder
      .addCase(fetchChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
        state.error = null;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки чатов';
      });

    // Create chat
    builder
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
      });

    // Fetch chat messages
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.page === 1) {
          state.messages = action.payload;
        } else {
          state.messages.unshift(...action.payload);
        }
        state.error = null;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Ошибка загрузки сообщений';
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || 'Ошибка отправки сообщения';
      });
  },
});

export const {
  clearError,
  setCurrentChat,
  clearCurrentChat,
  addMessage,
  updateMessage,
  removeMessage,
  updateChatLastMessage,
  incrementUnreadCount,
  clearUnreadCount,
} = chatSlice.actions;

export default chatSlice.reducer;
