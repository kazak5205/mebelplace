/**
 * Sentry Integration Helper
 * Simplified error tracking utilities
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: {
  id: string | number;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user information (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Capture custom exception with context
 */
export function captureException(
  error: Error,
  context?: {
    level?: Sentry.SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
  }
) {
  Sentry.captureException(error, {
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture custom message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for better error context
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category: category || 'custom',
    level: level || 'info',
    data,
  });
}

/**
 * Set additional tags
 */
export function setTags(tags: Record<string, string>) {
  Sentry.setTags(tags);
}

/**
 * Set additional context
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

export default Sentry;
