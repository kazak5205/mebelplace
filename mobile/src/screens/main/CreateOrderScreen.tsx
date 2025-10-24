import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import * as ImagePicker from 'expo-image-picker';

const CreateOrderScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'furniture', name: 'Мебель' },
    { id: 'carpentry', name: 'Столярные работы' },
    { id: 'upholstery', name: 'Обивка мебели' },
    { id: 'restoration', name: 'Реставрация' },
    { id: 'custom', name: 'На заказ' },
    { id: 'repair', name: 'Ремонт' },
    { id: 'other', name: 'Другое' },
  ];

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.95, // Высокое качество для фото заказа
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implement image upload to server
      const imageUrls = images.map(img => `/uploads/order-photos/${Date.now()}-${Math.random()}.jpg`);
      
      const orderData = {
        title: title.trim(),
        description: description.trim(),
        category,
        images: imageUrls,
      };

      // Синхронизировано с web: createOrder возвращает order
      await orderService.createOrder(orderData);
      
      Alert.alert(
        'Успех',
        'Заявка создана! Мастера увидят вашу заявку и смогут предложить свои услуги.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Ошибка', 'Не удалось создать заявку');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Заявка всем</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description Text */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            Создайте заявку — и мастера сами предложат вам лучшие варианты по цене и срокам.
          </Text>
          <Text style={styles.descriptionSubtext}>
            Все детали можно обсудить в мессенджере внутри приложения.
          </Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageUploadButton} onPress={handleImagePicker}>
            <Ionicons name="add" size={32} color="#f97316" />
            <Text style={styles.imageUploadText}>Вставить фото</Text>
          </TouchableOpacity>
          
          <Text style={styles.imageDescription}>
            Здесь вы можете прикрепить фото мебели из интернета или из вашей галереи — в качестве примера того, что хотите заказать.
          </Text>

          {/* Selected Images */}
          {images.length > 0 && (
            <View style={styles.selectedImages}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageItem}>
                  <Image source={{ uri: image }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Название заявки *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Например: Изготовление кухонного гарнитура"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Описание *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Опишите, какую мебель вы хотите: размеры, материал, цвет и особенности. Это поможет мебельным компаниям и мастерам рассчитать цену и сроки максимально точно."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Категория</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Отправка...' : 'Отправить заявку всем'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginBottom: 8,
  },
  descriptionSubtext: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#f97316',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    marginBottom: 12,
  },
  imageUploadText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 8,
  },
  imageDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  selectedImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
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
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#f97316',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateOrderScreen;
