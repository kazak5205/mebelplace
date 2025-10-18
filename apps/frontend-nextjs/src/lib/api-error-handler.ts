/**
 * Centralized API error handling
 * Provides consistent error handling across the application
 */

import { logger } from './logger';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler;

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler();
    }
    return ApiErrorHandler.instance;
  }

  private constructor() {}

  /**
   * Handle API errors with appropriate user feedback
   */
  handleError(error: any, context?: string): ApiError {
    const apiError = this.parseError(error);
    
    // Log error for debugging
    logger.error(`API Error${context ? ` in ${context}` : ''}`, error, {
      status: apiError.status,
      code: apiError.code,
      details: apiError.details,
    });

    // Show user-friendly message
    this.showUserMessage(apiError);

    return apiError;
  }

  /**
   * Parse different error formats into consistent ApiError
   */
  private parseError(error: any): ApiError {
    // Axios error
    if (error?.response) {
      return {
        message: error.response.data?.message || error.response.data?.error || 'Server error occurred',
        status: error.response.status,
        code: error.response.data?.code,
        details: error.response.data,
      };
    }

    // Network error
    if (error?.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
        details: error.request,
      };
    }

    // Generic error
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'GENERIC_ERROR',
        details: error,
      };
    }

    // String error
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR',
      };
    }

    // Unknown error
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  /**
   * Show appropriate user message based on error type
   */
  private showUserMessage(error: ApiError): void {
    const { message, status, code } = error;

    // Don't show toast for certain error codes
    if (this.shouldSilentError(code)) {
      return;
    }

    // Customize message based on status code
    let userMessage = message;

    switch (status) {
      case 401:
        userMessage = 'Please log in to continue';
        break;
      case 403:
        userMessage = 'You don\'t have permission to perform this action';
        break;
      case 404:
        userMessage = 'The requested resource was not found';
        break;
      case 429:
        userMessage = 'Too many requests. Please try again later';
        break;
      case 500:
        userMessage = 'Server error. Please try again later';
        break;
      case 0:
        userMessage = 'Network error. Please check your connection';
        break;
    }

    // Show toast notification
    toast.error(userMessage, {
      duration: 5000,
      position: 'top-right',
    });
  }

  /**
   * Determine if error should be handled silently
   */
  private shouldSilentError(code?: string): boolean {
    const silentCodes = [
      'VALIDATION_ERROR',
      'FORM_VALIDATION_ERROR',
      'CANCELLED_REQUEST',
    ];

    return silentCodes.includes(code || '');
  }

  /**
   * Handle validation errors specifically
   */
  handleValidationError(errors: Record<string, string[]>): void {
    const firstError = Object.values(errors)[0]?.[0];
    if (firstError) {
      toast.error(firstError);
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(): void {
    toast.error('Network error. Please check your connection and try again.', {
      duration: 8000,
    });
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(): void {
    toast.error('Your session has expired. Please log in again.', {
      duration: 5000,
    });
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
}

// Export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance();

// Export for easy access
export default apiErrorHandler;
