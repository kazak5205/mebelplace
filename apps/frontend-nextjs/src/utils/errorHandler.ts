'use client'

// Generic Error Handler for application-wide error management
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: Array<{
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  }> = [];
  private readonly maxQueueSize = 50;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: {
    code: string;
    message: string;
    details?: any;
  }): void {
    const errorEntry = {
      ...error,
      timestamp: new Date().toISOString(),
    };

    this.errorQueue.push(errorEntry);

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', errorEntry);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEntry),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    }
  }

  public getErrorQueue() {
    return [...this.errorQueue];
  }

  public clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Utility function to handle errors (overloaded for different types)
export function handleError(error: any): { message: string; code?: string; status?: number } {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      status: (error as any).response?.status,
    };
  }
  
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error?.response) {
    // Axios-style error
    return {
      message: error.response.data?.message || error.message || 'Unknown error',
      status: error.response.status,
    };
  }
  
  return {
    message: error?.message || 'Unknown error',
  };
}

// Format error for display
export function formatError(error: any): string {
  const handled = handleError(error);
  if (handled.status) {
    return `[${handled.status}] ${handled.message}`;
  }
  return handled.message;
}

// Check if error is a network error
export function isNetworkError(error: any): boolean {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return true;
  }
  
  if (error?.code === 'ECONNABORTED' || error?.code === 'ERR_NETWORK') {
    return true;
  }
  
  if (error?.message?.includes('timeout') || error?.message?.includes('Network Error')) {
    return true;
  }
  
  return false;
}

// Check if error is 401 Unauthorized
export function is401Error(error: any): boolean {
  return error?.response?.status === 401 || error?.status === 401;
}

// Обработчик ошибок Chrome Extension API
export class ChromeExtensionErrorHandler {
  private static instance: ChromeExtensionErrorHandler
  private isInitialized = false

  private constructor() {}

  public static getInstance(): ChromeExtensionErrorHandler {
    if (!ChromeExtensionErrorHandler.instance) {
      ChromeExtensionErrorHandler.instance = new ChromeExtensionErrorHandler()
    }
    return ChromeExtensionErrorHandler.instance
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return

    // Обрабатываем ошибки Chrome Extension API
    this.handleChromeRuntimeErrors()
    
    // Обрабатываем заблокированные ресурсы
    this.handleBlockedResources()
    
    this.isInitialized = true
  }

  private handleChromeRuntimeErrors() {
    // Перехватываем ошибки runtime.lastError
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Фильтруем ошибки Chrome Extension API
      if (message.includes('runtime.lastError') || 
          message.includes('message port closed') ||
          message.includes('Extension context invalidated') ||
          message.includes('Unchecked runtime.lastError')) {
        // Не показываем эти ошибки в консоли
        return
      }
      
      // Показываем остальные ошибки
      originalConsoleError.apply(console, args)
    }

    // Также перехватываем console.warn для runtime ошибок
    const originalConsoleWarn = console.warn
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Фильтруем предупреждения Chrome Extension API
      if (message.includes('runtime.lastError') || 
          message.includes('message port closed') ||
          message.includes('Extension context invalidated') ||
          message.includes('Unchecked runtime.lastError')) {
        // Не показываем эти предупреждения в консоли
        return
      }
      
      // Показываем остальные предупреждения
      originalConsoleWarn.apply(console, args)
    }

    // Обрабатываем необработанные ошибки
    window.addEventListener('error', (event) => {
      if (event.message?.includes('runtime.lastError') ||
          event.message?.includes('message port closed')) {
        event.preventDefault()
        event.stopPropagation()
      }
    })

    // Обрабатываем необработанные промисы
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('runtime.lastError') ||
          event.reason?.message?.includes('message port closed')) {
        event.preventDefault()
      }
    })
  }

  private handleBlockedResources() {
    // Перехватываем ошибки заблокированных ресурсов
    const originalConsoleWarn = console.warn
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Фильтруем ошибки заблокированных ресурсов
      if (message.includes('ERR_BLOCKED_BY_CLIENT') ||
          message.includes('ga/') ||
          message.includes('google-analytics') ||
          message.includes('googletagmanager') ||
          message.includes('Failed to load resource') ||
          message.includes('404 (Not Found)')) {
        // Не показываем эти предупреждения в консоли
        return
      }
      
      // Показываем остальные предупреждения
      originalConsoleWarn.apply(console, args)
    }

    // Также перехватываем console.error для заблокированных ресурсов
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Фильтруем ошибки заблокированных ресурсов
      if (message.includes('ERR_BLOCKED_BY_CLIENT') ||
          message.includes('ga/') ||
          message.includes('google-analytics') ||
          message.includes('googletagmanager') ||
          message.includes('Failed to load resource') ||
          message.includes('404 (Not Found)')) {
        // Не показываем эти ошибки в консоли
        return
      }
      
      // Показываем остальные ошибки
      originalConsoleError.apply(console, args)
    }
  }

  // Метод для безопасной работы с Chrome Extension API
  public safeChromeCall<T>(callback: () => T, fallback?: T): T | undefined {
    try {
      const chromeObj = (typeof window !== 'undefined') ? (window as any).chrome : undefined;
      if (typeof chromeObj !== 'undefined' && chromeObj?.runtime) {
        return callback()
      }
    } catch (error) {
      // Игнорируем ошибки Chrome Extension API
    }
    return fallback
  }
}

// Экспортируем singleton
export const chromeErrorHandler = ChromeExtensionErrorHandler.getInstance()

// Функции для обработки API ошибок
export function handleApiError(error: any, context: string) {
  const status = error.response?.status;
  const data = error.response?.data;
  const url = error.config?.url;
  
  const errorCode = status ? `API_${status}` : 'API_ERROR';
  const errorMessage = data?.message 
    ? `${context}: ${data.message}` 
    : `${context}: ${error.message || 'Unknown error'}`;

  ErrorHandler.getInstance().handleError({
    code: errorCode,
    message: errorMessage,
    details: {
      context,
      status,
      data,
      url,
    },
  });

  console.warn(`API Error in ${context}:`, error);
  
  // Можно добавить отправку ошибок в систему мониторинга
  if (typeof window !== 'undefined') {
    // Отправляем ошибку в наш API для логирования
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message || error,
        context,
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Игнорируем ошибки отправки логов
    })
  }
}

export function handleNetworkError(error: any, context: string) {
  console.warn(`Network Error in ${context}:`, error)
  
  // Проверяем, не заблокирован ли запрос
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    console.warn('Request blocked by client (likely ad blocker)')
  }
  
  // Отправляем ошибку в систему мониторинга
  handleApiError(error, context)
}

// Инициализируем при загрузке
if (typeof window !== 'undefined') {
  chromeErrorHandler.init()
}