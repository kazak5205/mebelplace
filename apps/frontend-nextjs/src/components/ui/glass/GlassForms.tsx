import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: 'primary' | 'secondary';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export interface GlassSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  searchable?: boolean;
  multi?: boolean;
}

export interface GlassCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
}

export interface GlassRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

// Glass Form Component
const GlassForm = React.forwardRef<HTMLFormElement, GlassFormProps>(
  ({ 
    className, 
    variant = 'primary',
    spacing = 'md',
    ...props 
  }, ref) => {
    const baseClasses = [
      'glass-transition'
    ];

    const variantClasses = {
      primary: [
        'glass-bg-primary',
        'glass-border',
        'glass-shadow-sm',
        'rounded-xl',
        'p-6'
      ],
      secondary: [
        'glass-bg-secondary',
        'glass-border',
        'glass-shadow-sm',
        'rounded-xl',
        'p-6'
      ]
    };

    const spacingClasses = {
      none: [],
      sm: ['space-y-3'],
      md: ['space-y-4'],
      lg: ['space-y-6']
    };

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      spacingClasses[spacing],
      className
    );

    return (
      <form ref={ref} className={classes} {...props} />
    );
  }
);

// Glass Select Component
const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    label,
    error,
    helperText,
    options,
    placeholder,
    searchable = false,
    multi = false,
    id,
    ...props 
  }, ref) => {
    const selectId = id || `glass-select-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'glass-transition',
      'w-full',
      'border',
      'rounded-lg',
      'glass-text-primary',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled',
      'appearance-none',
      'bg-transparent'
    ];

    const variantClasses = {
      primary: [
        'glass-border',
        'glass-bg-primary',
        'glass-shadow-sm',
        'focus:glass-border-accent',
        'focus:ring-orange-500'
      ],
      secondary: [
        'glass-border',
        'glass-bg-secondary',
        'glass-shadow-sm',
        'focus:glass-border-accent',
        'focus:ring-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-base'],
      lg: ['px-6', 'py-3', 'text-lg']
    };

    const selectClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-red-400 focus:ring-red-500',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium glass-text-primary mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 glass-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-400">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm glass-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Glass Checkbox Component
const GlassCheckbox = React.forwardRef<HTMLInputElement, GlassCheckboxProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    label,
    error,
    helperText,
    indeterminate = false,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `glass-checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'glass-transition',
      'border',
      'rounded',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled'
    ];

    const variantClasses = {
      primary: [
        'glass-border',
        'glass-bg-primary',
        'focus:ring-orange-500',
        'text-orange-500'
      ],
      secondary: [
        'glass-border',
        'glass-bg-secondary',
        'focus:ring-blue-500',
        'text-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6']
    };

    const checkboxClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-red-400 focus:ring-red-500',
      className
    );

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={checkboxClasses}
              {...props}
            />
          </div>
          
          {label && (
            <div className="flex-1">
              <label 
                htmlFor={checkboxId}
                className="text-sm font-medium glass-text-primary cursor-pointer"
              >
                {label}
              </label>
              
              {error && (
                <p className="mt-1 text-sm text-red-400">
                  {error}
                </p>
              )}
              
              {helperText && !error && (
                <p className="mt-1 text-sm glass-text-secondary">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>
        
        {!label && error && (
          <p className="mt-1 text-sm text-red-400">
            {error}
          </p>
        )}
        
        {!label && helperText && !error && (
          <p className="mt-1 text-sm glass-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Glass Radio Component
const GlassRadio = React.forwardRef<HTMLInputElement, GlassRadioProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    label,
    error,
    helperText,
    options,
    id,
    ...props 
  }, ref) => {
    const radioId = id || `glass-radio-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'glass-transition',
      'border',
      'rounded-full',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled'
    ];

    const variantClasses = {
      primary: [
        'glass-border',
        'glass-bg-primary',
        'focus:ring-orange-500',
        'text-orange-500'
      ],
      secondary: [
        'glass-border',
        'glass-bg-secondary',
        'focus:ring-blue-500',
        'text-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['w-4', 'h-4'],
      md: ['w-5', 'h-5'],
      lg: ['w-6', 'h-6']
    };

    const radioClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      error && 'border-red-400 focus:ring-red-500',
      className
    );

    if (options) {
      return (
        <div className="w-full">
          {label && (
            <div className="mb-3">
              <label className="block text-sm font-medium glass-text-primary">
                {label}
              </label>
            </div>
          )}
          
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  ref={option.value === props.value ? ref : undefined}
                  id={`${radioId}-${option.value}`}
                  type="radio"
                  value={option.value}
                  disabled={option.disabled}
                  className={radioClasses}
                  {...props}
                />
                <label 
                  htmlFor={`${radioId}-${option.value}`}
                  className="text-sm font-medium glass-text-primary cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          
          {error && (
            <p className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}
          
          {helperText && !error && (
            <p className="mt-2 text-sm glass-text-secondary">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={radioId}
              type="radio"
              className={radioClasses}
              {...props}
            />
          </div>
          
          {label && (
            <div className="flex-1">
              <label 
                htmlFor={radioId}
                className="text-sm font-medium glass-text-primary cursor-pointer"
              >
                {label}
              </label>
              
              {error && (
                <p className="mt-1 text-sm text-red-400">
                  {error}
                </p>
              )}
              
              {helperText && !error && (
                <p className="mt-1 text-sm glass-text-secondary">
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>
        
        {!label && error && (
          <p className="mt-1 text-sm text-red-400">
            {error}
          </p>
        )}
        
        {!label && helperText && !error && (
          <p className="mt-1 text-sm glass-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Glass Textarea Component
const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ 
    className, 
    variant = 'primary',
    size = 'md',
    label,
    error,
    helperText,
    autoResize = false,
    maxLength,
    showCount = false,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || `glass-textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = [
      'glass-transition',
      'w-full',
      'border',
      'rounded-lg',
      'glass-text-primary',
      'placeholder:glass-text-secondary',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'disabled:glass-disabled',
      'resize-none'
    ];

    const variantClasses = {
      primary: [
        'glass-border',
        'glass-bg-primary',
        'glass-shadow-sm',
        'focus:glass-border-accent',
        'focus:ring-orange-500'
      ],
      secondary: [
        'glass-border',
        'glass-bg-secondary',
        'glass-shadow-sm',
        'focus:glass-border-accent',
        'focus:ring-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-base'],
      lg: ['px-6', 'py-3', 'text-lg']
    };

    const textareaClasses = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      autoResize && 'resize-none',
      error && 'border-red-400 focus:ring-red-500',
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium glass-text-primary mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          maxLength={maxLength}
          {...props}
        />
        
        {(error || helperText || showCount) && (
          <div className="mt-1 flex justify-between items-center">
            <div>
              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}
              
              {helperText && !error && (
                <p className="text-sm glass-text-secondary">
                  {helperText}
                </p>
              )}
            </div>
            
            {showCount && maxLength && (
              <p className="text-sm glass-text-secondary">
                {(props.value as string)?.length || 0} / {maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

GlassForm.displayName = 'GlassForm';
GlassSelect.displayName = 'GlassSelect';
GlassCheckbox.displayName = 'GlassCheckbox';
GlassRadio.displayName = 'GlassRadio';
GlassTextarea.displayName = 'GlassTextarea';

export { GlassForm, GlassSelect, GlassCheckbox, GlassRadio, GlassTextarea };
