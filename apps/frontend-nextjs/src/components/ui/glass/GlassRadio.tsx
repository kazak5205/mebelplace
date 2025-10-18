'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, createContext, useContext } from 'react';
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
  FlagPlus,
  FlagMinus,
  TargetPlus,
  TargetMinus,
  ZapPlus,
  ZapMinus,
  ShieldPlus,
  ShieldMinus,
  KeyPlus,
  KeyMinus,
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
  FlagPlus as FlagPlusIcon,
  FlagMinus as FlagMinusIcon,
  TargetPlus as TargetPlusIcon,
  TargetMinus as TargetMinusIcon,
  ZapPlus as ZapPlusIcon,
  ZapMinus as ZapMinusIcon,
  ShieldPlus as ShieldPlusIcon,
  ShieldMinus as ShieldMinusIcon,
  KeyPlus as KeyPlusIcon,
  KeyMinus as KeyMinusIcon,
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

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  color?: string;
}

export interface RadioValidation {
  required?: boolean;
  custom?: (value: string) => string | null;
}

export interface RadioState {
  value: string;
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
}

export interface RadioGroupContextType {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onValidation: (error: string | null) => void;
  disabled: boolean;
  readonly: boolean;
  size: 'sm' | 'md' | 'lg' | 'xl';
  state: 'default' | 'success' | 'error' | 'warning' | 'info';
  showValidation: boolean;
  showRequired: boolean;
  showIcon: boolean;
  variant: 'default' | 'compact' | 'minimal' | 'detailed' | 'floating' | 'outlined';
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

export const useRadioGroupContext = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroupContext must be used within a GlassRadioGroup');
  }
  return context;
};

export interface GlassRadioProps {
  id?: string;
  name?: string;
  value: string;
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
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  className?: string;
  radioClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  validation?: RadioValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onValidation?: (error: string | null) => void;
}

export interface GlassRadioGroupProps {
  children: React.ReactNode;
  name: string;
  value?: string;
  defaultValue?: string;
  label?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'floating' | 'outlined';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'default' | 'success' | 'error' | 'warning' | 'info';
  layout?: 'vertical' | 'horizontal' | 'grid';
  showLabel?: boolean;
  showDescription?: boolean;
  showValidation?: boolean;
  showRequired?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  groupClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  validation?: RadioValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onValidation?: (error: string | null) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    radioSize: 'w-4 h-4',
    dotSize: 'w-2 h-2',
    textSize: 'text-sm',
    labelSize: 'text-xs',
    descriptionSize: 'text-xs',
    spacing: 'space-x-2'
  },
  md: {
    radioSize: 'w-5 h-5',
    dotSize: 'w-2.5 h-2.5',
    textSize: 'text-sm',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    spacing: 'space-x-3'
  },
  lg: {
    radioSize: 'w-6 h-6',
    dotSize: 'w-3 h-3',
    textSize: 'text-base',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    spacing: 'space-x-4'
  },
  xl: {
    radioSize: 'w-7 h-7',
    dotSize: 'w-3.5 h-3.5',
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
    checked: 'border-orange-500',
    dot: 'bg-orange-500',
    icon: 'text-white/60',
    label: 'text-white/80',
    description: 'text-white/60'
  },
  success: {
    border: 'border-green-500/50',
    focus: 'focus:border-green-400/50',
    ring: 'focus:ring-green-400/50',
    checked: 'border-green-500',
    dot: 'bg-green-500',
    icon: 'text-green-400',
    label: 'text-green-300',
    description: 'text-green-200/80'
  },
  error: {
    border: 'border-red-500/50',
    focus: 'focus:border-red-400/50',
    ring: 'focus:ring-red-400/50',
    checked: 'border-red-500',
    dot: 'bg-red-500',
    icon: 'text-red-400',
    label: 'text-red-300',
    description: 'text-red-200/80'
  },
  warning: {
    border: 'border-yellow-500/50',
    focus: 'focus:border-yellow-400/50',
    ring: 'focus:ring-yellow-400/50',
    checked: 'border-yellow-500',
    dot: 'bg-yellow-500',
    icon: 'text-yellow-400',
    label: 'text-yellow-300',
    description: 'text-yellow-200/80'
  },
  info: {
    border: 'border-blue-500/50',
    focus: 'focus:border-blue-400/50',
    ring: 'focus:ring-blue-400/50',
    checked: 'border-blue-500',
    dot: 'bg-blue-500',
    icon: 'text-blue-400',
    label: 'text-blue-300',
    description: 'text-blue-200/80'
  }
};

