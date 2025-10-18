'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertCircle, 
  Info, 
  Lock, 
  Unlock,
  RotateCcw,
  Save,
  Send,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  ArrowRight,
  ArrowLeft,
  Home,
  Settings,
  User,
  CreditCard,
  FileText,
  Image,
  Video,
  Star,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';

export type StepStatus = 'pending' | 'current' | 'completed' | 'error' | 'disabled' | 'skipped';

export type StepValidation = {
  isValid: boolean;
  message?: string;
  errors?: string[];
};

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  status: StepStatus;
  validation?: StepValidation;
  isOptional?: boolean;
  isSkippable?: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  content?: React.ReactNode;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    onClick: () => void;
    disabled?: boolean;
  }>;
  metadata?: {
    estimatedTime?: string;
    requiredFields?: string[];
    dependencies?: string[];
    tags?: string[];
  };
}

export interface GlassStepperProps {
  steps: StepperStep[];
  currentStep?: number;
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'horizontal' | 'vertical';
  showProgress?: boolean;
  showStepNumbers?: boolean;
  showStepIcons?: boolean;
  showStepDescriptions?: boolean;
  showStepActions?: boolean;
  showNavigation?: boolean;
  showValidation?: boolean;
  showStepSummary?: boolean;
  showStepMetadata?: boolean;
  allowStepNavigation?: boolean;
  allowStepSkipping?: boolean;
  allowStepEditing?: boolean;
  allowStepDeletion?: boolean;
  allowStepReordering?: boolean;
  autoAdvance?: boolean;
  autoSave?: boolean;
  className?: string;
  onStepChange?: (stepIndex: number, step: StepperStep) => void;
  onStepComplete?: (stepIndex: number, step: StepperStep) => void;
  onStepSkip?: (stepIndex: number, step: StepperStep) => void;
  onStepEdit?: (stepIndex: number, step: StepperStep) => void;
  onStepDelete?: (stepIndex: number, step: StepperStep) => void;
  onStepReorder?: (fromIndex: number, toIndex: number) => void;
  onComplete?: () => void;
  onReset?: () => void;
  onSave?: () => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    stepSize: 'w-8 h-8',
    iconSize: 'w-4 h-4',
    fontSize: 'text-xs',
    titleSize: 'text-sm',
    spacing: 'space-y-2',
    padding: 'p-2'
  },
  md: {
    stepSize: 'w-10 h-10',
    iconSize: 'w-5 h-5',
    fontSize: 'text-sm',
    titleSize: 'text-base',
    spacing: 'space-y-3',
    padding: 'p-3'
  },
  lg: {
    stepSize: 'w-12 h-12',
    iconSize: 'w-6 h-6',
    fontSize: 'text-base',
    titleSize: 'text-lg',
    spacing: 'space-y-4',
    padding: 'p-4'
  },
  xl: {
    stepSize: 'w-16 h-16',
    iconSize: 'w-8 h-8',
    fontSize: 'text-lg',
    titleSize: 'text-xl',
    spacing: 'space-y-6',
    padding: 'p-6'
  }
};

// Status configurations
const statusConfig = {
  pending: {
    color: 'text-white/60',
    bg: 'bg-glass-secondary/30',
    border: 'border-glass-border/50',
    icon: null,
    label: 'Ожидает'
  },
  current: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    icon: null,
    label: 'Текущий'
  },
  completed: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    icon: Check,
    label: 'Завершен'
  },
  error: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: AlertCircle,
    label: 'Ошибка'
  },
  disabled: {
    color: 'text-white/40',
    bg: 'bg-glass-secondary/20',
    border: 'border-glass-border/30',
    icon: Lock,
    label: 'Заблокирован'
  },
  skipped: {
    color: 'text-white/50',
    bg: 'bg-glass-secondary/25',
    border: 'border-glass-border/40',
    icon: null,
    label: 'Пропущен'
  }
};

