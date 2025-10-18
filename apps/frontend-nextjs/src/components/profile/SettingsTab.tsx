import React from 'react';

interface SettingsTabProps {
  theme?: string;
  onToggleTheme?: () => void;
}

export function SettingsTab({ theme, onToggleTheme }: SettingsTabProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Настройки</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
