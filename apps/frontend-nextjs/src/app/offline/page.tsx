/**
 * Offline Page - Страница для offline режима
 * Полностью соответствует спецификации FRONTEND_API_SPECIFICATION.yaml
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Search,
  Video,
  MessageCircle,
  User,
  Settings
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass/GlassCard';
import { GlassButton } from '@/components/ui/glass/GlassButton';
import { GlassLayout } from '@/components/ui/glass/GlassLayout';
import { pageTransitions } from '@/lib/animations';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Проверка статуса подключения
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Автоматическое перенаправление при восстановлении соединения
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const cachedActions = [
    {
      icon: Search,
      title: 'Поиск',
      description: 'Поиск мастеров и мебели',
      href: '/search',
      available: true,
    },
    {
      icon: Video,
      title: 'Видео',
      description: 'Просмотр сохраненных видео',
      href: '/my-videos',
      available: true,
    },
    {
      icon: MessageCircle,
      title: 'Чаты',
      description: 'Локальные сообщения',
      href: '/chats',
      available: false,
    },
    {
      icon: User,
      title: 'Профиль',
      description: 'Информация о профиле',
      href: '/profile',
      available: false,
    },
    {
      icon: Settings,
      title: 'Настройки',
      description: 'Настройки приложения',
      href: '/settings',
      available: true,
    },
  ];

  return (
    <GlassLayout className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={pageTransitions.fadeScale as any}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <GlassCard className="text-center p-8">
          {/* Icon */}
          <motion.div
            className="mb-6"
            animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              {isOnline ? (
                <RefreshCw className="w-10 h-10 text-green-500 animate-spin" />
              ) : (
                <WifiOff className="w-10 h-10 text-orange-500" />
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isOnline ? 'Соединение восстановлено!' : 'Нет подключения к интернету'}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-white/80 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isOnline 
              ? 'Перенаправляем вас на главную страницу...'
              : 'Проверьте подключение к интернету и попробуйте снова. Некоторые функции доступны в offline режиме.'
            }
          </motion.p>

          {/* Retry Button */}
          {!isOnline && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassButton
                onClick={handleRetry}
                className="w-full"
                disabled={retryCount > 3}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {retryCount > 3 ? 'Слишком много попыток' : 'Повторить попытку'}
              </GlassButton>
            </motion.div>
          )}

          {/* Cached Actions */}
          {!isOnline && (
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-white font-semibold text-lg mb-4">
                Доступно в offline режиме:
              </h3>
              
              {cachedActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <GlassButton
                    variant={action.available ? 'primary' : 'secondary'}
                    className="w-full justify-start"
                    disabled={!action.available}
                    onClick={() => action.available && (window.location.href = action.href)}
                  >
                    <action.icon className="w-4 h-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-70">{action.description}</div>
                    </div>
                  </GlassButton>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Home Button */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassButton
              onClick={handleGoHome}
              variant="secondary"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              На главную
            </GlassButton>
          </motion.div>

          {/* Connection Status */}
          <motion.div
            className="mt-6 pt-6 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
              {isOnline ? 'Подключено' : 'Offline режим'}
            </div>
          </motion.div>
        </GlassCard>

        {/* Background Animation */}
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,102,0,0.1),transparent_50%)]" />
        </motion.div>
      </motion.div>
    </GlassLayout>
  );
}