// Animation variants
const stepperVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const stepVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const progressVariants = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const GlassStepper: React.FC<GlassStepperProps> = ({
  steps,
  currentStep = 0,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  showProgress = true,
  showStepNumbers = true,
  showStepIcons = true,
  showStepDescriptions = true,
  showStepActions = true,
  showNavigation = true,
  showValidation = true,
  showStepSummary = true,
  showStepMetadata = false,
  allowStepNavigation = true,
  allowStepSkipping = true,
  allowStepEditing = true,
  allowStepDeletion = true,
  allowStepReordering = false,
  autoAdvance = false,
  autoSave = false,
  className,
  onStepChange,
  onStepComplete,
  onStepSkip,
  onStepEdit,
  onStepDelete,
  onStepReorder,
  onComplete,
  onReset,
  onSave
}) => {
  const [localCurrentStep, setLocalCurrentStep] = useState(currentStep);
  const [localSteps, setLocalSteps] = useState(steps);
  const [isAnimating, setIsAnimating] = useState(false);

  const config = sizeConfig[size];

  // Calculate progress
  const progress = useMemo(() => {
    const completedSteps = localSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / localSteps.length) * 100;
  }, [localSteps]);

  // Get current step
  const currentStepData = localSteps[localCurrentStep];

  // Handle step navigation
  const handleStepClick = (stepIndex: number) => {
    if (!allowStepNavigation || isAnimating) return;
    
    const step = localSteps[stepIndex];
    if (step.status === 'disabled') return;

    setIsAnimating(true);
    setLocalCurrentStep(stepIndex);
    onStepChange?.(stepIndex, step);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle step completion
  const handleStepComplete = (stepIndex: number) => {
    const step = localSteps[stepIndex];
    const updatedSteps = [...localSteps];
    updatedSteps[stepIndex] = { ...step, status: 'completed' as StepStatus };
    
    setLocalSteps(updatedSteps);
    onStepComplete?.(stepIndex, step);

    // Auto advance to next step
    if (autoAdvance && stepIndex < localSteps.length - 1) {
      setTimeout(() => {
        handleStepClick(stepIndex + 1);
      }, 500);
    }
  };

  // Handle step skip
  const handleStepSkip = (stepIndex: number) => {
    const step = localSteps[stepIndex];
    if (!step.isSkippable) return;

    const updatedSteps = [...localSteps];
    updatedSteps[stepIndex] = { ...step, status: 'skipped' as StepStatus };
    
    setLocalSteps(updatedSteps);
    onStepSkip?.(stepIndex, step);

    // Auto advance to next step
    if (autoAdvance && stepIndex < localSteps.length - 1) {
      setTimeout(() => {
        handleStepClick(stepIndex + 1);
      }, 500);
    }
  };

  // Handle navigation
  const handleNext = () => {
    if (localCurrentStep < localSteps.length - 1) {
      handleStepClick(localCurrentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (localCurrentStep > 0) {
      handleStepClick(localCurrentStep - 1);
    }
  };

  // Render step indicator
  const renderStepIndicator = (step: StepperStep, index: number) => {
    const statusInfo = statusConfig[step.status];
    const StatusIcon = statusInfo.icon;
    const StepIcon = step.icon;

    return (
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 transition-all duration-200',
          statusInfo.bg,
          statusInfo.border,
          config.stepSize,
          allowStepNavigation && step.status !== 'disabled' && 'cursor-pointer hover:scale-105'
        )}
        variants={stepVariants}
        initial="initial"
        animate="animate"
        whileHover={allowStepNavigation && step.status !== 'disabled' ? "hover" : undefined}
        onClick={() => handleStepClick(index)}
      >
        {/* Step number */}
        {showStepNumbers && !StatusIcon && !StepIcon && (
          <span className={cn(
            'font-semibold',
            statusInfo.color,
            config.fontSize
          )}>
            {index + 1}
          </span>
        )}

        {/* Status icon */}
        {StatusIcon && (
          <StatusIcon className={cn(
            statusInfo.color,
            config.iconSize
          )} />
        )}

        {/* Step icon */}
        {StepIcon && !StatusIcon && (
          <StepIcon className={cn(
            statusInfo.color,
            config.iconSize
          )} />
        )}

        {/* Optional indicator */}
        {step.isOptional && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">?</span>
          </div>
        )}
      </motion.div>
    );
  };

  // Render step content
  const renderStepContent = (step: StepperStep, index: number) => {
    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Step header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={cn(
              'font-semibold text-white',
              config.titleSize
            )}>
              {step.title}
            </h3>
            
            {/* Step actions */}
            {showStepActions && (
              <div className="flex items-center space-x-2">
                {allowStepEditing && step.isEditable && (
                  <button
                    onClick={() => onStepEdit?.(index, step)}
                    className="p-1.5 text-white/60 hover:bg-glass-secondary/30 hover:text-white rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {allowStepDeletion && step.isDeletable && (
                  <button
                    onClick={() => onStepDelete?.(index, step)}
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step description */}
          {showStepDescriptions && step.description && (
            <p className={cn(
              'text-white/80',
              config.fontSize
            )}>
              {step.description}
            </p>
          )}

          {/* Step metadata */}
          {showStepMetadata && step.metadata && (
            <div className="flex items-center space-x-4 text-sm text-white/60">
              {step.metadata.estimatedTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{step.metadata.estimatedTime}</span>
                </div>
              )}
              
              {step.metadata.requiredFields && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{step.metadata.requiredFields.length} обязательных полей</span>
                </div>
              )}
              
              {step.metadata.tags && (
                <div className="flex items-center space-x-1">
                  <span>Теги: {step.metadata.tags.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Validation errors */}
        {showValidation && step.validation && !step.validation.isValid && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Ошибки валидации</span>
            </div>
            {step.validation.message && (
              <p className="text-sm text-red-300 mb-2">{step.validation.message}</p>
            )}
            {step.validation.errors && (
              <ul className="text-sm text-red-300 space-y-1">
                {step.validation.errors.map((error, errorIndex) => (
                  <li key={errorIndex} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step content */}
        {step.content && (
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            {step.content}
          </div>
        )}

        {/* Step actions */}
        {step.actions && step.actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {step.actions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200',
                    action.variant === 'primary' && 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30',
                    action.variant === 'secondary' && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                    action.variant === 'danger' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                    action.variant === 'success' && 'bg-green-500/20 text-green-300 hover:bg-green-500/30',
                    !action.variant && 'bg-glass-secondary/30 text-white/80 hover:bg-glass-secondary/50',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {ActionIcon && <ActionIcon className="w-4 h-4" />}
                  <span className="text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  // Render horizontal stepper
  const renderHorizontalStepper = () => {
    return (
      <div className="space-y-6">
        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Прогресс</span>
              <span className="text-sm text-white/60">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                variants={progressVariants}
                initial="initial"
                animate="animate"
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex items-center justify-between">
          {localSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
              {/* Step indicator */}
              {renderStepIndicator(step, index)}

              {/* Step info */}
              <div className="text-center">
                <div className={cn(
                  'font-medium text-white',
                  config.fontSize
                )}>
                  {step.title}
                </div>
                {showStepDescriptions && step.description && (
                  <div className={cn(
                    'text-white/60 line-clamp-2',
                    config.fontSize
                  )}>
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector line */}
              {index < localSteps.length - 1 && (
                <div className="absolute left-1/2 top-1/2 w-full h-0.5 bg-glass-border/30 -z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Current step content */}
        {currentStepData && (
          <div className="p-6 bg-glass-primary/50 rounded-xl border border-glass-border/50">
            {renderStepContent(currentStepData, localCurrentStep)}
          </div>
        )}
      </div>
    );
  };

  // Render vertical stepper
  const renderVerticalStepper = () => {
    return (
      <div className="space-y-6">
        {/* Progress bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Прогресс</span>
              <span className="text-sm text-white/60">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-glass-secondary/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                variants={progressVariants}
                initial="initial"
                animate="animate"
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {localSteps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Step indicator */}
              <div className="flex-shrink-0">
                {renderStepIndicator(step, index)}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="p-4 bg-glass-primary/50 rounded-xl border border-glass-border/50">
                  {renderStepContent(step, index)}
                </div>
              </div>

              {/* Connector line */}
              {index < localSteps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-glass-border/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render navigation
  const renderNavigation = () => {
    if (!showNavigation) return null;

    return (
      <div className="flex items-center justify-between pt-6 border-t border-glass-border/30">
        <div className="flex items-center space-x-2">
          {localCurrentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white/80 hover:text-white rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          )}

          {allowStepSkipping && currentStepData?.isSkippable && (
            <button
              onClick={() => handleStepSkip(localCurrentStep)}
              className="px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white/80 hover:text-white rounded-lg transition-colors duration-200"
            >
              Пропустить
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {autoSave && (
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-4 py-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white/80 hover:text-white rounded-lg transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить</span>
            </button>
          )}

          {localCurrentStep < localSteps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors duration-200"
            >
              <span>Далее</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors duration-200"
            >
              <Check className="w-4 h-4" />
              <span>Завершить</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render step summary
  const renderStepSummary = () => {
    if (!showStepSummary) return null;

    return (
      <div className="p-4 bg-glass-secondary/20 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Сводка шагов</h4>
        <div className="space-y-2">
          {localSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                step.status === 'completed' && 'bg-green-500',
                step.status === 'current' && 'bg-orange-500',
                step.status === 'error' && 'bg-red-500',
                step.status === 'pending' && 'bg-white/30',
                step.status === 'skipped' && 'bg-white/50'
              )} />
              <span className={cn(
                'text-sm',
                step.status === 'completed' && 'text-green-400',
                step.status === 'current' && 'text-orange-400',
                step.status === 'error' && 'text-red-400',
                step.status === 'pending' && 'text-white/60',
                step.status === 'skipped' && 'text-white/50'
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className={cn(
        'bg-glass-primary/80 backdrop-blur-xl',
        'border border-glass-border/50',
        'rounded-2xl shadow-glass-lg',
        'overflow-hidden',
        className
      )}
      variants={stepperVariants}
      initial="initial"
      animate="animate"
    >
      <div className={config.padding}>
        {orientation === 'horizontal' ? renderHorizontalStepper() : renderVerticalStepper()}
        
        {renderNavigation()}
        {renderStepSummary()}
      </div>
    </motion.div>
  );
};

// Convenience components
export const GlassStepperCompact: React.FC<Omit<GlassStepperProps, 'variant' | 'size'>> = (props) => (
  <GlassStepper {...props} variant="compact" size="sm" />
);

export const GlassStepperDetailed: React.FC<Omit<GlassStepperProps, 'variant' | 'size'>> = (props) => (
  <GlassStepper {...props} variant="detailed" size="lg" />
);

export const GlassStepperMinimal: React.FC<Omit<GlassStepperProps, 'variant'>> = (props) => (
  <GlassStepper {...props} variant="minimal" showProgress={false} showNavigation={false} showStepSummary={false} />
);

// Example usage component
export const GlassStepperExample: React.FC = () => {
  const sampleSteps: StepperStep[] = [
    {
      id: '1',
      title: 'Личная информация',
      description: 'Заполните основную информацию о себе',
      icon: User,
      status: 'completed',
      isEditable: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Имя"
              className="w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
            <input
              type="text"
              placeholder="Фамилия"
              className="w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>
      ),
      actions: [
        {
          id: 'save',
          label: 'Сохранить',
          icon: Save,
          variant: 'primary',
          onClick: () => console.log('Save personal info')
        }
      ],
      metadata: {
        estimatedTime: '2 минуты',
        requiredFields: ['name', 'email'],
        tags: ['личные данные']
      }
    },
    {
      id: '2',
      title: 'Выбор услуги',
      description: 'Выберите тип мебели, которую хотите заказать',
      icon: Settings,
      status: 'current',
      isEditable: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg text-white transition-colors duration-200">
              <div className="text-center">
                <div className="text-lg font-semibold">Кухня</div>
                <div className="text-sm text-white/60">Полный комплект</div>
              </div>
            </button>
            <button className="p-4 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg text-white transition-colors duration-200">
              <div className="text-center">
                <div className="text-lg font-semibold">Спальня</div>
                <div className="text-sm text-white/60">Гарнитур</div>
              </div>
            </button>
          </div>
        </div>
      ),
      actions: [
        {
          id: 'next',
          label: 'Продолжить',
          icon: ArrowRight,
          variant: 'primary',
          onClick: () => console.log('Continue to next step')
        }
      ],
      metadata: {
        estimatedTime: '5 минут',
        requiredFields: ['service_type'],
        tags: ['выбор услуги']
      }
    },
    {
      id: '3',
      title: 'Детали проекта',
      description: 'Опишите детали вашего проекта',
      icon: FileText,
      status: 'pending',
      isEditable: true,
      content: (
        <div className="space-y-4">
          <textarea
            placeholder="Опишите ваш проект..."
            rows={4}
            className="w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
          <input
            type="text"
            placeholder="Бюджет (KZT)"
            className="w-full px-3 py-2 bg-glass-secondary/30 border border-glass-border/50 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>
      ),
      metadata: {
        estimatedTime: '10 минут',
        requiredFields: ['description', 'budget'],
        tags: ['детали проекта']
      }
    },
    {
      id: '4',
      title: 'Оплата',
      description: 'Выберите способ оплаты',
      icon: CreditCard,
      status: 'pending',
      isEditable: true,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg text-white transition-colors duration-200">
              <div className="text-center">
                <div className="text-lg font-semibold">Карта</div>
                <div className="text-sm text-white/60">Банковская карта</div>
              </div>
            </button>
            <button className="p-4 bg-glass-secondary/30 hover:bg-glass-secondary/50 border border-glass-border/50 rounded-lg text-white transition-colors duration-200">
              <div className="text-center">
                <div className="text-lg font-semibold">Наличные</div>
                <div className="text-sm text-white/60">При получении</div>
              </div>
            </button>
          </div>
        </div>
      ),
      metadata: {
        estimatedTime: '3 минуты',
        requiredFields: ['payment_method'],
        tags: ['оплата']
      }
    },
    {
      id: '5',
      title: 'Подтверждение',
      description: 'Проверьте и подтвердите заказ',
      icon: Check,
      status: 'pending',
      isEditable: true,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-glass-secondary/20 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Сводка заказа</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div>Услуга: Кухня</div>
              <div>Бюджет: 500,000 KZT</div>
              <div>Способ оплаты: Карта</div>
            </div>
          </div>
        </div>
      ),
      actions: [
        {
          id: 'confirm',
          label: 'Подтвердить заказ',
          icon: Check,
          variant: 'success',
          onClick: () => console.log('Confirm order')
        }
      ],
      metadata: {
        estimatedTime: '2 минуты',
        requiredFields: ['confirmation'],
        tags: ['подтверждение']
      }
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default stepper */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычный степпер</h3>
        <div className="max-w-4xl">
          <GlassStepper
            steps={sampleSteps}
            showProgress
            showStepNumbers
            showStepIcons
            showStepDescriptions
            showStepActions
            showNavigation
            showValidation
            showStepSummary
            showStepMetadata
            allowStepNavigation
            allowStepSkipping
            allowStepEditing
            allowStepDeletion
            autoAdvance
            autoSave
            onStepChange={(stepIndex, step) => console.log('Step changed:', stepIndex, step.title)}
            onStepComplete={(stepIndex, step) => console.log('Step completed:', stepIndex, step.title)}
            onStepSkip={(stepIndex, step) => console.log('Step skipped:', stepIndex, step.title)}
            onStepEdit={(stepIndex, step) => console.log('Step edit:', stepIndex, step.title)}
            onStepDelete={(stepIndex, step) => console.log('Step delete:', stepIndex, step.title)}
            onComplete={() => console.log('Stepper completed')}
            onReset={() => console.log('Stepper reset')}
            onSave={() => console.log('Stepper save')}
          />
        </div>
      </div>

      {/* Compact stepper */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактный степпер</h3>
        <div className="max-w-2xl">
          <GlassStepperCompact
            steps={sampleSteps}
            orientation="vertical"
            showProgress
            onStepChange={(stepIndex, step) => console.log('Compact step changed:', stepIndex, step.title)}
            onComplete={() => console.log('Compact stepper completed')}
          />
        </div>
      </div>

      {/* Minimal stepper */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальный степпер</h3>
        <div className="max-w-lg">
          <GlassStepperMinimal
            steps={sampleSteps}
            orientation="horizontal"
            onStepChange={(stepIndex, step) => console.log('Minimal step changed:', stepIndex, step.title)}
            onComplete={() => console.log('Minimal stepper completed')}
          />
        </div>
      </div>
    </div>
  );
};

