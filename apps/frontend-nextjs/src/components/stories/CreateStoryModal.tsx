import React from 'react';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStoryModal({ isOpen, onClose, onSuccess }: CreateStoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 glass-bg-primary/50 flex items-center justify-center z-50">
      <div className="glass-bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="glass-text-primary font-semibold mb-4">Создать историю</h2>
        <p className="glass-text-secondary mb-4">Функция в разработке</p>
        <button onClick={onClose} className="glass-bg-accent-orange-500 text-white px-4 py-2 rounded-lg">
          Закрыть
        </button>
      </div>
    </div>
  );
}
