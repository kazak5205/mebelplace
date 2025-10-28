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

  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'file' | 'video' = 'text', replyTo?: string, metadata?: any): Promise<Message> {
    return apiService.post<Message>(`/chat/${chatId}/message`, {
      content,
      type,
      replyTo,
      metadata
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
    
    const message = await apiService.upload<any>(`/chat/${chatId}/message`, formData)
    
    // Преобразуем camelCase поля в snake_case для совместимости
    return {
      ...message,
      file_path: message.filePath || message.file_path,
      file_name: message.fileName || message.file_name,
      file_size: message.fileSize || message.file_size,
      sender_id: message.senderId || message.sender_id,
      chat_id: message.chatId || message.chat_id,
      reply_to: message.replyTo || message.reply_to,
      created_at: message.createdAt || message.created_at,
      updated_at: message.updatedAt || message.updated_at
    }
  },

  async markChatAsRead(chatId: string): Promise<void> {
    return apiService.put(`/chat/${chatId}/read`)
  },

  async createChat(participants: string[], type: 'private' | 'group' = 'private', name?: string, orderId?: string): Promise<Chat> {
    const payload: any = {
      participants,
      type
    }
    
    if (name) payload.name = name
    if (orderId) payload.orderId = orderId
    
    return apiService.post<Chat>('/chat/create', payload)
  },

  // Алиас для совместимости со старым кодом
  async createChatWithUser(userId: string): Promise<Chat> {
    return apiService.post<Chat>('/chat/create', { participants: [userId], type: 'private' })
  },

  async leaveChat(chatId: string): Promise<void> {
    return apiService.post(`/chat/${chatId}/leave`)
  },

  async addParticipant(chatId: string, participantId: string): Promise<void> {
    return apiService.post(`/chat/${chatId}/add-participant`, { participantId })
  },

  async deleteChat(chatId: string): Promise<void> {
    return apiService.delete(`/chats/${chatId}`)
  },

  // Support chat methods
  async createSupportChat(): Promise<Chat> {
    return apiService.post<Chat>('/chat/support')
  },

  async getSupportChat(): Promise<Chat> {
    return apiService.get<Chat>('/chat/support')
  }
}
