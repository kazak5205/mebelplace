import React from 'react';

interface Proposal {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  price: number;
  description: string;
  estimated_days: number;
  created_at: string;
}

interface ProposalsListProps {
  proposals?: Proposal[];
  loading?: boolean;
  onAccept?: (proposalId: string) => void;
  onReject?: (proposalId: string) => void;
  requestId?: number;
  isAuthor?: boolean;
  onProposalAccepted?: () => Promise<void>;
}

export default function ProposalsList({ proposals, loading, onAccept, onReject, requestId, isAuthor, onProposalAccepted }: ProposalsListProps) {
  if (loading) {
    return (
      <div className="glass-bg-secondary rounded-lg p-6">
        <h3 className="glass-text-primary font-semibold mb-4">Предложения</h3>
        <p className="glass-text-secondary">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="glass-bg-secondary rounded-lg p-6">
      <h3 className="glass-text-primary font-semibold mb-4">Предложения ({proposals?.length || 0})</h3>
      {!proposals || proposals.length === 0 ? (
        <p className="glass-text-secondary">Пока нет предложений</p>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="glass-bg-primary rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {proposal.user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="glass-text-primary font-medium">{proposal.user.name}</h4>
                    <p className="glass-text-secondary text-sm">{proposal.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="glass-text-primary font-bold">{proposal.price} ₽</p>
                  <p className="glass-text-secondary text-sm">{proposal.estimated_days} дней</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
