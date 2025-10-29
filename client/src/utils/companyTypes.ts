import { CompanyType } from '../types'

// Названия типов компаний
export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  master: 'Мастер',
  company: 'Мебельная компания',
  shop: 'Мебельный магазин'
}

// Цвета для типов компаний
export const COMPANY_TYPE_COLORS: Record<CompanyType, { bg: string; text: string; border: string }> = {
  master: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30'
  },
  company: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30'
  },
  shop: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30'
  }
}

// Получить лейбл типа компании
export const getCompanyTypeLabel = (type: string | undefined): string => {
  if (!type) return 'Мастер'
  return COMPANY_TYPE_LABELS[type as CompanyType] || 'Мастер'
}

// Получить цвета типа компании
export const getCompanyTypeColors = (type: string | undefined) => {
  if (!type) return COMPANY_TYPE_COLORS.master
  return COMPANY_TYPE_COLORS[type as CompanyType] || COMPANY_TYPE_COLORS.master
}

