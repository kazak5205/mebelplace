import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Button,
  IconButton,
  Searchbar,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 8;

interface MediaItem {
  id: string;
  uri: string;
  mediaType: 'video' | 'photo';
  duration?: number;
  width: number;
  height: number;
  filename: string;
  creationTime: number;
}

const MediaSelectionScreen = ({ navigation, route }: any) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<'all' | 'video' | 'photo'>('video');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      loadMediaItems();
    }
  }, [hasPermission, mediaType]);

  const getPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const loadMediaItems = async () => {
    try {
      setIsLoading(true);
      
      const mediaTypeFilter = mediaType === 'all' 
        ? [MediaLibrary.MediaType.video, MediaLibrary.MediaType.photo]
        : mediaType === 'video' 
        ? [MediaLibrary.MediaType.video]
        : [MediaLibrary.MediaType.photo];

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: mediaTypeFilter,
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 100,
      });

      const items: MediaItem[] = assets.assets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'photo',
        duration: asset.duration,
        width: asset.width,
        height: asset.height,
        filename: asset.filename,
        creationTime: asset.creationTime,
      }));

      setMediaItems(items);
    } catch (error) {
      console.error('Error loading media items:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить медиафайлы');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const compressVideo = async (videoUri: string) => {
    try {
      console.log('Минимальная оптимизация видео...');
      const compressedVideo = await Video.compressAsync(videoUri, {
        quality: 0.95, // 95% - минимальное сжатие для сохранения качества
        maxFileSize: 100 * 1024 * 1024, // Максимум 100MB
        deleteCache: false,
      });
      console.log('Видео оптимизировано:', compressedVideo.uri);
      return compressedVideo.uri;
    } catch (error) {
      console.error('Ошибка оптимизации видео:', error);
      return videoUri; // Возвращаем оригинал при ошибке
    }
  };

  const handleContinue = async () => {
    if (!selectedMedia) {
      Alert.alert('Ошибка', 'Выберите медиафайл');
      return;
    }

    let finalMedia = selectedMedia;
    
    // Сжимаем видео если это видеофайл
    if (selectedMedia.mediaType === 'video') {
      try {
        const compressedUri = await compressVideo(selectedMedia.uri);
        finalMedia = { ...selectedMedia, uri: compressedUri };
      } catch (error) {
        console.error('Ошибка сжатия:', error);
      }
    }

    // Переходим к экрану камеры с выбранным медиа
    navigation.navigate('Camera', { 
      selectedMedia: finalMedia,
      mode: 'upload'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity
      style={[
        styles.mediaItem,
        selectedMedia?.id === item.id && styles.selectedMediaItem
      ]}
      onPress={() => handleMediaSelect(item)}
    >
      {item.mediaType === 'video' ? (
        <Video
          source={{ uri: item.uri }}
          style={styles.mediaPreview}
          resizeMode="cover"
          shouldPlay={false}
          isMuted
        />
      ) : (
        <View style={styles.mediaPreview}>
          <Ionicons name="image" size={40} color="#666" />
        </View>
      )}
      
      {item.mediaType === 'video' && item.duration && (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(item.duration)}
          </Text>
        </View>
      )}
      
      {selectedMedia?.id === item.id && (
        <View style={styles.selectedOverlay}>
          <Ionicons name="checkmark-circle" size={24} color="#f97316" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Searchbar
        placeholder="Поиск медиафайлов..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <View style={styles.filterChips}>
        <Chip
          selected={mediaType === 'all'}
          onPress={() => setMediaType('all')}
          style={styles.filterChip}
        >
          Все
        </Chip>
        <Chip
          selected={mediaType === 'video'}
          onPress={() => setMediaType('video')}
          style={styles.filterChip}
        >
          Видео
        </Chip>
        <Chip
          selected={mediaType === 'photo'}
          onPress={() => setMediaType('photo')}
          style={styles.filterChip}
        >
          Фото
        </Chip>
      </View>
    </View>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Запрос разрешений...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="folder-open" size={64} color="#666" />
        <Text style={styles.permissionText}>Нет доступа к медиабиблиотеке</Text>
        <Button onPress={getPermissions} mode="contained">
          Предоставить доступ
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка медиафайлов...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mediaItems}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      {selectedMedia && (
        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            onPress={() => setSelectedMedia(null)}
            style={styles.actionButton}
          >
            Отмена
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.actionButton}
          >
            Продолжить
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    padding: 8,
  },
  header: {
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 12,
    elevation: 2,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
    elevation: 2,
  },
  selectedMediaItem: {
    borderWidth: 2,
    borderColor: '#f97316',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default MediaSelectionScreen;
