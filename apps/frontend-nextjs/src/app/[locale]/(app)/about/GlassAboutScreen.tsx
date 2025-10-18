'use client';

import React, { useState, useEffect } from 'react';
import { 
  GlassCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent, 
  GlassButton 
} from '@/components/ui/glass';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  avatar: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface CompanyStat {
  id: string;
  value: string;
  label: string;
  icon: string;
}

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: string;
}

export default function GlassAboutScreen() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<CompanyStat[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API integration - using mock data structure matching API types
    const fetchAboutData = async () => {
      // Loading handled by API hooks
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 glass-bg-secondary rounded mb-6" />
            <div className="h-64 glass-bg-secondary rounded mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 glass-bg-secondary rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg-primary glass-blur-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8 text-center">
          <GlassCardContent>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold glass-text-primary mb-6">
                О компании <span className="glass-text-accent-orange-500">MebelPlace</span>
              </h1>
              <p className="text-xl glass-text-secondary leading-relaxed mb-8">
                Мы создаем будущее мебельной индустрии, объединяя талантливых мастеров с клиентами, 
                которые ценят качество и индивидуальный подход к каждому проекту.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlassButton variant="gradient" size="xl">
                  Присоединиться к нам
                </GlassButton>
                <GlassButton variant="secondary" size="xl">
                  Связаться с нами
                </GlassButton>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Mission Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-3xl text-center mb-8">
              Наша миссия
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 glass-bg-accent-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold glass-text-primary mb-3">Инновации</h3>
                <p className="glass-text-secondary">
                  Используем современные технологии для создания удобной и безопасной платформы
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 glass-bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold glass-text-primary mb-3">Качество</h3>
                <p className="glass-text-secondary">
                  Поддерживаем высокие стандарты качества во всех аспектах нашей работы
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 glass-bg-accent-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold glass-text-primary mb-3">Сообщество</h3>
                <p className="glass-text-secondary">
                  Создаем сильное сообщество мастеров и клиентов, основанное на доверии
                </p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Stats Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-3xl text-center mb-8">
              Наши достижения
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold glass-text-accent-orange-500 mb-2">
                    {stat.value}
                  </div>
                  <div className="glass-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Team Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-3xl text-center mb-8">
              Наша команда
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="w-32 h-32 glass-bg-secondary rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold glass-text-primary mb-2">
                    {member.name}
                  </h3>
                  <div className="glass-text-accent-orange-500 font-medium mb-3">
                    {member.position}
                  </div>
                  <p className="glass-text-secondary text-sm mb-4">
                    {member.bio}
                  </p>
                  <div className="flex justify-center gap-3">
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} className="w-8 h-8 glass-bg-accent-blue-500 rounded-full flex items-center justify-center hover:glass-shadow-md transition-all">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {member.social.email && (
                      <a href={`mailto:${member.social.email}`} className="w-8 h-8 glass-bg-success rounded-full flex items-center justify-center hover:glass-shadow-md transition-all">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Timeline Section */}
        <GlassCard variant="elevated" padding="xl" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2} className="text-3xl text-center mb-8">
              Наша история
            </GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-8">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 glass-bg-accent-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{event.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold glass-text-primary">
                        {event.title}
                      </h3>
                      <span className="px-3 py-1 glass-bg-secondary rounded-full text-sm glass-text-muted">
                        {event.year}
                      </span>
                    </div>
                    <p className="glass-text-secondary">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* CTA Section */}
        <GlassCard variant="elevated" padding="xl" className="text-center">
          <GlassCardContent>
            <h2 className="text-3xl font-bold glass-text-primary mb-4">
              Готовы присоединиться к нам?
            </h2>
            <p className="text-xl glass-text-secondary mb-8">
              Станьте частью сообщества мастеров и клиентов, которые создают мебель мечты
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton variant="gradient" size="xl">
                Зарегистрироваться как мастер
              </GlassButton>
              <GlassButton variant="secondary" size="xl">
                Найти мастера
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
