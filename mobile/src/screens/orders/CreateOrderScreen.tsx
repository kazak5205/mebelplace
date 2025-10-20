import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const categories = [
  { key: 'furniture', label: 'Мебель' },
  { key: 'decor', label: 'Декор' },
  { key: 'kitchen', label: 'Кухня' },
  { key: 'bedroom', label: 'Спальня' },
  { key: 'living', label: 'Гостиная' },
  { key: 'office', label: 'Офис' },
  { key: 'garden', label: 'Сад' },
  { key: 'other', label: 'Другое' },
];

const CreateOrderScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'furniture',
    budget: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { title, description, category, budget } = formData;

    // Валидация
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название заявки');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите описание заявки');
      return;
    }

    if (title.trim().length < 5) {
      Alert.alert('Ошибка', 'Название должно содержать минимум 5 символов');
      return;
    }

    if (description.trim().length < 20) {
      Alert.alert('Ошибка', 'Описание должно содержать минимум 20 символов');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData = {
        title: title.trim(),
        description: description.trim(),
        category,
        budget: budget ? parseInt(budget) : undefined,
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        Alert.alert(
          'Успех',
          'Заявка успешно создана!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            }
          ]
        );
      } else {
        Alert.alert('Ошибка', 'Не удалось создать заявку');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Создать заявку</Title>
              <Paragraph style={styles.subtitle}>
                Опишите, что вам нужно, и получите предложения от поставщиков
              </Paragraph>

              <TextInput
                label="Название заявки *"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                mode="outlined"
                style={styles.input}
                placeholder="Например: Нужен диван для гостиной"
                maxLength={100}
              />

              <TextInput
                label="Описание *"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Подробно опишите, что именно вам нужно, какие требования, предпочтения по стилю, цвету, размеру и т.д."
                maxLength={1000}
              />

              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Категория *</Text>
                <SegmentedButtons
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  buttons={categories}
                  style={styles.segmentedButtons}
                />
              </View>

              <TextInput
                label="Бюджет (₸)"
                value={formData.budget}
                onChangeText={(value) => handleInputChange('budget', value)}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                placeholder="Укажите примерный бюджет (необязательно)"
              />

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Советы для лучшего результата:</Text>
                <Text style={styles.tipText}>• Будьте конкретны в описании</Text>
                <Text style={styles.tipText}>• Укажите размеры, если важно</Text>
                <Text style={styles.tipText}>• Опишите стиль и цветовые предпочтения</Text>
                <Text style={styles.tipText}>• Добавьте фото, если есть</Text>
              </View>

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать заявку'}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  tipsContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  tipText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  submitButton: {
    paddingVertical: 8,
    marginBottom: 16,
  },
});

export default CreateOrderScreen;
