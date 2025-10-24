import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin_username: string;
  admin_first_name: string;
  admin_last_name: string;
}

interface AuditLogProps {}

const AuditLog: React.FC<AuditLogProps> = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    adminId: ''
  });

  useEffect(() => {
    loadLogs();
  }, [currentPage, filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50,
        ...filters
      };
      const response = await apiService.get<any>('/admin/audit-log', params);
      setLogs(response.logs || []);
      setTotalPages(response.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'video_upload': 'Загрузка видео',
      'update_priority': 'Обновление приоритета',
      'update_status': 'Обновление статуса',
      'delete_video': 'Удаление видео',
      'update_user_status': 'Обновление статуса пользователя',
      'create_category': 'Создание категории',
      'update_category': 'Обновление категории',
      'delete_category': 'Удаление категории'
    };
    return labels[action] || action;
  };

  const getResourceTypeLabel = (resourceType: string) => {
    const labels: { [key: string]: string } = {
      'video': 'Видео',
      'user': 'Пользователь',
      'category': 'Категория'
    };
    return labels[resourceType] || resourceType;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'text-red-600';
    if (action.includes('create')) return 'text-green-600';
    if (action.includes('update')) return 'text-blue-600';
    return 'text-gray-300';
  };

  const formatJson = (data: any) => {
    if (!data) return 'Нет данных';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Журнал аудита</h2>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Действие</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Все действия</option>
              <option value="video_upload">Загрузка видео</option>
              <option value="update_priority">Обновление приоритета</option>
              <option value="update_status">Обновление статуса</option>
              <option value="delete_video">Удаление видео</option>
              <option value="update_user_status">Обновление статуса пользователя</option>
              <option value="create_category">Создание категории</option>
              <option value="update_category">Обновление категории</option>
              <option value="delete_category">Удаление категории</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Тип ресурса</label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Все типы</option>
              <option value="video">Видео</option>
              <option value="user">Пользователь</option>
              <option value="category">Категория</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Админ</label>
            <input
              type="text"
              value={filters.adminId}
              onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
              placeholder="ID админа..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Админ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Действие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ресурс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Изменения
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Загрузка...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Записи не найдены
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {log.admin_first_name} {log.admin_last_name}
                      </div>
                      <div className="text-sm text-gray-400">@{log.admin_username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      <div>{getResourceTypeLabel(log.resource_type)}</div>
                      <div className="text-xs text-gray-400">{log.resource_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">
                        {log.old_values && log.new_values ? (
                          <details className="cursor-pointer">
                            <summary className="hover:text-gray-300">Показать изменения</summary>
                            <div className="mt-2 space-y-2">
                              <div>
                                <strong className="text-red-600">Было:</strong>
                                <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                                  {formatJson(log.old_values)}
                                </pre>
                              </div>
                              <div>
                                <strong className="text-green-600">Стало:</strong>
                                <pre className="text-xs bg-green-50 p-2 rounded mt-1 overflow-x-auto">
                                  {formatJson(log.new_values)}
                                </pre>
                              </div>
                            </div>
                          </details>
                        ) : (
                          'Нет изменений'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {log.ip_address}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                Предыдущая
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
              >
                Следующая
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Страница <span className="font-medium">{currentPage}</span> из{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
                  >
                    Предыдущая
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
                  >
                    Следующая
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
