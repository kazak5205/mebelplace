import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import SearchScreen from '../screens/main/SearchScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

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

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Видео') {
          iconName = 'play-outline';
        } else if (route.name === 'Поиск') {
          iconName = 'search-outline';
        } else if (route.name === 'Заявки всем') {
          iconName = 'document-text-outline';
        } else if (route.name === 'Чат') {
          iconName = 'chatbubble-outline';
        } else if (route.name === 'Профиль') {
          iconName = 'person-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#999',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
      name="Заявки всем" 
      component={OrderStack}
      options={{ title: 'Заявки всем' }}
    />
    <Tab.Screen 
      name="Чат" 
      component={MessageStack}
      options={{ title: 'Чат' }}
    />
    <Tab.Screen 
      name="Профиль" 
      component={ProfileScreen}
      options={{ title: 'Профиль' }}
    />
  </Tab.Navigator>
);

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
