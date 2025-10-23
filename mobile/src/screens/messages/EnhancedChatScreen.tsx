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
  Menu,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { apiService } from '../../services/apiService';
import type { Message, Chat } from '@shared/types';

const EnhancedChatScreen = ({ route, navigation }: any) => {
  const { chatId, masterId, masterName, initialMessage, videoId } = route.params;
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChatData();
    loadMessages();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, [chatId]);

  const loadChatData = async () => {
    try {
      if (chatId) {
        const response = await apiService.getChatById(chatId);
        if (response.success) {
          setChat(response.data);
        }
      } else if (masterId) {
        // Создаем новый чат с мастером
        const response = await apiService.createChatWithUser(masterId);
        if (response.success) {
          setChat(response.data);
          if (initialMessage) {
            // Отправляем начальное сообщение
            setTimeout(() => {
              handleSendMessage(initialMessage);
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getChatMessages(chatId || chat?.id || '');
      
      if (response.success) {
        setMessages(response.data);
        // Отмечаем сообщения как прочитанные
        markMessagesAsRead();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    on('new_message', handleNewMessage);
    on('message_read', handleMessageRead);
    on('user_blocked', handleUserBlocked);
  };

  const cleanupSocketListeners = () => {
    off('new_message', handleNewMessage);
    off('message_read', handleMessageRead);
    off('user_blocked', handleUserBlocked);
  };

  const handleNewMessage = (message: Message) => {
    if (message.chatId === (chatId || chat?.id)) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
  };

  const handleMessageRead = (data: { messageId: string; chatId: string }) => {
    if (data.chatId === (chatId || chat?.id)) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
    }
  };

  const handleUserBlocked = (data: { userId: string; isBlocked: boolean }) => {
    if (data.userId === (masterId || chat?.participants.find(p => p.id !== user?.id)?.id)) {
      setIsBlocked(data.isBlocked);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await apiService.markChatAsRead(chatId || chat?.id || '');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || newMessage.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      
      const messageData = {
        content: text,
        chatId: chatId || chat?.id,
        videoId: videoId, // Если есть ссылка на видео
      };

      const response = await apiService.sendMessage(messageData);
      
      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        setNewMessage('');
        scrollToBottom();
        
        // Отправляем через сокет
        emit('send_message', response.data);
      } else {
        Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при отправке сообщения');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Удалить переписку',
      'Вы уверены, что хотите удалить эту переписку? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.leaveChat(chatId || chat?.id || '');
              
              if (response.success) {
                Alert.alert('Успех', 'Переписка удалена');
                navigation.goBack();
              } else {
                Alert.alert('Ошибка', 'Не удалось удалить переписку');
              }
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при удалении');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = () => {
    const targetUserId = masterId || chat?.participants.find(p => p.id !== user?.id)?.id;
    const targetUserName = masterName || chat?.participants.find(p => p.id !== user?.id)?.name;
    
    Alert.alert(
      'Заблокировать пользователя',
      `Вы уверены, что хотите заблокировать ${targetUserName}? Вы не сможете отправлять друг другу сообщения.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Заблокировать',
          style: 'destructive',
          onPress: async () => {
            try {
              // Здесь должен быть вызов API для блокировки пользователя
              // const response = await apiService.blockUser(targetUserId);
              
              setIsBlocked(true);
              Alert.alert('Успех', 'Пользователь заблокирован');
            } catch (error) {
              console.error('Error blocking user:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при блокировке');
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = () => {
    const targetUserId = masterId || chat?.participants.find(p => p.id !== user?.id)?.id;
    const targetUserName = masterName || chat?.participants.find(p => p.id !== user?.id)?.name;
    
    Alert.alert(
      'Разблокировать пользователя',
      `Разблокировать ${targetUserName}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Разблокировать',
          onPress: async () => {
            try {
              // Здесь должен быть вызов API для разблокировки пользователя
              // const response = await apiService.unblockUser(targetUserId);
              
              setIsBlocked(false);
              Alert.alert('Успех', 'Пользователь разблокирован');
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Ошибка', 'Произошла ошибка при разблокировке');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.id;
    const otherParticipant = chat?.participants.find(p => p.id !== user?.id);
    
    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Avatar.Text 
            size={32} 
            label={otherParticipant?.name?.charAt(0).toUpperCase() || 'U'} 
            style={styles.messageAvatar}
          />
        )}
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.content}
          </Text>
          {item.videoId && (
            <TouchableOpacity 
              style={styles.videoLink}
              onPress={() => navigation.navigate('VideoPlayer', { videoId: item.videoId })}
            >
              <Ionicons name="videocam" size={16} color="#3b82f6" />
              <Text style={styles.videoLinkText}>Видео</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
            {new Date(item.createdAt).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка чата...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {masterName || chat?.participants.find(p => p.id !== user?.id)?.name || 'Чат'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isBlocked ? 'Заблокирован' : 'В сети'}
          </Text>
        </View>
        
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <TouchableOpacity onPress={() => setShowMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="#000" />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            onPress={() => {
              setShowMenu(false);
              if (isBlocked) {
                handleUnblockUser();
              } else {
                handleBlockUser();
              }
            }}
            title={isBlocked ? 'Разблокировать' : 'Заблокировать'}
            leadingIcon={isBlocked ? 'account-check' : 'account-cancel'}
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setShowMenu(false);
              handleDeleteChat();
            }}
            title="Удалить переписку"
            leadingIcon="delete"
            titleStyle={{ color: '#F44336' }}
          />
        </Menu>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      {!isBlocked && (
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Введите сообщение..."
            style={styles.textInput}
            multiline
            maxLength={1000}
            mode="outlined"
            disabled={isSending}
          />
          <IconButton
            icon="send"
            mode="contained"
            onPress={() => handleSendMessage()}
            disabled={!newMessage.trim() || isSending}
            loading={isSending}
            style={styles.sendButton}
          />
        </View>
      )}

      {isBlocked && (
        <View style={styles.blockedContainer}>
          <Text style={styles.blockedText}>
            Этот пользователь заблокирован
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: 'white',
  },
  otherText: {
    color: '#333',
  },
  videoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  videoLinkText: {
    color: '#3b82f6',
    fontSize: 12,
    marginLeft: 4,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
  },
  blockedContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  blockedText: {
    color: '#F44336',
    fontSize: 14,
  },
});

export default EnhancedChatScreen;
