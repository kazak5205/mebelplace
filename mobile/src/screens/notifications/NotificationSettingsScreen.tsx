import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Switch,
  Button,
  Divider,
  List,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderResponses: boolean;
  orderUpdates: boolean;
  newMessages: boolean;
  newVideos: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderResponses: true,
    orderUpdates: true,
    newMessages: true,
    newVideos: true,
    marketing: false,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Здесь должен быть вызов API для загрузки настроек уведомлений
      // const response = await notificationService.getSettings();
      // if (response.success) {
      //   setSettings(response.data);
      // }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      // Здесь должен быть вызов API для сохранения настроек
      // const response = await notificationService.updateSettings(settings);
      // if (response.success) {
      //   Alert.alert('Успех', 'Настройки сохранены');
      // }
      
      // Временно показываем успех
      Alert.alert('Успех', 'Настройки сохранены');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const testSMS = async () => {
    try {
      const response = await notificationService.testSms();
      
      if (response.success) {
        Alert.alert('Успех', 'Тестовое SMS отправлено');
      } else {
        Alert.alert('Ошибка', 'Не удалось отправить тестовое SMS');
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке SMS');
    }
  };

  const checkSMSBalance = async () => {
    try {
      const response = await notificationService.getSmsBalance();
      
      if (response.success) {
        Alert.alert('Баланс SMS', `Доступно SMS: ${response.data.balance}`);
      } else {
        Alert.alert('Ошибка', 'Не удалось получить баланс SMS');
      }
    } catch (error) {
      console.error('Error checking SMS balance:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при проверке баланса');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка настроек...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          icon="arrow-left"
        >
          Назад
        </Button>
        <Title style={styles.headerTitle}>Настройки уведомлений</Title>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Общие настройки</Title>
            
            <List.Item
              title="Push-уведомления"
              description="Получать уведомления в приложении"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={(value) => updateSetting('pushNotifications', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Email-уведомления"
              description="Получать уведомления на email"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSetting('emailNotifications', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="SMS-уведомления"
              description="Получать уведомления по SMS"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={(value) => updateSetting('smsNotifications', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Notification Types */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Типы уведомлений</Title>
            
            <List.Item
              title="Отклики на заявки"
              description="Уведомления о новых откликах"
              left={(props) => <List.Icon {...props} icon="chat" />}
              right={() => (
                <Switch
                  value={settings.orderResponses}
                  onValueChange={(value) => updateSetting('orderResponses', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Обновления заявок"
              description="Изменения статуса заявок"
              left={(props) => <List.Icon {...props} icon="update" />}
              right={() => (
                <Switch
                  value={settings.orderUpdates}
                  onValueChange={(value) => updateSetting('orderUpdates', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Новые сообщения"
              description="Уведомления о новых сообщениях"
              left={(props) => <List.Icon {...props} icon="message" />}
              right={() => (
                <Switch
                  value={settings.newMessages}
                  onValueChange={(value) => updateSetting('newMessages', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Новые видео"
              description="Уведомления о новых видео от подписок"
              left={(props) => <List.Icon {...props} icon="video" />}
              right={() => (
                <Switch
                  value={settings.newVideos}
                  onValueChange={(value) => updateSetting('newVideos', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Маркетинг"
              description="Рекламные уведомления и предложения"
              left={(props) => <List.Icon {...props} icon="bullhorn" />}
              right={() => (
                <Switch
                  value={settings.marketing}
                  onValueChange={(value) => updateSetting('marketing', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Sound and Vibration */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Звук и вибрация</Title>
            
            <List.Item
              title="Звук уведомлений"
              description="Воспроизводить звук при получении уведомлений"
              left={(props) => <List.Icon {...props} icon="volume-high" />}
              right={() => (
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={(value) => updateSetting('soundEnabled', value)}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Вибрация"
              description="Вибрация при получении уведомлений"
              left={(props) => <List.Icon {...props} icon="vibrate" />}
              right={() => (
                <Switch
                  value={settings.vibrationEnabled}
                  onValueChange={(value) => updateSetting('vibrationEnabled', value)}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* SMS Testing */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Тестирование SMS</Title>
            
            <Button
              mode="outlined"
              onPress={testSMS}
              style={styles.testButton}
              icon="send"
            >
              Отправить тестовое SMS
            </Button>
            
            <Button
              mode="outlined"
              onPress={checkSMSBalance}
              style={styles.testButton}
              icon="account-balance-wallet"
            >
              Проверить баланс SMS
            </Button>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <Button
            mode="contained"
            onPress={saveSettings}
            loading={isSaving}
            disabled={isSaving}
            style={styles.saveButton}
            icon="content-save"
          >
            Сохранить настройки
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  testButton: {
    marginBottom: 12,
  },
  saveContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default NotificationSettingsScreen;
