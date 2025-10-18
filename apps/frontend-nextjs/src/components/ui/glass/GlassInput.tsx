'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
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
  ShieldMinus,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Tag as TagIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Archive as ArchiveIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Bell as BellIcon,
  Heart as HeartIcon,
  Star as StarIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Home as HomeIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  RefreshCw as RefreshIcon,
  Loader as LoaderIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share2 as ShareIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Folder as FolderIcon,
  File as FileIcon,
  FolderOpen as FolderOpenIcon,
  FolderPlus as FolderPlusIcon,
  FilePlus as FilePlusIcon,
  FileMinus as FileMinusIcon,
  FolderMinus as FolderMinusIcon,
  Trash as TrashIcon2,
  BookmarkPlus as BookmarkPlusIcon,
  BookmarkMinus as BookmarkMinusIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  Check as CheckIcon,
  X as XIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  HelpCircle as HelpCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Lightbulb as LightbulbIcon,
  BookOpen as BookOpenIcon
} from 'lucide-react';

export interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: string) => string | null;
}

export interface InputState {
  value: string;
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
}

export interface GlassInputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'hidden';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'floating' | 'outlined';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'default' | 'success' | 'error' | 'warning' | 'info';
  showLabel?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showValidation?: boolean;
  showRequired?: boolean;
  showClear?: boolean;
  showPasswordToggle?: boolean;
  showCopy?: boolean;
  showCounter?: boolean;
  allowClear?: boolean;
  allowPasswordToggle?: boolean;
  allowCopy?: boolean;
  allowCounter?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  validation?: InputValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
  onValidation?: (error: string | null) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    height: 'h-8',
    padding: 'px-3 py-1.5',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-xs',
    descriptionSize: 'text-xs'
  },
  md: {
    height: 'h-10',
    padding: 'px-3 py-2',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs'
  },
  lg: {
    height: 'h-12',
    padding: 'px-4 py-3',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
    labelSize: 'text-base',
    descriptionSize: 'text-sm'
  },
  xl: {
    height: 'h-14',
    padding: 'px-4 py-4',
    textSize: 'text-lg',
    iconSize: 'w-6 h-6',
    labelSize: 'text-lg',
    descriptionSize: 'text-base'
  }
};

// State configurations
const stateConfig = {
  default: {
    border: 'border-glass-border/50',
    focus: 'focus:border-orange-400/50',
    ring: 'focus:ring-orange-400/50',
    icon: 'text-white/60',
    label: 'text-white/80',
    description: 'text-white/60'
  },
  success: {
    border: 'border-green-500/50',
    focus: 'focus:border-green-400/50',
    ring: 'focus:ring-green-400/50',
    icon: 'text-green-400',
    label: 'text-green-300',
    description: 'text-green-200/80'
  },
  error: {
    border: 'border-red-500/50',
    focus: 'focus:border-red-400/50',
    ring: 'focus:ring-red-400/50',
    icon: 'text-red-400',
    label: 'text-red-300',
    description: 'text-red-200/80'
  },
  warning: {
    border: 'border-yellow-500/50',
    focus: 'focus:border-yellow-400/50',
    ring: 'focus:ring-yellow-400/50',
    icon: 'text-yellow-400',
    label: 'text-yellow-300',
    description: 'text-yellow-200/80'
  },
  info: {
    border: 'border-blue-500/50',
    focus: 'focus:border-blue-400/50',
    ring: 'focus:ring-blue-400/50',
    icon: 'text-blue-400',
    label: 'text-blue-300',
    description: 'text-blue-200/80'
  }
};

