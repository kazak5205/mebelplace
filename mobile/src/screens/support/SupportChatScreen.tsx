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
  Card,
  Title,
  Paragraph,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { apiService } from '../../services/apiService';
import type { Message, Chat } from '@shared/types';

const SupportChatScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { emit, on, off } = useSocket();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadSupportChat();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const loadSupportChat = async () => {
    try {
      setIsLoading(true);
      
      // Синхронизировано с web: getSupportChat возвращает chat
      try {
        const chat = await apiService.getSupportChat();
        if (chat) {
          setChat(chat);
          loadMessages(chat.id);
        } else {
          // Чат с поддержкой не существует, создадим его при первом сообщении
          setChat(null);
          setIsLoading(false);
        }
      } catch {
        // Чат не найден
        setChat(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading support chat:', error);
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      // Синхронизировано с web: getChatMessages возвращает messages
      const messages = await apiService.getChatMessages(chatId);
      setMessages(messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSupportChat = async () => {
    try {
      setIsCreatingChat(true);
      
      // Синхронизировано с web: createSupportChat возвращает chat
      const chat = await apiService.createSupportChat();
      setChat(chat);
      return chat.id;
    } catch (error) {
      console.error('Error creating support chat:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании чата');
      return null;
    } finally {
      setIsCreatingChat(false);
    }
  };

  const setupSocketListeners = () => {
    on('new_message', handleNewMessage);
    on('message_read', handleMessageRead);
  };

  const cleanupSocketListeners = () => {
    off('new_message', handleNewMessage);
    off('message_read', handleMessageRead);
  };

  const handleNewMessage = (message: Message) => {
    if (message.chatId === chat?.id) {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    }
  };

  const handleMessageRead = (data: { messageId: string; chatId: string }) => {
    if (data.chatId === chat?.id) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
    }
  };

  const handleSendMessage = async () => {
    const text = newMessage.trim();
    if (!text || isSending) return;

    try {
      setIsSending(true);
      
      let currentChatId = chat?.id;
      
      // Если чата нет, создаем его
      if (!currentChatId) {
        currentChatId = await createSupportChat();
        if (!currentChatId) {
          setIsSending(false);
          return;
        }
      }
      
      const messageData = {
        content: text,
        chatId: currentChatId,
      };

      // Синхронизировано с web: sendSupportMessage возвращает message
      const message = await apiService.sendSupportMessage(messageData);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
      
      // Отправляем через сокет
      emit('send_message', message);
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === user?.id;
    const isSupport = item.sender?.role === 'admin' || item.sender?.role === 'support';
    
    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && (
          <Avatar.Icon 
            size={32} 
            icon={isSupport ? "headset" : "account"} 
            style={[
              styles.messageAvatar,
              isSupport && styles.supportAvatar
            ]}
          />
        )}
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          {!isOwn && isSupport && (
            <Text style={styles.supportLabel}>Поддержка</Text>
          )}
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.content}
          </Text>
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

  const renderWelcomeCard = () => (
    <Card style={styles.welcomeCard}>
      <Card.Content>
        <View style={styles.welcomeHeader}>
          <Avatar.Icon 
            size={48} 
            icon="headset" 
            style={styles.welcomeAvatar}
          />
          <View style={styles.welcomeInfo}>
            <Title style={styles.welcomeTitle}>Служба поддержки</Title>
            <Text style={styles.welcomeSubtitle}>MebelPlace</Text>
          </View>
        </View>
        
        <Paragraph style={styles.welcomeText}>
          Добро пожаловать в службу поддержки! Мы готовы помочь вам с любыми вопросами по использованию приложения, заказам мебели или техническими проблемами.
        </Paragraph>
        
        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            onPress={() => setNewMessage('У меня проблема с заказом')}
            style={styles.quickButton}
            icon="shopping-cart"
          >
            Проблема с заказом
          </Button>
          <Button
            mode="outlined"
            onPress={() => setNewMessage('Техническая проблема')}
            style={styles.quickButton}
            icon="bug"
          >
            Техническая проблема
          </Button>
          <Button
            mode="outlined"
            onPress={() => setNewMessage('Вопрос о приложении')}
            style={styles.quickButton}
            icon="help-circle"
          >
            Вопрос о приложении
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Загрузка чата поддержки...</Text>
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
          <Text style={styles.headerTitle}>Служба поддержки</Text>
          <Text style={styles.headerSubtitle}>
            {messages.length > 0 ? 'Активный чат' : 'Готовы помочь'}
          </Text>
        </View>
        
        <View style={styles.placeholder} />
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
        ListHeaderComponent={messages.length === 0 ? renderWelcomeCard : null}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Опишите вашу проблему..."
          style={styles.textInput}
          multiline
          maxLength={1000}
          mode="outlined"
          disabled={isSending || isCreatingChat}
        />
        <IconButton
          icon="send"
          mode="contained"
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || isSending || isCreatingChat}
          loading={isSending || isCreatingChat}
          style={styles.sendButton}
        />
      </View>
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
  placeholder: {
    width: 24,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeAvatar: {
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  quickActions: {
    gap: 8,
  },
  quickButton: {
    marginBottom: 8,
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
  supportAvatar: {
    backgroundColor: '#4CAF50',
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
  supportLabel: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
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
});

export default SupportChatScreen;
