import { apiService } from './api'
import { Chat, Message } from '../types'

export const chatService = {
  async getChats(params?: {
    page?: number
    limit?: number
  }): Promise<{
    chats: Chat[]
    pagination: any
  }> {
    return apiService.get('/chat/list', params)
  },

  async getChat(id: string): Promise<Chat> {
    return apiService.get<Chat>(`/chat/${id}`)
  },

  async getMessages(chatId: string, params?: {
    page?: number
    limit?: number
  }): Promise<{
    messages: Message[]
    pagination: any
  }> {
    return apiService.get(`/chat/${chatId}/messages`, params)
  },

  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'file' | 'video' = 'text', replyTo?: string): Promise<Message> {
    return apiService.post<Message>(`/chat/${chatId}/message`, {
      content,
      type,
      replyTo
    })
  },

  async sendMessageWithFile(chatId: string, file: File, content?: string): Promise<Message> {
    const formData = new FormData()
    formData.append('file', file)
    if (content) {
      formData.append('content', content)
    }
    
    // Определяем тип по file
    let type = 'file'
    if (file.type.startsWith('image/')) {
      type = 'image'
    } else if (file.type.startsWith('video/')) {
      type = 'video'
    }
    formData.append('type', type)
    
    return apiService.upload<Message>(`/chat/${chatId}/message`, formData)
  },

  async markChatAsRead(chatId: string): Promise<void> {
    return apiService.put(`/chat/${chatId}/read`)
  },

  async createChat(participants: string[], type: 'private' | 'group' = 'private', name?: string, orderId?: string): Promise<Chat> {
    return apiService.post<Chat>('/chat/create', {
      participants,
      type,
      name,
      orderId
    })
  },

  // Алиас для совместимости со старым кодом
  async createChatWithUser(userId: string): Promise<Chat> {
    return this.createChat([userId], 'private')
  },

  async leaveChat(chatId: string): Promise<void> {
    return apiService.post(`/chat/${chatId}/leave`)
  },

  async addParticipant(chatId: string, participantId: string): Promise<void> {
    return apiService.post(`/chat/${chatId}/add-participant`, { participantId })
  }
}
