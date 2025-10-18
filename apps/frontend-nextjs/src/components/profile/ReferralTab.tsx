import React from 'react';

interface ReferralTabProps {
  userId?: number;
}

export function ReferralTab({ userId }: ReferralTabProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Реферальная программа</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
