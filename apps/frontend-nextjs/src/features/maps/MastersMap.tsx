import React from 'react';

interface MastersMapProps {
  masters?: any[];
  onMasterSelect?: (master: any) => void;
  onMasterClick?: (master: any) => void;
}

export function MastersMap({ masters = [], onMasterSelect, onMasterClick }: MastersMapProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Карта мастеров</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}