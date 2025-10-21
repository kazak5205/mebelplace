/**
 * Chat service using shared chatApi
 * SYNCHRONIZED WITH WEB VERSION - same API, same format
 */
import { apiClient } from './apiService'
import { chatApi } from '@shared/utils/api'

const baseChatService = chatApi(apiClient)

// Export with same interface as web version
export const chatService = {
  // List and get
  getChats: () => baseChatService.list(),
  getChat: (id: string) => baseChatService.get(id),
  
  // Create
  createChat: (participantId: string) => baseChatService.create(participantId),
  createChatWithUser: (userId: string) => baseChatService.createWithUser(userId),
  
  // Messages
  getMessages: (chatId: string, params?: any) => 
    baseChatService.getMessages(chatId, params),
  sendMessage: (chatId: string, content: string, type: string = 'text', metadata?: any) => 
    baseChatService.sendMessage(chatId, content, type, metadata),
  
  // Read status
  markAsRead: (chatId: string, messageId: string) => 
    baseChatService.markAsRead(chatId, messageId),
  markChatAsRead: (chatId: string) => 
    baseChatService.markChatAsRead(chatId),
  
  // File upload
  uploadFile: async (chatId: string, fileUri: string) => {
    const formData = new FormData()
    // For React Native, we need to handle file uploads differently
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg', // or detect from file
      name: 'upload.jpg',
    } as any)
    return baseChatService.uploadFile(chatId, formData)
  },
}

// Export base service for direct use
export default baseChatService
