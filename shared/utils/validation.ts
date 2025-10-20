// Validation utilities with Zod schemas
import { z } from 'zod';

// ============================================
// PHONE VALIDATION (Kazakhstan)
// ============================================

// Поддерживаемые форматы:
// +77001234567
// 87001234567
// 77001234567
// 7001234567 (без префикса)

export const normalizeKazakhstanPhone = (phone: string): string => {
  // Удаляем все нечисловые символы кроме +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // Если начинается с 8, заменяем на +7
  if (normalized.startsWith('8')) {
    normalized = '+7' + normalized.slice(1);
  }
  
  // Если начинается с 7 (без +), добавляем +
  if (normalized.startsWith('7') && !normalized.startsWith('+7')) {
    normalized = '+' + normalized;
  }
  
  // Если начинается с +77, оставляем как есть
  // Если не начинается с +7, добавляем +7
  if (!normalized.startsWith('+7')) {
    normalized = '+7' + normalized;
  }
  
  return normalized;
};

export const isValidKazakhstanPhone = (phone: string): boolean => {
  const normalized = normalizeKazakhstanPhone(phone);
  // Казахстанский номер: +7 + 10 цифр
  const kazakhstanPhoneRegex = /^\+7\d{10}$/;
  return kazakhstanPhoneRegex.test(normalized);
};

// ============================================
// ZOD SCHEMAS
// ============================================

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email обязателен')
  .email('Неверный формат email')
  .toLowerCase()
  .trim();

// Phone validation (Kazakhstan)
export const phoneSchema = z
  .string()
  .min(1, 'Номер телефона обязателен')
  .transform(normalizeKazakhstanPhone)
  .refine(isValidKazakhstanPhone, {
    message: 'Неверный формат номера. Используйте: +7XXXXXXXXXX или 8XXXXXXXXXX',
  });

// Email OR Phone (для логина)
export const emailOrPhoneSchema = z
  .string()
  .min(1, 'Email или номер телефона обязателен')
  .refine(
    (value) => {
      // Проверяем, является ли это email
      const isEmail = z.string().email().safeParse(value).success;
      if (isEmail) return true;
      
      // Проверяем, является ли это телефон
      return isValidKazakhstanPhone(value);
    },
    {
      message: 'Введите корректный email или номер телефона',
    }
  );

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать минимум 8 символов')
  .max(100, 'Пароль слишком длинный')
  .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
  .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
  .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(50, 'Имя слишком длинное')
  .regex(/^[а-яА-ЯёЁa-zA-Z\s-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

// ============================================
// AUTH SCHEMAS
// ============================================

// Login schema (email OR phone + password)
export const loginSchema = z.object({
  emailOrPhone: emailOrPhoneSchema,
  password: z.string().min(1, 'Пароль обязателен'),
  rememberMe: z.boolean().optional(),
});

// Register schema
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  role: z.enum(['client', 'master'], {
    required_error: 'Выберите роль',
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Необходимо принять условия использования',
  }),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Укажите email или номер телефона',
    path: ['email'],
  }
).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  }
);

// ============================================
// ORDER SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  title: z
    .string()
    .min(5, 'Название должно содержать минимум 5 символов')
    .max(100, 'Название слишком длинное'),
  description: z
    .string()
    .min(20, 'Описание должно содержать минимум 20 символов')
    .max(1000, 'Описание слишком длинное'),
  category: z
    .string()
    .min(1, 'Выберите категорию'),
  budget: z
    .number()
    .min(0, 'Бюджет не может быть отрицательным')
    .optional(),
  location: z.object({
    city: z.string().min(1, 'Выберите город'),
    region: z.string().min(1, 'Выберите регион'),
    address: z.string().min(5, 'Укажите адрес'),
  }),
  images: z
    .array(z.string())
    .max(10, 'Максимум 10 изображений')
    .optional(),
});

export const orderResponseSchema = z.object({
  message: z
    .string()
    .min(20, 'Сообщение должно содержать минимум 20 символов')
    .max(500, 'Сообщение слишком длинное'),
  proposedPrice: z
    .number()
    .min(0, 'Цена не может быть отрицательной'),
  estimatedTime: z
    .string()
    .min(1, 'Укажите срок выполнения'),
});

// ============================================
// CHAT SCHEMAS
// ============================================

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Сообщение слишком длинное'),
  type: z.enum(['text', 'image', 'file', 'video']).default('text'),
  replyTo: z.string().optional(),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  specialties: z.array(z.string()).optional(),
  location: z.object({
    city: z.string(),
    region: z.string(),
  }).optional(),
});

// ============================================
// VIDEO SCHEMAS
// ============================================

export const uploadVideoSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название слишком длинное'),
  description: z
    .string()
    .max(500, 'Описание слишком длинное')
    .optional(),
  tags: z
    .array(z.string())
    .max(10, 'Максимум 10 тегов')
    .optional(),
  category: z.string().optional(),
});

// ============================================
// UTILITY TYPES
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type OrderResponseFormData = z.infer<typeof orderResponseSchema>;
export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UploadVideoFormData = z.infer<typeof uploadVideoSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

export const formatPhoneForDisplay = (phone: string): string => {
  const normalized = normalizeKazakhstanPhone(phone);
  // +7 (700) 123-45-67
  if (normalized.length === 12) {
    return `+7 (${normalized.slice(2, 5)}) ${normalized.slice(5, 8)}-${normalized.slice(8, 10)}-${normalized.slice(10)}`;
  }
  return normalized;
};

export const detectInputType = (value: string): 'email' | 'phone' | 'unknown' => {
  // Удаляем пробелы
  const trimmed = value.trim();
  
  // Проверяем на email
  if (trimmed.includes('@')) {
    return 'email';
  }
  
  // Проверяем на телефон (содержит только цифры и +)
  if (/^[+\d\s()-]+$/.test(trimmed)) {
    return 'phone';
  }
  
  return 'unknown';
};

