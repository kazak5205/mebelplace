import { apiService } from './api'
import { Chat, Message } from '../types'

export const chatService = {
  async getChats(): Promise<Chat[]> {
    return apiService.get<Chat[]>('/chats')
  },

  async getChat(id: string): Promise<Chat> {
    return apiService.get<Chat>(`/chats/${id}`)
  },

  async getMessages(chatId: string, params?: {
    page?: number
    limit?: number
    before?: string
  }): Promise<{
    messages: Message[]
    total: number
    page: number
    limit: number
  }> {
    return apiService.get(`/chats/${chatId}/messages`, params)
  },

  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'file' | 'video' = 'text', metadata?: any): Promise<Message> {
    return apiService.post<Message>(`/chats/${chatId}/messages`, {
      content,
      type,
      metadata
    })
  },

  async markAsRead(chatId: string, messageId: string): Promise<void> {
    return apiService.put(`/chats/${chatId}/messages/${messageId}/read`)
  },

  async markChatAsRead(chatId: string): Promise<void> {
    return apiService.put(`/chats/${chatId}/read`)
  },

  async createChat(participantId: string): Promise<Chat> {
    return apiService.post<Chat>('/chats', { participantId })
  },

  // Создание чата до принятия заявки (использует маршрут /chat/create)
  async createChatWithUser(userId: string): Promise<Chat> {
    return apiService.post<Chat>('/chat/create', {
      participants: [userId],
      type: 'private'
    })
  },

  async uploadFile(chatId: string, file: File): Promise<{
    url: string
    filename: string
    size: number
    type: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.upload(`/chats/${chatId}/upload`, formData)
  }
}
