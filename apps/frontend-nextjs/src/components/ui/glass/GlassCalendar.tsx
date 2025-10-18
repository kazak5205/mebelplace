'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  Search,
  Grid,
  List,
  Sun,
  Moon,
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
  color?: string;
  type?: 'meeting' | 'task' | 'reminder' | 'deadline' | 'event' | 'custom';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  attendees?: string[];
  isCompleted?: boolean;
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metadata?: Record<string, any>;
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'agenda';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GlassCalendarProps {
  events?: CalendarEvent[];
  selectedDate?: Date;
  currentView?: CalendarView['type'];
  variant?: 'default' | 'compact' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showNavigation?: boolean;
  showViewSelector?: boolean;
  showEventCreator?: boolean;
  showEventDetails?: boolean;
  showEventActions?: boolean;
  showTodayButton?: boolean;
  showWeekNumbers?: boolean;
  showTimeSlots?: boolean;
  showEventCount?: boolean;
  allowEventCreation?: boolean;
  allowEventEditing?: boolean;
  allowEventDeletion?: boolean;
  allowDateSelection?: boolean;
  allowMultiDateSelection?: boolean;
  className?: string;
  onDateSelect?: (date: Date) => void;
  onDateRangeSelect?: (startDate: Date, endDate: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onViewChange?: (view: CalendarView['type']) => void;
  onMonthChange?: (date: Date) => void;
}

// Size configurations
const sizeConfig = {
  sm: {
    cellSize: 'w-8 h-8',
    headerSize: 'h-8',
    fontSize: 'text-xs',
    spacing: 'gap-1',
    padding: 'p-2'
  },
  md: {
    cellSize: 'w-10 h-10',
    headerSize: 'h-10',
    fontSize: 'text-sm',
    spacing: 'gap-2',
    padding: 'p-3'
  },
  lg: {
    cellSize: 'w-12 h-12',
    headerSize: 'h-12',
    fontSize: 'text-base',
    spacing: 'gap-3',
    padding: 'p-4'
  },
  xl: {
    cellSize: 'w-16 h-16',
    headerSize: 'h-16',
    fontSize: 'text-lg',
    spacing: 'gap-4',
    padding: 'p-6'
  }
};

// View configurations
const viewConfigs: CalendarView[] = [
  { type: 'month', label: 'Месяц', icon: Grid },
  { type: 'week', label: 'Неделя', icon: List },
  { type: 'day', label: 'День', icon: CalendarIcon },
  { type: 'agenda', label: 'Список', icon: List }
];

// Event type configurations
const eventTypeConfig = {
  meeting: { color: 'bg-blue-500', icon: User },
  task: { color: 'bg-green-500', icon: CheckCircle },
  reminder: { color: 'bg-yellow-500', icon: AlertCircle },
  deadline: { color: 'bg-red-500', icon: Clock },
  event: { color: 'bg-purple-500', icon: Star },
  custom: { color: 'bg-gray-500', icon: Info }
};

// Animation variants
const calendarVariants = {
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

const cellVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  selected: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const eventVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.2,
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

export const GlassCalendar: React.FC<GlassCalendarProps> = ({
  events = [],
  selectedDate = new Date(),
  currentView = 'month',
  variant = 'default',
  size = 'md',
  showHeader = true,
  showNavigation = true,
  showViewSelector = true,
  showEventCreator = true,
  showEventDetails = true,
  showEventActions = true,
  showTodayButton = true,
  showWeekNumbers = false,
  showTimeSlots = true,
  showEventCount = true,
  allowEventCreation = true,
  allowEventEditing = true,
  allowEventDeletion = true,
  allowDateSelection = true,
  allowMultiDateSelection = false,
  className,
  onDateSelect,
  onDateRangeSelect,
  onEventClick,
  onEventCreate,
  onEventEdit,
  onEventDelete,
  onViewChange,
  onMonthChange
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [view, setView] = useState<CalendarView['type']>(currentView);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const config = sizeConfig[size];

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    };
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  // Navigate calendar
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    onMonthChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onMonthChange?.(today);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!allowDateSelection) return;

    if (allowMultiDateSelection) {
      const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
      if (isSelected) {
        setSelectedDates(prev => prev.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        setSelectedDates(prev => [...prev, date]);
      }
    } else {
      setSelectedDates([date]);
      onDateSelect?.(date);
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onEventClick?.(event);
  };

  // Handle event creation
  const handleEventCreate = (date: Date) => {
    if (allowEventCreation) {
      onEventCreate?.(date);
    }
  };

  // Render month view
  const renderMonthView = () => {
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {calendarData.weekDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-center font-medium text-white/60',
              config.headerSize,
              config.fontSize
            )}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarData.days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
          const dayEvents = getEventsForDate(date);

          return (
            <motion.div
              key={index}
              className={cn(
                'relative cursor-pointer rounded-lg transition-colors duration-200',
                config.cellSize,
                'flex flex-col items-center justify-center',
                isCurrentMonth ? 'text-white' : 'text-white/40',
                isToday && 'bg-orange-500/20 ring-2 ring-orange-500/50',
                isSelected && 'bg-orange-500/30',
                !isCurrentMonth && 'opacity-50'
              )}
              variants={cellVariants}
              whileHover="hover"
              whileTap={isSelected ? "selected" : undefined}
              onClick={() => handleDateClick(date)}
            >
              <span className={config.fontSize}>{date.getDate()}</span>
              
              {/* Event indicators */}
              {dayEvents.length > 0 && (
                <div className="absolute bottom-1 flex space-x-0.5">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        eventTypeConfig[event.type || 'custom'].color
                      )}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  )}
                </div>
              )}

              {/* Event count */}
              {showEventCount && dayEvents.length > 0 && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-orange-500/80 text-white text-xs rounded-full flex items-center justify-center">
                  {dayEvents.length}
                </div>
              )}

              {/* Add event button */}
              {allowEventCreation && isCurrentMonth && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventCreate(date);
                  }}
                  className="absolute top-1 left-1 w-4 h-4 bg-glass-secondary/50 hover:bg-glass-secondary/70 text-white/60 hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="space-y-4">
        {/* Week header */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayEvents = getEventsForDate(date);

            return (
              <div
                key={index}
                className={cn(
                  'text-center p-2 rounded-lg',
                  isToday && 'bg-orange-500/20'
                )}
              >
                <div className="text-sm text-white/60">
                  {calendarData.weekDays[index]}
                </div>
                <div className={cn(
                  'text-lg font-semibold',
                  isToday ? 'text-orange-400' : 'text-white'
                )}>
                  {date.getDate()}
                </div>
                {showEventCount && dayEvents.length > 0 && (
                  <div className="text-xs text-white/60">
                    {dayEvents.length} событий
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        {showTimeSlots && (
          <div className="space-y-2">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="flex items-center space-x-2">
                <div className="w-12 text-sm text-white/60">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 h-8 border-t border-glass-border/30">
                  {/* Events for this hour */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
      <div className="space-y-4">
        {/* Day header */}
        <div className={cn(
          'text-center p-4 rounded-lg',
          isToday && 'bg-orange-500/20'
        )}>
          <div className="text-2xl font-bold text-white">
            {currentDate.getDate()}
          </div>
          <div className="text-white/60">
            {currentDate.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Events list */}
        <div className="space-y-2">
          {dayEvents.map((event) => (
            <motion.div
              key={event.id}
              className="p-3 bg-glass-secondary/30 rounded-lg cursor-pointer hover:bg-glass-secondary/50 transition-colors duration-200"
              variants={eventVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              onClick={() => handleEventClick(event)}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  eventTypeConfig[event.type || 'custom'].color
                )} />
                <div className="flex-1">
                  <div className="font-medium text-white">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-white/60">{event.description}</div>
                  )}
                </div>
                {event.startDate && (
                  <div className="text-sm text-white/60">
                    {event.startDate.toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Render agenda view
  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return (
      <div className="space-y-2">
        {sortedEvents.map((event) => (
          <motion.div
            key={event.id}
            className="p-3 bg-glass-secondary/30 rounded-lg cursor-pointer hover:bg-glass-secondary/50 transition-colors duration-200"
            variants={eventVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            onClick={() => handleEventClick(event)}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                'w-3 h-3 rounded-full',
                eventTypeConfig[event.type || 'custom'].color
              )} />
              <div className="flex-1">
                <div className="font-medium text-white">{event.title}</div>
                {event.description && (
                  <div className="text-sm text-white/60">{event.description}</div>
                )}
              </div>
              <div className="text-sm text-white/60">
                {event.startDate.toLocaleDateString('ru-RU')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // Render current view
  const renderCurrentView = () => {
    switch (view) {
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'agenda':
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

  // Render header
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">
            {calendarData.monthName}
          </h2>
          {showTodayButton && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-glass-secondary/30 hover:bg-glass-secondary/50 text-white/80 hover:text-white rounded-lg transition-colors duration-200 text-sm"
            >
              Сегодня
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showViewSelector && (
            <div className="flex items-center bg-glass-secondary/30 rounded-lg p-1">
              {viewConfigs.map((viewConfig) => {
                const Icon = viewConfig.icon;
                return (
                  <button
                    key={viewConfig.type}
                    onClick={() => {
                      setView(viewConfig.type);
                      onViewChange?.(viewConfig.type);
                    }}
                    className={cn(
                      'flex items-center space-x-1 px-2 py-1 rounded transition-colors duration-200 text-sm',
                      view === viewConfig.type
                        ? 'bg-glass-accent/30 text-orange-300'
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{viewConfig.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {showNavigation && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 bg-glass-secondary/30 hover:bg-glass-secondary/50 rounded-lg transition-colors duration-200"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
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
      variants={calendarVariants}
      initial="initial"
      animate="animate"
    >
      <div className={config.padding}>
        {renderHeader()}
        {renderCurrentView()}
      </div>
    </motion.div>
  );
};

// Convenience components
export const GlassCalendarCompact: React.FC<Omit<GlassCalendarProps, 'variant' | 'size'>> = (props) => (
  <GlassCalendar {...props} variant="compact" size="sm" />
);

export const GlassCalendarDetailed: React.FC<Omit<GlassCalendarProps, 'variant' | 'size'>> = (props) => (
  <GlassCalendar {...props} variant="detailed" size="lg" />
);

export const GlassCalendarMinimal: React.FC<Omit<GlassCalendarProps, 'variant'>> = (props) => (
  <GlassCalendar {...props} variant="minimal" showHeader={false} showNavigation={false} showViewSelector={false} />
);

// Example usage component
export const GlassCalendarExample: React.FC = () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Встреча с клиентом',
      description: 'Обсуждение проекта кухни',
      startDate: new Date(2024, 0, 15, 10, 0),
      endDate: new Date(2024, 0, 15, 11, 0),
      type: 'meeting',
      priority: 'high',
      location: 'Офис',
      attendees: ['Алексей Иванов', 'Мария Петрова']
    },
    {
      id: '2',
      title: 'Завершение проекта',
      description: 'Сдача готовой кухни',
      startDate: new Date(2024, 0, 20, 14, 0),
      type: 'deadline',
      priority: 'urgent'
    },
    {
      id: '3',
      title: 'Планирование',
      description: 'Планирование новых проектов',
      startDate: new Date(2024, 0, 22, 9, 0),
      endDate: new Date(2024, 0, 22, 10, 0),
      type: 'task',
      priority: 'medium'
    }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Default calendar */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Обычный календарь</h3>
        <div className="max-w-4xl">
          <GlassCalendar
            events={sampleEvents}
            showHeader
            showNavigation
            showViewSelector
            showEventCreator
            showEventDetails
            showEventActions
            showTodayButton
            showEventCount
            allowEventCreation
            allowEventEditing
            allowEventDeletion
            allowDateSelection
            onDateSelect={(date) => console.log('Date selected:', date)}
            onEventClick={(event) => console.log('Event clicked:', event.title)}
            onEventCreate={(date) => console.log('Create event for:', date)}
            onEventEdit={(event) => console.log('Edit event:', event.title)}
            onEventDelete={(eventId) => console.log('Delete event:', eventId)}
            onViewChange={(view) => console.log('View changed:', view)}
            onMonthChange={(date) => console.log('Month changed:', date)}
          />
        </div>
      </div>

      {/* Compact calendar */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Компактный календарь</h3>
        <div className="max-w-md">
          <GlassCalendarCompact
            events={sampleEvents}
            showEventCount
            onDateSelect={(date) => console.log('Compact date selected:', date)}
            onEventClick={(event) => console.log('Compact event clicked:', event.title)}
          />
        </div>
      </div>

      {/* Minimal calendar */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Минимальный календарь</h3>
        <div className="max-w-sm">
          <GlassCalendarMinimal
            events={sampleEvents}
            onDateSelect={(date) => console.log('Minimal date selected:', date)}
          />
        </div>
      </div>
    </div>
  );
};