// Animation variants
const radioVariants = {
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

const dotVariants = {
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

export const GlassRadio = forwardRef<HTMLInputElement, GlassRadioProps>(({
  id,
  name,
  value,
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
  disabled = false,
  readonly = false,
  autoFocus = false,
  className,
  radioClassName,
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
  const groupContext = useContext(RadioGroupContext);
  
  const [radioState, setRadioState] = useState<RadioState>({
    value: '',
    error: null,
    touched: false,
    focused: false,
    dirty: false
  });

  const radioRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Use group context if available
  const isInGroup = !!groupContext;
  const currentName = isInGroup ? groupContext.name : name;
  const currentValue = isInGroup ? groupContext.value : radioState.value;
  const currentDisabled = isInGroup ? groupContext.disabled : disabled;
  const currentReadonly = isInGroup ? groupContext.readonly : readonly;
  const currentSize = isInGroup ? groupContext.size : size;
  const currentState = isInGroup ? groupContext.state : state;
  const currentShowValidation = isInGroup ? groupContext.showValidation : showValidation;
  const currentShowRequired = isInGroup ? groupContext.showRequired : showRequired;
  const currentShowIcon = isInGroup ? groupContext.showIcon : showIcon;
  const currentVariant = isInGroup ? groupContext.variant : variant;

  // Get current error
  const currentError = error || radioState.error;

  // Get current state
  const currentStateStyle = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : currentState;

  // Check if this radio is selected
  const isSelected = currentValue === value;

  // Validate radio
  const validateRadio = useCallback((radioValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !radioValue) {
      return 'Поле обязательно для заполнения';
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(radioValue);
    }

    return null;
  }, [validation]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    if (isInGroup) {
      groupContext.onChange(newValue);
    } else {
      setRadioState(prev => ({
        ...prev,
        value: newValue,
        dirty: true
      }));

      // Validate
      const error = validateRadio(newValue);
      setRadioState(prev => ({
        ...prev,
        error
      }));

      onValidation?.(error);
    }

    onValueChange?.(newValue);
  };

  // Handle focus
  const handleFocus = () => {
    if (isInGroup) {
      groupContext.onFocus();
    } else {
      setRadioState(prev => ({
        ...prev,
        focused: true
      }));
    }
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    if (isInGroup) {
      groupContext.onBlur();
    } else {
      setRadioState(prev => ({
        ...prev,
        focused: false,
        touched: true
      }));
    }
    onBlur?.();
  };

  // Handle click
  const handleClick = () => {
    if (currentDisabled || currentReadonly) return;
    handleValueChange(value);
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
        {showRequired && (
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
    if (!showValidation || !currentError || !radioState.touched) return null;

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

  // Get radio classes
  const getRadioClasses = () => {
    return cn(
      'relative inline-flex items-center justify-center rounded-full border-2 bg-glass-secondary/30 transition-colors duration-200 cursor-pointer',
      config.radioSize,
      stateStyle.border,
      stateStyle.focus,
      stateStyle.ring,
      isSelected && stateStyle.checked,
      currentDisabled && 'opacity-50 cursor-not-allowed',
      currentReadonly && 'opacity-75 cursor-default',
      radioClassName
    );
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={radioVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Label */}
      {renderLabel()}

      {/* Description */}
      {renderDescription()}

      {/* Radio container */}
      <div className={cn('flex items-center', config.spacing)}>
        {/* Left icon */}
        {renderLeftIcon()}

        {/* Radio */}
        <div
          className={getRadioClasses()}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={currentDisabled || currentReadonly ? -1 : 0}
          role="radio"
          aria-checked={isSelected}
          aria-disabled={currentDisabled}
          aria-readonly={currentReadonly}
        >
          {/* Hidden input */}
          <input
            ref={ref || radioRef}
            id={id}
            name={currentName}
            type="radio"
            value={value}
            checked={isSelected}
            onChange={() => {}} // Handled by click
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={currentDisabled}
            readOnly={currentReadonly}
            autoFocus={autoFocus}
            className="sr-only"
          />

          {/* Radio dot */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className={cn(
                  'rounded-full',
                  config.dotSize,
                  stateStyle.dot
                )}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right icon */}
        {renderRightIcon()}
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

GlassRadio.displayName = 'GlassRadio';

export const GlassRadioGroup: React.FC<GlassRadioGroupProps> = ({
  children,
  name,
  value,
  defaultValue,
  label,
  description,
  variant = 'default',
  size = 'md',
  state = 'default',
  layout = 'vertical',
  showLabel = true,
  showDescription = true,
  showValidation = true,
  showRequired = true,
  disabled = false,
  readonly = false,
  className,
  groupClassName,
  labelClassName,
  descriptionClassName,
  validation,
  error,
  success,
  warning,
  info,
  onValueChange,
  onFocus,
  onBlur,
  onValidation
}) => {
  const [groupState, setGroupState] = useState<RadioState>({
    value: value || defaultValue || '',
    error: null,
    touched: false,
    focused: false,
    dirty: false
  });

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Get current value
  const currentValue = value !== undefined ? value : groupState.value;

  // Get current error
  const currentError = error || groupState.error;

  // Get current state
  const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : state;

  // Validate group
  const validateGroup = useCallback((groupValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !groupValue) {
      return 'Поле обязательно для заполнения';
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(groupValue);
    }

    return null;
  }, [validation]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    setGroupState(prev => ({
      ...prev,
      value: newValue,
      dirty: true
    }));

    // Validate
    const error = validateGroup(newValue);
    setGroupState(prev => ({
      ...prev,
      error
    }));

    onValueChange?.(newValue);
    onValidation?.(error);
  };

  // Handle focus
  const handleFocus = () => {
    setGroupState(prev => ({
      ...prev,
      focused: true
    }));
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setGroupState(prev => ({
      ...prev,
      focused: false,
      touched: true
    }));
    onBlur?.();
  };

  // Render label
  const renderLabel = () => {
    if (!showLabel || !label) return null;

    return (
      <label
        className={cn(
          'block font-medium mb-2',
          config.labelSize,
          stateStyle.label,
          labelClassName
        )}
      >
        {label}
        {showRequired && (
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

  // Render error message
  const renderErrorMessage = () => {
    if (!showValidation || !currentError || !groupState.touched) return null;

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

  // Get group classes
  const getGroupClasses = () => {
    return cn(
      'space-y-2',
      layout === 'horizontal' && 'flex flex-wrap gap-4',
      layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
      groupClassName
    );
  };

  // Group context value
  const groupContextValue: RadioGroupContextType = {
    name,
    value: currentValue,
    onChange: handleValueChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onValidation: (error) => {
      setGroupState(prev => ({ ...prev, error }));
      onValidation?.(error);
    },
    disabled,
    readonly,
    size,
    state: currentState,
    showValidation,
    showRequired,
    showIcon: true,
    variant
  };

  return (
    <RadioGroupContext.Provider value={groupContextValue}>
      <motion.div
        className={cn('space-y-2', className)}
        variants={radioVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Label */}
        {renderLabel()}

        {/* Description */}
        {renderDescription()}

        {/* Radio group */}
        <div className={getGroupClasses()}>
          {children}
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
    </RadioGroupContext.Provider>
  );
};

// Convenience components
export const GlassRadioCompact: React.FC<Omit<GlassRadioProps, 'variant' | 'size'>> = (props) => (
  <GlassRadio {...props} variant="compact" size="sm" />
);

export const GlassRadioDetailed: React.FC<Omit<GlassRadioProps, 'variant' | 'size'>> = (props) => (
  <GlassRadio {...props} variant="detailed" size="lg" />
);

export const GlassRadioMinimal: React.FC<Omit<GlassRadioProps, 'variant'>> = (props) => (
  <GlassRadio {...props} variant="minimal" showLabel={false} showDescription={false} showIcon={false} showValidation={false} />
);

export const GlassRadioFloating: React.FC<Omit<GlassRadioProps, 'variant'>> = (props) => (
  <GlassRadio {...props} variant="floating" />
);

export const GlassRadioOutlined: React.FC<Omit<GlassRadioProps, 'variant'>> = (props) => (
  <GlassRadio {...props} variant="outlined" />
);

// Example usage component
export const GlassRadioExample: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = (fieldId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Radio examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Радиокнопки</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычная радиокнопка
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактная радиокнопка
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальная радиокнопка
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальная радиокнопка
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Floating радиокнопка
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Outlined радиокнопка
          </button>
        </div>
      </div>

      {/* Default radio group */}
      <GlassRadioGroup
        name="default-group"
        label="Обычная группа радиокнопок"
        description="Стандартная группа радиокнопок с glass эффектом"
        value={values.default || ''}
        onValueChange={(value) => handleValueChange('default', value)}
        variant="default"
        size="md"
        layout="vertical"
        showLabel
        showDescription
        showValidation
        showRequired
        required
        validation={{
          required: true
        }}
      >
        <GlassRadio
          value="option1"
          label="Опция 1"
          description="Описание опции 1"
          icon={User}
        />
        <GlassRadio
          value="option2"
          label="Опция 2"
          description="Описание опции 2"
          icon={Mail}
        />
        <GlassRadio
          value="option3"
          label="Опция 3"
          description="Описание опции 3"
          icon={Phone}
        />
      </GlassRadioGroup>

      {/* Compact radio group */}
      <GlassRadioGroup
        name="compact-group"
        label="Категория"
        value={values.compact || ''}
        onValueChange={(value) => handleValueChange('compact', value)}
        variant="compact"
        size="sm"
        layout="horizontal"
        showLabel
        showValidation
        showRequired
        required
        validation={{
          required: true
        }}
      >
        <GlassRadio
          value="cat1"
          label="Категория 1"
          icon={Tag}
        />
        <GlassRadio
          value="cat2"
          label="Категория 2"
          icon={Tag}
        />
        <GlassRadio
          value="cat3"
          label="Категория 3"
          icon={Tag}
        />
      </GlassRadioGroup>

      {/* Detailed radio group */}
      <GlassRadioGroup
        name="detailed-group"
        label="Детальная группа радиокнопок"
        description="Группа с множеством возможностей"
        value={values.detailed || ''}
        onValueChange={(value) => handleValueChange('detailed', value)}
        variant="detailed"
        size="lg"
        layout="grid"
        showLabel
        showDescription
        showValidation
        showRequired
        required
        validation={{
          required: true
        }}
      >
        <GlassRadio
          value="detail1"
          label="Детальная опция 1"
          description="Подробное описание опции 1"
          icon={Settings}
        />
        <GlassRadio
          value="detail2"
          label="Детальная опция 2"
          description="Подробное описание опции 2"
          icon={Settings}
        />
        <GlassRadio
          value="detail3"
          label="Детальная опция 3"
          description="Подробное описание опции 3"
          icon={Settings}
        />
        <GlassRadio
          value="detail4"
          label="Детальная опция 4"
          description="Подробное описание опции 4"
          icon={Settings}
        />
      </GlassRadioGroup>

      {/* Radio group with different states */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Состояния групп</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassRadioGroup
            name="success-group"
            label="Успешная группа"
            value="option1"
            state="success"
            success="Опция выбрана корректно"
            showLabel
            showValidation
          >
            <GlassRadio
              value="option1"
              label="Опция 1"
              icon={CheckCircle}
            />
            <GlassRadio
              value="option2"
              label="Опция 2"
              icon={CheckCircle}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="error-group"
            label="Группа с ошибкой"
            value=""
            state="error"
            error="Необходимо выбрать опцию"
            showLabel
            showValidation
          >
            <GlassRadio
              value="option1"
              label="Опция 1"
              icon={AlertCircle}
            />
            <GlassRadio
              value="option2"
              label="Опция 2"
              icon={AlertCircle}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="warning-group"
            label="Предупреждение"
            value="option1"
            state="warning"
            warning="Обратите внимание на выбор"
            showLabel
            showValidation
          >
            <GlassRadio
              value="option1"
              label="Опция 1"
              icon={AlertTriangle}
            />
            <GlassRadio
              value="option2"
              label="Опция 2"
              icon={AlertTriangle}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="info-group"
            label="Информационная группа"
            value="option1"
            state="info"
            info="Дополнительная информация"
            showLabel
            showValidation
          >
            <GlassRadio
              value="option1"
              label="Опция 1"
              icon={Info}
            />
            <GlassRadio
              value="option2"
              label="Опция 2"
              icon={Info}
            />
          </GlassRadioGroup>
        </div>
      </div>

      {/* Radio group with different sizes */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Размеры групп</h4>
        <div className="space-y-4">
          <GlassRadioGroup
            name="small-group"
            label="Маленькая группа"
            value={values.small || ''}
            onValueChange={(value) => handleValueChange('small', value)}
            size="sm"
            showLabel
          >
            <GlassRadio
              value="small1"
              label="Маленькая опция 1"
              icon={Target}
            />
            <GlassRadio
              value="small2"
              label="Маленькая опция 2"
              icon={Target}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="medium-group"
            label="Средняя группа"
            value={values.medium || ''}
            onValueChange={(value) => handleValueChange('medium', value)}
            size="md"
            showLabel
          >
            <GlassRadio
              value="medium1"
              label="Средняя опция 1"
              icon={Target}
            />
            <GlassRadio
              value="medium2"
              label="Средняя опция 2"
              icon={Target}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="large-group"
            label="Большая группа"
            value={values.large || ''}
            onValueChange={(value) => handleValueChange('large', value)}
            size="lg"
            showLabel
          >
            <GlassRadio
              value="large1"
              label="Большая опция 1"
              icon={Target}
            />
            <GlassRadio
              value="large2"
              label="Большая опция 2"
              icon={Target}
            />
          </GlassRadioGroup>

          <GlassRadioGroup
            name="extra-large-group"
            label="Очень большая группа"
            value={values.extraLarge || ''}
            onValueChange={(value) => handleValueChange('extraLarge', value)}
            size="xl"
            showLabel
          >
            <GlassRadio
              value="xl1"
              label="Очень большая опция 1"
              icon={Target}
            />
            <GlassRadio
              value="xl2"
              label="Очень большая опция 2"
              icon={Target}
            />
          </GlassRadioGroup>
        </div>
      </div>
    </div>
  );
};
