/**
 * Sentry Server Configuration
 * Error tracking for server-side errors
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Debugging
  debug: process.env.NODE_ENV === 'development',

  // Ignore certain errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
  ],

  // Before send hook
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error(hint?.originalException || hint?.syntheticException);
      return null;
    }
    return event;
  },
});
