import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Avatar,
  Badge,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { apiService } from '../../services/apiService';

interface Chat {
  id: string;
  participants: Array<{
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    createdAt: string;
    type: 'text' | 'image' | 'video' | 'voice';
  };
  unreadCount: number;
  updatedAt: string;
}

const MessagesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
    setupSocketListeners();
    
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const setupSocketListeners = () => {
    on('new_message', handleNewMessage);
    on('user_online', handleUserOnline);
  };

  const cleanupSocketListeners = () => {
    off('new_message');
    off('user_online');
  };

  const handleNewMessage = (data: any) => {
    // Обновляем чат с новым сообщением
    setChats(prev => prev.map(chat => {
      if (chat.id === data.chatId) {
        return {
          ...chat,
          lastMessage: data.message,
          unreadCount: data.senderId !== user?.id ? chat.unreadCount + 1 : chat.unreadCount,
          updatedAt: data.message.createdAt,
        };
      }
      return chat;
    }));
  };

  const handleUserOnline = (data: any) => {
    // Обновляем статус пользователя онлайн
    setChats(prev => prev.map(chat => ({
      ...chat,
      participants: chat.participants.map(participant => 
        participant.id === data.userId 
          ? { ...participant, isOnline: data.isOnline }
          : participant
      ),
    })));
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getChats();
      
      if (response.success) {
        setChats(response.data);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadChats().finally(() => setRefreshing(false));
  }, []);

  const handleChatPress = (chat: Chat) => {
    navigation.navigate('Chat', { chatId: chat.id });
  };

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(participant => participant.id !== user?.id);
  };

  const formatLastMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('ru-RU', {
        weekday: 'short',
      });
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const getMessagePreview = (message: Chat['lastMessage']) => {
    if (!message) return 'Нет сообщений';
    
    switch (message.type) {
      case 'text':
        return message.text;
      case 'image':
        return '📷 Фото';
      case 'video':
        return '🎥 Видео';
      case 'voice':
        return '🎤 Голосовое сообщение';
      default:
        return message.text;
    }
  };

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherParticipant = getOtherParticipant(item);
    const isOnline = otherParticipant?.isOnline || false;
    
    return (
      <Card style={styles.chatCard} onPress={() => handleChatPress(item)}>
        <Card.Content style={styles.chatContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={50}
              source={{ uri: otherParticipant?.avatar }}
              style={styles.avatar}
            />
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Title style={styles.chatTitle} numberOfLines={1}>
                {otherParticipant?.username || 'Неизвестный пользователь'}
              </Title>
              {item.lastMessage && (
                <Text style={styles.timeText}>
                  {formatLastMessageTime(item.lastMessage.createdAt)}
                </Text>
              )}
            </View>
            
            <View style={styles.messagePreview}>
              <Paragraph 
                style={[
                  styles.messageText,
                  item.unreadCount > 0 && styles.unreadMessageText
                ]} 
                numberOfLines={1}
              >
                {getMessagePreview(item.lastMessage)}
              </Paragraph>
              
              {item.unreadCount > 0 && (
                <Badge style={styles.unreadBadge}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Badge>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Нет сообщений</Text>
      <Text style={styles.emptySubtitle}>
        Начните общение с другими пользователями
      </Text>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  chatCard: {
    marginBottom: 8,
    elevation: 1,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#E0E0E0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessageText: {
    fontWeight: 'bold',
    color: '#000',
  },
  unreadBadge: {
    backgroundColor: '#f97316',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default MessagesScreen;
