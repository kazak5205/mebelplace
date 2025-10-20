import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Avatar,
  List,
  Switch,
  Button,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Инициализируем уведомления при загрузке профиля
    notificationService.initialize();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    if (value) {
      // Включаем уведомления
      await notificationService.initialize();
    } else {
      // Отключаем уведомления
      notificationService.cleanup();
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    // TODO: Реализовать переключение темы
  };

  const handleEditProfile = () => {
    // TODO: Реализовать редактирование профиля
    Alert.alert('Редактирование профиля', 'Функция в разработке');
  };

  const handleSettings = () => {
    // TODO: Реализовать настройки
    Alert.alert('Настройки', 'Функция в разработке');
  };

  const handleHelp = () => {
    // TODO: Реализовать помощь
    Alert.alert('Помощь', 'Функция в разработке');
  };

  const handleAbout = () => {
    Alert.alert(
      'О приложении',
      'MebelPlace v1.0.0\n\nПлатформа для поиска и продажи мебели с видео-контентом.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Выход из аккаунта...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <Avatar.Image
                size={80}
                source={{ uri: user?.avatar }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <Title style={styles.username}>{user?.username}</Title>
            <Paragraph style={styles.email}>{user?.email}</Paragraph>
            
            <View style={styles.roleContainer}>
              <Ionicons 
                name={user?.role === 'customer' ? 'person' : 'storefront'} 
                size={16} 
                color="#2196F3" 
              />
              <Text style={styles.roleText}>
                {user?.role === 'customer' ? 'Покупатель' : 'Поставщик'}
              </Text>
            </View>
            
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="pencil"
            >
              Редактировать профиль
            </Button>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Статистика</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Заявок</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>8</Text>
                <Text style={styles.statLabel}>Видео</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Сообщений</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>156</Text>
                <Text style={styles.statLabel}>Лайков</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Настройки</Title>
            
            <List.Item
              title="Уведомления"
              description="Получать push-уведомления"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Темная тема"
              description="Использовать темное оформление"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Настройки"
              description="Общие настройки приложения"
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSettings}
            />
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.supportCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Поддержка</Title>
            
            <List.Item
              title="Помощь"
              description="Часто задаваемые вопросы"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleHelp}
            />
            
            <Divider />
            
            <List.Item
              title="О приложении"
              description="Версия и информация"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAbout}
            />
          </Card.Content>
        </Card>

        {/* Logout */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
          icon="logout"
        >
          Выйти из аккаунта
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  editButton: {
    marginTop: 8,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  supportCard: {
    marginBottom: 24,
    elevation: 2,
  },
  logoutButton: {
    marginBottom: 32,
    paddingVertical: 8,
  },
});

export default ProfileScreen;
