import React from 'react';

interface AdvancedFiltersProps {
  onFiltersChange?: (filters: any) => void;
  filters?: SearchFilters;
  onChange?: (filters: SearchFilters) => void;
  onSave?: (name: string, filters: SearchFilters) => void;
  savedFilters?: Array<{ name: string; filters: SearchFilters }>;
}

export interface SearchFilters {
  type?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: string;
  priceMin?: number;
  priceMax?: number;
  verified?: boolean;
  hasPortfolio?: boolean;
  radius?: number;
}

export function AdvancedFilters({ onFiltersChange, filters, onChange, onSave, savedFilters }: AdvancedFiltersProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Расширенные фильтры</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}

export function SearchFilters({ onFiltersChange }: AdvancedFiltersProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Фильтры поиска</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
