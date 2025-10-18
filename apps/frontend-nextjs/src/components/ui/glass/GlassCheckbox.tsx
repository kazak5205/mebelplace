'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Check,
  Minus,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
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
  User,
  Mail,
  Phone,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
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
  BookOpen as BookOpenIcon,
  User as UserIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key as KeyIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon
} from 'lucide-react';

export interface CheckboxValidation {
  required?: boolean;
  custom?: (value: boolean) => string | null;
}

export interface CheckboxState {
  checked: boolean;
  indeterminate?: boolean;
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
}

export interface GlassCheckboxProps {
  id?: string;
  name?: string;
  value?: boolean;
  defaultValue?: boolean;
  indeterminate?: boolean;
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
  showIndeterminate?: boolean;
  allowIndeterminate?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  className?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  validation?: CheckboxValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onValidation?: (error: string | null) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    checkboxSize: 'w-4 h-4',
    iconSize: 'w-3 h-3',
    textSize: 'text-sm',
    labelSize: 'text-xs',
    descriptionSize: 'text-xs',
    spacing: 'space-x-2'
  },
  md: {
    checkboxSize: 'w-5 h-5',
    iconSize: 'w-4 h-4',
    textSize: 'text-sm',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    spacing: 'space-x-3'
  },
  lg: {
    checkboxSize: 'w-6 h-6',
    iconSize: 'w-5 h-5',
    textSize: 'text-base',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    spacing: 'space-x-4'
  },
  xl: {
    checkboxSize: 'w-7 h-7',
    iconSize: 'w-6 h-6',
    textSize: 'text-lg',
    labelSize: 'text-lg',
    descriptionSize: 'text-base',
    spacing: 'space-x-5'
  }
};

// State configurations
const stateConfig = {
  default: {
    border: 'border-glass-border/50',
    focus: 'focus:border-orange-400/50',
    ring: 'focus:ring-orange-400/50',
    checked: 'bg-orange-500 border-orange-500',
    icon: 'text-white/60',
    label: 'text-white/80',
    description: 'text-white/60'
  },
  success: {
    border: 'border-green-500/50',
    focus: 'focus:border-green-400/50',
    ring: 'focus:ring-green-400/50',
    checked: 'bg-green-500 border-green-500',
    icon: 'text-green-400',
    label: 'text-green-300',
    description: 'text-green-200/80'
  },
  error: {
    border: 'border-red-500/50',
    focus: 'focus:border-red-400/50',
    ring: 'focus:ring-red-400/50',
    checked: 'bg-red-500 border-red-500',
    icon: 'text-red-400',
    label: 'text-red-300',
    description: 'text-red-200/80'
  },
  warning: {
    border: 'border-yellow-500/50',
    focus: 'focus:border-yellow-400/50',
    ring: 'focus:ring-yellow-400/50',
    checked: 'bg-yellow-500 border-yellow-500',
    icon: 'text-yellow-400',
    label: 'text-yellow-300',
    description: 'text-yellow-200/80'
  },
  info: {
    border: 'border-blue-500/50',
    focus: 'focus:border-blue-400/50',
    ring: 'focus:ring-blue-400/50',
    checked: 'bg-blue-500 border-blue-500',
    icon: 'text-blue-400',
    label: 'text-blue-300',
    description: 'text-blue-200/80'
  }
};

