import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Загрузка...', 
  showLogo = true 
}) => {
  return (
    <LinearGradient
      colors={['#f97316', '#ea580c']}
      style={styles.container}
    >
      <View style={styles.content}>
        {showLogo && (
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={64} color="white" />
            <Text style={styles.logoText}>MebelPlace</Text>
          </View>
        )}
        
        <ActivityIndicator 
          size="large" 
          color="white" 
          style={styles.spinner}
        />
        
        <Text style={styles.message}>{message}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    letterSpacing: 1,
  },
  spinner: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default LoadingScreen;
