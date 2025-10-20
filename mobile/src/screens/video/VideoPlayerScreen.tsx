import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  PanResponder,
  Vibration,
} from 'react-native';
import Video from 'react-native-video';
import {
  Text,
  IconButton,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { apiService } from '../../services/apiService';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface VideoData {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likes: number;
  views: number;
  isLiked: boolean;
  comments: any[];
  createdAt: string;
}

const VideoPlayerScreen = ({ route, navigation }: any) => {
  const { videoId } = route.params;
  const { user } = useAuth();
  const { emit } = useSocket();
  
  const [video, setVideo] = useState<VideoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  
  const videoRef = useRef<Video>(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Начало жеста
      },
      onPanResponderMove: (evt, gestureState) => {
        // Обработка движения жеста
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const threshold = 50;
        
        // Свайп вверх - следующее видео
        if (dy < -threshold) {
          handleNextVideo();
        }
        // Свайп вниз - предыдущее видео
        else if (dy > threshold) {
          handlePreviousVideo();
        }
        // Свайп влево - пропустить
        else if (dx < -threshold) {
          handleSkipVideo();
        }
        // Свайп вправо - лайк
        else if (dx > threshold) {
          handleLikeVideo();
        }
      },
    })
  ).current;

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  // Предзагружаем видео для быстрого старта
  useEffect(() => {
    if (video?.videoUrl) {
      Video.prefetch(video.videoUrl, {
        shouldCache: true,
        cachePolicy: 'cache'
      }).catch(() => {});
    }
  }, [video?.videoUrl]);

  const loadVideo = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getVideoById(videoId);
      if (response.success) {
        setVideo(response.data);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить видео');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeVideo = async () => {
    if (!video) return;
    
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = video.isLiked 
        ? await apiService.unlikeVideo(video.id)
        : await apiService.likeVideo(video.id);
        
      if (response.success) {
        setVideo(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        } : null);
        
        // Отправляем событие через WebSocket
        emit('video_liked', {
          videoId: video.id,
          userId: user?.id,
          isLiked: !video.isLiked,
        });
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleNextVideo = () => {
    // Переход к следующему видео (пока просто закрываем)
    navigation.goBack();
  };

  const handlePreviousVideo = () => {
    // Переход к предыдущему видео (пока просто закрываем)
    navigation.goBack();
  };

  const handleSkipVideo = () => {
    // Пропуск видео - переходим к следующему
    handleNextVideo();
  };

  const handleDoubleTap = () => {
    handleLikeVideo();
    // Запускаем анимацию сердечка
    setShowHeartAnimation(true);
    
    // Сброс анимации
    heartScale.setValue(0);
    heartOpacity.setValue(0);
    
    // Анимация появления и исчезновения
    Animated.parallel([
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Анимация исчезновения
      Animated.parallel([
        Animated.timing(heartScale, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHeartAnimation(false);
      });
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !video) return;
    
    try {
      setIsSubmittingComment(true);
      const response = await apiService.addComment(video.id, commentText.trim());
      
      if (response.success) {
        setCommentText('');
        // Обновляем список комментариев
        loadVideo();
        
        // Отправляем событие через WebSocket
        emit('new_comment', {
          videoId: video.id,
          comment: response.data,
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Ошибка', 'Не удалось добавить комментарий');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка видео...</Text>
      </View>
    );
  }

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Видео не найдено</Text>
        <Button onPress={() => navigation.goBack()}>
          Назад
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <View style={styles.videoContainer} {...panResponder.panHandlers}>
        <Video
          ref={videoRef}
          source={{ 
            uri: video.videoUrl,
            headers: {
              'Range': 'bytes=0-1048576' // Загружаем первые 1MB для быстрого старта
            }
          }}
          style={styles.video}
          resizeMode="cover"
          paused={!isPlaying}
          repeat={false}
          onLoad={() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }}
          onBuffer={(data) => {
            setIsBuffering(data.isBuffering);
            if (data.buffered && data.buffered.length > 0) {
              const buffered = data.buffered[0];
              const progress = (buffered.end - buffered.start) / video.duration * 100;
              setBufferProgress(progress);
            }
          }}
          onProgress={(data) => {
            // Показываем прогресс буферизации
            if (data.buffered && data.buffered.length > 0) {
              const buffered = data.buffered[0];
              const progress = (buffered.end - buffered.start) / video.duration * 100;
              setBufferProgress(progress);
            }
          }}
          onError={(error) => {
            console.error('Video error:', error);
            Alert.alert('Ошибка', 'Ошибка воспроизведения видео');
          }}
        />
        
        {/* Double tap overlay for like */}
        <View 
          style={styles.doubleTapOverlay}
          onTouchEnd={handleDoubleTap}
        />
        
        {/* Heart Animation */}
        {showHeartAnimation && (
          <Animated.View
            style={[
              styles.heartAnimation,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Text style={styles.heartIcon}>❤️</Text>
          </Animated.View>
        )}
        
        {/* Video Info Overlay */}
        <View style={styles.videoInfoOverlay}>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.videoAuthor}>
              @{video.author.username}
            </Text>
            {video.description && (
              <Text style={styles.videoDescription} numberOfLines={3}>
                {video.description}
              </Text>
            )}
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.actionButton}>
              <IconButton
                icon={video.isLiked ? "heart" : "heart-outline"}
                iconColor={video.isLiked ? "#FF4444" : "white"}
                size={32}
                onPress={handleLikeVideo}
              />
              <Text style={styles.actionText}>{video.likes}</Text>
            </View>
            
            <View style={styles.actionButton}>
              <IconButton
                icon="chat-outline"
                iconColor="white"
                size={32}
                onPress={() => setShowComments(true)}
              />
              <Text style={styles.actionText}>{video.comments.length}</Text>
            </View>
            
            <View style={styles.actionButton}>
              <IconButton
                icon="share-outline"
                iconColor="white"
                size={32}
                onPress={() => {
                  // TODO: Реализовать шаринг
                }}
              />
              <Text style={styles.actionText}>Поделиться</Text>
            </View>
          </View>
        </View>
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.bufferingText}>
              Загрузка... {Math.round(bufferProgress)}%
            </Text>
          </View>
        )}
        
        {/* Play/Pause Button */}
        <View style={styles.playButtonContainer}>
          <IconButton
            icon={isPlaying ? "pause" : "play"}
            iconColor="white"
            size={48}
            onPress={() => setIsPlaying(!isPlaying)}
            style={styles.playButton}
          />
        </View>
      </View>
      
      {/* Comments Modal */}
      <Portal>
        <Modal
          visible={showComments}
          onDismiss={() => setShowComments(false)}
          contentContainerStyle={styles.commentsModal}
        >
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Комментарии</Text>
            <IconButton
              icon="close"
              onPress={() => setShowComments(false)}
            />
          </View>
          
          <View style={styles.commentsList}>
            {video.comments.map((comment, index) => (
              <View key={comment.id || index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>
                  {comment.author?.username || 'Аноним'}
                </Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.commentInput}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Добавить комментарий..."
              mode="outlined"
              style={styles.commentTextInput}
              multiline
            />
            <Button
              mode="contained"
              onPress={handleAddComment}
              disabled={!commentText.trim() || isSubmittingComment}
              loading={isSubmittingComment}
              style={styles.commentButton}
            >
              Отправить
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: width,
    height: height,
  },
  doubleTapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  videoInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  videoInfo: {
    flex: 1,
    marginRight: 16,
  },
  videoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  videoAuthor: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  videoDescription: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  actionButtons: {
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 2,
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bufferingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    zIndex: 3,
  },
  bufferingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
  commentsModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  commentTextInput: {
    flex: 1,
    marginRight: 8,
  },
  commentButton: {
    marginLeft: 8,
  },
  heartAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 60,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default VideoPlayerScreen;
