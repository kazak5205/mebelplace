import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Order {
  id: string;
  title: string;
  description: string;
  images: string[];
  client_id: string;
  client_username: string;
  client_phone: string;
  client_first_name: string;
  client_last_name: string;
  clientId?: string;
  clientUsername?: string;
  clientPhone?: string;
  clientFirstName?: string;
  clientLastName?: string;
  master_id: string;
  master_username: string;
  master_phone: string;
  status: string;
  price: number;
  deadline: string;
  location: string;
  region: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  response_count: number;
  responseCount?: number;
}

interface OrderResponse {
  id: string;
  order_id: string;
  orderId?: string;
  master_id: string;
  masterId?: string;
  master_username: string;
  masterUsername?: string;
  master_phone: string;
  masterPhone?: string;
  master_first_name: string;
  masterFirstName?: string;
  master_last_name: string;
  masterLastName?: string;
  message: string;
  price: number;
  deadline: string;
  created_at: string;
  createdAt?: string;
  master?: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    name: string;
    phone: string;
    avatar: string;
    email: string | null;
    role: string;
  };
}

interface OrderManagementProps {}

const OrderManagement: React.FC<OrderManagementProps> = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [responses, setResponses] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    loadOrders();
  }, [currentPage, filters]);

  useEffect(() => {
    if (selectedOrder) {
      loadOrderResponses(selectedOrder.id);
    }
  }, [selectedOrder]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };
      // Добавляем фильтры только если они заданы
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      
      const response = await apiService.get<any>('/orders/feed', params);
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderResponses = async (orderId: string) => {
    try {
      setLoadingResponses(true);
      const response = await apiService.get<any>(`/orders/${orderId}/responses`);
      setResponses(response || []);
    } catch (error) {
      console.error('Failed to load order responses:', error);
      setResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'pending': 'В ожидании',
      'accepted': 'Принята',
      'in_progress': 'В работе',
      'completed': 'Завершена',
      'cancelled': 'Отменена'
    };
    return labels[status] || status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Управление заявками</h2>
        <div className="text-sm text-gray-400">
          Всего заявок: {orders.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Статус</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Все</option>
              <option value="pending">В ожидании</option>
              <option value="accepted">Принята</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Категория</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Все категории</option>
              <option value="general">Общее</option>
              <option value="furniture">Мебель</option>
              <option value="repair">Ремонт</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Поиск</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Поиск по заявке..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Список заявок</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Загрузка...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-gray-400">Заявки не найдены</div>
            ) : (
              <div className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{order.title}</h4>
                        <p className="text-sm text-gray-400 line-clamp-2">{order.description}</p>
                      </div>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-1 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>👤 Клиент: {order.clientFirstName || order.client_first_name} {order.clientLastName || order.client_last_name}</span>
                        <span className="text-orange-400">📱 {order.clientPhone || order.client_phone || 'Нет телефона'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>📍 {order.location}</span>
                        <span>💬 Откликов: {order.response_count || 0}</span>
                      </div>
                      
                      <div className="text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Предыдущая
              </button>
              <span className="text-sm text-gray-400">
                Страница {currentPage} из {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Следующая
              </button>
            </div>
          )}
        </div>

        {/* Order Details & Responses */}
        <div className="bg-gray-800 rounded-lg shadow">
          {selectedOrder ? (
            <>
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Детали заявки</h3>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Order Info */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">{selectedOrder.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">{selectedOrder.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Клиент:</span>
                      <div className="text-white font-medium">
                        {selectedOrder.clientFirstName || selectedOrder.client_first_name} {selectedOrder.clientLastName || selectedOrder.client_last_name}
                      </div>
                      <div className="text-gray-400">@{selectedOrder.clientUsername || selectedOrder.client_username}</div>
                      <div className="text-orange-400 font-medium">📱 {selectedOrder.clientPhone || selectedOrder.client_phone || 'Нет телефона'}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Статус:</span>
                      <div className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                        {getStatusLabel(selectedOrder.status)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Локация:</span>
                      <div className="text-white">{selectedOrder.location}</div>
                      <div className="text-gray-400">{selectedOrder.region}</div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Категория:</span>
                      <div className="text-white">{selectedOrder.category}</div>
                    </div>
                    
                    {selectedOrder.price && (
                      <div>
                        <span className="text-gray-400">Цена:</span>
                        <div className="text-white font-medium">{selectedOrder.price} ₸</div>
                      </div>
                    )}
                    
                    <div className="col-span-2">
                      <span className="text-gray-400">Создана:</span>
                      <div className="text-white">{formatDate(selectedOrder.created_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                {selectedOrder.images && selectedOrder.images.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Изображения:</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedOrder.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Order image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Responses */}
                <div className="border-t border-gray-700 pt-4">
                  <h5 className="text-sm font-medium text-white mb-3">
                    Отклики мастеров ({responses.length})
                  </h5>
                  
                  {loadingResponses ? (
                    <div className="text-center text-gray-400 py-4">Загрузка откликов...</div>
                  ) : responses.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">Откликов пока нет</div>
                  ) : (
                    <div className="space-y-3">
                      {responses.map((response) => (
                        <div key={response.id} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-white">
                                {response.master?.name || response.master?.username || response.masterUsername || response.master_username || 'Мастер'}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{response.master?.username || response.masterUsername || response.master_username}
                              </div>
                              <div className="text-xs text-orange-400 font-medium">
                                📱 {response.master?.phone || response.masterPhone || response.master_phone || 'Нет телефона'}
                              </div>
                            </div>
                            <div className="text-right">
                              {response.price && (
                                <div className="text-lg font-bold text-green-400">{response.price} ₸</div>
                              )}
                              {response.deadline && (
                                <div className="text-xs text-gray-400">
                                  Срок: {formatDate(response.deadline)}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2">{response.message}</p>
                          
                          <div className="text-xs text-gray-500">
                            {formatDate(response.createdAt || response.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-400 min-h-[400px] flex items-center justify-center">
              <div>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Выберите заявку для просмотра деталей</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
          <div className="text-yellow-400 text-sm mb-1">В ожидании</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'pending').length}
          </div>
        </div>
        <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
          <div className="text-green-400 text-sm mb-1">Принятых</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'accepted').length}
          </div>
        </div>
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
          <div className="text-blue-400 text-sm mb-1">В работе</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'in_progress').length}
          </div>
        </div>
        <div className="bg-purple-500 bg-opacity-20 border border-purple-500 rounded-lg p-4">
          <div className="text-purple-400 text-sm mb-1">Завершенных</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'completed').length}
          </div>
        </div>
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400 text-sm mb-1">Отмененных</div>
          <div className="text-2xl font-bold text-white">
            {orders.filter(o => o.status === 'cancelled').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;

