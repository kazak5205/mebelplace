import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useAuth } from '@shared/contexts/AuthContext';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'client' as 'client' | 'master',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { username, email, password, confirmPassword, phone, role } = formData;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        username,
        email,
        password,
        phone: phone || undefined,
        role,
      });
      
      if (!success) {
        Alert.alert('Ошибка', 'Не удалось создать аккаунт. Возможно, email уже используется.');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Создать аккаунт</Title>
              <Paragraph style={styles.subtitle}>
                Зарегистрируйтесь в MebelPlace
              </Paragraph>

              <TextInput
                label="Имя пользователя *"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
              />

              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <TextInput
                label="Телефон"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Тип аккаунта *</Text>
                <SegmentedButtons
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  buttons={[
                    { value: 'client', label: 'Покупатель' },
                    { value: 'master', label: 'Поставщик' },
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>

              <TextInput
                label="Пароль *"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                autoComplete="password"
              />

              <TextInput
                label="Подтвердите пароль *"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                mode="outlined"
                style={styles.input}
                secureTextEntry
                autoComplete="password"
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="white" /> : 'Зарегистрироваться'}
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              >
                Уже есть аккаунт? Войти
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
