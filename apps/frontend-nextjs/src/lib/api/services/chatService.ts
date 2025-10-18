import { api } from '../client';
import { Chat, ChatMessage } from '@/lib/store/slices/chatSlice';

export const chatService = {
  // Get user chats
  getChats: async (): Promise<Chat[]> => {
    const response = await api.get('/chats');
    return response.data;
  },

  // Create new chat
  createChat: async (participantId: number, type: 'private' | 'group' = 'private'): Promise<Chat> => {
    const response = await api.post('/chats/create', {
      participant_id: participantId,
      type,
    });
    return response.data;
  },

  // Get chat messages
  getMessages: async (chatId: number, page: number = 1, limit: number = 50): Promise<ChatMessage[]> => {
    const response = await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Send message
  sendMessage: async (chatId: number, content: string, messageType: 'text' | 'image' | 'video' | 'file' = 'text'): Promise<ChatMessage> => {
    const response = await api.post(`/chats/${chatId}/send`, {
      content,
      message_type: messageType,
    });
    return response.data;
  },

  // Get group chats
  getGroupChats: async (): Promise<Chat[]> => {
    const response = await api.get('/chats/group');
    return response.data;
  },

  // Create group chat
  createGroupChat: async (name: string, participantIds: number[]): Promise<Chat> => {
    const response = await api.post('/chats/group/create', {
      name,
      participant_ids: participantIds,
    });
    return response.data;
  },

  // Get group chat details
  getGroupChat: async (chatId: number): Promise<Chat> => {
    const response = await api.get(`/chats/group/${chatId}`);
    return response.data;
  },

  // Get chat participants
  getParticipants: async (chatId: number): Promise<any[]> => {
    const response = await api.get(`/chats/${chatId}/participants`);
    return response.data;
  },

  // Add participant to group chat
  addParticipant: async (chatId: number, userId: number): Promise<void> => {
    await api.post(`/chats/${chatId}/participants`, { user_id: userId });
  },

  // Send group message
  sendGroupMessage: async (chatId: number, content: string, messageType: 'text' | 'image' | 'video' | 'file' = 'text'): Promise<ChatMessage> => {
    const response = await api.post(`/chats/group/${chatId}/send`, {
      content,
      message_type: messageType,
    });
    return response.data;
  },

  // Leave group chat
  leaveGroupChat: async (chatId: number): Promise<void> => {
    await api.post(`/chats/group/${chatId}/leave`);
  },
};
