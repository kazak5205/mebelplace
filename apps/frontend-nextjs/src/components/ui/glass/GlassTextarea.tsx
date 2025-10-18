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
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  Save,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Move as MoveIcon,
  RotateCcw as RotateIcon,
  Save as SaveIcon
} from 'lucide-react';

export interface TextareaValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface TextareaState {
  value: string;
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
  rows: number;
}

export interface GlassTextareaProps {
  id?: string;
  name?: string;
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
  showCopy?: boolean;
  showCounter?: boolean;
  showResize?: boolean;
  showMaximize?: boolean;
  allowClear?: boolean;
  allowCopy?: boolean;
  allowCounter?: boolean;
  allowResize?: boolean;
  allowMaximize?: boolean;
  allowAutoResize?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  cols?: number;
  wrap?: 'soft' | 'hard' | 'off';
  className?: string;
  textareaClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  validation?: TextareaValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
  onResize?: (rows: number) => void;
  onMaximize?: () => void;
  onValidation?: (error: string | null) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    padding: 'px-3 py-2',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-xs',
    descriptionSize: 'text-xs',
    minHeight: 'min-h-[80px]'
  },
  md: {
    padding: 'px-3 py-2',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    minHeight: 'min-h-[100px]'
  },
  lg: {
    padding: 'px-4 py-3',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    minHeight: 'min-h-[120px]'
  },
  xl: {
    padding: 'px-4 py-4',
    textSize: 'text-lg',
    iconSize: 'w-6 h-6',
    labelSize: 'text-lg',
    descriptionSize: 'text-base',
    minHeight: 'min-h-[140px]'
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
const textareaVariants = {
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

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  id,
  name,
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
  showCopy = false,
  showCounter = false,
  showResize = false,
  showMaximize = false,
  allowClear = false,
  allowCopy = false,
  allowCounter = false,
  allowResize = false,
  allowMaximize = false,
  allowAutoResize = true,
  required = false,
  disabled = false,
  readonly = false,
  autoFocus = false,
  autoComplete,
  maxLength,
  minLength,
  rows = 3,
  minRows = 2,
  maxRows = 10,
  cols,
  wrap = 'soft',
  className,
  textareaClassName,
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
  onResize,
  onMaximize,
  onValidation
}, ref) => {
  const [textareaState, setTextareaState] = useState<TextareaState>({
    value: value || defaultValue || '',
    error: null,
    touched: false,
    focused: false,
    dirty: false,
    rows: rows
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Get current value
  const currentValue = value !== undefined ? value : textareaState.value;

  // Get current error
  const currentError = error || textareaState.error;

  // Get current state
  const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : state;

  // Validate textarea
  const validateTextarea = useCallback((textareaValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && (!textareaValue || textareaValue.trim() === '')) {
      return 'Поле обязательно для заполнения';
    }

    // Min length validation
    if (validation.minLength && textareaValue && textareaValue.length < validation.minLength) {
      return `Минимум ${validation.minLength} символов`;
    }

    // Max length validation
    if (validation.maxLength && textareaValue && textareaValue.length > validation.maxLength) {
      return `Максимум ${validation.maxLength} символов`;
    }

    // Pattern validation
    if (validation.pattern && textareaValue && !validation.pattern.test(textareaValue)) {
      return 'Неверный формат';
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(textareaValue);
    }

    return null;
  }, [validation]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    if (!allowAutoResize || !textareaRef.current) return;

    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const newRows = Math.max(minRows, Math.min(maxRows, Math.ceil(scrollHeight / lineHeight)));
    
    textarea.style.height = `${newRows * lineHeight}px`;
    
    setTextareaState(prev => ({
      ...prev,
      rows: newRows
    }));
    
    onResize?.(newRows);
  }, [allowAutoResize, minRows, maxRows, onResize]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    setTextareaState(prev => ({
      ...prev,
      value: newValue,
      dirty: true
    }));

    // Validate
    const error = validateTextarea(newValue);
    setTextareaState(prev => ({
      ...prev,
      error
    }));

    onValueChange?.(newValue);
    onValidation?.(error);

    // Auto-resize
    if (allowAutoResize) {
      setTimeout(autoResize, 0);
    }
  };

  // Handle focus
  const handleFocus = () => {
    setTextareaState(prev => ({
      ...prev,
      focused: true
    }));
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setTextareaState(prev => ({
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

  // Handle maximize
  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  // Get left icon
  const getLeftIcon = () => {
    if (leftIcon) return leftIcon;
    if (icon) return icon;
    return FileText;
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
      <div className="absolute left-3 top-3">
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
      <div className="absolute right-3 top-3">
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
        className="absolute right-3 top-3 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        <X className="w-4 h-4" />
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
        className="absolute right-3 top-3 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    );
  };

  // Render maximize button
  const renderMaximizeButton = () => {
    if (!allowMaximize || !showMaximize) return null;

    return (
      <button
        type="button"
        onClick={handleMaximize}
        className="absolute right-3 bottom-3 p-1 text-white/60 hover:text-white hover:bg-glass-secondary/30 rounded transition-colors duration-200"
      >
        {isMaximized ? (
          <Minimize className="w-4 h-4" />
        ) : (
          <Maximize className="w-4 h-4" />
        )}
      </button>
    );
  };

  // Render counter
  const renderCounter = () => {
    if (!allowCounter || !showCounter || !maxLength) return null;

    return (
      <div className="absolute right-3 bottom-3 text-xs text-white/60">
        {currentValue.length}/{maxLength}
      </div>
    );
  };

  // Render error message
  const renderErrorMessage = () => {
    if (!showValidation || !currentError || !textareaState.touched) return null;

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

  // Get textarea classes
  const getTextareaClasses = () => {
    const hasLeftIcon = getLeftIcon() && showIcon;
    const hasRightIcon = getRightIcon() || allowClear || allowCopy || allowMaximize || allowCounter;

    return cn(
      'w-full bg-glass-secondary/30 border rounded-lg text-white placeholder-white/60 focus:outline-none transition-colors duration-200 resize-none',
      config.padding,
      config.textSize,
      config.minHeight,
      stateStyle.border,
      stateStyle.focus,
      stateStyle.ring,
      hasLeftIcon && 'pl-10',
      hasRightIcon && 'pr-10',
      allowResize && 'resize-y',
      disabled && 'opacity-50 cursor-not-allowed',
      readonly && 'opacity-75 cursor-default',
      textareaClassName
    );
  };

  return (
    <motion.div
      className={cn('space-y-2', className)}
      variants={textareaVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Label */}
      {renderLabel()}

      {/* Description */}
      {renderDescription()}

      {/* Textarea container */}
      <div className="relative">
        {/* Textarea field */}
        <textarea
          ref={ref || textareaRef}
          id={id}
          name={name}
          value={currentValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readonly}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          rows={isMaximized ? maxRows : textareaState.rows}
          cols={cols}
          wrap={wrap}
          className={getTextareaClasses()}
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

        {/* Copy button */}
        {renderCopyButton()}

        {/* Maximize button */}
        {renderMaximizeButton()}

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

GlassTextarea.displayName = 'GlassTextarea';

// Convenience components
export const GlassTextareaCompact: React.FC<Omit<GlassTextareaProps, 'variant' | 'size'>> = (props) => (
  <GlassTextarea {...props} variant="compact" size="sm" />
);

export const GlassTextareaDetailed: React.FC<Omit<GlassTextareaProps, 'variant' | 'size'>> = (props) => (
  <GlassTextarea {...props} variant="detailed" size="lg" />
);

export const GlassTextareaMinimal: React.FC<Omit<GlassTextareaProps, 'variant'>> = (props) => (
  <GlassTextarea {...props} variant="minimal" showLabel={false} showDescription={false} showIcon={false} showValidation={false} />
);

export const GlassTextareaFloating: React.FC<Omit<GlassTextareaProps, 'variant'>> = (props) => (
  <GlassTextarea {...props} variant="floating" />
);

export const GlassTextareaOutlined: React.FC<Omit<GlassTextareaProps, 'variant'>> = (props) => (
  <GlassTextarea {...props} variant="outlined" />
);

// Example usage component
export const GlassTextareaExample: React.FC = () => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = (fieldId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  return (
    <div className="space-y-8 p-8">
      {/* Textarea examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Многострочные поля</h3>
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

      {/* Default textarea */}
      <GlassTextarea
        id="default-textarea"
        name="default"
        label="Обычное поле"
        description="Стандартное многострочное поле с glass эффектом"
        placeholder="Введите текст..."
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
        showCopy
        showCounter
        showResize
        showMaximize
        allowClear
        allowCopy
        allowCounter
        allowResize
        allowMaximize
        allowAutoResize
        required
        rows={4}
        minRows={2}
        maxRows={8}
        maxLength={500}
        validation={{
          required: true,
          minLength: 10,
          maxLength: 500
        }}
        icon={FileText}
      />

      {/* Compact textarea */}
      <GlassTextareaCompact
        id="compact-textarea"
        name="compact"
        label="Комментарий"
        placeholder="Введите комментарий..."
        value={values.compact || ''}
        onValueChange={(value) => handleValueChange('compact', value)}
        showLabel
        showIcon
        showValidation
        showRequired
        allowClear
        allowAutoResize
        required
        rows={3}
        minRows={2}
        maxRows={5}
        maxLength={200}
        validation={{
          required: true,
          minLength: 5,
          maxLength: 200
        }}
        icon={MessageCircle}
      />

      {/* Detailed textarea */}
      <GlassTextareaDetailed
        id="detailed-textarea"
        name="detailed"
        label="Подробное описание"
        description="Подробное описание с множеством возможностей"
        placeholder="Введите подробное описание..."
        value={values.detailed || ''}
        onValueChange={(value) => handleValueChange('detailed', value)}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showCopy
        showCounter
        showResize
        showMaximize
        allowClear
        allowCopy
        allowCounter
        allowResize
        allowMaximize
        allowAutoResize
        required
        rows={6}
        minRows={4}
        maxRows={12}
        maxLength={1000}
        validation={{
          required: true,
          minLength: 20,
          maxLength: 1000
        }}
        icon={FileText}
      />

      {/* Minimal textarea */}
      <GlassTextareaMinimal
        id="minimal-textarea"
        name="minimal"
        placeholder="Минимальное поле..."
        value={values.minimal || ''}
        onValueChange={(value) => handleValueChange('minimal', value)}
        showValidation
        allowClear
        allowAutoResize
        rows={3}
        minRows={2}
        maxRows={5}
      />

      {/* Floating textarea */}
      <GlassTextareaFloating
        id="floating-textarea"
        name="floating"
        label="Floating поле"
        placeholder="Введите текст..."
        value={values.floating || ''}
        onValueChange={(value) => handleValueChange('floating', value)}
        showLabel
        showIcon
        showValidation
        allowClear
        allowAutoResize
        icon={Edit}
      />

      {/* Outlined textarea */}
      <GlassTextareaOutlined
        id="outlined-textarea"
        name="outlined"
        label="Outlined поле"
        description="Поле с outlined стилем"
        placeholder="Введите текст..."
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
        rows={4}
        minRows={3}
        maxRows={8}
        maxLength={300}
        validation={{
          required: true,
          minLength: 10,
          maxLength: 300
        }}
        icon={FileText}
      />

      {/* Textarea with different states */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Состояния полей</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassTextarea
            id="success-textarea"
            name="success"
            label="Успешное поле"
            placeholder="Введите текст..."
            value="Успешное значение"
            state="success"
            success="Поле заполнено корректно"
            showLabel
            showValidation
            icon={CheckCircle}
          />

          <GlassTextarea
            id="error-textarea"
            name="error"
            label="Поле с ошибкой"
            placeholder="Введите текст..."
            value="Неверное значение"
            state="error"
            error="Поле содержит ошибку"
            showLabel
            showValidation
            icon={AlertCircle}
          />

          <GlassTextarea
            id="warning-textarea"
            name="warning"
            label="Предупреждение"
            placeholder="Введите текст..."
            value="Значение с предупреждением"
            state="warning"
            warning="Обратите внимание на это поле"
            showLabel
            showValidation
            icon={AlertTriangle}
          />

          <GlassTextarea
            id="info-textarea"
            name="info"
            label="Информационное поле"
            placeholder="Введите текст..."
            value="Информационное значение"
            state="info"
            info="Дополнительная информация"
            showLabel
            showValidation
            icon={Info}
          />
        </div>
      </div>

      {/* Textarea with different sizes */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Размеры полей</h4>
        <div className="space-y-4">
          <GlassTextarea
            id="small-textarea"
            name="small"
            label="Маленькое поле"
            placeholder="Введите текст..."
            value={values.small || ''}
            onValueChange={(value) => handleValueChange('small', value)}
            size="sm"
            showLabel
            showIcon
            icon={FileText}
          />

          <GlassTextarea
            id="medium-textarea"
            name="medium"
            label="Среднее поле"
            placeholder="Введите текст..."
            value={values.medium || ''}
            onValueChange={(value) => handleValueChange('medium', value)}
            size="md"
            showLabel
            showIcon
            icon={FileText}
          />

          <GlassTextarea
            id="large-textarea"
            name="large"
            label="Большое поле"
            placeholder="Введите текст..."
            value={values.large || ''}
            onValueChange={(value) => handleValueChange('large', value)}
            size="lg"
            showLabel
            showIcon
            icon={FileText}
          />

          <GlassTextarea
            id="extra-large-textarea"
            name="extraLarge"
            label="Очень большое поле"
            placeholder="Введите текст..."
            value={values.extraLarge || ''}
            onValueChange={(value) => handleValueChange('extraLarge', value)}
            size="xl"
            showLabel
            showIcon
            icon={FileText}
          />
        </div>
      </div>

      {/* Textarea with special features */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Специальные возможности</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassTextarea
            id="auto-resize-textarea"
            name="autoResize"
            label="Авторазмер"
            description="Поле автоматически изменяет размер"
            placeholder="Введите текст..."
            value={values.autoResize || ''}
            onValueChange={(value) => handleValueChange('autoResize', value)}
            showLabel
            showDescription
            showIcon
            allowAutoResize
            minRows={2}
            maxRows={6}
            icon={FileText}
          />

          <GlassTextarea
            id="resize-textarea"
            name="resize"
            label="Ручное изменение размера"
            description="Поле можно изменять вручную"
            placeholder="Введите текст..."
            value={values.resize || ''}
            onValueChange={(value) => handleValueChange('resize', value)}
            showLabel
            showDescription
            showIcon
            allowResize
            rows={4}
            icon={FileText}
          />

          <GlassTextarea
            id="maximize-textarea"
            name="maximize"
            label="Максимизация"
            description="Поле можно развернуть на полный экран"
            placeholder="Введите текст..."
            value={values.maximize || ''}
            onValueChange={(value) => handleValueChange('maximize', value)}
            showLabel
            showDescription
            showIcon
            showMaximize
            allowMaximize
            rows={4}
            minRows={3}
            maxRows={10}
            icon={FileText}
          />

          <GlassTextarea
            id="counter-textarea"
            name="counter"
            label="Счетчик символов"
            description="Показывает количество символов"
            placeholder="Введите текст..."
            value={values.counter || ''}
            onValueChange={(value) => handleValueChange('counter', value)}
            showLabel
            showDescription
            showIcon
            showCounter
            allowCounter
            maxLength={200}
            rows={4}
            icon={FileText}
          />
        </div>
      </div>
    </div>
  );
};