// Animation variants
const inputVariants = {
  initial: { 
    opacity: 0, 
    y: 10
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const errorVariants = {
  initial: { 
    opacity: 0, 
    y: -5,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  id,
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  label,
  description,
  variant = 'default',
  size = 'md',
  state = 'default',
  showLabel = true,
  showDescription = true,
  showIcon = true,
  showValidation = true,
  showRequired = true,
  showClear = false,
  showPasswordToggle = false,
  showCopy = false,
  showCounter = false,
  allowClear = false,
  allowPasswordToggle = false,
  allowCopy = false,
  allowCounter = false,
  required = false,
  disabled = false,
  readonly = false,
  autoFocus = false,
  autoComplete,
  maxLength,
  minLength,
  min,
  max,
  step,
  pattern,
  className,
  inputClassName,
  labelClassName,
  descriptionClassName,
  icon,
  leftIcon,
  rightIcon,
  validation,
  error,
  success,
  warning,
  info,
  onValueChange,
  onFocus,
  onBlur,
  onClear,
  onCopy,
  onValidation
}, ref) => {
  const [inputState, setInputState] = useState<InputState>({
    value: value || defaultValue || '',
    error: null,
    touched: false,
    focused: false,
    dirty: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Get current value
  const currentValue = value !== undefined ? value : inputState.value;

  // Get current error
  const currentError = error || inputState.error;

  // Get current state
  const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : state;

  // Validate input
  const validateInput = useCallback((inputValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && (!inputValue || inputValue.trim() === '')) {
      return 'Поле обязательно для заполнения';
    }

    // Min length validation
    if (validation.minLength && inputValue && inputValue.length < validation.minLength) {
      return `Минимум ${validation.minLength} символов`;
    }

    // Max length validation
    if (validation.maxLength && inputValue && inputValue.length > validation.maxLength) {
      return `Максимум ${validation.maxLength} символов`;
    }

    // Pattern validation
    if (validation.pattern && inputValue && !validation.pattern.test(inputValue)) {
      return 'Неверный формат';
    }

    // Email validation
    if (validation.email && inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      return 'Неверный формат email';
    }

    // URL validation
    if (validation.url && inputValue && !/^https?:\/\/.+/.test(inputValue)) {
      return 'Неверный формат URL';
    }

    // Phone validation
    if (validation.phone && inputValue && !/^[\+]?[1-9][\d]{0,15}$/.test(inputValue)) {
      return 'Неверный формат телефона';
    }

    // Min value validation
    if (validation.min !== undefined && inputValue && Number(inputValue) < validation.min) {
      return `Минимальное значение: ${validation.min}`;
    }

    // Max value validation
    if (validation.max !== undefined && inputValue && Number(inputValue) > validation.max) {
      return `Максимальное значение: ${validation.max}`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(inputValue);
    }

    return null;
  }, [validation]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    setInputState(prev => ({
      ...prev,
      value: newValue,
      dirty: true
    }));

    // Validate
    const error = validateInput(newValue);
    setInputState(prev => ({
      ...prev,
      error
    }));

    onValueChange?.(newValue);
    onValidation?.(error);
  };

  // Handle focus
  const handleFocus = () => {
    setInputState(prev => ({
      ...prev,
      focused: true
    }));
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setInputState(prev => ({
      ...prev,
      focused: false,
      touched: true
    }));
    onBlur?.();
  };

  // Handle clear
  const handleClear = () => {
    handleValueChange('');
    onClear?.();
  };

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentValue);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle password toggle
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // Get input type
  const getInputType = () => {
    if (type === 'password' && showPassword) {
      return 'text';
    }
    return type;
  };

  // Get left icon
  const getLeftIcon = () => {
    if (leftIcon) return leftIcon;
    if (icon) return icon;
    
    // Default icons based on type
    switch (type) {
      case 'email':
        return Mail;
      case 'password':
        return Lock;
      case 'tel':
        return Phone;
      case 'url':
        return ExternalLink;
      case 'search':
        return Search;
      default:
        return null;
    }
  };

  // Get right icon
  const getRightIcon = () => {
    if (rightIcon) return rightIcon;
    
    // State icons
    if (currentError) return AlertCircle;
    if (success) return CheckCircle;
    if (warning) return AlertTriangle;
    if (info) return Info;
    
    return null;
  };

  // Render label
  const renderLabel = () => {
    if (!showLabel || !label) return null;

    return (
      <label
        htmlFor={id}
        className={cn(
          'block font-medium mb-2',
          config.labelSize,
          stateStyle.label,
          labelClassName
        )}
      >
        {label}
        {required && showRequired && (
          <span className="text-red-400 ml-1">*</span>
        )}
      </label>
    );
  };

  // Render description
  const renderDescription = () => {
    if (!showDescription || !description) return null;

    return (
      <p className={cn(
        'mt-1 mb-2',
        config.descriptionSize,
        stateStyle.description,
        descriptionClassName
      )}>
        {description}
      </p>
    );
  };

  // Render left icon
  const renderLeftIcon = () => {
    const LeftIcon = getLeftIcon();
    if (!LeftIcon || !showIcon) return null;

    return (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <LeftIcon className={cn(
          config.iconSize,
          stateStyle.icon
        )} />
      </div>
    );
  };

  // Render right icon
  const renderRightIcon = () => {
    const RightIcon = getRightIcon();
    if (!RightIcon) return null;

    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <RightIcon className={cn(
          config.iconSize,
          stateStyle.icon
        )} />
      </div>
    );
  };

  // Render clear button
  const renderClearButton = () => {
    if (!allowClear || !showClear || !currentValue) return null;

    return (
      <button
        type="button"
        onClick={handleClear}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    );
  };

  // Render password toggle
  const renderPasswordToggle = () => {
    if (!allowPasswordToggle || !showPasswordToggle || type !== 'password') return null;

    return (
      <button
        type="button"
        onClick={handlePasswordToggle}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    );
  };

  // Render copy button
  const renderCopyButton = () => {
    if (!allowCopy || !showCopy || !currentValue) return null;

    return (
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  };

  // Render counter
  const renderCounter = () => {
    if (!allowCounter || !showCounter || !maxLength) return null;

    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-white/60">
        {currentValue.length}/{maxLength}
      </div>
    );
  };

  // Render error message
  const renderErrorMessage = () => {
    if (!showValidation || !currentError || !inputState.touched) return null;

    return (
      <AnimatePresence>
        <motion.p
          className="mt-1 text-xs text-red-400"
          variants={errorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentError}
        </motion.p>
      </AnimatePresence>
    );
  };

  // Render success message
  const renderSuccessMessage = () => {
    if (!showValidation || !success) return null;

    return (
      <motion.p
        className="mt-1 text-xs text-green-400"
        variants={errorVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {success}
      </motion.p>
    );
  };

  // Render warning message
  const renderWarningMessage = () => {
    if (!showValidation || !warning) return null;

    return (
      <motion.p
        className="mt-1 text-xs text-yellow-400"
        variants={errorVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {warning}
      </motion.p>
    );
  };

  // Render info message
  const renderInfoMessage = () => {
    if (!showValidation || !info) return null;

    return (
      <motion.p
        className="mt-1 text-xs text-blue-400"
        variants={errorVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {info}
      </motion.p>
    );
  };

  // Get input classes
  const getInputClasses = () => {
    const hasLeftIcon = getLeftIcon() && showIcon;
    const hasRightIcon = getRightIcon() || allowClear || allowPasswordToggle || allowCopy || allowCounter;

    return cn(
      'w-full bg-glass-secondary/30 border rounded-lg text-white placeholder-white/60 focus:outline-none transition-colors duration-200',
      config.height,
      config.padding,
      config.textSize,
      stateStyle.border,
      stateStyle.focus,
      stateStyle.ring,
      hasLeftIcon && 'pl-10',
      hasRightIcon && 'pr-10',
      disabled && 'opacity-50 cursor-not-allowed',
      readonly && 'opacity-75 cursor-default',
      inputClassName
    );
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={inputVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Label */}
      {renderLabel()}

      {/* Description */}
      {renderDescription()}

      {/* Input container */}
      <div className="relative">
        {/* Input field */}
        <input
          ref={ref || inputRef}
          id={id}
          name={name}
          type={getInputType()}
          value={currentValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          className={getInputClasses()}
          onChange={(e) => handleValueChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Left icon */}
        {renderLeftIcon()}

        {/* Right icon */}
        {renderRightIcon()}

        {/* Clear button */}
        {renderClearButton()}

        {/* Password toggle */}
        {renderPasswordToggle()}

        {/* Copy button */}
        {renderCopyButton()}

        {/* Counter */}
        {renderCounter()}
      </div>

      {/* Error message */}
      {renderErrorMessage()}

      {/* Success message */}
      {renderSuccessMessage()}

      {/* Warning message */}
      {renderWarningMessage()}

      {/* Info message */}
      {renderInfoMessage()}
    </motion.div>
  );
});

GlassInput.displayName = 'GlassInput';

// Convenience components
export const GlassInputCompact: React.FC<Omit<GlassInputProps, 'variant' | 'size'>> = (props) => (
  <GlassInput {...props} variant="compact" size="sm" />
);

export const GlassInputDetailed: React.FC<Omit<GlassInputProps, 'variant' | 'size'>> = (props) => (
  <GlassInput {...props} variant="detailed" size="lg" />
);

export const GlassInputMinimal: React.FC<Omit<GlassInputProps, 'variant'>> = (props) => (
  <GlassInput {...props} variant="minimal" showLabel={false} showDescription={false} showIcon={false} showValidation={false} />
);

export const GlassInputFloating: React.FC<Omit<GlassInputProps, 'variant'>> = (props) => (
  <GlassInput {...props} variant="floating" />
);

export const GlassInputOutlined: React.FC<Omit<GlassInputProps, 'variant'>> = (props) => (
  <GlassInput {...props} variant="outlined" />
);

// Example usage component
export const GlassInputExample: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = (fieldId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Input examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Поля ввода</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычное поле
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактное поле
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальное поле
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальное поле
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Floating поле
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Outlined поле
          </button>
        </div>
      </div>

      {/* Default input */}
      <GlassInput
        id="default-input"
        name="default"
        type="text"
        label="Обычное поле"
        description="Стандартное поле ввода с glass эффектом"
        placeholder="Введите текст"
        value={values.default || ''}
        onValueChange={(value) => handleValueChange('default', value)}
        variant="default"
        size="md"
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        allowClear
        required
        validation={{
          required: true,
          minLength: 3,
          maxLength: 50
        }}
        icon={User}
      />

      {/* Compact input */}
      <GlassInputCompact
        id="compact-input"
        name="compact"
        type="email"
        label="Email"
        placeholder="Введите email"
        value={values.compact || ''}
        onValueChange={(value) => handleValueChange('compact', value)}
        showLabel
        showIcon
        showValidation
        showRequired
        allowClear
        required
        validation={{
          required: true,
          email: true
        }}
        icon={Mail}
      />

      {/* Detailed input */}
      <GlassInputDetailed
        id="detailed-input"
        name="detailed"
        type="password"
        label="Пароль"
        description="Пароль должен содержать минимум 8 символов"
        placeholder="Введите пароль"
        value={values.detailed || ''}
        onValueChange={(value) => handleValueChange('detailed', value)}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showPasswordToggle
        allowPasswordToggle
        required
        validation={{
          required: true,
          minLength: 8,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
        }}
        icon={Lock}
      />

      {/* Minimal input */}
      <GlassInputMinimal
        id="minimal-input"
        name="minimal"
        type="text"
        placeholder="Минимальное поле"
        value={values.minimal || ''}
        onValueChange={(value) => handleValueChange('minimal', value)}
        showValidation
        allowClear
      />

      {/* Floating input */}
      <GlassInputFloating
        id="floating-input"
        name="floating"
        type="text"
        label="Floating поле"
        placeholder="Введите текст"
        value={values.floating || ''}
        onValueChange={(value) => handleValueChange('floating', value)}
        showLabel
        showIcon
        showValidation
        allowClear
        icon={Search}
      />

      {/* Outlined input */}
      <GlassInputOutlined
        id="outlined-input"
        name="outlined"
        type="url"
        label="URL"
        description="Введите корректный URL"
        placeholder="https://example.com"
        value={values.outlined || ''}
        onValueChange={(value) => handleValueChange('outlined', value)}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showCopy
        allowCopy
        required
        validation={{
          required: true,
          url: true
        }}
        icon={ExternalLink}
      />

      {/* Input with different states */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Состояния полей</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            id="success-input"
            name="success"
            type="text"
            label="Успешное поле"
            placeholder="Введите текст"
            value="Успешное значение"
            state="success"
            success="Поле заполнено корректно"
            showLabel
            showValidation
            icon={CheckCircle}
          />

          <GlassInput
            id="error-input"
            name="error"
            type="text"
            label="Поле с ошибкой"
            placeholder="Введите текст"
            value="Неверное значение"
            state="error"
            error="Поле содержит ошибку"
            showLabel
            showValidation
            icon={AlertCircle}
          />

          <GlassInput
            id="warning-input"
            name="warning"
            type="text"
            label="Предупреждение"
            placeholder="Введите текст"
            value="Значение с предупреждением"
            state="warning"
            warning="Обратите внимание на это поле"
            showLabel
            showValidation
            icon={AlertTriangle}
          />

          <GlassInput
            id="info-input"
            name="info"
            type="text"
            label="Информационное поле"
            placeholder="Введите текст"
            value="Информационное значение"
            state="info"
            info="Дополнительная информация"
            showLabel
            showValidation
            icon={Info}
          />
        </div>
      </div>

      {/* Input with different types */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Типы полей</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            id="number-input"
            name="number"
            type="number"
            label="Числовое поле"
            placeholder="Введите число"
            value={values.number || ''}
            onValueChange={(value) => handleValueChange('number', value)}
            showLabel
            showIcon
            showValidation
            min={0}
            max={100}
            step={1}
            icon={Target}
          />

          <GlassInput
            id="phone-input"
            name="phone"
            type="tel"
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
            value={values.phone || ''}
            onValueChange={(value) => handleValueChange('phone', value)}
            showLabel
            showIcon
            showValidation
            validation={{
              phone: true
            }}
            icon={Phone}
          />

          <GlassInput
            id="search-input"
            name="search"
            type="search"
            label="Поиск"
            placeholder="Поиск..."
            value={values.search || ''}
            onValueChange={(value) => handleValueChange('search', value)}
            showLabel
            showIcon
            showClear
            allowClear
            icon={Search}
          />

          <GlassInput
            id="url-input"
            name="url"
            type="url"
            label="URL"
            placeholder="https://example.com"
            value={values.url || ''}
            onValueChange={(value) => handleValueChange('url', value)}
            showLabel
            showIcon
            showValidation
            showCopy
            allowCopy
            validation={{
              url: true
            }}
            icon={ExternalLink}
          />
        </div>
      </div>

      {/* Input with different sizes */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Размеры полей</h4>
        <div className="space-y-4">
          <GlassInput
            id="small-input"
            name="small"
            type="text"
            label="Маленькое поле"
            placeholder="Введите текст"
            value={values.small || ''}
            onValueChange={(value) => handleValueChange('small', value)}
            size="sm"
            showLabel
            showIcon
            icon={User}
          />

          <GlassInput
            id="medium-input"
            name="medium"
            type="text"
            label="Среднее поле"
            placeholder="Введите текст"
            value={values.medium || ''}
            onValueChange={(value) => handleValueChange('medium', value)}
            size="md"
            showLabel
            showIcon
            icon={User}
          />

          <GlassInput
            id="large-input"
            name="large"
            type="text"
            label="Большое поле"
            placeholder="Введите текст"
            value={values.large || ''}
            onValueChange={(value) => handleValueChange('large', value)}
            size="lg"
            showLabel
            showIcon
            icon={User}
          />

          <GlassInput
            id="extra-large-input"
            name="extraLarge"
            type="text"
            label="Очень большое поле"
            placeholder="Введите текст"
            value={values.extraLarge || ''}
            onValueChange={(value) => handleValueChange('extraLarge', value)}
            size="xl"
            showLabel
            showIcon
            icon={User}
          />
        </div>
      </div>
    </div>
  );
};