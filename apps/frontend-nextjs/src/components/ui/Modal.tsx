import React from 'react';

interface ModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: string;
}

export function Modal({ isOpen, open, onClose, title, children, size }: ModalProps) {
  const isModalOpen = isOpen || open;
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 glass-bg-primary/50 flex items-center justify-center z-50">
      <div className="glass-bg-secondary rounded-lg p-6 max-w-md w-full mx-4">
        {title && (
          <h2 className="glass-text-primary font-semibold mb-4">{title}</h2>
        )}
        {children}
        <button
          onClick={onClose}
          className="mt-4 glass-bg-accent-orange-500 text-white px-4 py-2 rounded-lg"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
