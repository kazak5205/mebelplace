import { z } from 'zod'

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Сообщение не может быть пустым').max(2000, 'Максимум 2000 символов'),
  attachments: z.array(z.object({
    type: z.enum(['image', 'video', 'audio', 'document']),
    url: z.string().url(),
  })).optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

export const createChatSchema = z.object({
  type: z.enum(['private', 'group', 'channel']),
  title: z.string().min(3, 'Название должно быть не менее 3 символов').optional(),
  participant_ids: z.array(z.number()).min(1, 'Укажите хотя бы одного участника'),
})

export type CreateChatInput = z.infer<typeof createChatSchema>


