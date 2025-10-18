/**
 * Centralized logging system for MebelPlace
 * Replaces console statements with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as any : undefined,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    if (this.isProduction) return level === 'warn' || level === 'error';
    return true;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context, error);

    // In development, use console for better debugging
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '', error || '');
      return;
    }

    // In production, send to monitoring service (Sentry, etc.)
    if (this.isProduction) {
      // TODO: Integrate with Sentry or other monitoring service
      // For now, we'll use console but this should be replaced
      console[level](JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }

  // API specific logging
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, { method, url, data });
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'debug';
    this.log(level, `API Response: ${method} ${url} - ${status}`, { method, url, status, data });
  }

  // User action logging
  userAction(action: string, context?: Record<string, any>): void {
    this.info(`User Action: ${action}`, context);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} took ${duration}ms`, { operation, duration, ...context });
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for easy access
export default logger;
