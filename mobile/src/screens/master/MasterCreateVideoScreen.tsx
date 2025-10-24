import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  ActivityIndicator,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useAuth } from '@shared/contexts/AuthContext';
import { videoService } from '../../services/videoService';

const MasterCreateVideoScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form fields
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPromotional, setIsPromotional] = useState(false);

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

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужно разрешение для доступа к медиатеке');
    }
  };

  const selectVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1.0, // Максимальное качество - не сжимать на клиенте
        videoMaxDuration: 300, // 5 минут максимум
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        setVideoUri(video.uri);
        
        // Генерируем превью
        try {
          const thumbnail = await VideoThumbnails.getThumbnailAsync(video.uri, {
            time: 1000, // 1 секунда
            quality: 0.9, // Высокое качество превью
          });
          setThumbnailUri(thumbnail.uri);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать видео');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = async () => {
    if (!videoUri) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите видео');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите описание');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);
      
      if (thumbnailUri) {
        formData.append('thumbnail', {
          uri: thumbnailUri,
          type: 'image/jpeg',
          name: 'thumbnail.jpg',
        } as any);
      }
      
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('tags', JSON.stringify(tags));
      formData.append('isPromotional', isPromotional.toString());

      // Синхронизировано с web: uploadVideo возвращает video
      await videoService.uploadVideo(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      Alert.alert(
        'Успех',
        'Видеореклама успешно создана',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании видеорекламы');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Title style={styles.headerTitle}>Создать видеорекламу</Title>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Video Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Видео</Title>
            
            {videoUri ? (
              <View style={styles.videoPreview}>
                {thumbnailUri && (
                  <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
                )}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoSelected}>Видео выбрано</Text>
                  <TouchableOpacity onPress={selectVideo} style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Изменить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity onPress={selectVideo} style={styles.selectButton}>
                <Ionicons name="videocam" size={48} color="#666" />
                <Text style={styles.selectButtonText}>Выбрать видео</Text>
                <Text style={styles.selectButtonSubtext}>
                  Максимум 5 минут
                </Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>

        {/* Video Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Детали видеорекламы</Title>
            
            <TextInput
              label="Название *"
              value={title}
              onChangeText={setTitle}
              style={styles.textInput}
              placeholder="Введите название видеорекламы"
              mode="outlined"
            />
            
            <TextInput
              label="Описание *"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              placeholder="Опишите вашу мебель, услуги, преимущества..."
              mode="outlined"
            />
            
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Категория мебели</Text>
              <View style={styles.categoryChips}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    mode={category === cat ? 'flat' : 'outlined'}
                    selected={category === cat}
                    onPress={() => setCategory(cat)}
                    style={styles.categoryChip}
                  >
                    {cat}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Tags */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Теги</Title>
            
            <View style={styles.tagInputContainer}>
              <TextInput
                label="Добавить тег"
                value={tagInput}
                onChangeText={setTagInput}
                style={styles.tagInput}
                placeholder="Введите тег"
                mode="outlined"
                onSubmitEditing={addTag}
              />
              <Button mode="contained" onPress={addTag} style={styles.addTagButton}>
                Добавить
              </Button>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => removeTag(tag)}
                    style={styles.tagChip}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Promotional Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Настройки рекламы</Title>
            
            <View style={styles.promotionalContainer}>
              <View style={styles.promotionalInfo}>
                <Text style={styles.promotionalTitle}>Рекламное видео</Text>
                <Text style={styles.promotionalDescription}>
                  Отметьте, если это рекламное видео для продвижения ваших услуг
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.promotionalToggle,
                  isPromotional && styles.promotionalToggleActive
                ]}
                onPress={() => setIsPromotional(!isPromotional)}
              >
                <View style={[
                  styles.promotionalToggleThumb,
                  isPromotional && styles.promotionalToggleThumbActive
                ]} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Создание видеорекламы</Title>
              <ProgressBar progress={uploadProgress} style={styles.progressBar} />
              <Text style={styles.progressText}>
                {Math.round(uploadProgress * 100)}%
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Upload Button */}
        <View style={styles.uploadContainer}>
          <Button
            mode="contained"
            onPress={handleUpload}
            loading={isUploading}
            disabled={isUploading || !videoUri || !title.trim() || !description.trim()}
            style={styles.uploadButton}
            icon="video-plus"
          >
            {isUploading ? 'Создание...' : 'Создать видеорекламу'}
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
    width: 24,
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
  selectButton: {
    alignItems: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    color: '#666',
  },
  selectButtonSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  videoInfo: {
    flex: 1,
  },
  videoSelected: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  changeButtonText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  textInput: {
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  promotionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promotionalInfo: {
    flex: 1,
    marginRight: 16,
  },
  promotionalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  promotionalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  promotionalToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  promotionalToggleActive: {
    backgroundColor: '#4CAF50',
  },
  promotionalToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  promotionalToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  progressBar: {
    marginVertical: 8,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  uploadContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  uploadButton: {
    paddingVertical: 8,
  },
});

export default MasterCreateVideoScreen;
