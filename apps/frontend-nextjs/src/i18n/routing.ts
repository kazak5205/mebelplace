/**
 * i18n Routing Configuration
 */

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'kz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed', // ru без префикса, kz/en с префиксом
});
