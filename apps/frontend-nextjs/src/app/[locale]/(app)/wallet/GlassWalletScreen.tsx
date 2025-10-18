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
import { useWalletBalance, useWalletTransactions, useWalletStats } from '@/lib/api/hooks';

interface WalletTransaction {
  id: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out' | 'refund';
  amount: number;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  reference?: string;
  counterpart?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface WalletBalance {
  available: number;
  pending: number;
  frozen: number;
  total: number;
}

interface WalletStats {
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  transactionCount: number;
}

export default function GlassWalletScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'send' | 'receive'>('overview');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  
  // Use real API hooks instead of mock data
  const { data: balance, loading: balanceLoading, error: balanceError } = useWalletBalance();
  const { data: stats, loading: statsLoading, error: statsError } = useWalletStats();
  const { data: transactions = [], loading: transactionsLoading, error: transactionsError } = useWalletTransactions();
  
  const loading = balanceLoading || statsLoading || transactionsLoading;

  // Data is now loaded via API hooks

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return '📈';
      case 'expense': return '📉';
      case 'transfer_in': return '⬇️';
      case 'transfer_out': return '⬆️';
      case 'refund': return '🔄';
      default: return '💰';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'glass-text-success';
      case 'expense': return 'glass-text-danger';
      case 'transfer_in': return 'glass-text-success';
      case 'transfer_out': return 'glass-text-danger';
      case 'refund': return 'glass-text-accent-blue-500';
      default: return 'glass-text-primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'glass-bg-success text-white';
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      case 'failed': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'pending': return 'Ожидает';
      case 'failed': return 'Неудачный';
      default: return status;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'income') return transaction.type === 'income';
    if (filter === 'expense') return transaction.type === 'expense';
    if (filter === 'pending') return transaction.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 glass-bg-secondary rounded" />
              ))}
            </div>
            <div className="h-64 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Кошелек
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Настройки
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Обзор', icon: '📊' },
                { id: 'transactions', label: 'Транзакции', icon: '📋' },
                { id: 'send', label: 'Отправить', icon: '📤' },
                { id: 'receive', label: 'Получить', icon: '📥' }
              ].map((tab) => (
                <GlassButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'gradient' : 'ghost'}
                  size="md"
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Overview Tab */}
        {activeTab === 'overview' && balance && stats && (
          <>
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Доступно</p>
                      <p className="text-2xl font-bold glass-text-success">{formatCurrency(balance?.available || 0)}</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-success rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">В обработке</p>
                      <p className="text-2xl font-bold glass-text-accent-orange-500">{formatCurrency(balance?.pending || 0)}</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Заблокировано</p>
                      <p className="text-2xl font-bold glass-text-danger">{formatCurrency(balance?.frozen || 0)}</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-danger rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="interactive" padding="lg">
                <GlassCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm glass-text-secondary mb-1">Общий баланс</p>
                      <p className="text-2xl font-bold glass-text-primary">{formatCurrency(balance?.total || 0)}</p>
                    </div>
                    <div className="w-12 h-12 glass-bg-accent-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Статистика доходов
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">Всего заработано:</span>
                      <span className="font-semibold glass-text-success text-lg">
                        {formatCurrency(stats?.totalIncome || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">За этот месяц:</span>
                      <span className="font-semibold glass-text-success">
                        {formatCurrency(stats?.monthlyIncome || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">Количество транзакций:</span>
                      <span className="font-semibold glass-text-primary">
                        {stats?.transactionCount || 0}
                      </span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>

              <GlassCard variant="elevated" padding="lg">
                <GlassCardHeader>
                  <GlassCardTitle level={2} className="text-lg">
                    Статистика расходов
                  </GlassCardTitle>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">Всего потрачено:</span>
                      <span className="font-semibold glass-text-danger text-lg">
                        {formatCurrency(stats?.totalExpense || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">За этот месяц:</span>
                      <span className="font-semibold glass-text-danger">
                        {formatCurrency(stats?.monthlyExpense || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="glass-text-secondary">Чистая прибыль:</span>
                      <span className="font-semibold glass-text-success">
                        {formatCurrency((stats?.totalIncome || 0) - (stats?.totalExpense || 0))}
                      </span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassButton variant="gradient" size="xl" className="h-24 flex flex-col items-center justify-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Отправить деньги</span>
              </GlassButton>
              
              <GlassButton variant="secondary" size="xl" className="h-24 flex flex-col items-center justify-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Вывести средства</span>
              </GlassButton>
              
              <GlassButton variant="secondary" size="xl" className="h-24 flex flex-col items-center justify-center">
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>История транзакций</span>
              </GlassButton>
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            <GlassCard variant="elevated" padding="lg" className="mb-6">
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'income', 'expense', 'pending'] as const).map((filterType) => (
                    <GlassButton
                      key={filterType}
                      variant={filter === filterType ? 'gradient' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(filterType)}
                    >
                      {filterType === 'all' && 'Все'}
                      {filterType === 'income' && 'Доходы'}
                      {filterType === 'expense' && 'Расходы'}
                      {filterType === 'pending' && 'Ожидающие'}
                    </GlassButton>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>

            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <GlassCard key={transaction.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                  <GlassCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getTransactionTypeIcon(transaction.type)}</div>
                        
                        <div>
                          <h3 className="font-semibold glass-text-primary">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center gap-4 text-sm glass-text-secondary">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.createdAt)}</span>
                            {transaction.reference && (
                              <>
                                <span>•</span>
                                <span>#{transaction.reference}</span>
                              </>
                            )}
                          </div>
                          {transaction.counterpart && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-6 h-6 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
                                {transaction.counterpart.avatar ? (
                                  <img 
                                    src={transaction.counterpart.avatar} 
                                    alt={transaction.counterpart.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <svg className="w-3 h-3 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm glass-text-secondary">
                                {transaction.counterpart.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type === 'income' || transaction.type === 'transfer_in' || transaction.type === 'refund' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </GlassCardHeader>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {/* Send/Receive Tabs */}
        {(activeTab === 'send' || activeTab === 'receive') && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                {activeTab === 'send' ? 'Отправка денег' : 'Получение денег'}
              </h3>
              <p className="glass-text-secondary mb-4">
                Функция {activeTab === 'send' ? 'отправки' : 'получения'} денег будет доступна после интеграции с платежными системами
              </p>
              <GlassButton variant="gradient" size="lg">
                {activeTab === 'send' ? 'Отправить' : 'Получить'}
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