// Animation variants
const checkboxVariants = {
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

const checkVariants = {
  initial: { 
    scale: 0,
    opacity: 0
  },
  animate: { 
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
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

export const GlassCheckbox = forwardRef<HTMLInputElement, GlassCheckboxProps>(({
  id,
  name,
  value,
  defaultValue,
  indeterminate,
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
  showIndeterminate = true,
  allowIndeterminate = false,
  required = false,
  disabled = false,
  readonly = false,
  autoFocus = false,
  className,
  checkboxClassName,
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
  onValidation
}, ref) => {
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    checked: value || defaultValue || false,
    indeterminate: indeterminate || false,
    error: null,
    touched: false,
    focused: false,
    dirty: false
  });

  const checkboxRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Get current value
  const currentChecked = value !== undefined ? value : checkboxState.checked;
  const currentIndeterminate = indeterminate !== undefined ? indeterminate : checkboxState.indeterminate;

  // Get current error
  const currentError = error || checkboxState.error;

  // Get current state
  const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : state;

  // Validate checkbox
  const validateCheckbox = useCallback((checked: boolean): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !checked) {
      return 'Поле обязательно для заполнения';
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(checked);
    }

    return null;
  }, [validation]);

  // Handle value change
  const handleValueChange = (newChecked: boolean) => {
    setCheckboxState(prev => ({
      ...prev,
      checked: newChecked,
      indeterminate: false,
      dirty: true
    }));

    // Validate
    const error = validateCheckbox(newChecked);
    setCheckboxState(prev => ({
      ...prev,
      error
    }));

    onValueChange?.(newChecked);
    onValidation?.(error);
  };

  // Handle indeterminate change
  const handleIndeterminateChange = () => {
    if (!allowIndeterminate) return;

    setCheckboxState(prev => ({
      ...prev,
      indeterminate: !prev.indeterminate,
      checked: false,
      dirty: true
    }));

    onValueChange?.(false);
    onValidation?.(null);
  };

  // Handle focus
  const handleFocus = () => {
    setCheckboxState(prev => ({
      ...prev,
      focused: true
    }));
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setCheckboxState(prev => ({
      ...prev,
      focused: false,
      touched: true
    }));
    onBlur?.();
  };

  // Handle click
  const handleClick = () => {
    if (disabled || readonly) return;
    handleValueChange(!currentChecked);
  };

  // Handle key down
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      handleClick();
    }
  };

  // Get left icon
  const getLeftIcon = () => {
    if (leftIcon) return leftIcon;
    if (icon) return icon;
    return null;
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
          'block font-medium cursor-pointer',
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
        'mt-1',
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
      <div className="flex-shrink-0">
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
      <div className="flex-shrink-0">
        <RightIcon className={cn(
          config.iconSize,
          stateStyle.icon
        )} />
      </div>
    );
  };

  // Render error message
  const renderErrorMessage = () => {
    if (!showValidation || !currentError || !checkboxState.touched) return null;

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

  // Get checkbox classes
  const getCheckboxClasses = () => {
    return cn(
      'relative inline-flex items-center justify-center rounded border-2 bg-glass-secondary/30 transition-colors duration-200 cursor-pointer',
      config.checkboxSize,
      stateStyle.border,
      stateStyle.focus,
      stateStyle.ring,
      currentChecked && stateStyle.checked,
      currentIndeterminate && 'bg-orange-500 border-orange-500',
      disabled && 'opacity-50 cursor-not-allowed',
      readonly && 'opacity-75 cursor-default',
      checkboxClassName
    );
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={checkboxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Label */}
      {renderLabel()}

      {/* Description */}
      {renderDescription()}

      {/* Checkbox container */}
      <div className={cn('flex items-center', config.spacing)}>
        {/* Left icon */}
        {renderLeftIcon()}

        {/* Checkbox */}
        <div
          className={getCheckboxClasses()}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={disabled || readonly ? -1 : 0}
          role="checkbox"
          aria-checked={currentIndeterminate ? 'mixed' : currentChecked}
          aria-disabled={disabled}
          aria-readonly={readonly}
        >
          {/* Hidden input */}
          <input
            ref={ref || checkboxRef}
            id={id}
            name={name}
            type="checkbox"
            checked={currentChecked}
            onChange={() => {}} // Handled by click
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readonly}
            autoFocus={autoFocus}
            className="sr-only"
          />

          {/* Check icon */}
          <AnimatePresence>
            {currentChecked && (
              <motion.div
                variants={checkVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Check className={cn(
                  config.iconSize,
                  'text-white'
                )} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Indeterminate icon */}
          <AnimatePresence>
            {currentIndeterminate && (
              <motion.div
                variants={checkVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Minus className={cn(
                  config.iconSize,
                  'text-white'
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right icon */}
        {renderRightIcon()}

        {/* Indeterminate button */}
        {allowIndeterminate && showIndeterminate && (
          <button
            type="button"
            onClick={handleIndeterminateChange}
            disabled={disabled || readonly}
            className="ml-2 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
            title="Переключить неопределенное состояние"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
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

GlassCheckbox.displayName = 'GlassCheckbox';

// Convenience components
export const GlassCheckboxCompact: React.FC<Omit<GlassCheckboxProps, 'variant' | 'size'>> = (props) => (
  <GlassCheckbox {...props} variant="compact" size="sm" />
);

export const GlassCheckboxDetailed: React.FC<Omit<GlassCheckboxProps, 'variant' | 'size'>> = (props) => (
  <GlassCheckbox {...props} variant="detailed" size="lg" />
);

export const GlassCheckboxMinimal: React.FC<Omit<GlassCheckboxProps, 'variant'>> = (props) => (
  <GlassCheckbox {...props} variant="minimal" showLabel={false} showDescription={false} showIcon={false} showValidation={false} />
);

export const GlassCheckboxFloating: React.FC<Omit<GlassCheckboxProps, 'variant'>> = (props) => (
  <GlassCheckbox {...props} variant="floating" />
);

export const GlassCheckboxOutlined: React.FC<Omit<GlassCheckboxProps, 'variant'>> = (props) => (
  <GlassCheckbox {...props} variant="outlined" />
);

// Example usage component
export const GlassCheckboxExample: React.FC = () => {
  const [values, setValues] = useState<Record<string, boolean>>({});

  const handleValueChange = (fieldId: string, value: boolean) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Checkbox examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Чекбоксы</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычный чекбокс
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактный чекбокс
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальный чекбокс
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальный чекбокс
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Floating чекбокс
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Outlined чекбокс
          </button>
        </div>
      </div>

      {/* Default checkbox */}
      <GlassCheckbox
        id="default-checkbox"
        name="default"
        label="Обычный чекбокс"
        description="Стандартный чекбокс с glass эффектом"
        value={values.default || false}
        onValueChange={(value) => handleValueChange('default', value)}
        variant="default"
        size="md"
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showIndeterminate
        allowIndeterminate
        required
        validation={{
          required: true
        }}
        icon={Check}
      />

      {/* Compact checkbox */}
      <GlassCheckboxCompact
        id="compact-checkbox"
        name="compact"
        label="Согласие"
        value={values.compact || false}
        onValueChange={(value) => handleValueChange('compact', value)}
        showLabel
        showIcon
        showValidation
        showRequired
        required
        validation={{
          required: true
        }}
        icon={Check}
      />

      {/* Detailed checkbox */}
      <GlassCheckboxDetailed
        id="detailed-checkbox"
        name="detailed"
        label="Детальный чекбокс"
        description="Чекбокс с множеством возможностей"
        value={values.detailed || false}
        onValueChange={(value) => handleValueChange('detailed', value)}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showIndeterminate
        allowIndeterminate
        required
        validation={{
          required: true
        }}
        icon={Check}
      />

      {/* Minimal checkbox */}
      <GlassCheckboxMinimal
        id="minimal-checkbox"
        name="minimal"
        value={values.minimal || false}
        onValueChange={(value) => handleValueChange('minimal', value)}
        showValidation
      />

      {/* Floating checkbox */}
      <GlassCheckboxFloating
        id="floating-checkbox"
        name="floating"
        label="Floating чекбокс"
        value={values.floating || false}
        onValueChange={(value) => handleValueChange('floating', value)}
        showLabel
        showIcon
        showValidation
        icon={Check}
      />

      {/* Outlined checkbox */}
      <GlassCheckboxOutlined
        id="outlined-checkbox"
        name="outlined"
        label="Outlined чекбокс"
        description="Чекбокс с outlined стилем"
        value={values.outlined || false}
        onValueChange={(value) => handleValueChange('outlined', value)}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        required
        validation={{
          required: true
        }}
        icon={Check}
      />

      {/* Checkbox with different states */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Состояния чекбоксов</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCheckbox
            id="success-checkbox"
            name="success"
            label="Успешный чекбокс"
            value={true}
            state="success"
            success="Чекбокс отмечен корректно"
            showLabel
            showValidation
            icon={CheckCircle}
          />

          <GlassCheckbox
            id="error-checkbox"
            name="error"
            label="Чекбокс с ошибкой"
            value={false}
            state="error"
            error="Необходимо отметить чекбокс"
            showLabel
            showValidation
            icon={AlertCircle}
          />

          <GlassCheckbox
            id="warning-checkbox"
            name="warning"
            label="Предупреждение"
            value={true}
            state="warning"
            warning="Обратите внимание на этот чекбокс"
            showLabel
            showValidation
            icon={AlertTriangle}
          />

          <GlassCheckbox
            id="info-checkbox"
            name="info"
            label="Информационный чекбокс"
            value={false}
            state="info"
            info="Дополнительная информация"
            showLabel
            showValidation
            icon={Info}
          />
        </div>
      </div>

      {/* Checkbox with different sizes */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Размеры чекбоксов</h4>
        <div className="space-y-4">
          <GlassCheckbox
            id="small-checkbox"
            name="small"
            label="Маленький чекбокс"
            value={values.small || false}
            onValueChange={(value) => handleValueChange('small', value)}
            size="sm"
            showLabel
            showIcon
            icon={Check}
          />

          <GlassCheckbox
            id="medium-checkbox"
            name="medium"
            label="Средний чекбокс"
            value={values.medium || false}
            onValueChange={(value) => handleValueChange('medium', value)}
            size="md"
            showLabel
            showIcon
            icon={Check}
          />

          <GlassCheckbox
            id="large-checkbox"
            name="large"
            label="Большой чекбокс"
            value={values.large || false}
            onValueChange={(value) => handleValueChange('large', value)}
            size="lg"
            showLabel
            showIcon
            icon={Check}
          />

          <GlassCheckbox
            id="extra-large-checkbox"
            name="extraLarge"
            label="Очень большой чекбокс"
            value={values.extraLarge || false}
            onValueChange={(value) => handleValueChange('extraLarge', value)}
            size="xl"
            showLabel
            showIcon
            icon={Check}
          />
        </div>
      </div>

      {/* Checkbox with special features */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Специальные возможности</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCheckbox
            id="indeterminate-checkbox"
            name="indeterminate"
            label="Неопределенное состояние"
            description="Чекбокс с возможностью неопределенного состояния"
            value={values.indeterminate || false}
            onValueChange={(value) => handleValueChange('indeterminate', value)}
            showLabel
            showDescription
            showIcon
            showIndeterminate
            allowIndeterminate
            icon={Check}
          />

          <GlassCheckbox
            id="disabled-checkbox"
            name="disabled"
            label="Отключенный чекбокс"
            description="Чекбокс в отключенном состоянии"
            value={true}
            disabled
            showLabel
            showDescription
            showIcon
            icon={Check}
          />

          <GlassCheckbox
            id="readonly-checkbox"
            name="readonly"
            label="Только для чтения"
            description="Чекбокс в режиме только для чтения"
            value={true}
            readonly
            showLabel
            showDescription
            showIcon
            icon={Check}
          />

          <GlassCheckbox
            id="required-checkbox"
            name="required"
            label="Обязательный чекбокс"
            description="Чекбокс с обязательной валидацией"
            value={values.required || false}
            onValueChange={(value) => handleValueChange('required', value)}
            showLabel
            showDescription
            showIcon
            showValidation
            showRequired
            required
            validation={{
              required: true
            }}
            icon={Check}
          />
        </div>
      </div>
    </div>
  );
};
