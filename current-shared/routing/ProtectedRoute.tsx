// Protected Route Component для React Router
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'master' | 'admin')[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  // Требуется авторизация, но пользователь не залогинен
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Проверяем роль пользователя
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect в зависимости от роли
    const roleRedirects = {
      client: '/',
      master: '/master/me',
      admin: '/admin',
    };
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

