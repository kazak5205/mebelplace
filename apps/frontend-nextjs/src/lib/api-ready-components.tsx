/**
 * API-Ready Components for MebelPlace
 * Pre-configured components ready for API integration
 * Maintains design system and styling
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/logger';
import { apiErrorHandler } from '@/lib/api-error-handler';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Base props for API-ready components
interface ApiReadyProps {
  onDataLoad?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
}

// Loading state component
export function ApiLoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-[var(--color-text-secondary)]">{message}</p>
      </div>
    </div>
  );
}

// Error state component
export function ApiErrorState({ 
  error, 
  onRetry, 
  title = 'Error occurred',
  showRetry = true 
}: { 
  error?: any; 
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
}) {
  const t = useTranslations('errors');
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[var(--color-error)]" />
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-4">
          {error?.message || t('unexpectedError')}
        </p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="primary" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('tryAgain')}
          </Button>
        )}
      </div>
    </div>
  );
}

// Empty state component
export function ApiEmptyState({ 
  title, 
  description, 
  action,
  icon = '📭'
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {description}
        </p>
        {action}
      </div>
    </div>
  );
}

// API-ready container component
export function ApiReadyContainer({ 
  loading, 
  error, 
  data, 
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  className = ''
}: {
  loading: boolean;
  error: any;
  data: any;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  if (loading) {
    return <ApiLoadingState />;
  }

  if (error) {
    return <ApiErrorState error={error} onRetry={onRetry} />;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <ApiEmptyState 
        title={emptyTitle || 'No data found'}
        description={emptyDescription || 'There is no data to display at the moment.'}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

// API-ready list component
export function ApiReadyList<T>({
  data,
  loading,
  error,
  onRetry,
  renderItem,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display.',
  emptyAction,
  className = '',
  itemClassName = ''
}: {
  data: T[] | null;
  loading: boolean;
  error: any;
  onRetry?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ApiReadyContainer
      loading={loading}
      error={error}
      data={data}
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      className={className}
    >
      <div className="space-y-4">
        {data?.map((item, index) => (
          <div key={index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </ApiReadyContainer>
  );
}

// API-ready grid component
export function ApiReadyGrid<T>({
  data,
  loading,
  error,
  onRetry,
  renderItem,
  emptyTitle = 'No items found',
  emptyDescription = 'There are no items to display.',
  emptyAction,
  className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  itemClassName = ''
}: {
  data: T[] | null;
  loading: boolean;
  error: any;
  onRetry?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ApiReadyContainer
      loading={loading}
      error={error}
      data={data}
      onRetry={onRetry}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      className={className}
    >
      {data?.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </ApiReadyContainer>
  );
}

// API-ready form component
export function ApiReadyForm({
  onSubmit,
  loading,
  error,
  children,
  submitText = 'Submit',
  className = ''
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
  error: any;
  children: React.ReactNode;
  submitText?: string;
  className?: string;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <div className="mb-4 p-4 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg">
          <p className="text-[var(--color-error)] text-sm">
            {error.message || 'An error occurred'}
          </p>
        </div>
      )}
      
      {children}
      
      <Button 
        type="submit" 
        variant="primary" 
        disabled={loading}
        className="w-full mt-6"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          submitText
        )}
      </Button>
    </form>
  );
}

// Hook for API-ready components
export function useApiReady() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const execute = async (apiCall: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      logger.info('API call successful', { result });
      return result;
    } catch (err) {
      const apiError = apiErrorHandler.handleError(err);
      setError(apiError);
      logger.error('API call failed', err instanceof Error ? err : new Error(String(err)));
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setError(null);
  };

  return {
    loading,
    error,
    data,
    execute,
    retry,
    setData,
    setError,
    setLoading
  };
}
