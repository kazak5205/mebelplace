/**
 * App Context for global state management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '@/lib/api/hooks';

// Types
interface AppState {
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'kk' | 'en';
  notifications: any[];
  unreadCount: number;
  onlineUsers: string[];
  activeChats: string[];
  currentLocation: { lat: number; lng: number } | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: any }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'SET_LANGUAGE'; payload: 'ru' | 'kk' | 'en' }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_ONLINE_USERS'; payload: string[] }
  | { type: 'ADD_ACTIVE_CHAT'; payload: string }
  | { type: 'REMOVE_ACTIVE_CHAT'; payload: string }
  | { type: 'SET_LOCATION'; payload: { lat: number; lng: number } | null };

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  theme: 'auto',
  language: 'ru',
  notifications: [],
  unreadCount: 0,
  onlineUsers: [],
  activeChats: [],
  currentLocation: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload,
      };
    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case 'ADD_ACTIVE_CHAT':
      return {
        ...state,
        activeChats: [...state.activeChats, action.payload],
      };
    case 'REMOVE_ACTIVE_CHAT':
      return {
        ...state,
        activeChats: state.activeChats.filter(id => id !== action.payload),
      };
    case 'SET_LOCATION':
      return {
        ...state,
        currentLocation: action.payload,
      };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();

  // Sync auth state
  useEffect(() => {
    dispatch({ type: 'SET_USER', payload: user });
    dispatch({ type: 'SET_LOADING', payload: authLoading });
  }, [user, authLoading]);

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto';
      const savedLanguage = localStorage.getItem('language') as 'ru' | 'kk' | 'en';
      
      if (savedTheme) dispatch({ type: 'SET_THEME', payload: savedTheme });
      if (savedLanguage) dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
    }
  }, []);

  // Save preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', state.theme);
      localStorage.setItem('language', state.language);
    }
  }, [state.theme, state.language]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.warn('Failed to get location:', error);
        }
      );
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks
export function useUser() {
  const { state } = useApp();
  return state.user;
}

export function useIsAuthenticated() {
  const { state } = useApp();
  return state.isAuthenticated;
}

export function useTheme() {
  const { state, dispatch } = useApp();
  return {
    theme: state.theme,
    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      dispatch({ type: 'SET_THEME', payload: theme });
    },
  };
}

export function useLanguage() {
  const { state, dispatch } = useApp();
  return {
    language: state.language,
    setLanguage: (language: 'ru' | 'kk' | 'en') => {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    },
  };
}

export function useNotifications() {
  const { state, dispatch } = useApp();
  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification: (notification: any) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    },
    removeNotification: (id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    },
    markAsRead: (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    },
    markAllAsRead: () => {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    },
    setUnreadCount: (count: number) => {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
    },
  };
}

export function useOnlineUsers() {
  const { state, dispatch } = useApp();
  return {
    onlineUsers: state.onlineUsers,
    setOnlineUsers: (users: string[]) => {
      dispatch({ type: 'SET_ONLINE_USERS', payload: users });
    },
  };
}

export function useActiveChats() {
  const { state, dispatch } = useApp();
  return {
    activeChats: state.activeChats,
    addActiveChat: (chatId: string) => {
      dispatch({ type: 'ADD_ACTIVE_CHAT', payload: chatId });
    },
    removeActiveChat: (chatId: string) => {
      dispatch({ type: 'REMOVE_ACTIVE_CHAT', payload: chatId });
    },
  };
}

export function useLocation() {
  const { state, dispatch } = useApp();
  return {
    location: state.currentLocation,
    setLocation: (location: { lat: number; lng: number } | null) => {
      dispatch({ type: 'SET_LOCATION', payload: location });
    },
  };
}
