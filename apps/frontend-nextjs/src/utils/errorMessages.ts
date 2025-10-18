/**
 * User-Friendly Error Messages
 * Maps technical errors to human-readable messages
 * Per TZ: no stack traces, friendly text, retry options
 */

export const ERROR_MESSAGES = {
  // Network errors
  'Network Error': 'Ошибка сети. Проверьте подключение к интернету.',
  'ERR_NETWORK': 'Нет подключения к интернету. Проверьте Wi-Fi или мобильные данные.',
  'ERR_CONNECTION_REFUSED': 'Не удалось подключиться к серверу. Попробуйте позже.',
  'ERR_CONNECTION_RESET': 'Соединение прервано. Попробуйте ещё раз.',
  'ERR_TIMEOUT': 'Превышено время ожидания. Попробуйте снова.',
  
  // HTTP status codes
  400: 'Некорректные данные. Проверьте введённую информацию.',
  401: 'Необходима авторизация. Войдите в аккаунт.',
  403: 'Доступ запрещён. У вас нет прав для этого действия.',
  404: 'Не найдено. Возможно, контент был удалён.',
  409: 'Конфликт данных. Попробуйте обновить страницу.',
  422: 'Ошибка валидации. Проверьте заполненные поля.',
  429: 'Слишком много запросов. Подождите немного.',
  500: 'Ошибка сервера. Мы уже работаем над исправлением.',
  502: 'Сервер временно недоступен. Попробуйте через минуту.',
  503: 'Сервис временно недоступен. Ведутся технические работы.',
  504: 'Превышено время ожидания сервера.',
  
  // Auth errors
  'invalid_credentials': 'Неверный email или пароль.',
  'user_not_found': 'Пользователь не найден.',
  'email_already_exists': 'Этот email уже используется.',
  'phone_already_exists': 'Этот номер телефона уже зарегистрирован.',
  'invalid_token': 'Ссылка устарела. Запросите новую.',
  'token_expired': 'Сессия истекла. Войдите заново.',
  'password_too_weak': 'Пароль слишком простой. Используйте буквы, цифры и символы.',
  
  // Upload errors  
  'file_too_large': 'Файл слишком большой. Максимум 500 МБ.',
  'invalid_file_type': 'Неподдерживаемый формат файла.',
  'upload_failed': 'Ошибка загрузки. Проверьте соединение и попробуйте снова.',
  'presign_failed': 'Ошибка загрузки. Попробуйте позже.',
  
  // Video errors
  'video_not_found': 'Видео не найдено или было удалено.',
  'video_processing': 'Видео обрабатывается. Подождите немного.',
  
  // Request/Order errors
  'request_not_found': 'Заявка не найдена.',
  'proposal_already_accepted': 'Это предложение уже было принято.',
  'insufficient_funds': 'Недостаточно средств на балансе.',
  
  // Permission errors
  'camera_access_denied': 'Нет доступа к камере. Разрешите в настройках браузера.',
  'microphone_access_denied': 'Нет доступа к микрофону. Разрешите в настройках.',
  'location_access_denied': 'Нет доступа к геолокации.',
  'notification_permission_denied': 'Уведомления отключены. Включите в настройках браузера.',
  
  // Stream errors
  'stream_token_expired': 'Токен стрима истёк. Пересоздайте трансляцию.',
  'stream_not_found': 'Трансляция не найдена или завершена.',
  'stream_connection_failed': 'Не удалось подключиться к трансляции.',
  
  // Generic
  'unknown_error': 'Произошла ошибка. Попробуйте обновить страницу.',
  'server_error': 'Что-то пошло не так на сервере. Мы уже исправляем.',
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  // Handle Axios errors
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    // Check for custom error message from backend
    if (data?.error && typeof data.error === 'string') {
      // Check if we have a friendly version
      const friendly = ERROR_MESSAGES[data.error as keyof typeof ERROR_MESSAGES];
      if (friendly) return friendly;
    }
    
    // Use status code message
    const statusMessage = ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES];
    if (statusMessage) return statusMessage;
  }
  
  // Handle network errors
  if (error?.code) {
    const codeMessage = ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES];
    if (codeMessage) return codeMessage;
  }
  
  // Handle error messages
  if (error?.message) {
    const msgKey = error.message as keyof typeof ERROR_MESSAGES;
    if (ERROR_MESSAGES[msgKey]) return ERROR_MESSAGES[msgKey];
    
    // Check if message contains known patterns
    if (error.message.includes('Network')) return ERROR_MESSAGES['Network Error'];
    if (error.message.includes('timeout')) return ERROR_MESSAGES['ERR_TIMEOUT'];
  }
  
  // Fallback
  return ERROR_MESSAGES['unknown_error'];
}

/**
 * Get error with retry suggestion
 */
export function getErrorWithRetry(error: any): { message: string; canRetry: boolean } {
  const message = getUserFriendlyError(error);
  
  // Network/timeout errors can retry
  const canRetry = 
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ERR_TIMEOUT' ||
    error?.code === 'ERR_CONNECTION_REFUSED' ||
    error?.response?.status === 503 ||
    error?.response?.status === 502 ||
    error?.response?.status === 429;
  
  return { message, canRetry };
}

/**
 * Log error for monitoring (Sentry)
 */
export function logError(error: any, context?: Record<string, any>) {
  // In production, send to Sentry
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    const win = window as any;
    if (win.Sentry) {
      win.Sentry.captureException(error, { extra: context });
    }
  }
  
  // Always log to console in dev
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error, context);
  }
}

