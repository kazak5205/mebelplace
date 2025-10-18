'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton,
  GlassInput 
} from '@/components/ui/glass';

interface Invoice {
  id: string;
  number: string;
  orderId: string;
  client: {
    id: string;
    name: string;
    email: string;
    address: string;
    taxNumber?: string;
  };
  master: {
    id: string;
    name: string;
    email: string;
    address: string;
    taxNumber?: string;
  };
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
}

export default function GlassInvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'due_date'>('newest');

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchInvoices = async () => {
      // Loading handled by API hooks
    };

    fetchInvoices();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'glass-bg-secondary text-white';
      case 'sent': return 'glass-bg-accent-orange-500 text-white';
      case 'paid': return 'glass-bg-success text-white';
      case 'overdue': return 'glass-bg-danger text-white';
      case 'cancelled': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'sent': return 'Отправлен';
      case 'paid': return 'Оплачен';
      case 'overdue': return 'Просрочен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || invoice.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount_high':
        return b.total - a.total;
      case 'amount_low':
        return a.total - b.total;
      case 'due_date':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 glass-bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-6">
          <GlassCardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <GlassCardTitle level={1} className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Счета и инвойсы
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспорт
                </GlassButton>
                <GlassButton variant="gradient" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Создать счет
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <GlassInput
                value={searchQuery}
                 onValueChange={setSearchQuery}
                placeholder="Поиск по номеру счета, клиенту или заказу..."
                className="flex-1 min-w-[300px]"
              />

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'draft' && 'Черновики'}
                    {filterType === 'sent' && 'Отправленные'}
                    {filterType === 'paid' && 'Оплаченные'}
                    {filterType === 'overdue' && 'Просроченные'}
                    {filterType === 'cancelled' && 'Отмененные'}
                  </GlassButton>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">Сортировка:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="glass-bg-primary glass-border rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="amount_high">Сумма: по убыванию</option>
                  <option value="amount_low">Сумма: по возрастанию</option>
                  <option value="due_date">По сроку оплаты</option>
                </select>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Invoices List */}
        {sortedInvoices.length > 0 ? (
          <div className="space-y-6">
            {sortedInvoices.map((invoice) => (
              <GlassCard key={invoice.id} variant="elevated" padding="lg">
                <GlassCardHeader>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold glass-text-primary mb-2">
                            {invoice.number}
                          </h3>
                          <div className="flex items-center gap-4 text-sm glass-text-secondary mb-2">
                            <span>Заказ: {invoice.orderId}</span>
                            <span>•</span>
                            <span>Создан: {formatDate(invoice.createdAt)}</span>
                            <span>•</span>
                            <span>Срок оплаты: {formatDate(invoice.dueDate)}</span>
                          </div>
                          {invoice.paidAt && (
                            <div className="text-sm glass-text-success">
                              Оплачен: {formatDate(invoice.paidAt)}
                            </div>
                          )}
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>

                      {/* Client and Master Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="glass-bg-secondary rounded-lg p-4">
                          <h4 className="font-semibold glass-text-primary mb-2">Клиент</h4>
                          <div className="text-sm glass-text-secondary space-y-1">
                            <div>{invoice.client.name}</div>
                            <div>{invoice.client.email}</div>
                            <div>{invoice.client.address}</div>
                            {invoice.client.taxNumber && (
                              <div>ИИН: {invoice.client.taxNumber}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="glass-bg-secondary rounded-lg p-4">
                          <h4 className="font-semibold glass-text-primary mb-2">Исполнитель</h4>
                          <div className="text-sm glass-text-secondary space-y-1">
                            <div>{invoice.master.name}</div>
                            <div>{invoice.master.email}</div>
                            <div>{invoice.master.address}</div>
                            {invoice.master.taxNumber && (
                              <div>ИИН: {invoice.master.taxNumber}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <h4 className="font-semibold glass-text-primary mb-3">Позиции</h4>
                        <div className="space-y-2">
                          {invoice.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center glass-bg-secondary p-3 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium glass-text-primary">{item.name}</div>
                                <div className="text-sm glass-text-secondary">{item.description}</div>
                                <div className="text-sm glass-text-muted">
                                  {item.quantity} × {formatCurrency(item.unitPrice)}
                                </div>
                              </div>
                              <div className="font-semibold glass-text-primary">
                                {formatCurrency(item.total)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="glass-bg-secondary rounded-lg p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="glass-text-secondary">Подитог:</span>
                            <span className="glass-text-primary">{formatCurrency(invoice.subtotal)}</span>
                          </div>
                          {invoice.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="glass-text-secondary">Скидка:</span>
                              <span className="glass-text-success">-{formatCurrency(invoice.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="glass-text-secondary">НДС (15%):</span>
                            <span className="glass-text-primary">{formatCurrency(invoice.tax)}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="font-semibold glass-text-primary">Итого:</span>
                            <span className="font-bold text-lg glass-text-accent-orange-500">
                              {formatCurrency(invoice.total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {invoice.notes && (
                        <div className="mt-4 glass-bg-secondary rounded-lg p-4">
                          <h4 className="font-semibold glass-text-primary mb-2">Примечания</h4>
                          <p className="text-sm glass-text-secondary">{invoice.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <GlassButton variant="gradient" size="md">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Скачать PDF
                      </GlassButton>
                      <GlassButton variant="secondary" size="md">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Отправить
                      </GlassButton>
                      {invoice.status === 'sent' && (
                        <GlassButton variant="gradient" size="md">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Отметить как оплаченный
                        </GlassButton>
                      )}
                      <GlassButton variant="ghost" size="md">
                        Редактировать
                      </GlassButton>
                    </div>
                  </div>
                </GlassCardHeader>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Счета не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет счетов'
                  : `Нет счетов со статусом "${getStatusText(filter)}"`
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать первый счет
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
