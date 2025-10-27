import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Avatar,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@shared/contexts/AuthContext';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const handleImagePick = async () => {
    try {
      Alert.alert(
        'Выберите фото',
        'Откуда вы хотите выбрать фото?',
        [
          {
            text: 'Камера',
            onPress: async () => {
              // Проверяем разрешение на камеру
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Ошибка', 'Нужно разрешение на использование камеры');
                return;
              }

              // Открываем камеру
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.95, // Высокое качество для аватара
              });

              if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Галерея',
            onPress: async () => {
              // Проверяем разрешение на галерею
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Ошибка', 'Нужно разрешение на доступ к галерее');
                return;
              }

              // Открываем галерею
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.95, // Высокое качество для аватара
              });

              if (!result.canceled && result.assets[0]) {
                await uploadAvatar(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Отмена',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Image pick error:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setIsLoading(true);

      // Создаем FormData для загрузки
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      // Загружаем на сервер через /api/auth/profile
      const { authService } = await import('@shared/services/authService');
      const response = await authService.uploadAvatar(formData);
      
      if (response && response.avatar) {
        // Обновляем локальное состояние
        setFormData(prev => ({ ...prev, avatar: response.avatar }));
        Alert.alert('Успешно', 'Аватар обновлен');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить аватар');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Имя не может быть пустым');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Ошибка', 'Телефон не может быть пустым');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(formData);
      Alert.alert('Успешно', 'Профиль обновлен', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось обновить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Avatar Section */}
        <Card style={styles.avatarCard}>
          <Card.Content style={styles.avatarContent}>
            <TouchableOpacity onPress={handleImagePick}>
              <View style={styles.avatarContainer}>
                <Avatar.Image
                  size={100}
                  source={{ uri: formData.avatar }}
                  style={styles.avatar}
                />
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={24} color="white" />
                </View>
              </View>
              <Text style={styles.changePhotoText}>Изменить фото</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Основная информация</Text>
            
            <TextInput
              label="Имя"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
            />

            <TextInput
              label="Телефон *"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              mode="outlined"
              keyboardType="phone-pad"
              left={<TextInput.Icon icon="phone" />}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        {/* Role Info */}
        <Card style={styles.roleCard}>
          <Card.Content>
            <View style={styles.roleInfo}>
              <Ionicons 
                name={user?.role === 'client' ? 'person' : user?.role === 'master' ? 'storefront' : 'shield'} 
                size={20} 
                color="#f97316" 
              />
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleLabel}>Роль</Text>
                <Text style={styles.roleValue}>
                  {user?.role === 'client' ? 'Клиент' : user?.role === 'master' ? 'Мастер' : 'Администратор'}
                </Text>
              </View>
            </View>
            <Text style={styles.roleNote}>
              Для изменения роли свяжитесь с поддержкой
            </Text>
          </Card.Content>
        </Card>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
          icon="content-save"
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          style={styles.cancelButton}
        >
          Отмена
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
  avatarCard: {
    marginBottom: 16,
    elevation: 2,
  },
  avatarContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f97316',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '500',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  roleCard: {
    marginBottom: 24,
    elevation: 2,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTextContainer: {
    marginLeft: 12,
  },
  roleLabel: {
    fontSize: 12,
    color: '#666',
  },
  roleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f97316',
  },
  roleNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  saveButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 32,
    paddingVertical: 8,
  },
});

export default EditProfileScreen;

