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
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '@shared/utils/validation';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const { register } = useAuth();

  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<RegisterFormData> = {};
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      Alert.alert('Успех', 'Регистрация прошла успешно!');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Регистрация</Title>
            <Paragraph style={styles.subtitle}>
              Создайте аккаунт для работы с MebelPlace
            </Paragraph>

            <Input
              label="Имя *"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              error={errors.name}
              style={styles.input}
            />

            <Input
              label="Email (опционально)"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Телефон (опционально)"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              error={errors.phone}
              style={styles.input}
              keyboardType="phone-pad"
            />

            <Input
              label="Пароль *"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              style={styles.input}
              secureTextEntry
            />

            <Input
              label="Подтверждение пароля *"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              style={styles.input}
              secureTextEntry
            />

            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Роль *</Text>
              <View style={styles.radioGroup}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="client"
                    status={formData.role === 'client' ? 'checked' : 'unchecked'}
                    onPress={() => updateField('role', 'client')}
                  />
                  <Text style={styles.radioLabel}>Клиент</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="master"
                    status={formData.role === 'master' ? 'checked' : 'unchecked'}
                    onPress={() => updateField('role', 'master')}
                  />
                  <Text style={styles.radioLabel}>Мастер</Text>
                </View>
              </View>
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={formData.acceptTerms ? 'checked' : 'unchecked'}
                onPress={() => updateField('acceptTerms', !formData.acceptTerms)}
              />
              <Text style={styles.checkboxLabel}>
                Я принимаю условия использования и политику конфиденциальности
              </Text>
            </View>
            {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}

            <Button
              variant="primary"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              fullWidth
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
              fullWidth
            >
              Уже есть аккаунт? Войти
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#f97316',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  roleContainer: {
    marginVertical: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  registerButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;