import { z } from 'zod'

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Комментарий не может быть пустым')
    .max(500, 'Максимум 500 символов'),
  parent_id: z.number().optional(),
})

export type CommentInput = z.infer<typeof commentSchema>


