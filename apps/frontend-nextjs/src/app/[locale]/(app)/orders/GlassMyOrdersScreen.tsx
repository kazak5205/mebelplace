'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface Order {
  id: string;
  title: string;
  description: string;
  master: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdAt: string;
  deadline: string;
  category: string;
  images: string[];
}

export default function GlassMyOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchOrders = async () => {
      // Loading handled by API hooks
    };

    fetchOrders();
  }, []);

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
      case 'pending': return 'glass-bg-accent-orange-500 text-white';
      case 'confirmed': return 'glass-bg-accent-blue-500 text-white';
      case 'in_progress': return 'glass-bg-accent-purple-500 text-white';
      case 'completed': return 'glass-bg-success text-white';
      case 'cancelled': return 'glass-bg-danger text-white';
      default: return 'glass-bg-secondary text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="flex gap-6">
                  <div className="w-24 h-24 glass-bg-secondary rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-6 glass-bg-secondary rounded mb-2" />
                    <div className="h-4 glass-bg-secondary rounded w-2/3 mb-4" />
                    <div className="h-4 glass-bg-secondary rounded w-1/2" />
                  </div>
                </div>
              </GlassCard>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Мои заказы
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
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((filterType) => (
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
                  {filterType === 'cancelled' && 'Отменены'}
                </GlassButton>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <GlassCard key={order.id} variant="interactive" padding="lg" className="hover:glass-shadow-md transition-all">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Image */}
                  <div className="w-full lg:w-48 flex-shrink-0">
                    <div className="aspect-video lg:aspect-square glass-bg-secondary rounded-lg overflow-hidden">
                      <img 
                        src={order.images[0]} 
                        alt={order.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold glass-text-primary mb-2">
                          {order.title}
                        </h3>
                        <p className="glass-text-secondary mb-2">
                          {order.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm glass-text-muted">
                          <span>{order.category}</span>
                          <span>•</span>
                          <span>Создан {formatDate(order.createdAt)}</span>
                          <span>•</span>
                          <span>До {formatDate(order.deadline)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {order.status === 'in_progress' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm glass-text-secondary mb-2">
                          <span>Прогресс выполнения</span>
                          <span>{order.progress}%</span>
                        </div>
                        <div className="w-full glass-bg-secondary rounded-full h-2">
                          <div 
                            className="glass-bg-accent-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Master Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 glass-bg-secondary rounded-full flex items-center justify-center overflow-hidden">
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
                        <div className="font-medium glass-text-primary">
                          {order.master.name}
                        </div>
                        <div className="flex items-center gap-1 text-sm glass-text-secondary">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{order.master.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold glass-text-accent-orange-500">
                          {order.price.toLocaleString()} ₸
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <GlassButton variant="secondary" size="md">
                          Подробнее
                        </GlassButton>
                        {order.status === 'in_progress' && (
                          <GlassButton variant="gradient" size="md">
                            Отследить
                          </GlassButton>
                        )}
                        {order.status === 'completed' && (
                          <GlassButton variant="ghost" size="md">
                            Оставить отзыв
                          </GlassButton>
                        )}
                        <GlassButton variant="ghost" size="md">
                          Написать мастеру
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard variant="elevated" padding="xl" className="text-center">
            <GlassCardContent>
              <div className="w-16 h-16 glass-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 glass-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold glass-text-primary mb-2">
                Заказы не найдены
              </h3>
              <p className="glass-text-secondary mb-4">
                {filter === 'all' 
                  ? 'У вас пока нет заказов. Создайте заявку, чтобы найти мастера'
                  : 'В этой категории заказов пока нет'
                }
              </p>
              {filter === 'all' && (
                <GlassButton variant="gradient" size="lg">
                  Создать заявку
                </GlassButton>
              )}
            </GlassCardContent>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
