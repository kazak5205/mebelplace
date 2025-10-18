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

interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
}

interface Order {
  id: string;
  title: string;
  description: string;
  client: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    address: string;
  };
  master: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
  };
  price: number;
  timeline: string;
  createdAt: string;
  status: OrderStatus[];
  currentStatus: string;
  progress: number;
  images: string[];
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
}

export default function GlassOrderTrackingScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchOrders = async () => {
      // Loading handled by API hooks
    };

    fetchOrders();
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
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      case 'confirmed': return 'glass-bg-accent-blue-500 text-white';
      case 'in_progress': return 'glass-bg-success text-white';
      case 'completed': return 'glass-bg-accent-purple-500 text-white';
      case 'delivered': return 'glass-bg-success text-white';
      case 'cancelled': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'confirmed': return 'Подтвержден';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'in_progress': return '🔨';
      case 'completed': return '🎉';
      case 'delivered': return '🚚';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || order.currentStatus === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 glass-bg-secondary rounded" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Отслеживание заказов
              </GlassCardTitle>
              
              <div className="text-right">
                <div className="text-2xl font-bold glass-text-primary mb-1">
                  {orders.length}
                </div>
                <div className="text-sm glass-text-secondary">
                  Всего заказов
                </div>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
                <GlassInput
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  placeholder="Поиск по номеру заказа, названию или клиенту..."
                  className="flex-1 min-w-[300px]"
                />

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'in_progress', 'completed', 'delivered', 'cancelled'] as const).map((filterType) => (
                  <GlassButton
                    key={filterType}
                    variant={filter === filterType ? 'gradient' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType === 'all' && 'Все'}
                    {filterType === 'pending' && 'Ожидают'}
                    {filterType === 'in_progress' && 'В работе'}
                    {filterType === 'completed' && 'Завершены'}
                    {filterType === 'delivered' && 'Доставлены'}
                    {filterType === 'cancelled' && 'Отменены'}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <GlassCard key={order.id} variant="elevated" padding="lg">
                <GlassCardHeader>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold glass-text-primary mb-2">
                            {order.title}
                          </h3>
                          <p className="glass-text-secondary leading-relaxed mb-2">
                            {order.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm glass-text-muted">
                            <span>ID: {order.id}</span>
                            <span>•</span>
                            <span>Создан: {formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.currentStatus)}`}>
                          {getStatusIcon(order.currentStatus)} {getStatusText(order.currentStatus)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm glass-text-secondary mb-2">
                          <span>Прогресс выполнения</span>
                          <span>{order.progress}%</span>
                        </div>
                        <div className="w-full glass-bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 glass-bg-accent-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Client and Master Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="glass-bg-secondary rounded-lg p-4">
                          <h4 className="font-semibold glass-text-primary mb-2">Клиент</h4>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 glass-bg-primary rounded-full flex items-center justify-center overflow-hidden">
                              {order.client.avatar ? (
                                <img 
                                  src={order.client.avatar} 
                                  alt={order.client.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-5 h-5 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="font-medium glass-text-primary">{order.client.name}</div>
                              <div className="text-sm glass-text-secondary">{order.client.phone}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="glass-bg-secondary rounded-lg p-4">
                          <h4 className="font-semibold glass-text-primary mb-2">Мастер</h4>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 glass-bg-primary rounded-full flex items-center justify-center overflow-hidden">
                              {order.master.avatar ? (
                                <img 
                                  src={order.master.avatar} 
                                  alt={order.master.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-5 h-5 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="font-medium glass-text-primary">{order.master.name}</div>
                              <div className="text-sm glass-text-secondary">{order.master.phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm glass-text-secondary">Стоимость:</span>
                          <p className="font-semibold glass-text-accent-orange-500 text-lg">
                            {formatCurrency(order.price)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm glass-text-secondary">Срок:</span>
                          <p className="font-semibold glass-text-primary">
                            {order.timeline}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm glass-text-secondary">Адрес доставки:</span>
                          <p className="font-semibold glass-text-primary text-sm">
                            {order.client.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                      <GlassButton variant="gradient" size="md">
                        Подробнее
                      </GlassButton>
                      <GlassButton variant="secondary" size="md">
                        Связаться
                      </GlassButton>
                      <GlassButton variant="ghost" size="md">
                        Документы
                      </GlassButton>
                    </div>
                  </div>
                </GlassCardHeader>
                
                <GlassCardContent>
                  {/* Status Timeline */}
                  <div className="mb-6">
                    <h4 className="font-semibold glass-text-primary mb-4">История статусов</h4>
                    <div className="space-y-4">
                      {order.status.map((status, index) => (
                        <div key={status.id} className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            index === order.status.length - 1 
                              ? getStatusColor(status.status)
                              : 'glass-bg-secondary glass-text-muted'
                          }`}>
                            {getStatusIcon(status.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium glass-text-primary">
                                {getStatusText(status.status)}
                              </span>
                              <span className="text-sm glass-text-muted">
                                {formatDate(status.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm glass-text-secondary mb-1">
                              {status.description}
                            </p>
                            {status.location && (
                              <p className="text-xs glass-text-muted">
                                📍 {status.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images and Documents */}
                  {(order.images.length > 0 || order.documents.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Images */}
                      {order.images.length > 0 && (
                        <div>
                          <h4 className="font-semibold glass-text-primary mb-3">Фотографии</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {order.images.map((image, index) => (
                              <div key={index} className="aspect-video glass-bg-secondary rounded-lg overflow-hidden">
                                <img 
                                  src={image} 
                                  alt={`Order image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {order.documents.length > 0 && (
                        <div>
                          <h4 className="font-semibold glass-text-primary mb-3">Документы</h4>
                          <div className="space-y-2">
                            {order.documents.map((doc, index) => (
                              <div key={index} className="flex items-center gap-3 glass-bg-secondary p-3 rounded-lg">
                                <div className="w-10 h-10 glass-bg-accent-blue-500 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium glass-text-primary">
                                    {doc.name}
                                  </div>
                                  <div className="text-xs glass-text-muted">
                                    {doc.type === 'contract' ? 'Договор' : 'Эскиз'}
                                  </div>
                                </div>
                                <GlassButton variant="ghost" size="sm">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </GlassButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Заказы не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет заказов'
                  : `Нет заказов со статусом "${getStatusText(filter)}"`
                }
              </p>
              <GlassButton variant="gradient" size="lg">
                Создать первый заказ
              </GlassButton>
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
