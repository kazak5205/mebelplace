/**
 * RequestsContent - Requests list with create functionality
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, MapPin, Clock, User } from 'lucide-react';
import { useRequests, useCreateRequest } from '@/lib/api/hooks/useRequests';
import { useCurrentUser } from '@/lib/api/hooks/useAuth';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';

// Validation schema
const createRequestSchema = z.object({
  title: z.string().min(3, 'Минимум 3 символа').max(200, 'Максимум 200 символов'),
  description: z.string().min(10, 'Минимум 10 символов').max(2000, 'Максимум 2000 символов'),
  category: z.string(),
  region: z.string(),
  images: z.array(z.any()).optional(),
});

type CreateRequestInput = z.infer<typeof createRequestSchema>;

export function RequestsContent() {
  const t = useTranslations('requests');
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Get current user to check role
  const { data: currentUser } = useCurrentUser();
  const isMaster = currentUser?.role === 'master';

  // Fetch requests
  const { data, isLoading, refetch } = useRequests({ status: filter });
  const { mutate: createRequest, isPending: isCreating } = useCreateRequest();

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      region: 'ALM',
      category: 'furniture',
    },
  });

  // Real-time updates via WebSocket
  // Note: WebSocket disabled for MVP - requires proper client setup
  /* useWebSocketEvent(
    null,
    'request_update',
    (data: any) => {
      console.log('Request update:', data);
      refetch();
    }
  ); */

  const onSubmit = (formData: CreateRequestInput) => {
    // Transform form data to API format
    const requestData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      region: formData.region,
      images: formData.images,
    };

    createRequest(requestData, {
      onSuccess: () => {
        setShowCreateModal(false);
        reset();
        refetch();
      },
      onError: (error) => {
        console.error('Failed to create request:', error);
      },
    });
  };

  const requests = data?.data || [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 lg:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {t('title')}
            </h1>
            {!isMaster && (
              <Button
                onClick={() => setShowCreateModal(true)}
                leftIcon={<Plus className="w-5 h-5" />}
              >
                {t('createRequest')}
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {isMaster ? t('requests.empty.title') : t('emptyState.title')}
            </h3>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {isMaster ? 'Пока нет активных заявок от клиентов' : t('emptyState.description')}
            </p>
            {!isMaster && (
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-5 h-5" />}>
                {t('createRequest')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {requests.map((request: any) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('createModal.title')}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t('createModal.titleLabel')}
            {...register('title')}
            error={errors.title?.message}
            placeholder={t('createModal.titlePlaceholder')}
            required
          />

          <Textarea
            label={t('createModal.descriptionLabel')}
            {...register('description')}
            error={errors.description?.message}
            placeholder={t('createModal.descriptionPlaceholder')}
            rows={5}
            required
          />

          <Select
            label={t('createModal.regionLabel')}
            {...register('region')}
            error={errors.region?.message}
            options={[
              { value: 'ALM', label: 'Алматы' },
              { value: 'AST', label: 'Астана' },
              { value: 'SHY', label: 'Шымкент' },
              { value: 'ALL', label: 'Все регионы' },
            ]}
            required
          />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              {t('createModal.cancel')}
            </Button>
            <Button type="submit" loading={isCreating}>
              {t('createModal.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Request Card Component
function RequestCard({ request }: { request: any }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const statusColors = {
    active: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    pending: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    completed: 'bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-tertiary)]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[var(--color-surface)] rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2 line-clamp-2">
            {request.title}
          </h3>
          <span
            className={clsx(
              'inline-block px-3 py-1 rounded-full text-xs font-medium',
              statusColors[request.status as keyof typeof statusColors] || statusColors.pending
            )}
          >
            {request.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-3">
        {request.description}
      </p>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{request.region}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
        </div>

        {request.responses_count > 0 && (
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <User className="w-4 h-4" />
            <span>{request.responses_count} откликов</span>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 pt-4 border-[var(--color-border)]"
          >
            <Button 
              variant="secondary" 
              size="sm" 
              fullWidth
              onClick={() => router.push(`/requests/${request.id}`)}
            >
              Посмотреть отклики
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

