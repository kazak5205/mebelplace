'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Check,
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
  Minus,
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
  Minus as MinusIcon,
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

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  group?: string;
  color?: string;
}

export interface SelectValidation {
  required?: boolean;
  minSelections?: number;
  maxSelections?: number;
  custom?: (value: string | string[]) => string | null;
}

export interface SelectState {
  value: string | string[];
  error: string | null;
  touched: boolean;
  focused: boolean;
  dirty: boolean;
  open: boolean;
  searchQuery: string;
  filteredOptions: SelectOption[];
}

export interface GlassSelectProps {
  id?: string;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  placeholder?: string;
  label?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed' | 'floating' | 'outlined';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'default' | 'success' | 'error' | 'warning' | 'info';
  type?: 'single' | 'multiple';
  showLabel?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showValidation?: boolean;
  showRequired?: boolean;
  showClear?: boolean;
  showSearch?: boolean;
  showCounter?: boolean;
  showGroups?: boolean;
  allowClear?: boolean;
  allowSearch?: boolean;
  allowCounter?: boolean;
  allowGroups?: boolean;
  allowCreate?: boolean;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxSelections?: number;
  minSelections?: number;
  className?: string;
  selectClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  options: SelectOption[];
  validation?: SelectValidation;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  onValueChange?: (value: string | string[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  onValidation?: (error: string | null) => void;
  onCreate?: (value: string) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    height: 'h-8',
    padding: 'px-3 py-1.5',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-xs',
    descriptionSize: 'text-xs',
    optionPadding: 'px-3 py-1.5',
    optionTextSize: 'text-sm'
  },
  md: {
    height: 'h-10',
    padding: 'px-3 py-2',
    textSize: 'text-sm',
    iconSize: 'w-4 h-4',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    optionPadding: 'px-3 py-2',
    optionTextSize: 'text-sm'
  },
  lg: {
    height: 'h-12',
    padding: 'px-4 py-3',
    textSize: 'text-base',
    iconSize: 'w-5 h-5',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    optionPadding: 'px-4 py-3',
    optionTextSize: 'text-base'
  },
  xl: {
    height: 'h-14',
    padding: 'px-4 py-4',
    textSize: 'text-lg',
    iconSize: 'w-6 h-6',
    labelSize: 'text-lg',
    descriptionSize: 'text-base',
    optionPadding: 'px-4 py-4',
    optionTextSize: 'text-lg'
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
const selectVariants = {
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

const dropdownVariants = {
  initial: { 
    opacity: 0, 
    y: -10,
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
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const optionVariants = {
  initial: { 
    opacity: 0, 
    x: -10
  },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassSelect = forwardRef<HTMLDivElement, GlassSelectProps>(({
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
  type = 'single',
  showLabel = true,
  showDescription = true,
  showIcon = true,
  showValidation = true,
  showRequired = true,
  showClear = false,
  showSearch = false,
  showCounter = false,
  showGroups = false,
  allowClear = false,
  allowSearch = false,
  allowCounter = false,
  allowGroups = false,
  allowCreate = false,
  required = false,
  disabled = false,
  readonly = false,
  autoFocus = false,
  autoComplete,
  maxSelections,
  minSelections,
  className,
  selectClassName,
  labelClassName,
  descriptionClassName,
  icon,
  leftIcon,
  rightIcon,
  options,
  validation,
  error,
  success,
  warning,
  info,
  onValueChange,
  onFocus,
  onBlur,
  onClear,
  onSearch,
  onValidation,
  onCreate
}, ref) => {
  const [selectState, setSelectState] = useState<SelectState>({
    value: value || defaultValue || (type === 'multiple' ? [] : ''),
    error: null,
    touched: false,
    focused: false,
    dirty: false,
    open: false,
    searchQuery: '',
    filteredOptions: options
  });

  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = sizeConfig[size];
  const stateStyle = stateConfig[state];

  // Get current value
  const currentValue = value !== undefined ? value : selectState.value;

  // Get current error
  const currentError = error || selectState.error;

  // Get current state
  const currentState = error ? 'error' : success ? 'success' : warning ? 'warning' : info ? 'info' : state;

  // Filter options based on search query
  const filterOptions = useCallback((query: string) => {
    if (!query) {
      setSelectState(prev => ({
        ...prev,
        filteredOptions: options
      }));
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      option.description?.toLowerCase().includes(query.toLowerCase())
    );

    setSelectState(prev => ({
      ...prev,
      filteredOptions: filtered
    }));
  }, [options]);

  // Validate select
  const validateSelect = useCallback((selectValue: string | string[]): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required) {
      if (type === 'multiple') {
        if (!Array.isArray(selectValue) || selectValue.length === 0) {
          return 'Поле обязательно для заполнения';
        }
      } else {
        if (!selectValue || selectValue.toString().trim() === '') {
          return 'Поле обязательно для заполнения';
        }
      }
    }

    // Min selections validation
    if (validation.minSelections && type === 'multiple' && Array.isArray(selectValue)) {
      if (selectValue.length < validation.minSelections) {
        return `Минимум ${validation.minSelections} элементов`;
      }
    }

    // Max selections validation
    if (validation.maxSelections && type === 'multiple' && Array.isArray(selectValue)) {
      if (selectValue.length > validation.maxSelections) {
        return `Максимум ${validation.maxSelections} элементов`;
      }
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(selectValue);
    }

    return null;
  }, [validation, type]);

  // Handle value change
  const handleValueChange = (newValue: string | string[]) => {
    setSelectState(prev => ({
      ...prev,
      value: newValue,
      dirty: true
    }));

    // Validate
    const error = validateSelect(newValue);
    setSelectState(prev => ({
      ...prev,
      error
    }));

    onValueChange?.(newValue);
    onValidation?.(error);
  };

  // Handle option select
  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    if (type === 'multiple') {
      const currentValues = Array.isArray(currentValue) ? currentValue : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      
      handleValueChange(newValues);
    } else {
      handleValueChange(option.value);
      setSelectState(prev => ({
        ...prev,
        open: false,
        searchQuery: ''
      }));
    }
  };

  // Handle clear
  const handleClear = () => {
    handleValueChange(type === 'multiple' ? [] : '');
    onClear?.();
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSelectState(prev => ({
      ...prev,
      searchQuery: query
    }));
    filterOptions(query);
    onSearch?.(query);
  };

  // Handle create
  const handleCreate = (value: string) => {
    if (allowCreate && value.trim()) {
      onCreate?.(value.trim());
      setSelectState(prev => ({
        ...prev,
        searchQuery: ''
      }));
    }
  };

  // Handle focus
  const handleFocus = () => {
    setSelectState(prev => ({
      ...prev,
      focused: true
    }));
    onFocus?.();
  };

  // Handle blur
  const handleBlur = () => {
    setSelectState(prev => ({
      ...prev,
      focused: false,
      touched: true
    }));
    onBlur?.();
  };

  // Handle toggle
  const handleToggle = () => {
    if (disabled || readonly) return;
    
    setSelectState(prev => ({
      ...prev,
      open: !prev.open,
      searchQuery: ''
    }));
    
    if (!selectState.open) {
      filterOptions('');
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setSelectState(prev => ({
          ...prev,
          open: false,
          searchQuery: ''
        }));
      }
    };

    if (selectState.open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectState.open]);

  // Get selected options
  const getSelectedOptions = () => {
    if (type === 'multiple') {
      const values = Array.isArray(currentValue) ? currentValue : [];
      return options.filter(option => values.includes(option.value));
    } else {
      return options.filter(option => option.value === currentValue);
    }
  };

  // Get display value
  const getDisplayValue = () => {
    const selectedOptions = getSelectedOptions();
    
    if (type === 'multiple') {
      if (selectedOptions.length === 0) return '';
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} элементов выбрано`;
    } else {
      return selectedOptions[0]?.label || '';
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
    if (!allowClear || !showClear || !currentValue || (Array.isArray(currentValue) && currentValue.length === 0)) return null;

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

  // Render dropdown arrow
  const renderDropdownArrow = () => {
    return (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {selectState.open ? (
          <ChevronUp className={cn(
            config.iconSize,
            stateStyle.icon
          )} />
        ) : (
          <ChevronDown className={cn(
            config.iconSize,
            stateStyle.icon
          )} />
        )}
      </div>
    );
  };

  // Render option
  const renderOption = (option: SelectOption) => {
    const isSelected = type === 'multiple' 
      ? Array.isArray(currentValue) && currentValue.includes(option.value)
      : currentValue === option.value;

    return (
      <motion.div
        key={option.value}
        className={cn(
          'flex items-center space-x-3 cursor-pointer transition-colors duration-200',
          config.optionPadding,
          config.optionTextSize,
          isSelected && 'bg-orange-500/20 text-orange-300',
          !isSelected && 'text-white/80 hover:bg-glass-secondary/30',
          option.disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => handleOptionSelect(option)}
        variants={optionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Option icon */}
        {option.icon && (
          <option.icon className={cn(
            config.iconSize,
            isSelected ? 'text-orange-400' : 'text-white/60'
          )} />
        )}

        {/* Option content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{option.label}</div>
          {option.description && (
            <div className="text-xs text-white/60 truncate">{option.description}</div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <Check className="w-4 h-4 text-orange-400" />
        )}
      </motion.div>
    );
  };

  // Render group
  const renderGroup = (groupName: string, groupOptions: SelectOption[]) => {
    return (
      <div key={groupName} className="space-y-1">
        <div className="px-3 py-2 text-xs font-medium text-white/60 uppercase tracking-wide">
          {groupName}
        </div>
        <div className="space-y-1">
          {groupOptions.map(renderOption)}
        </div>
      </div>
    );
  };

  // Render dropdown
  const renderDropdown = () => {
    if (!selectState.open) return null;

    const groupedOptions = allowGroups && showGroups
      ? selectState.filteredOptions.reduce((groups, option) => {
          const group = option.group || 'Без группы';
          if (!groups[group]) groups[group] = [];
          groups[group].push(option);
          return groups;
        }, {} as Record<string, SelectOption[]>)
      : { 'Все': selectState.filteredOptions };

    return (
      <AnimatePresence>
        <motion.div
          className="absolute top-full left-0 right-0 mt-1 bg-glass-primary/90 backdrop-blur-xl border border-glass-border/50 rounded-lg shadow-glass-lg overflow-hidden z-50"
          variants={dropdownVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Search input */}
          {allowSearch && showSearch && (
            <div className="p-3 border-b border-glass-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Поиск..."
                  value={selectState.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm"
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(groupedOptions).map(([groupName, groupOptions]) =>
              groupOptions.length > 0 ? (
                allowGroups && showGroups ? (
                  renderGroup(groupName, groupOptions)
                ) : (
                  <div key={groupName} className="space-y-1">
                    {groupOptions.map(renderOption)}
                  </div>
                )
              ) : null
            )}

            {/* No options message */}
            {selectState.filteredOptions.length === 0 && (
              <div className="p-3 text-center text-white/60 text-sm">
                {selectState.searchQuery ? 'Ничего не найдено' : 'Нет доступных опций'}
              </div>
            )}

            {/* Create option */}
            {allowCreate && selectState.searchQuery && !selectState.filteredOptions.some(opt => opt.label.toLowerCase() === selectState.searchQuery.toLowerCase()) && (
              <div className="p-3 border-t border-glass-border/50">
                <button
                  onClick={() => handleCreate(selectState.searchQuery)}
                  className="w-full flex items-center space-x-2 p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать "{selectState.searchQuery}"</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Render error message
  const renderErrorMessage = () => {
    if (!showValidation || !currentError || !selectState.touched) return null;

    return (
      <AnimatePresence>
        <motion.p
          className="mt-1 text-xs text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
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
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
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
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
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
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
      >
        {info}
      </motion.p>
    );
  };

  // Get select classes
  const getSelectClasses = () => {
    const hasLeftIcon = getLeftIcon() && showIcon;
    const hasRightIcon = getRightIcon() || allowClear;

    return cn(
      'w-full bg-glass-secondary/30 border rounded-lg text-white placeholder-white/60 focus:outline-none transition-colors duration-200 cursor-pointer',
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
      selectClassName
    );
  };

  return (
    <motion.div
      ref={ref || selectRef}
      className={cn('relative space-y-2', className)}
      variants={selectVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Label */}
      {renderLabel()}

      {/* Description */}
      {renderDescription()}

      {/* Select container */}
      <div className="relative">
        {/* Select field */}
        <div
          className={getSelectClasses()}
          onClick={handleToggle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          tabIndex={disabled || readonly ? -1 : 0}
        >
          {/* Display value */}
          <div className="truncate">
            {getDisplayValue() || placeholder}
          </div>

          {/* Left icon */}
          {renderLeftIcon()}

          {/* Right icon */}
          {renderRightIcon()}

          {/* Clear button */}
          {renderClearButton()}

          {/* Dropdown arrow */}
          {renderDropdownArrow()}
        </div>

        {/* Dropdown */}
        {renderDropdown()}
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

GlassSelect.displayName = 'GlassSelect';

// Convenience components
export const GlassSelectCompact: React.FC<Omit<GlassSelectProps, 'variant' | 'size'>> = (props) => (
  <GlassSelect {...props} variant="compact" size="sm" />
);

export const GlassSelectDetailed: React.FC<Omit<GlassSelectProps, 'variant' | 'size'>> = (props) => (
  <GlassSelect {...props} variant="detailed" size="lg" />
);

export const GlassSelectMinimal: React.FC<Omit<GlassSelectProps, 'variant'>> = (props) => (
  <GlassSelect {...props} variant="minimal" showLabel={false} showDescription={false} showIcon={false} showValidation={false} />
);

export const GlassSelectFloating: React.FC<Omit<GlassSelectProps, 'variant'>> = (props) => (
  <GlassSelect {...props} variant="floating" />
);

export const GlassSelectOutlined: React.FC<Omit<GlassSelectProps, 'variant'>> = (props) => (
  <GlassSelect {...props} variant="outlined" />
);

// Example usage component
export const GlassSelectExample: React.FC = () => {
  const [values, setValues] = useState<Record<string, string | string[]>>({});

  const handleValueChange = (fieldId: string, value: string | string[]) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const sampleOptions: SelectOption[] = [
    { value: 'option1', label: 'Опция 1', description: 'Описание опции 1', icon: User },
    { value: 'option2', label: 'Опция 2', description: 'Описание опции 2', icon: Mail },
    { value: 'option3', label: 'Опция 3', description: 'Описание опции 3', icon: Phone },
    { value: 'option4', label: 'Опция 4', description: 'Описание опции 4', icon: MapPin },
    { value: 'option5', label: 'Опция 5', description: 'Описание опции 5', icon: Calendar },
    { value: 'option6', label: 'Опция 6', description: 'Описание опции 6', icon: Clock },
    { value: 'option7', label: 'Опция 7', description: 'Описание опции 7', icon: Tag },
    { value: 'option8', label: 'Опция 8', description: 'Описание опции 8', icon: FileText }
  ];

  const groupedOptions: SelectOption[] = [
    { value: 'user1', label: 'Пользователь 1', group: 'Пользователи', icon: User },
    { value: 'user2', label: 'Пользователь 2', group: 'Пользователи', icon: User },
    { value: 'admin1', label: 'Администратор 1', group: 'Администраторы', icon: Shield },
    { value: 'admin2', label: 'Администратор 2', group: 'Администраторы', icon: Shield },
    { value: 'mod1', label: 'Модератор 1', group: 'Модераторы', icon: Key },
    { value: 'mod2', label: 'Модератор 2', group: 'Модераторы', icon: Key }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Select examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Выпадающие списки</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200">
            Обычный список
          </button>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors duration-200">
            Компактный список
          </button>
          <button className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200">
            Детальный список
          </button>
          <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors duration-200">
            Минимальный список
          </button>
          <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors duration-200">
            Floating список
          </button>
          <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors duration-200">
            Outlined список
          </button>
        </div>
      </div>

      {/* Default select */}
      <GlassSelect
        id="default-select"
        name="default"
        label="Обычный список"
        description="Стандартный выпадающий список с glass эффектом"
        placeholder="Выберите опцию"
        value={values.default || ''}
        onValueChange={(value) => handleValueChange('default', value)}
        options={sampleOptions}
        variant="default"
        size="md"
        type="single"
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showSearch
        allowClear
        allowSearch
        required
        validation={{
          required: true
        }}
        icon={Settings}
      />

      {/* Compact select */}
      <GlassSelectCompact
        id="compact-select"
        name="compact"
        label="Категория"
        placeholder="Выберите категорию"
        value={values.compact || ''}
        onValueChange={(value) => handleValueChange('compact', value)}
        options={sampleOptions.slice(0, 4)}
        showLabel
        showIcon
        showValidation
        showRequired
        allowClear
        required
        validation={{
          required: true
        }}
        icon={Tag}
      />

      {/* Detailed select */}
      <GlassSelectDetailed
        id="detailed-select"
        name="detailed"
        label="Детальный список"
        description="Список с множеством возможностей"
        placeholder="Выберите опцию"
        value={values.detailed || ''}
        onValueChange={(value) => handleValueChange('detailed', value)}
        options={sampleOptions}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showSearch
        showCounter
        allowClear
        allowSearch
        allowCounter
        required
        validation={{
          required: true
        }}
        icon={Settings}
      />

      {/* Minimal select */}
      <GlassSelectMinimal
        id="minimal-select"
        name="minimal"
        placeholder="Минимальный список"
        value={values.minimal || ''}
        onValueChange={(value) => handleValueChange('minimal', value)}
        options={sampleOptions.slice(0, 3)}
        showValidation
        allowClear
      />

      {/* Floating select */}
      <GlassSelectFloating
        id="floating-select"
        name="floating"
        label="Floating список"
        placeholder="Выберите опцию"
        value={values.floating || ''}
        onValueChange={(value) => handleValueChange('floating', value)}
        options={sampleOptions}
        showLabel
        showIcon
        showValidation
        allowClear
        allowSearch
        icon={Filter}
      />

      {/* Outlined select */}
      <GlassSelectOutlined
        id="outlined-select"
        name="outlined"
        label="Outlined список"
        description="Список с outlined стилем"
        placeholder="Выберите опцию"
        value={values.outlined || ''}
        onValueChange={(value) => handleValueChange('outlined', value)}
        options={sampleOptions}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showSearch
        allowClear
        allowSearch
        required
        validation={{
          required: true
        }}
        icon={Settings}
      />

      {/* Multiple select */}
      <GlassSelect
        id="multiple-select"
        name="multiple"
        label="Множественный выбор"
        description="Выберите несколько опций"
        placeholder="Выберите опции"
        value={values.multiple || []}
        onValueChange={(value) => handleValueChange('multiple', value)}
        options={sampleOptions}
        type="multiple"
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showSearch
        showCounter
        allowClear
        allowSearch
        allowCounter
        required
        maxSelections={3}
        validation={{
          required: true,
          minSelections: 1,
          maxSelections: 3
        }}
        icon={Target}
      />

      {/* Grouped select */}
      <GlassSelect
        id="grouped-select"
        name="grouped"
        label="Группированный список"
        description="Список с группировкой опций"
        placeholder="Выберите пользователя"
        value={values.grouped || ''}
        onValueChange={(value) => handleValueChange('grouped', value)}
        options={groupedOptions}
        showLabel
        showDescription
        showIcon
        showValidation
        showRequired
        showClear
        showSearch
        showGroups
        allowClear
        allowSearch
        allowGroups
        required
        validation={{
          required: true
        }}
        icon={Users}
      />

      {/* Select with different states */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Состояния списков</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassSelect
            id="success-select"
            name="success"
            label="Успешный список"
            placeholder="Выберите опцию"
            value="option1"
            options={sampleOptions}
            state="success"
            success="Опция выбрана корректно"
            showLabel
            showValidation
            icon={CheckCircle}
          />

          <GlassSelect
            id="error-select"
            name="error"
            label="Список с ошибкой"
            placeholder="Выберите опцию"
            value=""
            options={sampleOptions}
            state="error"
            error="Необходимо выбрать опцию"
            showLabel
            showValidation
            icon={AlertCircle}
          />

          <GlassSelect
            id="warning-select"
            name="warning"
            label="Предупреждение"
            placeholder="Выберите опцию"
            value="option2"
            options={sampleOptions}
            state="warning"
            warning="Обратите внимание на выбор"
            showLabel
            showValidation
            icon={AlertTriangle}
          />

          <GlassSelect
            id="info-select"
            name="info"
            label="Информационный список"
            placeholder="Выберите опцию"
            value="option3"
            options={sampleOptions}
            state="info"
            info="Дополнительная информация"
            showLabel
            showValidation
            icon={Info}
          />
        </div>
      </div>

      {/* Select with different sizes */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Размеры списков</h4>
        <div className="space-y-4">
          <GlassSelect
            id="small-select"
            name="small"
            label="Маленький список"
            placeholder="Выберите опцию"
            value={values.small || ''}
            onValueChange={(value) => handleValueChange('small', value)}
            options={sampleOptions}
            size="sm"
            showLabel
            showIcon
            icon={Settings}
          />

          <GlassSelect
            id="medium-select"
            name="medium"
            label="Средний список"
            placeholder="Выберите опцию"
            value={values.medium || ''}
            onValueChange={(value) => handleValueChange('medium', value)}
            options={sampleOptions}
            size="md"
            showLabel
            showIcon
            icon={Settings}
          />

          <GlassSelect
            id="large-select"
            name="large"
            label="Большой список"
            placeholder="Выберите опцию"
            value={values.large || ''}
            onValueChange={(value) => handleValueChange('large', value)}
            options={sampleOptions}
            size="lg"
            showLabel
            showIcon
            icon={Settings}
          />

          <GlassSelect
            id="extra-large-select"
            name="extraLarge"
            label="Очень большой список"
            placeholder="Выберите опцию"
            value={values.extraLarge || ''}
            onValueChange={(value) => handleValueChange('extraLarge', value)}
            options={sampleOptions}
            size="xl"
            showLabel
            showIcon
            icon={Settings}
          />
        </div>
      </div>
    </div>
  );
};
