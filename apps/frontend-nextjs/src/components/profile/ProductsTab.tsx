import React from 'react';

interface ProductsTabProps {
  userId?: number;
  isOwnProfile?: boolean;
}

export function ProductsTab({ userId, isOwnProfile }: ProductsTabProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Продукты</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
