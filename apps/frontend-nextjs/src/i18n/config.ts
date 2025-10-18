/**
 * i18n Configuration for MebelPlace
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Поддерживаемые локали
export const locales = ['ru', 'en', 'kk'] as const;
export type Locale = (typeof locales)[number];

// Локаль по умолчанию
export const defaultLocale: Locale = 'ru';

// Проверка валидности локали
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Получение локали из URL или заголовков
export function getLocaleFromRequest(request: Request): Locale {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Извлекаем локаль из пути
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  
  if (isValidLocale(potentialLocale)) {
    return potentialLocale;
  }
  
  // Fallback на заголовки Accept-Language
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase())
      .map(lang => {
        // Извлекаем основную часть языка (ru, en, kk)
        if (lang.startsWith('ru')) return 'ru';
        if (lang.startsWith('en')) return 'en';
        if (lang.startsWith('kk') || lang.startsWith('kz')) return 'kk';
        return null;
      })
      .filter(Boolean) as Locale[];
    
    if (preferredLocales.length > 0) {
      return preferredLocales[0];
    }
  }
  
  return defaultLocale;
}

// Конфигурация next-intl
export default getRequestConfig(async ({ locale }) => {
  // Проверяем валидность локали
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Динамически импортируем переводы
  let messages;
  try {
    switch (locale) {
      case 'ru':
        messages = (await import('./ru.json')).default;
        break;
      case 'en':
        messages = (await import('./en.json')).default;
        break;
      case 'kk':
        messages = (await import('./kk.json')).default;
        break;
      default:
        messages = (await import('./ru.json')).default;
    }
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback на русский язык
    messages = (await import('./ru.json')).default;
  }

  return {
    messages,
    timeZone: getTimeZoneForLocale(locale),
    now: new Date(),
    formats: {
      dateTime: getDateTimeFormats(locale),
      number: getNumberFormats(locale),
      list: getListFormats(locale),
    },
  };
});

// Получение часового пояса для локали
function getTimeZoneForLocale(locale: Locale): string {
  switch (locale) {
    case 'ru':
      return 'Asia/Almaty'; // Казахстан
    case 'en':
      return 'UTC';
    case 'kk':
      return 'Asia/Almaty'; // Казахстан
    default:
      return 'Asia/Almaty';
  }
}

// Форматы даты и времени для каждой локали
function getDateTimeFormats(locale: Locale) {
  const baseFormats = {
    short: {
      date: 'short',
      time: 'short',
    },
    medium: {
      date: 'medium',
      time: 'medium',
    },
    long: {
      date: 'long',
      time: 'long',
    },
    full: {
      date: 'full',
      time: 'full',
    },
  };

  switch (locale) {
    case 'ru':
      return {
        ...baseFormats,
        dateTime: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        date: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        time: {
          hour: '2-digit',
          minute: '2-digit',
        },
        relative: {
          now: 'сейчас',
          past: '{value} назад',
          future: 'через {value}',
        },
      };
    case 'en':
      return {
        ...baseFormats,
        dateTime: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        date: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        time: {
          hour: '2-digit',
          minute: '2-digit',
        },
        relative: {
          now: 'now',
          past: '{value} ago',
          future: 'in {value}',
        },
      };
    case 'kk':
      return {
        ...baseFormats,
        dateTime: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
        date: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        },
        time: {
          hour: '2-digit',
          minute: '2-digit',
        },
        relative: {
          now: 'қазір',
          past: '{value} бұрын',
          future: '{value} кейін',
        },
      };
    default:
      return baseFormats;
  }
}

// Форматы чисел для каждой локали
function getNumberFormats(locale: Locale) {
  const baseFormats = {
    decimal: {
      style: 'decimal',
    },
    currency: {
      style: 'currency',
    },
    percent: {
      style: 'percent',
    },
  };

  switch (locale) {
    case 'ru':
      return {
        ...baseFormats,
        currency: {
          style: 'currency',
          currency: 'KZT',
          currencyDisplay: 'symbol',
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
      };
    case 'en':
      return {
        ...baseFormats,
        currency: {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'symbol',
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
      };
    case 'kk':
      return {
        ...baseFormats,
        currency: {
          style: 'currency',
          currency: 'KZT',
          currencyDisplay: 'symbol',
        },
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        },
      };
    default:
      return baseFormats;
  }
}

// Форматы списков для каждой локали
function getListFormats(locale: Locale) {
  switch (locale) {
    case 'ru':
      return {
        conjunction: {
          style: 'long',
          type: 'conjunction',
        },
        disjunction: {
          style: 'long',
          type: 'disjunction',
        },
        unit: {
          style: 'long',
          type: 'unit',
        },
      };
    case 'en':
      return {
        conjunction: {
          style: 'long',
          type: 'conjunction',
        },
        disjunction: {
          style: 'long',
          type: 'disjunction',
        },
        unit: {
          style: 'long',
          type: 'unit',
        },
      };
    case 'kk':
      return {
        conjunction: {
          style: 'long',
          type: 'conjunction',
        },
        disjunction: {
          style: 'long',
          type: 'disjunction',
        },
        unit: {
          style: 'long',
          type: 'unit',
        },
      };
    default:
      return {
        conjunction: {
          style: 'long',
          type: 'conjunction',
        },
      };
  }
}

// Утилиты для работы с локализацией
export const i18nUtils = {
  // Получение направления текста
  getTextDirection: (locale: Locale): 'ltr' | 'rtl' => {
    return 'ltr'; // Все поддерживаемые языки используют LTR
  },

  // Получение языка для HTML атрибута
  getHtmlLang: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
        return 'ru-KZ';
      case 'en':
        return 'en-US';
      case 'kk':
        return 'kk-KZ';
      default:
        return 'ru-KZ';
    }
  },

  // Получение названия языка
  getLanguageName: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
        return 'Русский';
      case 'en':
        return 'English';
      case 'kk':
        return 'Қазақша';
      default:
        return 'Русский';
    }
  },

  // Получение флага для языка
  getLanguageFlag: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
        return '🇷🇺';
      case 'en':
        return '🇺🇸';
      case 'kk':
        return '🇰🇿';
      default:
        return '🇷🇺';
    }
  },

  // Проверка RTL языка
  isRTL: (locale: Locale): boolean => {
    return false; // Все поддерживаемые языки LTR
  },

  // Получение формата валюты
  getCurrencyFormat: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
      case 'kk':
        return 'KZT';
      case 'en':
        return 'USD';
      default:
        return 'KZT';
    }
  },

  // Получение формата даты
  getDateFormat: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
        return 'DD.MM.YYYY';
      case 'en':
        return 'MM/DD/YYYY';
      case 'kk':
        return 'DD.MM.YYYY';
      default:
        return 'DD.MM.YYYY';
    }
  },

  // Получение формата времени
  getTimeFormat: (locale: Locale): string => {
    switch (locale) {
      case 'ru':
      case 'kk':
        return 'HH:mm';
      case 'en':
        return 'h:mm A';
      default:
        return 'HH:mm';
    }
  },
};

// Middleware для обработки локализации
export function createI18nMiddleware() {
  return function middleware(request: Request) {
    const locale = getLocaleFromRequest(request);
    const url = new URL(request.url);
    
    // Если локаль не в пути, добавляем её
    if (!isValidLocale(url.pathname.split('/')[1])) {
      url.pathname = `/${locale}${url.pathname}`;
      return Response.redirect(url);
    }
    
    return null;
  };
}

// Хук для получения текущей локали
export function useCurrentLocale(): Locale {
  // В реальном приложении это будет получаться из контекста
  return defaultLocale;
}

// Хук для переключения локали
export function useSwitchLocale() {
  return function switchLocale(newLocale: Locale) {
    if (!isValidLocale(newLocale)) {
      throw new Error(`Invalid locale: ${newLocale}`);
    }
    
    // В реальном приложении здесь будет логика переключения
    console.log(`Switching to locale: ${newLocale}`);
  };
}