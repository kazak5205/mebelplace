import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tab-navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';

// Master Screens
import UserHomeScreen from '../screens/main/UserHomeScreen'; // Видеолента других мастеров
import MasterAllOrdersScreen from '../screens/master/MasterAllOrdersScreen';
import MasterCreateVideoScreen from '../screens/master/MasterCreateVideoScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import MasterProfileScreen from '../screens/master/MasterProfileScreen';

// Shared Screens
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import TikTokPlayerScreen from '../screens/video/TikTokPlayerScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import RespondToOrderScreen from '../screens/orders/RespondToOrderScreen';
import OrderStatusHistoryScreen from '../screens/orders/OrderStatusHistoryScreen';
import MasterChannelScreen from '../screens/main/MasterChannelScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationSettingsScreen from '../screens/notifications/NotificationSettingsScreen';
import SubscribersScreen from '../screens/subscriptions/SubscribersScreen';
import EnhancedChatScreen from '../screens/messages/EnhancedChatScreen';
import SupportChatScreen from '../screens/support/SupportChatScreen';
import UploadVideoScreen from '../screens/video/UploadVideoScreen';

const Tab = createBottomTabNavigator();

const MasterNavigation = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'MasterHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MasterAllOrders':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'MasterCreateVideo':
              iconName = focused ? 'videocam' : 'videocam-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'MasterProfile':
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
        name="MasterHome" 
        component={UserHomeScreen} // Видеолента других мастеров
        options={{
          tabBarLabel: 'Главная',
        }}
      />
      
      <Tab.Screen 
        name="MasterAllOrders" 
        component={MasterAllOrdersScreen}
        options={{
          tabBarLabel: 'Все заявки',
        }}
      />
      
      <Tab.Screen 
        name="MasterCreateVideo" 
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
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Мессенджер',
        }}
      />
      
      <Tab.Screen 
        name="MasterProfile" 
        component={MasterProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
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
        name="UploadVideo" 
        component={UploadVideoScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="RespondToOrder" 
        component={RespondToOrderScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="OrderStatusHistory" 
        component={OrderStatusHistoryScreen}
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
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="NotificationSettings" 
        component={NotificationSettingsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="Subscribers" 
        component={SubscribersScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="Chat" 
        component={EnhancedChatScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="SupportChat" 
        component={SupportChatScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

export default MasterNavigation;
