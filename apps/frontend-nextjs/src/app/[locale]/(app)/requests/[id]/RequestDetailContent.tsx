'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/api/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import ProposalsList from '@/components/requests/ProposalsList';
import ProposalForm from '@/components/requests/ProposalForm';

interface Request {
  id: number;
  title: string;
  description: string;
  photo_url?: string;
  region: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  price_min?: number;
  price_max?: number;
  deadline?: string;
  created_at: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  proposals_count: number;
}

interface RequestDetailContentProps {
  requestId: string;
}

export default function RequestDetailContent({ requestId }: RequestDetailContentProps) {
  const t = useTranslations('requests');
  const { data: user } = useCurrentUser();
  const [request, setRequest] = useState<Request | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  // Data is fetched via API hooks

  const fetchRequest = async () => {
    try {
      // Loading handled by API hooks
    } catch (error) {
      console.error('Error fetching request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" label={t('loading')} />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-[var(--color-text-primary)]">
          {t('requestNotFound')}
        </h2>
      </div>
    );
  }

  const isAuthor = user?.id === request.author?.id;
  const isMaster = user?.role === 'master';
  const canPropose = isMaster && !isAuthor;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Request Details */}
      <div className="bg-[var(--color-surface)] rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
          {request.title}
        </h1>
        
        <p className="text-[var(--color-text-secondary)] mb-4">
          {request.description}
        </p>

        {request.photo_url && (
          <img
            src={request.photo_url}
            alt={request.title}
            className="w-full max-h-96 object-cover rounded-lg mb-4"
          />
        )}

        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
          <div>📍 {request.region}</div>
          {request.price_min && request.price_max && (
            <div>
              💰 {request.price_min.toLocaleString()} - {request.price_max.toLocaleString()} ₸
            </div>
          )}
          {request.deadline && (
            <div>📅 {new Date(request.deadline).toLocaleDateString()}</div>
          )}
          <div>💬 {request.proposals_count} {t('proposals')}</div>
        </div>

        {/* Author Info */}
        {request.author && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              {request.author.avatar && (
                <img
                  src={request.author.avatar}
                  alt={request.author.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">
                  {request.author.username}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Master Proposal Button */}
      {canPropose && !showProposalForm && (
        <button
          onClick={() => setShowProposalForm(true)}
          className="w-full bg-[var(--color-accent)] text-white py-3 px-6 rounded-lg 
                     hover:bg-[var(--color-accent-dark)] transition-colors mb-6
                     font-medium text-lg"
        >
          {t('makeProposal')}
        </button>
      )}

      {/* Proposal Form for Master */}
      {showProposalForm && (
        <div className="mb-6">
          <ProposalForm
            requestId={parseInt(requestId)}
            onSuccess={() => {
              setShowProposalForm(false);
              fetchRequest(); // Refresh to show new proposal count
            }}
            onCancel={() => setShowProposalForm(false)}
          />
        </div>
      )}

      {/* Proposals List */}
      <ProposalsList
        requestId={parseInt(requestId)}
        isAuthor={isAuthor}
        onProposalAccepted={fetchRequest}
      />
    </div>
  );
}

