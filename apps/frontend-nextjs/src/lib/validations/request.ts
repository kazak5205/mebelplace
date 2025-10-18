/**
 * Request Validation Schemas
 * Zod schemas for request forms
 */

import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().min(5, 'Название должно содержать минимум 5 символов').max(100),
  description: z.string().min(20, 'Описание должно содержать минимум 20 символов').max(1000),
  category: z.string().min(1, 'Выберите категорию'),
  budget_min: z.number().min(0, 'Минимальный бюджет должен быть положительным'),
  budget_max: z.number().min(0, 'Максимальный бюджет должен быть положительным'),
  region: z.string().min(1, 'Выберите регион'),
  deadline: z.string().optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

