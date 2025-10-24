import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Avatar,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { apiService } from '../../services/apiService';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { Message, Chat } from '@shared/types';

const ChatScreen = ({ route, navigation }: any) => {
  const { chatId } = route.params;
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatData();
    loadMessages();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, [chatId]);

  const setupSocketListeners = () => {
    on('new_message', handleNewMessage);
  };

  const cleanupSocketListeners = () => {
    off('new_message');
  };

  const handleNewMessage = (data: any) => {
    if (data.chatId === chatId) {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    }
  };

  const loadChatData = async () => {
    try {
      // Синхронизировано с web: getChatById возвращает chat
      const chatData = await apiService.getChatById(chatId) as Chat;
      setChat(chatData);
      navigation.setOptions({ title: getOtherParticipant(chatData)?.name || 'Чат' });
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      // Синхронизировано с web: getMessages возвращает messages
      const messagesData = await apiService.getMessages(chatId, 1, 50) as Message[];
      setMessages(messagesData.reverse()); // Показываем старые сообщения сверху
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOtherParticipant = (chatData: Chat) => {
    return chatData?.participants.find((participant) => participant.id !== user?.id);
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      
      const messageData = {
        text: newMessage.trim(),
        type: 'text',
      };

      // Синхронизировано с web: sendMessage возвращает message
      const message = await apiService.sendMessage(chatId, messageData);
      setNewMessage('');
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Отправляем событие через WebSocket
      emit('new_message', {
        chatId,
        message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Нет доступа', 'Для записи голосовых сообщений нужен доступ к микрофону');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      // Stop timer
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      setIsRecording(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!uri) {
        Alert.alert('Ошибка', 'Не удалось записать аудио');
        return;
      }

      // Check minimum duration
      if (recordingDuration < 1) {
        Alert.alert('Слишком короткое', 'Запись должна быть длиннее 1 секунды');
        return;
      }

      // Send audio message
      await sendVoiceMessage(uri, recordingDuration);
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Ошибка', 'Не удалось завершить запись');
      setIsRecording(false);
    }
  };

  const handleCancelRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      
      setIsRecording(false);
      setRecordingDuration(0);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  const sendVoiceMessage = async (uri: string, duration: number) => {
    try {
      setIsSending(true);

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'audio/m4a',
        name: `voice_${Date.now()}.m4a`,
      } as any);
      formData.append('type', 'voice');
      formData.append('duration', duration.toString());

      // Синхронизировано с web: sendMessage возвращает message
      const message = await apiService.sendMessage(chatId, formData);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Send via WebSocket
      emit('new_message', {
        chatId,
        message,
      });
    } catch (error) {
      console.error('Error sending voice message:', error);
      Alert.alert('Ошибка', 'Не удалось отправить голосовое сообщение');
    } finally {
      setIsSending(false);
      setRecordingDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === user?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && showAvatar && (
          <Avatar.Image
            size={32}
            source={{ uri: item.sender.avatar }}
            style={styles.messageAvatar}
          />
        )}
        
        {!isMyMessage && !showAvatar && (
          <View style={styles.messageAvatarPlaceholder} />
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && showAvatar && (
            <Text style={styles.senderName}>{item.sender.name}</Text>
          )}
          
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Начните общение</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка сообщений...</Text>
      </View>
    );
  }

  const otherParticipant = getOtherParticipant(chat!);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatContainer}>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Запись... {formatDuration(recordingDuration)}
              </Text>
              <TouchableOpacity onPress={handleCancelRecording}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            {!isRecording && (
              <>
                <TextInput
                  value={newMessage}
                  onChangeText={setNewMessage}
                  placeholder="Введите сообщение..."
                  style={styles.textInput}
                  multiline
                  maxLength={1000}
                  disabled={isSending}
                />
                
                {newMessage.trim() ? (
                  <IconButton
                    icon="send"
                    mode="contained"
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    loading={isSending}
                    style={styles.sendButton}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={handleStartRecording}
                    style={styles.voiceButton}
                  >
                    <Ionicons
                      name="mic"
                      size={24}
                      color="#f97316"
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {isRecording && (
              <TouchableOpacity
                onPress={handleStopRecording}
                style={styles.voiceButtonRecording}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageAvatarPlaceholder: {
    width: 32,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#f97316',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.6)',
  },
  otherMessageTime: {
    color: 'rgba(255,255,255,0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(239,68,68,0.3)',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 14,
    color: '#f97316',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#fff',
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249,115,22,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButtonRecording: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    margin: 0,
    backgroundColor: '#f97316',
  },
});

export default ChatScreen;
