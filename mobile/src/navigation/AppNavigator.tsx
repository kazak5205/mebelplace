import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { getTabs, getRedirectPath } from '@shared/routing/routes';
import LoadingScreen from '../components/LoadingScreen';
import { useBadgeCounts } from '../hooks/useBadgeCounts';
import type { User } from '@shared/types';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import SearchScreen from '../screens/main/SearchScreen';
import MasterChannelScreen from '../screens/main/MasterChannelScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import HelpScreen from '../screens/main/HelpScreen';

// Video screens
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import TikTokPlayerScreen from '../screens/video/TikTokPlayerScreen';
import CameraScreen from '../screens/video/CameraScreen';
import MediaSelectionScreen from '../screens/video/MediaSelectionScreen';

// Order screens
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import CreateOrderScreen from '../screens/orders/CreateOrderScreen';

// Message screens
import ChatScreen from '../screens/messages/ChatScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const VideoStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TikTokPlayer" 
      component={TikTokPlayerScreen} 
      options={{ 
        title: 'Видео',
        headerShown: false 
      }}
    />
    <Stack.Screen 
      name="Camera" 
      component={CameraScreen} 
      options={{ 
        title: 'Камера',
        headerShown: false 
      }}
    />
    <Stack.Screen 
      name="MediaSelection" 
      component={MediaSelectionScreen} 
      options={{ 
        title: 'Выбор медиа',
        headerShown: true 
      }}
    />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SearchList" 
      component={SearchScreen} 
      options={{ 
        title: 'Поиск',
        headerShown: true 
      }}
    />
    <Stack.Screen 
      name="MasterChannel" 
      component={MasterChannelScreen} 
      options={{ 
        title: 'Профиль мастера',
        headerShown: false 
      }}
    />
  </Stack.Navigator>
);

const OrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="OrdersList" 
      component={OrdersScreen} 
      options={{ title: 'Заявки' }}
    />
    <Stack.Screen 
      name="OrderDetails" 
      component={OrderDetailsScreen} 
      options={{ title: 'Детали заявки' }}
    />
    <Stack.Screen 
      name="CreateOrder" 
      component={CreateOrderScreen} 
      options={{ title: 'Создать заявку' }}
    />
  </Stack.Navigator>
);

const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MessagesList" 
      component={MessagesScreen} 
      options={{ title: 'Сообщения' }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen} 
      options={{ title: 'Чат' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ title: 'Профиль' }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ title: 'Редактировать профиль' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Настройки' }}
    />
    <Stack.Screen 
      name="Help" 
      component={HelpScreen} 
      options={{ title: 'Помощь' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { user } = useAuth();
  const { unreadMessagesCount, pendingOrdersCount } = useBadgeCounts();
  
  // Get tabs based on user role (synchronized with shared/routing/routes.ts)
  const userRole = user?.role || 'client';
  const tabs = getTabs(userRole);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Synchronized icon mapping
          if (route.name === 'Видео') {
            iconName = focused ? 'play' : 'play-outline';
          } else if (route.name === 'Поиск') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Заявки' || route.name === 'Мои заявки') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Чат') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',  // Orange (синхронизировано с shared)
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      })}
    >
      <Tab.Screen 
        name="Видео" 
        component={VideoStack}
        options={{ title: 'Видео' }}
      />
      <Tab.Screen 
        name="Поиск" 
        component={SearchStack}
        options={{ title: 'Поиск' }}
      />
      <Tab.Screen 
        name={userRole === 'client' ? 'Мои заявки' : 'Заявки'}
        component={OrderStack}
        options={{ 
          title: userRole === 'client' ? 'Мои заявки' : 'Заявки',
          tabBarBadge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Чат" 
        component={MessageStack}
        options={{ 
          title: 'Чат',
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Профиль" 
        component={ProfileStack}
        options={{ title: 'Профиль' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Загрузка приложения..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
