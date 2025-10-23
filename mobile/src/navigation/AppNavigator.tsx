import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { useBadgeCounts } from '../hooks/useBadgeCounts';
import { CenterTabButton } from '../components/TabBarButton';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens - User
import HomeScreen from '../screens/main/HomeScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import CreateOrderScreen from '../screens/main/CreateOrderScreen';
import UserMessagesScreen from '../screens/main/UserMessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Guest screens
import GuestHomeScreen from '../screens/guest/GuestHomeScreen';

// Master screens
import MasterHomeScreen from '../screens/master/MasterHomeScreen';
import MasterOrdersScreen from '../screens/master/MasterOrdersScreen';
import CreateVideoScreen from '../screens/master/CreateVideoScreen';
import MasterMessagesScreen from '../screens/master/MasterMessagesScreen';
import MasterProfileScreen from '../screens/master/MasterProfileScreen';

// Video screens
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import TikTokPlayerScreen from '../screens/video/TikTokPlayerScreen';
import CameraScreen from '../screens/video/CameraScreen';
import MediaSelectionScreen from '../screens/video/MediaSelectionScreen';

// Order screens
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderResponsesScreen from '../screens/orders/OrderResponsesScreen';

// Message screens
import ChatScreen from '../screens/messages/ChatScreen';

// Profile screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SubscriptionsScreen from '../screens/profile/SubscriptionsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Video Stack - общий для всех пользователей
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

// User Navigation Stacks
const UserOrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="UserOrdersList" 
      component={UserOrdersScreen} 
      options={{ title: 'Мои заявки' }}
    />
    <Stack.Screen 
      name="OrderDetails" 
      component={OrderDetailsScreen} 
      options={{ title: 'Детали заявки' }}
    />
    <Stack.Screen 
      name="OrderResponses" 
      component={OrderResponsesScreen} 
      options={{ title: 'Ответы на заявку' }}
    />
    <Stack.Screen 
      name="CreateOrder" 
      component={CreateOrderScreen} 
      options={{ title: 'Заявка всем' }}
    />
  </Stack.Navigator>
);

const UserMessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="UserMessagesList" 
      component={UserMessagesScreen} 
      options={{ title: 'Мессенджер' }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen} 
      options={{ title: 'Чат' }}
    />
  </Stack.Navigator>
);

const UserProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="UserProfileMain" 
      component={UserProfileScreen} 
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
      name="Support" 
      component={SupportScreen} 
      options={{ title: 'Служба поддержки' }}
    />
    <Stack.Screen 
      name="Subscriptions" 
      component={SubscriptionsScreen} 
      options={{ title: 'Подписки' }}
    />
  </Stack.Navigator>
);

// Master Navigation Stacks
const MasterOrderStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MasterOrdersList" 
      component={MasterOrdersScreen} 
      options={{ title: 'Все заявки' }}
    />
    <Stack.Screen 
      name="OrderDetails" 
      component={OrderDetailsScreen} 
      options={{ title: 'Детали заявки' }}
    />
  </Stack.Navigator>
);

const MasterMessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MasterMessagesList" 
      component={MasterMessagesScreen} 
      options={{ title: 'Мессенджер' }}
    />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen} 
      options={{ title: 'Чат' }}
    />
  </Stack.Navigator>
);

const MasterProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MasterProfileMain" 
      component={MasterProfileScreen} 
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
      name="Support" 
      component={SupportScreen} 
      options={{ title: 'Служба поддержки' }}
    />
  </Stack.Navigator>
);

// User Tabs
const UserTabs = () => {
  const { unreadMessagesCount, pendingOrdersCount } = useBadgeCounts();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconSize = size;

          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Мои заявки') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Заявка всем') {
            iconName = 'add-circle';
            iconSize = 56; // Большая центральная кнопка
            color = '#f97316';
          } else if (route.name === 'Мессенджер') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen}
        options={{ title: 'Главная' }}
      />
      <Tab.Screen 
        name="Мои заявки" 
        component={UserOrderStack}
        options={{ 
          title: 'Мои заявки',
          tabBarBadge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Заявка всем" 
        component={CreateOrderScreen}
        options={{ 
          title: 'Заявка всем',
          tabBarLabel: 'Заявка всем',
          tabBarButton: (props) => (
            <CenterTabButton
              focused={props.accessibilityState?.selected || false}
              onPress={props.onPress}
              label="Заявка всем"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Мессенджер" 
        component={UserMessageStack}
        options={{ 
          title: 'Мессенджер',
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Профиль" 
        component={UserProfileStack}
        options={{ title: 'Профиль' }}
      />
    </Tab.Navigator>
  );
};

// Master Tabs
const MasterTabs = () => {
  const { unreadMessagesCount, pendingOrdersCount } = useBadgeCounts();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconSize = size;

          if (route.name === 'Главная') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Все заявки') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Создать видеорекламу') {
            iconName = 'add-circle';
            iconSize = 56; // Большая центральная кнопка
            color = '#f97316';
          } else if (route.name === 'Мессенджер') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Профиль') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Главная" 
        component={MasterHomeScreen}
        options={{ title: 'Главная' }}
      />
      <Tab.Screen 
        name="Все заявки" 
        component={MasterOrderStack}
        options={{ 
          title: 'Все заявки',
          tabBarBadge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Создать видеорекламу" 
        component={CreateVideoScreen}
        options={{ 
          title: 'Создать видеорекламу',
          tabBarLabel: 'Создать',
          tabBarButton: (props) => (
            <CenterTabButton
              focused={props.accessibilityState?.selected || false}
              onPress={props.onPress}
              label="Создать"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Мессенджер" 
        component={MasterMessageStack}
        options={{ 
          title: 'Мессенджер',
          tabBarBadge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
        }}
      />
      <Tab.Screen 
        name="Профиль" 
        component={MasterProfileStack}
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
        user.role === 'master' ? (
          <Stack.Screen name="MasterMain" component={MasterTabs} />
        ) : (
          <Stack.Screen name="UserMain" component={UserTabs} />
        )
      ) : (
        <>
          <Stack.Screen name="GuestMain" component={GuestHomeScreen} />
          <Stack.Screen name="Auth" component={AuthStack} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
