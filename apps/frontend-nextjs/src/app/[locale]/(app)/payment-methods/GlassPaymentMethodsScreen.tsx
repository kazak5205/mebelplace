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

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
  isActive: boolean;
  addedAt: string;
  lastUsed?: string;
  metadata?: {
    lastFour?: string;
    expiryDate?: string;
    bankName?: string;
    walletType?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  orderId?: string;
}

export default function GlassPaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'methods' | 'transactions'>('methods');
  const [showAddForm, setShowAddForm] = useState(false);

  // Data is fetched via API hooks
  const loading = false; // Will be replaced with real API hook when ready

  useEffect(() => {
    // Data is fetched via API hooks
    const fetchData = async () => {
      // Loading handled by API hooks
    };

    fetchData();
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'bank': return '🏦';
      case 'wallet': return '💰';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'card': return 'Банковская карта';
      case 'bank': return 'Банковский перевод';
      case 'wallet': return 'Электронный кошелек';
      case 'cash': return 'Наличные';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'glass-bg-success text-white';
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      case 'failed': return 'glass-bg-danger text-white';
      case 'refunded': return 'glass-bg-accent-blue-500 text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'pending': return 'Ожидает';
      case 'failed': return 'Неудачный';
      case 'refunded': return 'Возвращен';
      default: return status;
    }
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === methodId
    })));
  };

  const handleToggleActive = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, isActive: !method.isActive }
        : method
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="h-64 glass-bg-secondary rounded" />
            <div className="h-48 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Способы оплаты
              </GlassCardTitle>
              
              <div className="flex gap-3">
                <GlassButton variant="secondary" size="md" onClick={() => setShowAddForm(!showAddForm)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить способ оплаты
                </GlassButton>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'methods', label: 'Способы оплаты', icon: '💳' },
                { id: 'transactions', label: 'История платежей', icon: '📊' }
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

        {/* Add Payment Method Form */}
        {showAddForm && (
          <GlassCard variant="elevated" padding="lg" className="mb-6">
            <GlassCardHeader>
              <GlassCardTitle level={2} className="text-lg">
                Добавить способ оплаты
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassInput
                  label="Номер карты"
                  placeholder="1234 5678 9012 3456"
                  className="w-full"
                />
                <GlassInput
                  label="Срок действия"
                  placeholder="MM/YY"
                  className="w-full"
                />
                <GlassInput
                  label="Имя владельца"
                  placeholder="IVAN IVANOV"
                  className="w-full"
                />
                <GlassInput
                  label="CVV"
                  placeholder="123"
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <GlassButton variant="gradient" size="md">
                  Добавить карту
                </GlassButton>
                <GlassButton variant="ghost" size="md" onClick={() => setShowAddForm(false)}>
                  Отмена
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <GlassCard key={method.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                <GlassCardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getPaymentTypeIcon(method.type)}</div>
                      <div>
                        <h3 className="font-semibold glass-text-primary">
                          {method.name}
                        </h3>
                        <p className="text-sm glass-text-secondary">
                          {method.details}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      {method.isDefault && (
                        <span className="px-2 py-1 glass-bg-accent-orange-500 text-white rounded-full text-xs font-medium">
                          По умолчанию
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        method.isActive ? 'glass-bg-success text-white' : 'glass-bg-secondary text-white'
                      }`}>
                        {method.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm glass-text-secondary">
                    <div className="flex justify-between">
                      <span>Тип:</span>
                      <span>{getPaymentTypeText(method.type)}</span>
                    </div>
                    {method.metadata?.bankName && (
                      <div className="flex justify-between">
                        <span>Банк:</span>
                        <span>{method.metadata.bankName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Добавлен:</span>
                      <span>{formatDate(method.addedAt)}</span>
                    </div>
                    {method.lastUsed && (
                      <div className="flex justify-between">
                        <span>Последнее использование:</span>
                        <span>{formatDate(method.lastUsed)}</span>
                      </div>
                    )}
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <GlassButton 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Сделать основным
                      </GlassButton>
                    )}
                    <GlassButton 
                      variant={method.isActive ? "ghost" : "gradient"} 
                      size="sm"
                      onClick={() => handleToggleActive(method.id)}
                    >
                      {method.isActive ? 'Отключить' : 'Включить'}
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm">
                      ⋯
                    </GlassButton>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <GlassCard key={transaction.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                        transaction.type === 'income' ? 'glass-bg-success' : 'glass-bg-danger'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {transaction.type === 'income' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                          )}
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold glass-text-primary">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center gap-4 text-sm glass-text-secondary">
                          <span>ID: {transaction.id}</span>
                          <span>•</span>
                          <span>{transaction.paymentMethod}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'income' ? 'glass-text-success' : 'glass-text-danger'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  <div className="flex gap-3">
                    <GlassButton variant="ghost" size="sm">
                      Подробнее
                    </GlassButton>
                    {transaction.orderId && (
                      <GlassButton variant="secondary" size="sm">
                        Заказ #{transaction.orderId}
                      </GlassButton>
                    )}
                    {transaction.status === 'completed' && (
                      <GlassButton variant="ghost" size="sm">
                        Скачать чек
                      </GlassButton>
                    )}
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'methods' && paymentMethods.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Способы оплаты не добавлены
              </h3>
              <p className="glass-text-secondary mb-4">
                Добавьте способ оплаты для удобства работы с заказами
              </p>
              <GlassButton variant="gradient" size="lg" onClick={() => setShowAddForm(true)}>
                Добавить способ оплаты
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}

        {activeTab === 'transactions' && transactions.length === 0 && (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                История платежей пуста
              </h3>
              <p className="glass-text-secondary mb-4">
                Здесь будут отображаться все ваши транзакции
              </p>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
