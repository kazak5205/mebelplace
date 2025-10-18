import React from 'react';

interface ProposalFormProps {
  onSubmit?: (data: any) => void;
  loading?: boolean;
  requestId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProposalForm({ onSubmit, loading, requestId, onSuccess, onCancel }: ProposalFormProps) {
  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Отправить предложение</h3>
      <p className="glass-text-secondary">Функция в разработке</p>
    </div>
  );
}
