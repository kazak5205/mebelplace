import React from 'react';

interface PremiumEmptyStateProps {
  title?: string;
  description?: string;
}

export function PremiumEmptyState({ title = "Пусто", description = "Нет данных" }: PremiumEmptyStateProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6 text-center">
      <h3 className="glass-text-primary font-semibold mb-2">{title}</h3>
      <p className="glass-text-secondary">{description}</p>
    </div>
  );
}
