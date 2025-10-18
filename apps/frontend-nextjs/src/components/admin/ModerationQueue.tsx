import React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassButton } from '@/components/ui/glass';

interface ModerationItem {
  id: number;
  type: 'video' | 'comment' | 'user';
  title: string;
  content: string;
  reported_by: string;
  reason: string;
  created_at: string;
}

interface ModerationQueueProps {
  items?: ModerationItem[];
  loading?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function ModerationQueue({ items = [], loading = false, onApprove, onReject }: ModerationQueueProps) {
  if (loading) {
    return (
      <GlassCard variant="elevated" padding="lg">
        <GlassCardHeader>
          <GlassCardTitle level={2}>Очередь модерации</GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 glass-bg-secondary rounded-lg" />
            ))}
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" padding="lg">
      <GlassCardHeader>
        <GlassCardTitle level={2}>Очередь модерации</GlassCardTitle>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-bg-secondary rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold glass-text-primary">{item.title}</h3>
                  <p className="text-sm glass-text-secondary">Тип: {item.type}</p>
                </div>
                <span className="text-xs glass-text-muted">
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              
              <p className="glass-text-secondary text-sm mb-3">{item.content}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm glass-text-muted">
                    Жалоба от: {item.reported_by}
                  </p>
                  <p className="text-sm glass-text-danger">
                    Причина: {item.reason}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onReject?.(item.id)}
                  >
                    Отклонить
                  </GlassButton>
                  <GlassButton
                    variant="gradient"
                    size="sm"
                    onClick={() => onApprove?.(item.id)}
                  >
                    Одобрить
                  </GlassButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}