import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { SocketProvider } from './src/contexts/SocketContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { navigationRef } from './src/utils/navigationRef';
function AppContent() {
  const { theme, navigationTheme, isDark } = useTheme();
  
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <AuthProvider>
          <SocketProvider>
            <AppNavigator />
            <StatusBar style={isDark ? "light" : "dark"} />
          </SocketProvider>
        </AuthProvider>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
