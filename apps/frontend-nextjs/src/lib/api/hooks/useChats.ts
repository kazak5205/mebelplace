/**
 * Chats API Hooks
 * React Query hooks for chat-related endpoints
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import api from '../api-wrapper';

export interface Chat {
  id: number;
  participant: {
    id: number;
    username: string;
    avatar: string | null;
    is_online: boolean;
  };
  last_message: {
    id: number;
    content: string;
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'photo' | 'voice' | 'audio' | 'video' | 'file';
  attachments: Array<{
    id: number;
    type: 'image' | 'video' | 'file';
    url: string;
    filename: string;
  }>;
  is_read: boolean;
  created_at: string;
}

export interface SendMessageData {
  content: string;
  attachments?: File[];
}

export interface ChatsResponse {
  data: Chat[];
  total: number;
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  has_more: boolean;
}

// Query Keys
export const chatKeys = {
  all: ['chats'] as const,
  list: ['chats', 'list'] as const,
  detail: (id: number) => ['chats', 'detail', id] as const,
  messages: (id: number) => ['chats', 'messages', id] as const,
};

// Get chats list
export function useChats(
  options?: Omit<UseQueryOptions<ChatsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ChatsResponse, Error>({
    queryKey: chatKeys.list,
    queryFn: () => api.get<ChatsResponse>('/chats'),
    ...options,
  });
}

// Get single chat
export function useChat(
  chatId: number,
  options?: Omit<UseQueryOptions<Chat, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Chat, Error>({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => api.get<Chat>(`/chats/${chatId}`),
    enabled: chatId > 0,
    ...options,
  });
}

// Get chat messages with infinite scroll
export function useChatMessages(chatId: number, limit: number = 50) {
  return useInfiniteQuery<MessagesResponse, Error>({
    queryKey: chatKeys.messages(chatId),
    queryFn: ({ pageParam = 0 }) =>
      api.get<MessagesResponse>(
        `/chats/${chatId}/messages?limit=${limit}&offset=${pageParam}`
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) return undefined;
      return allPages.length * limit;
    },
    enabled: chatId > 0,
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    Message,
    Error,
    { chatId: number; data: SendMessageData }
  >({
    mutationFn: async ({ chatId, data }) => {
      if (data.attachments && data.attachments.length > 0) {
        const formData = new FormData();
        formData.append('content', data.content);
        data.attachments.forEach((file) => {
          formData.append('attachments', file);
        });

        return api.post<Message>(`/chats/${chatId}/messages`, formData);
      }

      return api.post<Message>(`/chats/${chatId}/messages`, {
        content: data.content,
      });
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    },
  });
}

// Mark messages as read
export function useMarkMessagesRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { chatId: number; messageIds: number[] }>({
    mutationFn: ({ chatId, messageIds }) =>
      api.post<void>(`/chats/${chatId}/read`, { message_ids: messageIds }),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    },
  });
}

// Create or get chat with user
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, Error, number>({
    mutationFn: (userId: number) =>
      api.post<Chat>('/chats', { participant_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.list });
    },
  });
}

