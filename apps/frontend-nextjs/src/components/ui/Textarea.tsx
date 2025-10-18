import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium glass-text-primary">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 glass-bg-primary glass-border rounded-lg text-white placeholder-glass-text-muted focus:outline-none focus:ring-2 focus:ring-orange-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
