import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 glass-bg-secondary rounded-t-lg max-h-[80vh] overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-400 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold glass-text-primary">{title}</h3>
          </div>
        )}
        
        {/* Content */}
        <div className="px-4 py-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
