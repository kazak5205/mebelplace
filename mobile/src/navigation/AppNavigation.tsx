import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@shared/contexts/AuthContext';

// Navigation Components
import UserNavigation from './UserNavigation';
import MasterNavigation from './MasterNavigation';
import GuestNavigation from './GuestNavigation';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Можно показать splash screen
    return null;
  }

  const getUserRole = () => {
    if (!user) return 'guest';
    if (user.role === 'master' || user.isMaster) return 'master';
    return 'user';
  };

  const userRole = getUserRole();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === 'guest' && (
          <Stack.Screen name="GuestNavigation" component={GuestNavigation} />
        )}
        
        {userRole === 'user' && (
          <Stack.Screen name="UserNavigation" component={UserNavigation} />
        )}
        
        {userRole === 'master' && (
          <Stack.Screen name="MasterNavigation" component={MasterNavigation} />
        )}
        
        {/* Auth Screens - доступны всем */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
