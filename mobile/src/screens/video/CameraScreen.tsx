import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Video } from 'expo-av';
import {
  Text,
  IconButton,
  Button,
  Portal,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { apiService } from '../../services/apiService';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const CameraScreen = ({ navigation, route }: any) => {
  const { selectedMedia, mode } = route.params || {};
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(selectedMedia?.uri || null);
  const [showPreview, setShowPreview] = useState(!!selectedMedia);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'furniture',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const cameraRef = useRef<Camera>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    
    setHasPermission(
      cameraStatus === 'granted' && 
      audioStatus === 'granted' && 
      mediaStatus === 'granted'
    );
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(current => 
      current === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1.0, // Максимальное качество для фото
        base64: false,
      });
      
      setCapturedMedia(photo.uri);
      setShowPreview(true);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    
    try {
      setIsRecording(true);
      setRecordingDuration(0);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const video = await cameraRef.current.recordAsync({
        quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 60, // Максимум 60 секунд
      });
      
      setCapturedMedia(video.uri);
      setShowPreview(true);
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Ошибка', 'Не удалось записать видео');
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  };

  const retakeMedia = () => {
    setCapturedMedia(null);
    setShowPreview(false);
    setUploadData({ title: '', description: '', category: 'furniture' });
  };

  const selectFromGallery = () => {
    navigation.navigate('MediaSelection');
  };

  const compressVideo = async (videoUri: string) => {
    try {
      console.log('Сжимаем видео...');
      
      // Получаем информацию о файле
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      const fileSizeMB = fileInfo.size ? fileInfo.size / (1024 * 1024) : 0;
      
      // Минимальное сжатие для сохранения качества
      let quality = 0.95; // 95% качества - почти без потерь
      let maxFileSize = 100 * 1024 * 1024; // 100MB по умолчанию
      
      if (fileSizeMB > 150) {
        quality = 0.90; // 90% для очень больших файлов
        maxFileSize = 80 * 1024 * 1024; // 80MB
      } else if (fileSizeMB > 100) {
        quality = 0.92; // 92% для больших файлов
        maxFileSize = 90 * 1024 * 1024; // 90MB
      } else if (fileSizeMB > 50) {
        quality = 0.94; // 94% для средних файлов
        maxFileSize = 95 * 1024 * 1024; // 95MB
      }
      
      console.log(`Сжимаем видео: ${fileSizeMB.toFixed(1)}MB -> качество ${quality * 100}%`);
      
      const compressedVideo = await Video.compressAsync(videoUri, {
        quality: quality,
        maxFileSize: maxFileSize,
        deleteCache: false,
      });
      
      const compressedInfo = await FileSystem.getInfoAsync(compressedVideo.uri);
      const compressedSizeMB = compressedInfo.size ? compressedInfo.size / (1024 * 1024) : 0;
      
      console.log(`Видео сжато: ${fileSizeMB.toFixed(1)}MB -> ${compressedSizeMB.toFixed(1)}MB`);
      return compressedVideo.uri;
    } catch (error) {
      console.error('Ошибка сжатия видео:', error);
      return videoUri; // Возвращаем оригинал при ошибке
    }
  };

  const handleUpload = async () => {
    if (!capturedMedia || !uploadData.title.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните название');
      return;
    }

    try {
      setIsUploading(true);
      
      // Определяем тип медиа
      const isVideo = capturedMedia.includes('.mp4') || capturedMedia.includes('video');
      
      let finalMediaUri = capturedMedia;
      
      // Сжимаем видео для быстрой загрузки
      if (isVideo) {
        console.log('Сжимаем видео перед загрузкой...');
        setIsCompressing(true);
        finalMediaUri = await compressVideo(capturedMedia);
        setIsCompressing(false);
      }
      
      // Создаем FormData
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      
      if (isVideo) {
        formData.append('video', {
          uri: finalMediaUri,
          type: 'video/mp4',
          name: 'video.mp4',
        } as any);
      } else {
        formData.append('image', {
          uri: finalMediaUri,
          type: 'image/jpeg',
          name: 'image.jpg',
        } as any);
      }

      // Синхронизировано с web: uploadVideo возвращает video
      const result = isVideo 
        ? await apiService.uploadVideo(formData)
        : await apiService.uploadImage(formData);
      
      Alert.alert(
        'Успех', 
        'Медиа успешно загружено!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
              // Переходим к списку видео
              navigation.navigate('Videos');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке');
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.permissionText}>Запрос разрешений...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off" size={64} color="#666" />
        <Text style={styles.permissionText}>Нет доступа к камере</Text>
        <Button onPress={getPermissions} mode="contained">
          Предоставить доступ
        </Button>
      </View>
    );
  }

  if (showPreview && capturedMedia) {
    const isVideo = capturedMedia.includes('.mp4') || capturedMedia.includes('video');
    
    return (
      <View style={styles.previewContainer}>
        <StatusBar hidden />
        
        {isVideo ? (
          <Video
            source={{ uri: capturedMedia }}
            style={styles.previewMedia}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
        ) : (
          <Camera
            ref={cameraRef}
            style={styles.previewMedia}
            type={cameraType}
            flashMode={flashMode}
          />
        )}
        
        <View style={styles.previewControls}>
          <IconButton
            icon="close"
            iconColor="white"
            size={32}
            onPress={retakeMedia}
            style={styles.previewButton}
          />
          
          <IconButton
            icon="check"
            iconColor="white"
            size={32}
            onPress={() => setShowUploadModal(true)}
            style={[styles.previewButton, styles.uploadButton]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
      />
      
      {/* Top Controls */}
      <View style={styles.topControls}>
        <IconButton
          icon="close"
          iconColor="white"
          size={32}
          onPress={() => navigation.goBack()}
        />
        
        <IconButton
          icon={flashMode === FlashMode.on ? "flash" : "flash-off"}
          iconColor="white"
          size={32}
          onPress={toggleFlashMode}
        />
        
        <IconButton
          icon="camera-flip"
          iconColor="white"
          size={32}
          onPress={toggleCameraType}
        />
      </View>
      
      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.recordingInfo}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                {formatDuration(recordingDuration)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.captureControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={selectFromGallery}
          >
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.captureButton}
            onPress={isRecording ? stopRecording : startRecording}
            onLongPress={startRecording}
            disabled={isCapturing}
          >
            <View style={[
              styles.captureButtonInner,
              isRecording && styles.recordingButton
            ]} />
          </TouchableOpacity>
          
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.captureInfo}>
          <Text style={styles.captureHint}>
            {isRecording ? 'Нажмите для остановки' : 'Удерживайте для записи видео'}
          </Text>
        </View>
      </View>
      
      {/* Upload Modal */}
      <Portal>
        <Modal
          visible={showUploadModal}
          onDismiss={() => setShowUploadModal(false)}
          contentContainerStyle={styles.uploadModal}
        >
          <Text style={styles.uploadTitle}>Загрузить медиа</Text>
          
          <TextInput
            label="Название *"
            value={uploadData.title}
            onChangeText={(text) => setUploadData(prev => ({ ...prev, title: text }))}
            mode="outlined"
            style={styles.uploadInput}
          />
          
          <TextInput
            label="Описание"
            value={uploadData.description}
            onChangeText={(text) => setUploadData(prev => ({ ...prev, description: text }))}
            mode="outlined"
            style={styles.uploadInput}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.uploadButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowUploadModal(false)}
              style={styles.uploadButton}
            >
              Отмена
            </Button>
            
            <Button
              mode="contained"
              onPress={handleUpload}
              disabled={isUploading || isCompressing || !uploadData.title.trim()}
              loading={isUploading || isCompressing}
              style={styles.uploadButton}
            >
              {isCompressing ? 'Сжатие...' : isUploading ? 'Загрузка...' : 'Загрузить'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  recordingInfo: {
    marginBottom: 20,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  placeholder: {
    width: 50,
    height: 50,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  recordingButton: {
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  captureHint: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  previewMedia: {
    flex: 1,
  },
  previewControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  previewButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
  },
  uploadModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadInput: {
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  uploadButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default CameraScreen;
