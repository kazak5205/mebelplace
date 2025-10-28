import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import VideoManagement from '../components/admin/VideoManagement';
import UserManagement from '../components/admin/UserManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import CategoryManagement from '../components/admin/CategoryManagement';
import SupportChatManagement from '../components/admin/SupportChatManagement';
import AuditLog from '../components/admin/AuditLog';
import OrderManagement from '../components/admin/OrderManagement';

interface AdminPageProps {}

const AdminPage: React.FC<AdminPageProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка админки...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для доступа к админке</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Дашборд', icon: '📊' },
    { id: 'videos', name: 'Видео', icon: '🎥' },
    { id: 'users', name: 'Пользователи', icon: '👥' },
    { id: 'orders', name: 'Заявки', icon: '📋' },
    { id: 'analytics', name: 'Аналитика', icon: '📈' },
    { id: 'categories', name: 'Категории', icon: '📂' },
    { id: 'support', name: 'Поддержка', icon: '💬' },
    { id: 'audit', name: 'Аудит', icon: '📝' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'videos':
        return <VideoManagement />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'categories':
        return <CategoryManagement />;
      case 'support':
        return <SupportChatManagement />;
      case 'audit':
        return <AuditLog />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Админка MebelPlace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Привет, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={() => {
                  // ✅ Токены в httpOnly cookies, очищаются через /api/auth/logout
                  window.location.href = '/';
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-900 rounded-lg shadow-lg">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
