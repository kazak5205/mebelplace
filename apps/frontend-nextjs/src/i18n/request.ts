/**
 * i18n Request Configuration
 * Server-side internationalization for next-intl 3.22+
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment, but since we don't use URL-based routing,
  // we'll get it from cookie/headers via our middleware
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
    timeZone: 'Asia/Almaty',
    now: new Date(),
  };
});
