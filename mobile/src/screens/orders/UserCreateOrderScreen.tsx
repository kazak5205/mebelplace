import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@shared/contexts/AuthContext';
import { apiService } from '../../services/apiService';

const categories = [
  'Кухни',
  'Спальни',
  'Гостиные',
  'Детские',
  'Офисная мебель',
  'Мебель для ванной',
  'Прихожие',
  'Другое',
];

const UserCreateOrderScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      console.error('Error selecting images:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображения');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const { title, description, category, budget } = formData;

    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название заявки');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите описание');
      return;
    }

    if (!category) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите категорию');
      return;
    }

    try {
      setIsSubmitting(true);

      // Сначала создаем заявку
      const orderResponse = await apiService.createOrder({
        title: title.trim(),
        description: description.trim(),
        category,
        budget: budget.trim() || undefined,
      });

      if (!orderResponse.success) {
        Alert.alert('Ошибка', 'Не удалось создать заявку');
        return;
      }

      // Затем загружаем изображения, если есть
      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach((uri, index) => {
          formData.append('images', {
            uri,
            type: 'image/jpeg',
            name: `image_${index}.jpg`,
          } as any);
        });

        const uploadResponse = await apiService.uploadOrderImages(formData);
        
        if (!uploadResponse.success) {
          console.warn('Failed to upload images:', uploadResponse.error);
        }
      }

      Alert.alert(
        'Успех',
        'Заявка создана! Мастера смогут откликнуться на неё.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Заявка всем</Title>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Text */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerText}>
              Создайте заявку — и мастера сами предложат вам лучшие варианты по цене и срокам.
            </Title>
            <Paragraph style={styles.subHeaderText}>
              Все детали можно обсудить в мессенджере внутри приложения.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Images Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Фотографии</Title>
            
            {selectedImages.length > 0 ? (
              <View style={styles.imagesContainer}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
                {selectedImages.length < 5 && (
                  <TouchableOpacity onPress={selectImages} style={styles.addImageButton}>
                    <Ionicons name="add" size={32} color="#666" />
                    <Text style={styles.addImageText}>Добавить фото</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity onPress={selectImages} style={styles.selectImagesButton}>
                <Ionicons name="add" size={48} color="#666" />
                <Text style={styles.selectImagesText}>Вставить фото</Text>
              </TouchableOpacity>
            )}
            
            <Paragraph style={styles.imagesDescription}>
              Здесь вы можете прикрепить фото мебели из интернета или из вашей галереи — в качестве примера того, что хотите заказать.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Description Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Описание</Title>
            
            <TextInput
              label="Название заявки *"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              style={styles.textInput}
              placeholder="Например: Кухня в современном стиле"
              mode="outlined"
            />
            
            <TextInput
              label="Описание *"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={6}
              style={styles.textInput}
              placeholder="Опишите, какую мебель вы хотите: размеры, материал, цвет и особенности. Это поможет мебельным компаниям и мастерам рассчитать цену и сроки максимально точно."
              mode="outlined"
            />
            
            <TextInput
              label="Бюджет (₸)"
              value={formData.budget}
              onChangeText={(value) => handleInputChange('budget', value)}
              keyboardType="numeric"
              style={styles.textInput}
              placeholder="Например: 500000"
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Category Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Категория</Title>
            
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  mode={formData.category === category ? 'flat' : 'outlined'}
                  selected={formData.category === category}
                  onPress={() => handleInputChange('category', category)}
                  style={styles.categoryChip}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim() || !formData.category}
            style={styles.submitButton}
            icon="send"
          >
            Отправить заявку всем
          </Button>
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
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1976d2',
  },
  subHeaderText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1976d2',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectImagesButton: {
    alignItems: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectImagesText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  addImageText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  imagesDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  textInput: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  submitButton: {
    paddingVertical: 8,
  },
});

export default UserCreateOrderScreen;
