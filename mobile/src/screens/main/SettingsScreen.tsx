import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Switch,
  Divider,
  Button,
} from 'react-native-paper';
import { useAuth } from '@shared/contexts/AuthContext';

const SettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    chatMessages: true,
    videoLikes: true,
    language: 'ru',
    autoplayVideos: true,
    dataUsage: false,
  });

  const handleSettingToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Язык приложения',
      'Выберите язык',
      [
        { text: 'Русский', onPress: () => setSettings({ ...settings, language: 'ru' }) },
        { text: 'Қазақша', onPress: () => setSettings({ ...settings, language: 'kk' }) },
        { text: 'English', onPress: () => setSettings({ ...settings, language: 'en' }) },
        { text: 'Отмена', style: 'cancel' }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Очистить кэш',
      'Вы уверены, что хотите очистить кэш приложения?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Очистить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Очищаем различные типы кэша
              const cacheDir = FileSystem.cacheDirectory;
              
              if (cacheDir) {
                // Получаем список файлов в кэше
                const files = await FileSystem.readDirectoryAsync(cacheDir);
                
                // Удаляем каждый файл
                let deletedCount = 0;
                for (const file of files) {
                  try {
                    await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
                    deletedCount++;
                  } catch (e) {
                    console.error('Error deleting file:', file, e);
                  }
                }

                // Также очищаем некоторые ключи из AsyncStorage (но не токен!)
                const keysToRemove = [
                  'cached_videos',
                  'cached_orders',
                  'cached_chats',
                  'temp_data',
                ];
                
                await AsyncStorage.multiRemove(keysToRemove);

                Alert.alert(
                  'Успешно', 
                  `Кэш очищен! Удалено ${deletedCount} файлов.`
                );
              }
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Ошибка', 'Не удалось очистить кэш');
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Политика конфиденциальности', 'Откроется в браузере');
  };

  const handleTermsOfService = () => {
    Alert.alert('Условия использования', 'Откроется в браузере');
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'ru': return 'Русский';
      case 'kk': return 'Қазақша';
      case 'en': return 'English';
      default: return 'Русский';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Notifications Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Уведомления</Text>
            
            <List.Item
              title="Push-уведомления"
              description="Получать уведомления на устройство"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={() => handleSettingToggle('pushNotifications')}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Email уведомления"
              description="Получать уведомления на почту"
              left={(props) => <List.Icon {...props} icon="email" />}
              right={() => (
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={() => handleSettingToggle('emailNotifications')}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="SMS уведомления"
              description="Получать SMS о важных событиях"
              left={(props) => <List.Icon {...props} icon="message-text" />}
              right={() => (
                <Switch
                  value={settings.smsNotifications}
                  onValueChange={() => handleSettingToggle('smsNotifications')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Notification Types */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Типы уведомлений</Text>
            
            <List.Item
              title="Обновления заявок"
              description="Статус и отклики на заявки"
              left={(props) => <List.Icon {...props} icon="clipboard-text" />}
              right={() => (
                <Switch
                  value={settings.orderUpdates}
                  onValueChange={() => handleSettingToggle('orderUpdates')}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Сообщения в чате"
              description="Новые сообщения от пользователей"
              left={(props) => <List.Icon {...props} icon="chat" />}
              right={() => (
                <Switch
                  value={settings.chatMessages}
                  onValueChange={() => handleSettingToggle('chatMessages')}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Лайки на видео"
              description="Когда кто-то лайкает ваше видео"
              left={(props) => <List.Icon {...props} icon="heart" />}
              right={() => (
                <Switch
                  value={settings.videoLikes}
                  onValueChange={() => handleSettingToggle('videoLikes')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Настройки приложения</Text>
            
            <List.Item
              title="Язык"
              description={getLanguageName(settings.language)}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleLanguageChange}
            />
            
            <Divider />
            
            <List.Item
              title="Автовоспроизведение видео"
              description="Воспроизводить видео автоматически"
              left={(props) => <List.Icon {...props} icon="play-circle" />}
              right={() => (
                <Switch
                  value={settings.autoplayVideos}
                  onValueChange={() => handleSettingToggle('autoplayVideos')}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Экономия трафика"
              description="Снизить качество видео в мобильной сети"
              left={(props) => <List.Icon {...props} icon="cloud-download" />}
              right={() => (
                <Switch
                  value={settings.dataUsage}
                  onValueChange={() => handleSettingToggle('dataUsage')}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Security Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Безопасность</Text>
            
            <List.Item
              title="Сменить пароль"
              description="Изменить пароль для входа"
              left={(props) => <List.Icon {...props} icon="lock" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleChangePassword}
            />
          </Card.Content>
        </Card>

        {/* Storage */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Хранилище</Text>
            
            <List.Item
              title="Очистить кэш"
              description="Освободить место на устройстве"
              left={(props) => <List.Icon {...props} icon="delete" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleClearCache}
            />
          </Card.Content>
        </Card>

        {/* Legal */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Правовая информация</Text>
            
            <List.Item
              title="Политика конфиденциальности"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handlePrivacyPolicy}
            />
            
            <Divider />
            
            <List.Item
              title="Условия использования"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleTermsOfService}
            />
          </Card.Content>
        </Card>
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
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default SettingsScreen;

