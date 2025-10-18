import { z } from 'zod'

export const searchSchema = z.object({
  query: z.string().min(1, 'Введите поисковый запрос'),
  type: z.enum(['video', 'user', 'hashtag', 'channel', 'all']).optional(),
  region: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(['popularity', 'date', 'rating']).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
})

export type SearchInput = z.infer<typeof searchSchema>

export const filtersSchema = z.object({
  category: z.string().optional(),
  region: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
})

export type FiltersInput = z.infer<typeof filtersSchema>


