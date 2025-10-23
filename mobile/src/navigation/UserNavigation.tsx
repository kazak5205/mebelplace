import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tab-navigation';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';

// User Screens
import UserHomeScreen from '../screens/main/UserHomeScreen';
import UserOrdersScreen from '../screens/main/UserOrdersScreen';
import UserCreateOrderScreen from '../screens/orders/UserCreateOrderScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';

// Shared Screens
import VideoPlayerScreen from '../screens/video/VideoPlayerScreen';
import TikTokPlayerScreen from '../screens/video/TikTokPlayerScreen';
import BookmarkedVideosScreen from '../screens/video/BookmarkedVideosScreen';
import TrendingVideosScreen from '../screens/video/TrendingVideosScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import OrderResponsesScreen from '../screens/orders/OrderResponsesScreen';
import OrderStatusHistoryScreen from '../screens/orders/OrderStatusHistoryScreen';
import MasterChannelScreen from '../screens/main/MasterChannelScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationSettingsScreen from '../screens/notifications/NotificationSettingsScreen';
import SubscriptionsScreen from '../screens/subscriptions/SubscriptionsScreen';
import EnhancedChatScreen from '../screens/messages/EnhancedChatScreen';
import SupportChatScreen from '../screens/support/SupportChatScreen';

const Tab = createBottomTabNavigator();

const UserNavigation = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'UserHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'UserOrders':
              iconName = focused ? 'document-text' : 'document-text-outline';
              break;
            case 'UserCreateOrder':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Messages':
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case 'UserProfile':
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
        name="UserHome" 
        component={UserHomeScreen}
        options={{
          tabBarLabel: 'Главная',
        }}
      />
      
      <Tab.Screen 
        name="UserOrders" 
        component={UserOrdersScreen}
        options={{
          tabBarLabel: 'Мои заявки',
        }}
      />
      
      <Tab.Screen 
        name="UserCreateOrder" 
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
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Мессенджер',
        }}
      />
      
      <Tab.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
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
        name="BookmarkedVideos" 
        component={BookmarkedVideosScreen}
        options={{
          tabBarButton: () => null,
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
        name="OrderDetails" 
        component={OrderDetailsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      
      <Tab.Screen 
        name="OrderResponses" 
        component={OrderResponsesScreen}
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
        name="Subscriptions" 
        component={SubscriptionsScreen}
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

export default UserNavigation;
