'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Save,
  Send,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Bookmark,
  Flag,
  Target,
  Zap,
  Shield,
  Bell,
  Heart,
  Star,
  Plus,
  Minus,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader,
  Download,
  Upload,
  Share2,
  Edit,
  Trash2,
  Folder,
  File,
  FolderOpen,
  FolderPlus,
  FilePlus,
  FileMinus,
  FolderMinus,
  Trash,
  BookmarkPlus,
  BookmarkMinus,
  ShieldPlus,
  ShieldMinus
} from 'lucide-react';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'hidden';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: any;
  defaultValue?: any;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => string | null;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  collapsed?: boolean;
  className?: string;
}

export interface FormAction {
  id: string;
  label: string;
  type: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface GlassFormProps {
  children?: React.ReactNode;
  fields?: FormField[];
  sections?: FormSection[];
  actions?: FormAction[];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'wizard' | 'inline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline';
  showHeader?: boolean;
  showFooter?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showValidation?: boolean;
  showRequired?: boolean;
  allowAutoSave?: boolean;
  allowDraft?: boolean;
  allowReset?: boolean;
  allowCancel?: boolean;
  isSubmitting?: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  progress?: number;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onReset?: () => void;
  onCancel?: () => void;
  onFieldChange?: (fieldId: string, value: any) => void;
  onFieldBlur?: (fieldId: string) => void;
  onFieldFocus?: (fieldId: string) => void;
  onValidation?: (fieldId: string, error: string | null) => void;
  onAutoSave?: (values: Record<string, any>) => void;
  onDraft?: (values: Record<string, any>) => void;
}

// Form Context
interface FormContextType {
  formState: FormState;
  setFieldValue: (fieldId: string, value: any) => void;
  setFieldError: (fieldId: string, error: string | null) => void;
  setFieldTouched: (fieldId: string, touched: boolean) => void;
  validateField: (fieldId: string, value: any) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a GlassForm');
  }
  return context;
};

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'p-4',
    headerPadding: 'p-4 pb-2',
    footerPadding: 'p-4 pt-2',
    titleSize: 'text-lg',
    descriptionSize: 'text-sm',
    fieldSpacing: 'space-y-3',
    sectionSpacing: 'space-y-4'
  },
  md: {
    padding: 'p-6',
    headerPadding: 'p-6 pb-4',
    footerPadding: 'p-6 pt-4',
    titleSize: 'text-xl',
    descriptionSize: 'text-base',
    fieldSpacing: 'space-y-4',
    sectionSpacing: 'space-y-6'
  },
  lg: {
    padding: 'p-8',
    headerPadding: 'p-8 pb-6',
    footerPadding: 'p-8 pt-6',
    titleSize: 'text-2xl',
    descriptionSize: 'text-lg',
    fieldSpacing: 'space-y-5',
    sectionSpacing: 'space-y-8'
  },
  xl: {
    padding: 'p-10',
    headerPadding: 'p-10 pb-8',
    footerPadding: 'p-10 pt-8',
    titleSize: 'text-3xl',
    descriptionSize: 'text-xl',
    fieldSpacing: 'space-y-6',
    sectionSpacing: 'space-y-10'
  },
  full: {
    padding: 'p-12',
    headerPadding: 'p-12 pb-10',
    footerPadding: 'p-12 pt-10',
    titleSize: 'text-4xl',
    descriptionSize: 'text-2xl',
    fieldSpacing: 'space-y-8',
    sectionSpacing: 'space-y-12'
  }
};

