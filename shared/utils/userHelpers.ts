/**
 * User Helper Functions
 * Вспомогательные функции для работы с пользователями
 */

import { User } from '../types';

/**
 * Получить отображаемое имя пользователя
 * Для мастеров - название компании
 * Для клиентов - имя и фамилия
 * 
 * @param user - объект пользователя
 * @returns отображаемое имя
 */
export function getDisplayName(user: Partial<User> | null | undefined): string {
  if (!user) return 'Пользователь';

  // Для мастеров - название компании
  if (user.role === 'master' && user.companyName) {
    return user.companyName;
  }

  // Для клиентов - имя и фамилия
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  // Только имя
  if (user.firstName) {
    return user.firstName;
  }

  // Username как fallback
  if (user.username) {
    return user.username;
  }

  // Email как последний вариант
  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Пользователь';
}

/**
 * Получить первую букву для аватара-заглушки
 * 
 * @param user - объект пользователя
 * @returns первая буква имени/компании
 */
export function getInitials(user: Partial<User> | null | undefined): string {
  if (!user) return 'П';

  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase();
}

/**
 * Получить полную информацию о пользователе для отображения
 * 
 * @param user - объект пользователя
 * @returns объект с информацией для отображения
 */
export function getUserDisplayInfo(user: Partial<User> | null | undefined): {
  name: string;
  subtitle: string;
  initials: string;
} {
  if (!user) {
    return {
      name: 'Пользователь',
      subtitle: '',
      initials: 'П'
    };
  }

  const name = getDisplayName(user);
  const initials = getInitials(user);

  // Для мастеров - показываем адрес компании как subtitle
  if (user.role === 'master') {
    return {
      name,
      subtitle: user.companyAddress || user.username || '',
      initials
    };
  }

  // Для клиентов - показываем username или email
  return {
    name,
    subtitle: user.username || user.email || '',
    initials
  };
}

