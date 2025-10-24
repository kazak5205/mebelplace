import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';
import * as ImagePicker from 'expo-image-picker';
import * as VideoPicker from 'expo-video-picker';

const CreateVideoScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'general', name: 'Общее' },
    { id: 'furniture', name: 'Мебель' },
    { id: 'carpentry', name: 'Столярные работы' },
    { id: 'upholstery', name: 'Обивка мебели' },
    { id: 'restoration', name: 'Реставрация' },
    { id: 'custom', name: 'На заказ' },
    { id: 'repair', name: 'Ремонт' },
  ];

  const handleVideoPicker = async () => {
    try {
      const result = await VideoPicker.launchVideoLibraryAsync({
        mediaTypes: VideoPicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1.0, // Максимальное качество - не сжимать на клиенте
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать видео');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !selectedVideo) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля и выберите видео');
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Implement video upload to server
      const videoData = {
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        video: selectedVideo, // This would need to be converted to FormData
      };

      // Синхронизировано с web: uploadVideo возвращает video
      await videoService.uploadVideo(videoData);
      
      Alert.alert(
        'Успех',
        'Видеореклама создана! Она будет отображаться в ленте других мастеров.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('Ошибка', 'Не удалось создать видеорекламу');
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
        <Text style={styles.headerTitle}>Создать видеорекламу</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Upload Section */}
        <View style={styles.videoSection}>
          <TouchableOpacity style={styles.videoUploadButton} onPress={handleVideoPicker}>
            {selectedVideo ? (
              <View style={styles.selectedVideoContainer}>
                <Ionicons name="play-circle" size={48} color="#f97316" />
                <Text style={styles.selectedVideoText}>Видео выбрано</Text>
                <Text style={styles.selectedVideoSubtext}>Нажмите, чтобы изменить</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="videocam" size={48} color="#f97316" />
                <Text style={styles.uploadText}>Добавить видео</Text>
                <Text style={styles.uploadSubtext}>Выберите видео из галереи</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Название видеорекламы *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Например: Изготовление кухонного гарнитура на заказ"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Описание видеорекламы *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Опишите ваши услуги, опыт работы, используемые материалы и технологии. Это поможет клиентам лучше понять ваши возможности."
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

        {/* Tags Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Теги (через запятую)</Text>
          <TextInput
            style={styles.textInput}
            value={tags}
            onChangeText={setTags}
            placeholder="мебель, кухня, дерево, на заказ"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Создание...' : 'Создать видеорекламу'}
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
  videoSection: {
    marginBottom: 24,
  },
  videoUploadButton: {
    borderWidth: 2,
    borderColor: '#f97316',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#f97316',
    marginTop: 4,
  },
  selectedVideoContainer: {
    alignItems: 'center',
  },
  selectedVideoText: {
    fontSize: 16,
    color: '#f97316',
    fontWeight: '600',
    marginTop: 8,
  },
  selectedVideoSubtext: {
    fontSize: 12,
    color: '#f97316',
    marginTop: 4,
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

export default CreateVideoScreen;
