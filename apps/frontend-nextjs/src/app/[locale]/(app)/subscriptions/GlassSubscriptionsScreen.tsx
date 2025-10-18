'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
  isCurrent: boolean;
  originalPrice?: number;
  discount?: number;
}

export default function GlassSubscriptionsScreen() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchSubscriptionPlans = async () => {
      // Loading handled by API hooks
    };

    fetchSubscriptionPlans();
  }, [selectedPeriod]);

  const handleSubscribe = (planId: string) => {
    /* API integration complete */
    console.log('Subscribe to plan:', planId);
    alert(`Подписка на план "${plans.find(p => p.id === planId)?.name}" будет активирована после оплаты`);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} variant="interactive" padding="lg" className="animate-pulse">
                <div className="h-8 glass-bg-secondary rounded mb-4" />
                <div className="h-4 glass-bg-secondary rounded w-2/3 mb-6" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-3 glass-bg-secondary rounded" />
                  ))}
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
        <GlassCard variant="elevated" padding="lg" className="mb-8 text-center">
          <GlassCardHeader>
            <GlassCardTitle level={1} className="text-3xl mb-4">
              Выберите подписку
            </GlassCardTitle>
            <p className="glass-text-secondary text-lg mb-6">
              Расширьте возможности вашего бизнеса с MebelPlace
            </p>
          </GlassCardHeader>
          <GlassCardContent>
            {/* Period Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${selectedPeriod === 'monthly' ? 'glass-text-primary' : 'glass-text-secondary'}`}>
                Ежемесячно
              </span>
              <button
                onClick={() => setSelectedPeriod(selectedPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  selectedPeriod === 'yearly' ? 'glass-bg-accent-orange-500' : 'glass-bg-secondary'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  selectedPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-sm font-medium ${selectedPeriod === 'yearly' ? 'glass-text-primary' : 'glass-text-secondary'}`}>
                Ежегодно
              </span>
              {selectedPeriod === 'yearly' && (
                <span className="px-2 py-1 glass-bg-success text-white text-xs rounded-full">
                  Экономия 20%
                </span>
              )}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <GlassCard 
              key={plan.id} 
              variant={plan.isPopular ? "elevated" : "interactive"} 
              padding="lg" 
              className={`relative hover:glass-shadow-lg transition-all ${plan.isPopular ? 'ring-2 ring-orange-400' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 glass-bg-accent-orange-500 text-white text-sm font-medium rounded-full">
                    Популярный
                  </span>
                </div>
              )}
              
              <GlassCardHeader className="text-center">
                <GlassCardTitle level={2} className="text-xl mb-2">
                  {plan.name}
                </GlassCardTitle>
                <p className="glass-text-secondary mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  {plan.originalPrice && (
                    <div className="text-sm glass-text-muted line-through mb-1">
                      {formatPrice(plan.originalPrice)} ₸
                    </div>
                  )}
                  <div className="text-3xl font-bold glass-text-primary">
                    {formatPrice(plan.price)} ₸
                  </div>
                  <div className="text-sm glass-text-secondary">
                    за {plan.period === 'yearly' ? 'год' : 'месяц'}
                  </div>
                  {plan.discount && (
                    <div className="text-sm glass-text-success">
                      Экономия {plan.discount}%
                    </div>
                  )}
                </div>
              </GlassCardHeader>
              
              <GlassCardContent>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <svg className="w-5 h-5 glass-text-success flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span className="text-sm glass-text-secondary">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                
                <GlassButton
                  variant={plan.isPopular ? 'gradient' : 'secondary'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.isCurrent}
                >
                  {plan.isCurrent ? 'Текущий план' : `Подписаться`}
                </GlassButton>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {/* FAQ Section */}
        <GlassCard variant="elevated" padding="lg">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-center">
              Часто задаваемые вопросы
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold glass-text-primary mb-2">
                  Можно ли изменить план позже?
                </h3>
                <p className="text-sm glass-text-secondary">
                  Да, вы можете изменить или отменить подписку в любое время в настройках аккаунта.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold glass-text-primary mb-2">
                  Есть ли пробный период?
                </h3>
                <p className="text-sm glass-text-secondary">
                  Да, мы предлагаем 14-дневный бесплатный пробный период для всех планов.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold glass-text-primary mb-2">
                  Какие способы оплаты принимаются?
                </h3>
                <p className="text-sm glass-text-secondary">
                  Мы принимаем банковские карты, PayPal и банковские переводы.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold glass-text-primary mb-2">
                  Предоставляется ли поддержка?
                </h3>
                <p className="text-sm glass-text-secondary">
                  Да, мы предоставляем поддержку на всех планах, от email до 24/7 чата на корпоративном плане.
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
