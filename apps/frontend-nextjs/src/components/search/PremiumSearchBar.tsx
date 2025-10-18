import React from 'react';

interface PremiumSearchBarProps {
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function PremiumSearchBar({ onSearch, value, onChange, placeholder, autoFocus }: PremiumSearchBarProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Премиум поиск</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
