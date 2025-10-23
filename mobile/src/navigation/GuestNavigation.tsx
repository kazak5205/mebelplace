import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tab-navigation';
import { Ionicons } from '@expo/vector-icons';

// Guest Screens
import UserHomeScreen from '../screens/main/UserHomeScreen'; // Только просмотр видео
import UserCreateOrderScreen from '../screens/orders/UserCreateOrderScreen'; // Создание заявки
import MasterCreateVideoScreen from '../screens/master/MasterCreateVideoScreen'; // Создание видеорекламы
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Shared Screens
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import TikTokPlayerScreen from '../screens/video/TikTokPlayerScreen';
import TrendingVideosScreen from '../screens/video/TrendingVideosScreen';
import MasterChannelScreen from '../screens/main/MasterChannelScreen';

const Tab = createBottomTabNavigator();

const GuestNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'GuestHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'GuestCreateOrder':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'GuestCreateVideo':
              iconName = focused ? 'videocam' : 'videocam-outline';
              break;
            case 'GuestLogin':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      {/* Main Tabs */}
      <Tab.Screen 
        name="GuestHome" 
        component={UserHomeScreen} // Только просмотр видео
        options={{
          tabBarLabel: 'Главная',
        }}
      />
      
      <Tab.Screen 
        name="GuestCreateOrder" 
        component={UserCreateOrderScreen}
        options={{
          tabBarLabel: 'Заявка всем',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={size + 8} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="GuestCreateVideo" 
        component={MasterCreateVideoScreen}
        options={{
          tabBarLabel: 'Создать видеорекламу',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'videocam' : 'videocam-outline'} 
              size={size + 8} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="GuestLogin" 
        component={LoginScreen}
        options={{
          tabBarLabel: 'Войти',
        }}
      />

      {/* Modal Screens */}
      <Tab.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen}
        options={{
          tabBarButton: () => null,
          presentation: 'modal',
        }}
      />
      
      <Tab.Screen 
        name="TikTokPlayer" 
        component={TikTokPlayerScreen}
        options={{
          tabBarButton: () => null,
          presentation: 'modal',
        }}
      />
      
      <Tab.Screen 
        name="TrendingVideos" 
        component={TrendingVideosScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="MasterChannel" 
        component={MasterChannelScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

export default GuestNavigation;