// Animation variants
const formVariants = {
  initial: { 
    opacity: 0, 
    y: 20
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const sectionVariants = {
  initial: { 
    opacity: 0, 
    x: -20
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassForm: React.FC<GlassFormProps> = ({
  children,
  fields = [],
  sections = [],
  actions = [],
  variant = 'default',
  size = 'md',
  layout = 'vertical',
  showHeader = true,
  showFooter = true,
  showTitle = true,
  showDescription = true,
  showIcon = false,
  showProgress = false,
  showValidation = true,
  showRequired = true,
  allowAutoSave = false,
  allowDraft = false,
  allowReset = false,
  allowCancel = false,
  isSubmitting = false,
  isValid = true,
  isDirty = false,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  title,
  description,
  icon,
  progress,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  onSubmit,
  onReset,
  onCancel,
  onFieldChange,
  onFieldBlur,
  onFieldFocus,
  onValidation,
  onAutoSave,
  onDraft
}) => {
  const [formState, setFormState] = useState<FormState>({
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const config = sizeConfig[size];

  // Initialize form values
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    const initialTouched: Record<string, boolean> = {};

    // Process fields
    fields.forEach(field => {
      initialValues[field.id] = field.value || field.defaultValue || '';
      initialTouched[field.id] = false;
    });

    // Process sections
    sections.forEach(section => {
      section.fields.forEach(field => {
        initialValues[field.id] = field.value || field.defaultValue || '';
        initialTouched[field.id] = false;
      });
    });

    setFormState(prev => ({
      ...prev,
      values: initialValues,
      touched: initialTouched
    }));
  }, [fields, sections]);

  // Auto-save functionality
  useEffect(() => {
    if (allowAutoSave && formState.isDirty) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      const timeout = setTimeout(() => {
        onAutoSave?.(formState.values);
      }, 2000);

      setAutoSaveTimeout(timeout);

      return () => clearTimeout(timeout);
    }
  }, [formState.values, formState.isDirty, allowAutoSave, onAutoSave]);

  // Validate field
  const validateField = useCallback((fieldId: string, value: any): string | null => {
    const field = [...fields, ...sections.flatMap(s => s.fields)].find(f => f.id === fieldId);
    if (!field || !field.validation) return null;

    const validation = field.validation;

    // Required validation
    if (validation.required && (!value || value.toString().trim() === '')) {
      return `${field.label} обязательно для заполнения`;
    }

    // Min length validation
    if (validation.minLength && value && value.toString().length < validation.minLength) {
      return `${field.label} должно содержать минимум ${validation.minLength} символов`;
    }

    // Max length validation
    if (validation.maxLength && value && value.toString().length > validation.maxLength) {
      return `${field.label} должно содержать максимум ${validation.maxLength} символов`;
    }

    // Pattern validation
    if (validation.pattern && value && !validation.pattern.test(value.toString())) {
      return `${field.label} имеет неверный формат`;
    }

    // Min value validation
    if (validation.min !== undefined && value && Number(value) < validation.min) {
      return `${field.label} должно быть не менее ${validation.min}`;
    }

    // Max value validation
    if (validation.max !== undefined && value && Number(value) > validation.max) {
      return `${field.label} должно быть не более ${validation.max}`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, [fields, sections]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    [...fields, ...sections.flatMap(s => s.fields)].forEach(field => {
      const error = validateField(field.id, formState.values[field.id]);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors,
      isValid
    }));

    return isValid;
  }, [fields, sections, formState.values, validateField]);

  // Set field value
  const setFieldValue = useCallback((fieldId: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        [fieldId]: value
      },
      isDirty: true
    }));

    // Validate field
    const error = validateField(fieldId, value);
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldId]: error || ''
      }
    }));

    onFieldChange?.(fieldId, value);
    onValidation?.(fieldId, error);
  }, [validateField, onFieldChange, onValidation]);

  // Set field error
  const setFieldError = useCallback((fieldId: string, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldId]: error || ''
      }
    }));

    onValidation?.(fieldId, error);
  }, [onValidation]);

  // Set field touched
  const setFieldTouched = useCallback((fieldId: string, touched: boolean) => {
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldId]: touched
      }
    }));

    if (touched) {
      onFieldBlur?.(fieldId);
    } else {
      onFieldFocus?.(fieldId);
    }
  }, [onFieldBlur, onFieldFocus]);

  // Reset form
  const resetForm = useCallback(() => {
    const initialValues: Record<string, any> = {};
    const initialTouched: Record<string, boolean> = {};
    const initialErrors: Record<string, string> = {};

    [...fields, ...sections.flatMap(s => s.fields)].forEach(field => {
      initialValues[field.id] = field.defaultValue || '';
      initialTouched[field.id] = false;
      initialErrors[field.id] = '';
    });

    setFormState({
      values: initialValues,
      errors: initialErrors,
      touched: initialTouched,
      isSubmitting: false,
      isValid: true,
      isDirty: false
    });

    onReset?.();
  }, [fields, sections, onReset]);

  // Submit form
  const submitForm = useCallback(async () => {
    if (!validateForm()) return;

    setFormState(prev => ({
      ...prev,
      isSubmitting: true
    }));

    try {
      await onSubmit?.(formState.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    }
  }, [validateForm, onSubmit, formState.values]);

  // Handle form submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitForm();
  };

  // Handle section toggle
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className={cn(
        'flex items-center space-x-4 border-b border-glass-border/50',
        config.headerPadding,
        headerClassName
      )}>
        {/* Icon */}
        {showIcon && icon && (
          <div className="flex-shrink-0">
            {React.createElement(icon, { className: "w-8 h-8 text-orange-400" })}
          </div>
        )}

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          {showTitle && title && (
            <h2 className={cn(
              'font-semibold text-white truncate',
              config.titleSize
            )}>
              {title}
            </h2>
          )}
          {showDescription && description && (
            <p className={cn(
              'text-white/80 truncate',
              config.descriptionSize
            )}>
              {description}
            </p>
          )}
        </div>

        {/* Progress */}
        {showProgress && progress !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-white/60">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!showFooter || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex items-center justify-between border-t border-glass-border/50',
        config.footerPadding,
        footerClassName
      )}>
        <div className="flex items-center space-x-2">
          {/* Auto-save indicator */}
          {allowAutoSave && formState.isDirty && (
            <div className="flex items-center space-x-1 text-xs text-white/60">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span>Автосохранение</span>
            </div>
          )}

          {/* Draft indicator */}
          {allowDraft && formState.isDirty && (
            <div className="flex items-center space-x-1 text-xs text-white/60">
              <div className="w-2 h-2 bg-yellow-400 rounded-full" />
              <span>Черновик</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={action.id}
                type={action.type}
                onClick={action.onClick}
                disabled={action.disabled || action.loading || formState.isSubmitting}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200',
                  action.variant === 'primary' && 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
                  action.variant === 'secondary' && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                  action.variant === 'danger' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                  action.variant === 'success' && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
                  action.variant === 'warning' && 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30',
                  !action.variant && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                  (action.disabled || action.loading || formState.isSubmitting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {ActionIcon && <ActionIcon className="w-4 h-4" />}
                <span>{action.label}</span>
                {action.loading && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render field
  const renderField = (field: FormField) => {
    const hasError = formState.errors[field.id];
    const isTouched = formState.touched[field.id];
    const showError = showValidation && hasError && isTouched;

    return (
      <motion.div
        key={field.id}
        className={cn(
          'space-y-2',
          field.className
        )}
        variants={sectionVariants}
        initial="initial"
        animate="animate"
      >
        {/* Field label */}
        <label className="block text-sm font-medium text-white/80">
          {field.label}
          {field.required && showRequired && (
            <span className="text-red-400 ml-1">*</span>
          )}
        </label>

        {/* Field description */}
        {field.description && (
          <p className="text-xs text-white/60">{field.description}</p>
        )}

        {/* Field input */}
        <div className="relative">
          {/* Field icon */}
          {field.icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <field.icon className="w-4 h-4 text-white/60" />
            </div>
          )}

          {/* Input field */}
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formState.values[field.id] || ''}
            onChange={(e) => setFieldValue(field.id, e.target.value)}
            onBlur={() => setFieldTouched(field.id, true)}
            onFocus={() => setFieldTouched(field.id, false)}
            disabled={field.disabled}
            readOnly={field.readonly}
            className={cn(
              'w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 transition-colors duration-200',
              field.icon && 'pl-10',
              showError && 'border-red-500/50 focus:ring-red-400/50',
              field.disabled && 'opacity-50 cursor-not-allowed',
              field.readonly && 'opacity-75 cursor-default'
            )}
          />

          {/* Error icon */}
          {showError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
          )}
        </div>

        {/* Field error */}
        {showError && (
          <motion.p
            className="text-xs text-red-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {hasError}
          </motion.p>
        )}
      </motion.div>
    );
  };

  // Render section
  const renderSection = (section: FormSection) => {
    const isCollapsed = collapsedSections.has(section.id);

    return (
      <motion.div
        key={section.id}
        className={cn(
          'space-y-4',
          section.className
        )}
        variants={sectionVariants}
        initial="initial"
        animate="animate"
      >
        {/* Section header */}
        {(section.title || section.description) && (
          <div className="flex items-center justify-between">
            <div>
              {section.title && (
                <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              )}
              {section.description && (
                <p className="text-sm text-white/60">{section.description}</p>
              )}
            </div>

            {/* Collapse button */}
            {section.collapsible && (
              <button
                onClick={() => toggleSection(section.id)}
                className="p-2 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded-lg transition-colors duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Section fields */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className={cn(
                'space-y-4',
                layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
                layout === 'horizontal' && 'grid grid-cols-1 md:grid-cols-3 gap-4',
                layout === 'inline' && 'flex flex-wrap gap-4'
              )}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {section.fields.map(renderField)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Get size classes
  const getSizeClasses = () => {
    if (size === 'full') {
      return 'w-full h-full max-w-none max-h-none';
    }
    return 'w-full max-w-4xl';
  };

  // Form context value
  const formContextValue: FormContextType = {
    formState,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    submitForm
  };

  return (
    <FormContext.Provider value={formContextValue}>
      <motion.form
        ref={formRef}
        className={cn(
          'bg-glass-primary/90 backdrop-blur-xl',
          'border border-glass-border/50',
          'rounded-2xl shadow-glass-lg',
          'overflow-hidden',
          'flex flex-col',
          getSizeClasses(),
          className
        )}
        style={{
          maxWidth: maxWidth || undefined,
          maxHeight: maxHeight || undefined,
          minWidth: minWidth || undefined,
          minHeight: minHeight || undefined
        }}
        variants={formVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        {renderHeader()}

        {/* Body */}
        <div className={cn(
          'flex-1 overflow-auto',
          config.padding,
          bodyClassName
        )}>
          <div className={cn(
            config.fieldSpacing,
            layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
            layout === 'horizontal' && 'grid grid-cols-1 md:grid-cols-3 gap-4',
            layout === 'inline' && 'flex flex-wrap gap-4'
          )}>
            {/* Direct fields */}
            {fields.map(renderField)}

            {/* Sections */}
            {sections.map(renderSection)}

            {/* Custom children */}
            {children}
          </div>
        </div>

        {/* Footer */}
        {renderFooter()}

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
      </motion.form>
    </FormContext.Provider>
  );
};

// Convenience components
export const GlassFormCompact: React.FC<Omit<GlassFormProps, 'variant' | 'size'>> = (props) => (
  <GlassForm {...props} variant="compact" size="sm" />
);

export const GlassFormDetailed: React.FC<Omit<GlassFormProps, 'variant' | 'size'>> = (props) => (
  <GlassForm {...props} variant="detailed" size="lg" />
);

export const GlassFormMinimal: React.FC<Omit<GlassFormProps, 'variant'>> = (props) => (
  <GlassForm {...props} variant="minimal" showHeader={false} showFooter={false} showTitle={false} showDescription={false} />
);

export const GlassFormWizard: React.FC<Omit<GlassFormProps, 'variant'>> = (props) => (
  <GlassForm {...props} variant="wizard" showProgress />
);

export const GlassFormInline: React.FC<Omit<GlassFormProps, 'variant' | 'layout'>> = (props) => (
  <GlassForm {...props} variant="inline" layout="inline" />
);

// Example usage component
export const GlassFormExample: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleFields: FormField[] = [
    {
      id: 'name',
      name: 'name',
      label: 'Имя',
      type: 'text',
      placeholder: 'Введите ваше имя',
      required: true,
      validation: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      icon: User
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Введите ваш email',
      required: true,
      validation: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      icon: Mail
    },
    {
      id: 'phone',
      name: 'phone',
      label: 'Телефон',
      type: 'tel',
      placeholder: 'Введите ваш телефон',
      validation: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/
      },
      icon: Phone
    }
  ];

  const sampleSections: FormSection[] = [
    {
      id: 'personal',
      title: 'Личная информация',
      description: 'Основные данные о пользователе',
      fields: [
        {
          id: 'age',
          name: 'age',
          label: 'Возраст',
          type: 'number',
          placeholder: 'Введите ваш возраст',
          validation: {
            min: 18,
            max: 100
          }
        },
        {
          id: 'city',
          name: 'city',
          label: 'Город',
          type: 'text',
          placeholder: 'Введите ваш город',
          icon: MapPin
        }
      ],
      collapsible: true
    },
    {
      id: 'preferences',
      title: 'Предпочтения',
      description: 'Настройки и предпочтения',
      fields: [
        {
          id: 'newsletter',
          name: 'newsletter',
          label: 'Подписка на рассылку',
          type: 'checkbox',
          defaultValue: false
        },
        {
          id: 'notifications',
          name: 'notifications',
          label: 'Уведомления',
          type: 'checkbox',
          defaultValue: true
        }
      ],
      collapsible: true,
      collapsed: true
    }
  ];

  const sampleActions: FormAction[] = [
    {
      id: 'submit',
      label: 'Сохранить',
      type: 'submit',
      variant: 'primary',
      icon: Save,
      loading: isSubmitting
    },
    {
      id: 'reset',
      label: 'Сбросить',
      type: 'reset',
      variant: 'secondary',
      icon: RefreshCw
    },
    {
      id: 'cancel',
      label: 'Отмена',
      type: 'button',
      variant: 'secondary',
      icon: X
    }
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    setIsSubmitting(true);
    console.log('Form submitted:', values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
  };

  const handleAutoSave = (values: Record<string, any>) => {
    console.log('Auto-save:', values);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Form examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Формы</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычная форма
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактная форма
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальная форма
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальная форма
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Мастер форма
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Inline форма
          </button>
        </div>
      </div>

      {/* Default form */}
      <GlassForm
        title="Регистрация пользователя"
        description="Заполните форму для создания нового аккаунта"
        icon={User}
        fields={sampleFields}
        sections={sampleSections}
        actions={sampleActions}
        variant="default"
        size="md"
        layout="vertical"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showValidation
        showRequired
        allowAutoSave
        allowDraft
        allowReset
        allowCancel
        isSubmitting={isSubmitting}
        progress={75}
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
        onReset={() => console.log('Form reset')}
        onCancel={() => console.log('Form cancelled')}
        onFieldChange={(fieldId, value) => console.log('Field changed:', fieldId, value)}
        onFieldBlur={(fieldId) => console.log('Field blurred:', fieldId)}
        onFieldFocus={(fieldId) => console.log('Field focused:', fieldId)}
        onValidation={(fieldId, error) => console.log('Field validation:', fieldId, error)}
      />

      {/* Compact form */}
      <GlassFormCompact
        title="Быстрая форма"
        description="Компактная форма для быстрого ввода"
        fields={sampleFields.slice(0, 2)}
        actions={[
          {
            id: 'submit',
            label: 'Отправить',
            type: 'submit',
            variant: 'primary',
            icon: Send
          }
        ]}
        showHeader
        showFooter
        showTitle
        showDescription
        showValidation
        showRequired
        onSubmit={handleSubmit}
      />

      {/* Detailed form */}
      <GlassFormDetailed
        title="Детальная форма"
        description="Подробная форма с множеством полей и секций"
        icon={Settings}
        fields={sampleFields}
        sections={sampleSections}
        actions={sampleActions}
        layout="grid"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showValidation
        showRequired
        allowAutoSave
        allowDraft
        allowReset
        allowCancel
        progress={50}
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
      />

      {/* Minimal form */}
      <GlassFormMinimal
        fields={sampleFields.slice(0, 2)}
        actions={[
          {
            id: 'submit',
            label: 'Сохранить',
            type: 'submit',
            variant: 'primary',
            icon: Save
          }
        ]}
        showValidation
        showRequired
        onSubmit={handleSubmit}
      />

      {/* Wizard form */}
      <GlassFormWizard
        title="Мастер настройки"
        description="Пошаговая настройка системы"
        icon={Settings}
        fields={sampleFields}
        sections={sampleSections}
        actions={sampleActions}
        layout="vertical"
        showHeader
        showFooter
        showTitle
        showDescription
        showIcon
        showProgress
        showValidation
        showRequired
        allowAutoSave
        allowDraft
        allowReset
        allowCancel
        progress={90}
        onSubmit={handleSubmit}
        onAutoSave={handleAutoSave}
      />

      {/* Inline form */}
      <GlassFormInline
        title="Inline форма"
        description="Форма с горизонтальным расположением полей"
        fields={sampleFields.slice(0, 3)}
        actions={[
          {
            id: 'submit',
            label: 'Отправить',
            type: 'submit',
            variant: 'primary',
            icon: Send
          }
        ]}
        showHeader
        showFooter
        showTitle
        showDescription
        showValidation
        showRequired
        onSubmit={handleSubmit}
      />
    </div>
  );
};
