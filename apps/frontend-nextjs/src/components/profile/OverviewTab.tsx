import React from 'react';

interface OverviewTabProps {
  user?: any;
}

export function OverviewTab({ user }: OverviewTabProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Обзор</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
