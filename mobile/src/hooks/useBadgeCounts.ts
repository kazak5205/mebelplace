/**
 * Hook для получения счетчиков badge для навигации
 */
import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useSocket } from '../contexts/SocketContext';

export const useBadgeCounts = () => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const { on, off } = useSocket();

  // Загрузка счетчиков
  const loadCounts = async () => {
    try {
      // Получаем непрочитанные сообщения
      const chatsResponse = await apiService.getChats();
      if (chatsResponse.success) {
        const totalUnread = chatsResponse.data.reduce(
          (sum: number, chat: any) => sum + (chat.unreadCount || 0),
          0
        );
        setUnreadMessagesCount(totalUnread);
      }

      // Получаем заказы с новыми откликами
      const ordersResponse = await apiService.getOrders(1, 100);
      if (ordersResponse.success) {
        // Считаем заказы со статусом pending или с новыми откликами
        const pendingCount = ordersResponse.data.filter(
          (order: any) => order.status === 'pending' || order.hasNewResponses
        ).length;
        setPendingOrdersCount(pendingCount);
      }
    } catch (error) {
      console.error('Error loading badge counts:', error);
    }
  };

  // Подписка на WebSocket события
  useEffect(() => {
    loadCounts();

    // Обработчик новых сообщений
    const handleNewMessage = (data: any) => {
      setUnreadMessagesCount(prev => prev + 1);
    };

    // Обработчик новых откликов на заказы
    const handleNewOrderResponse = (data: any) => {
      setPendingOrdersCount(prev => prev + 1);
    };

    // Обработчик прочитанных сообщений
    const handleMessageRead = (data: any) => {
      setUnreadMessagesCount(prev => Math.max(0, prev - 1));
    };

    // Обработчик изменения статуса заказа
    const handleOrderStatusChanged = (data: any) => {
      loadCounts(); // Перезагружаем счетчики
    };

    // Подключаем слушатели
    on('new_message', handleNewMessage);
    on('new_order_response', handleNewOrderResponse);
    on('message_read', handleMessageRead);
    on('order_status_changed', handleOrderStatusChanged);

    // Отключаем при размонтировании
    return () => {
      off('new_message', handleNewMessage);
      off('new_order_response', handleNewOrderResponse);
      off('message_read', handleMessageRead);
      off('order_status_changed', handleOrderStatusChanged);
    };
  }, [on, off]);

  return {
    unreadMessagesCount,
    pendingOrdersCount,
    loadCounts, // Для ручного обновления
  };
};

