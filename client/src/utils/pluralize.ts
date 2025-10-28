/**
 * Склонение русских слов по числам
 * 
 * @param count - Число для склонения
 * @param one - Форма для 1 (отклик)
 * @param few - Форма для 2-4 (отклика)
 * @param many - Форма для 5+ (откликов)
 * @returns Правильная форма слова
 * 
 * @example
 * pluralize(1, 'отклик', 'отклика', 'откликов') // "1 отклик"
 * pluralize(2, 'отклик', 'отклика', 'откликов') // "2 отклика"
 * pluralize(5, 'отклик', 'отклика', 'откликов') // "5 откликов"
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const absCount = Math.abs(count)
  const mod10 = absCount % 10
  const mod100 = absCount % 100

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} ${one}`
  }
  
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} ${few}`
  }
  
  return `${count} ${many}`
}

/**
 * Склонение для "откликов"
 */
export function pluralizeResponses(count: number): string {
  return pluralize(count, 'отклик', 'отклика', 'откликов')
}

/**
 * Склонение для "подписчиков"
 */
export function pluralizeSubscribers(count: number): string {
  return pluralize(count, 'подписчик', 'подписчика', 'подписчиков')
}

/**
 * Склонение для "мастеров"
 */
export function pluralizeMasters(count: number): string {
  return pluralize(count, 'мастер', 'мастера', 'мастеров')
}

/**
 * Склонение для "видео"
 * Примечание: "видео" не склоняется, только число
 */
export function pluralizeVideos(count: number): string {
  return `${count} видео`
}

