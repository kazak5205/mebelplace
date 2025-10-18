/**
 * Auth Validation Schemas
 * Zod schemas for authentication forms
 */

import { z } from 'zod';

// Base schemas for individual fields
export const emailSchema = z.string().email('Неверный формат email');

export const passwordSchema = z.string()
  .min(6, 'Пароль должен содержать минимум 6 символов')
  .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать цифру');

export const loginSchema = z.object({
  email: z.string().min(1, 'Введите email или телефон'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email_or_phone: z.string().min(1, 'Введите email или номер телефона'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  confirmPassword: z.string().optional(),
  role: z.enum(['buyer', 'master']).optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export const verifySMSSchema = z.object({
  phone: z.string().regex(/^\+7\d{10}$/, 'Неверный формат телефона'),
  code: z.string().length(6, 'Код должен содержать 6 цифр'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifySMSInput = z.infer<typeof verifySMSSchema>;

