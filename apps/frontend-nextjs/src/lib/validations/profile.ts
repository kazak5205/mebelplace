import { z } from 'zod'

export const updateProfileSchema = z.object({
  username: z.string().min(3, 'Имя должно быть не менее 3 символов').optional(),
  email: z.string().email('Неверный формат email').optional(),
  phone: z.string().regex(/^\+7\d{10}$/, 'Неверный формат телефона').optional(),
  region: z.string().optional(),
  bio: z.string().max(500, 'Максимум 500 символов').optional(),
  avatar: z.string().url('Неверный URL').optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Введите текущий пароль'),
  new_password: z.string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Пароли не совпадают',
  path: ['confirm_password'],
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>


