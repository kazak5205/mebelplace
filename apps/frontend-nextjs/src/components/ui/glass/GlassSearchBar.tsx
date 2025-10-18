/**
 * GlassSearchBar - Поисковая строка с glass стилем, autocomplete, voice input
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Clock, 
  TrendingUp,
  Filter
} from 'lucide-react';
import { GlassInput } from './GlassInput';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: { label: string; value: string }[];
}

export interface GlassSearchBarProps {
  onSearch?: (query: string) => void;
  onVoiceInput?: (transcript: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  filters?: SearchFilter[];
  glassVariant?: 'primary' | 'secondary' | 'accent' | 'dark' | 'light';
  animation?: 'focus' | 'none';
  enableVoiceInput?: boolean;
  enableAutocomplete?: boolean;
  enableFilters?: boolean;
  showSuggestions?: boolean;
  showFilters?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

export const GlassSearchBar: React.FC<GlassSearchBarProps> = ({
  onSearch,
  onVoiceInput,
  onSuggestionSelect,
  onFilterChange,
  placeholder = 'Поиск или скажите...',
  suggestions = [],
  filters = [],
  glassVariant = 'primary',
  animation = 'focus',
  enableVoiceInput = true,
  enableAutocomplete = true,
  enableFilters = true,
  showSuggestions = true,
  showFilters = false,
  maxSuggestions = 8,
  debounceMs = 300,
  className,
  size = 'md',
  disabled = false,
  loading = false,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onVoiceInput?.(transcript);
        onSearch?.(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    }
  }, [onVoiceInput, onSearch]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch?.(searchQuery.trim());
      }
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (enableAutocomplete && value.trim()) {
      setShowSuggestionsList(true);
      debouncedSearch(value);
    } else {
      setShowSuggestionsList(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!recognitionSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setIsRecording(true);
    }
  };

  // Handle suggestion select
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestionsList(false);
    onSuggestionSelect?.(suggestion);
    onSearch?.(suggestion.text);
    inputRef.current?.blur();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestionsList(false);
      onSearch?.(query.trim());
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      setShowFiltersPanel(false);
      inputRef.current?.blur();
    }
  };

  // Handle filter change
  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...selectedFilters, [filterId]: value };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  // Get filtered suggestions
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
      query.trim() === ''
    )
    .slice(0, maxSuggestions);

  // Glass variant classes
  const glassClasses = {
    primary: 'bg-white/10 backdrop-blur-md border-white/20',
    secondary: 'bg-white/5 backdrop-blur-sm border-white/10',
    accent: 'bg-orange-500/20 backdrop-blur-md border-orange-500/30',
    dark: 'bg-black/20 backdrop-blur-lg border-white/5',
    light: 'bg-white/20 backdrop-blur-sm border-white/30',
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <motion.div
        className={cn(
          'relative flex items-center rounded-2xl overflow-hidden',
          glassClasses[glassVariant],
          sizeClasses[size]
        )}
        animate={animation === 'focus' && isFocused ? {
          scale: 1.02,
          boxShadow: '0 8px 32px rgba(255, 102, 0, 0.2)',
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-2 flex-shrink-0">
          <Search className={cn(
            'text-white/60',
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
          )} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={cn(
            'flex-1 bg-transparent border-none outline-none text-white placeholder-white/50',
            sizeClasses[size]
          )}
        />

        {/* Clear Button */}
        {query && (
          <motion.button
            onClick={clearSearch}
            className="p-2 text-white/60 hover:text-white transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className={cn(
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          </motion.button>
        )}

        {/* Voice Input Button */}
        {enableVoiceInput && recognitionSupported && (
          <motion.button
            onClick={handleVoiceInput}
            disabled={disabled || loading}
            className={cn(
              'p-2 transition-colors',
              isRecording 
                ? 'text-red-500 animate-pulse' 
                : 'text-white/60 hover:text-white'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRecording ? (
              <Mic className={cn(
                size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
              )} />
            ) : (
              <Mic className={cn(
                size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
              )} />
            )}
          </motion.button>
        )}

        {/* Filters Button */}
        {enableFilters && filters.length > 0 && (
          <motion.button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={cn(
              'p-2 transition-colors',
              showFiltersPanel 
                ? 'text-orange-500' 
                : 'text-white/60 hover:text-white'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Filter className={cn(
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          </motion.button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <motion.div
            className="pr-4 pl-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <div className={cn(
              'border-2 border-white/20 border-t-white rounded-full',
              size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
            )} />
          </motion.div>
        )}
      </motion.div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestionsList && enableAutocomplete && filteredSuggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="max-h-80 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="flex items-center gap-3">
                    {/* Suggestion Icon */}
                    <div className="flex-shrink-0">
                      {suggestion.type === 'recent' && <Clock className="w-4 h-4 text-white/60" />}
                      {suggestion.type === 'trending' && <TrendingUp className="w-4 h-4 text-orange-500" />}
                      {suggestion.type === 'suggestion' && <Search className="w-4 h-4 text-white/60" />}
                      {suggestion.icon}
                    </div>

                    {/* Suggestion Text */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.category && (
                        <div className="text-white/60 text-sm truncate">
                          {suggestion.category}
                        </div>
                      )}
                    </div>

                    {/* Count */}
                    {suggestion.count && (
                      <div className="flex-shrink-0 text-white/60 text-sm">
                        {suggestion.count}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && enableFilters && filters.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard className="p-4">
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Фильтры</h3>
                
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-white/80 text-sm font-medium">
                      {filter.label}
                    </label>
                    
                    {filter.type === 'checkbox' && filter.options && (
                      <div className="space-y-2">
                        {filter.options.map((option) => (
                          <label key={option.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedFilters[filter.id]?.includes(option.value) || false}
                              onChange={(e) => {
                                const currentValues = selectedFilters[filter.id] || [];
                                const newValues = e.target.checked
                                  ? [...currentValues, option.value]
                                  : currentValues.filter((v: string) => v !== option.value);
                                handleFilterChange(filter.id, newValues);
                              }}
                              className="rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-white/80 text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {filter.type === 'radio' && filter.options && (
                      <div className="space-y-2">
                        {filter.options.map((option) => (
                          <label key={option.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={filter.id}
                              value={option.value}
                              checked={selectedFilters[filter.id] === option.value}
                              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                              className="border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-white/80 text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {filter.type === 'select' && filter.options && (
                      <select
                        value={selectedFilters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-orange-500 focus:ring-orange-500"
                      >
                        <option value="">Выберите...</option>
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value} className="bg-gray-800">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-2 pt-4">
                  <GlassButton
                    onClick={() => {
                      setSelectedFilters({});
                      onFilterChange?.({});
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Сбросить
                  </GlassButton>
                  <GlassButton
                    onClick={() => setShowFiltersPanel(false)}
                    size="sm"
                  >
                    Применить
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <GlassCard className="px-4 py-2 bg-red-500/20 border-red-500/30">
              <div className="flex items-center gap-2 text-red-500">
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Слушаю...</span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlassSearchBar;
